import React from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

export interface ToastMessage {
  id: string;
  tipo: 'success' | 'warning' | 'info';
  titulo: string;
  mensagem?: string;
}

interface ToastContainerProps {
  toasts: ToastMessage[];
  onDismiss: (id: string) => void;
}

export const ToastContainer: React.FC<ToastContainerProps> = ({ toasts, onDismiss }) => {
  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none">
      {toasts.map(toast => {
        const icons = {
          success: <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />,
          warning: <AlertCircle className="w-5 h-5 text-amber-400 shrink-0" />,
          info: <Info className="w-5 h-5 text-blue-400 shrink-0" />
        };

        const borderStyles = {
          success: 'border-emerald-500/30 bg-[#0D1326]',
          warning: 'border-amber-500/30 bg-[#0D1326]',
          info: 'border-blue-500/30 bg-[#0D1326]'
        };

        return (
          <div
            key={toast.id}
            className={`pointer-events-auto flex items-start gap-3 p-4 rounded-xl border ${borderStyles[toast.tipo]} shadow-xl text-slate-100 transition-all duration-300 transform translate-y-0`}
          >
            {icons[toast.tipo]}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-white">{toast.titulo}</p>
              {toast.mensagem && <p className="text-xs text-slate-300 mt-0.5">{toast.mensagem}</p>}
            </div>
            <button
              onClick={() => onDismiss(toast.id)}
              className="text-slate-400 hover:text-white p-0.5"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
};
