import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'info';

export interface ToastItem {
  id: string;
  type: ToastType;
  title: string;
  message?: string;
}

// Global event bus for toast calls outside component trees
type ToastListener = (toasts: ToastItem[]) => void;
let globalToasts: ToastItem[] = [];
const listeners = new Set<ToastListener>();

function notifyListeners() {
  listeners.forEach((listener) => listener([...globalToasts]));
}

export const toast = {
  success: (title: string, message?: string) => {
    dispatchToast('success', title, message);
  },
  error: (title: string, message?: string) => {
    dispatchToast('error', title, message);
  },
  info: (title: string, message?: string) => {
    dispatchToast('info', title, message);
  }
};

function dispatchToast(type: ToastType, title: string, message?: string) {
  const id = `toast-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`;
  const item: ToastItem = { id, type, title, message };
  globalToasts = [...globalToasts, item];
  notifyListeners();

  setTimeout(() => {
    globalToasts = globalToasts.filter(t => t.id !== id);
    notifyListeners();
  }, 4000);
}

// Standalone ToastContainer
export const ToastContainer: React.FC = () => {
  const [items, setItems] = useState<ToastItem[]>(globalToasts);

  useEffect(() => {
    const handleUpdate = (updated: ToastItem[]) => {
      setItems(updated);
    };
    listeners.add(handleUpdate);
    return () => {
      listeners.delete(handleUpdate);
    };
  }, []);

  const removeToast = (id: string) => {
    globalToasts = globalToasts.filter(t => t.id !== id);
    notifyListeners();
  };

  if (items.length === 0) return null;

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none">
      {items.map(t => (
        <div
          key={t.id}
          className={`pointer-events-auto flex items-start gap-3 p-3.5 rounded-xl border shadow-md transition-all duration-200 bg-white ${
            t.type === 'success'
              ? 'border-[#42643A]/30 text-[#1C241D]'
              : t.type === 'error'
              ? 'border-red-300 text-red-900'
              : 'border-blue-300 text-slate-800'
          }`}
        >
          {t.type === 'success' && (
            <CheckCircle2 className="w-5 h-5 text-[#42643A] shrink-0 mt-0.5" />
          )}
          {t.type === 'error' && (
            <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
          )}
          {t.type === 'info' && (
            <Info className="w-5 h-5 text-[#2C5E7A] shrink-0 mt-0.5" />
          )}

          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold">{t.title}</p>
            {t.message && (
              <p className="text-[11px] text-[#586359] mt-0.5 line-clamp-2">{t.message}</p>
            )}
          </div>

          <button
            onClick={() => removeToast(t.id)}
            className="text-[#849085] hover:text-[#1C241D] p-0.5 rounded transition-colors cursor-pointer"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      ))}
    </div>
  );
};

// Context Provider and hook for backwards compatibility
interface ToastContextType {
  showToast: (title: string, type?: ToastType, message?: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const showToast = useCallback((title: string, type: ToastType = 'success', message?: string) => {
    dispatchToast(type, title, message);
  }, []);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <ToastContainer />
    </ToastContext.Provider>
  );
};

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    // Graceful fallback to global toast
    return {
      showToast: (title: string, type: ToastType = 'success', message?: string) => {
        dispatchToast(type, title, message);
      }
    };
  }
  return context;
}
