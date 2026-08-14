import React from 'react';
import './ToastViewport.css';

export type ToastType = 'success' | 'error' | 'info';

export interface Toast {
  id: number;
  type: ToastType;
  message: string;
  leaving?: boolean;
}

const ICONS: Record<ToastType, string> = { success: '✓', error: '✕', info: 'ℹ' };

interface ToastViewportProps {
  toasts: Toast[];
  onDismiss: (id: number) => void;
}

const ToastViewport: React.FC<ToastViewportProps> = ({ toasts, onDismiss }) => {
  if (toasts.length === 0) return null;

  return (
    <div className="toast-viewport" role="status" aria-live="polite">
      {toasts.map((t) => (
        <div
          key={t.id}
          className={`toast toast-${t.type}${t.leaving ? ' toast-leaving' : ''}`}
          onClick={() => onDismiss(t.id)}
        >
          <span className="toast-icon">{ICONS[t.type]}</span>
          <span className="toast-message">{t.message}</span>
          <button
            type="button"
            className="toast-close"
            aria-label="Dismiss notification"
            onClick={(e) => { e.stopPropagation(); onDismiss(t.id); }}
          >
            ×
          </button>
        </div>
      ))}
    </div>
  );
};

export default ToastViewport;
