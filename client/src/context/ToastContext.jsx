import React, { createContext, useCallback, useContext, useRef, useState } from 'react';

const ToastContext = createContext(null);

export const useToast = () => {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within ToastProvider');
  return ctx;
};

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);
  const idRef = useRef(0);

  const dismiss = useCallback((id) => setToasts((t) => t.filter((x) => x.id !== id)), []);

  const push = useCallback((message, type = 'info', ms = 4500) => {
    const id = ++idRef.current;
    setToasts((t) => [...t, { id, message, type }]);
    setTimeout(() => dismiss(id), ms);
  }, [dismiss]);

  const api = {
    success: (m) => push(m, 'success'),
    error: (m) => push(m, 'error', 6500),
    info: (m) => push(m, 'info')
  };

  return (
    <ToastContext.Provider value={api}>
      {children}
      <div className="toast-region" role="status" aria-live="polite">
        {toasts.map((t) => (
          <div key={t.id} className={`toast toast-${t.type}`}>
            <span>{t.message}</span>
            <button type="button" className="toast-close" onClick={() => dismiss(t.id)} aria-label="Dismiss">×</button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
};
