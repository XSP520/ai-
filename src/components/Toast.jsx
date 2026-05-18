import { useEffect, useState, useCallback } from 'react';

let toastIdCounter = 0;
let globalAddToast = null;

export function toast(message, type = 'success') {
  if (globalAddToast) {
    globalAddToast({ id: ++toastIdCounter, message, type });
  }
}

export default function ToastContainer() {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((t) => {
    setToasts((prev) => [...prev, t]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((item) => item.id !== t.id));
    }, 2500);
  }, []);

  useEffect(() => {
    globalAddToast = addToast;
    return () => {
      globalAddToast = null;
    };
  }, [addToast]);

  return (
    <div className="fixed bottom-6 right-6 z-[100] flex flex-col gap-3 pointer-events-none">
      {toasts.map((t) => (
        <div
          key={t.id}
          className="animate-slide-up pointer-events-auto px-5 py-3 rounded-xl shadow-lg bg-white dark:bg-[#1E293B] border border-[#E2E8F0] dark:border-[#334155] text-sm font-medium text-[#1E293B] dark:text-[#E2E8F0] flex items-center gap-2"
        >
          <span className="text-lg">
            {t.type === 'success' ? '🎉' : t.type === 'stage' ? '🏆' : '👍'}
          </span>
          {t.message}
        </div>
      ))}
    </div>
  );
}
