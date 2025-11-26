import React, { ReactNode } from "react";
import { X } from "lucide-react";

interface ModalProps {
  show: boolean;
  onClose: () => void;
  children: ReactNode;
}

const Modal: React.FC<ModalProps> = ({ show, onClose, children }) => {
  if (!show) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm bg-black/30 overflow-y-auto p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl relative max-w-2xl w-full max-h-[90vh] overflow-y-auto transform transition-all duration-300 scale-95 animate-in fade-in-90 zoom-in-90"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-800 hover:bg-gray-100 rounded-full p-1 transition"
          onClick={onClose}
        >
          <X className="w-5 h-5" />
        </button>
        <div className="p-6"> {children}</div>
      </div>
    </div>
  );
};

export default Modal;