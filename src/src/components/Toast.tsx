import { X } from 'lucide-react';

interface ToastProps {
  message: string;
  onClose: () => void;
}

export default function Toast({ message, onClose }: ToastProps) {
  return (
    <div className="fixed bottom-6 right-6 z-50 p-4 rounded-2xl glass-modal border-2 border-amber-400 shadow-2xl text-xs font-bold text-stone-900 flex items-center gap-3 animate-bounce">
      <span>{message}</span>
      <button onClick={onClose} className="p-1 hover:text-stone-600">
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}
