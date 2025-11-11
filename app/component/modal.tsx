import React, { ReactNode } from "react";

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
      className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 overflow-y-auto p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-lg shadow-xl relative max-w-2xl w-full max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          className="absolute top-3 right-3 text-gray-500 hover:text-gray-800 text-2xl z-10"
          onClick={onClose}
        >
          &times;
        </button>
        <div className="p-6"> {children}</div>
      </div>
    </div>
  );
};

export default Modal;
