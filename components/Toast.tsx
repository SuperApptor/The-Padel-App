
import React, { useEffect, useState } from 'react';
import { ToastType } from '../types';

interface ToastProps {
  message: string;
  type: ToastType;
  onClose: () => void;
}

const ToastComponent: React.FC<ToastProps> = ({ message, type, onClose }) => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    setVisible(true);
    const timer = setTimeout(() => {
      setVisible(false);
      // Allow time for fade-out animation before calling onClose
      setTimeout(onClose, 300); 
    }, 3700);

    return () => clearTimeout(timer);
  }, [message, type, onClose]);

  const bgColor = type === 'success' ? 'bg-green-500' : 'bg-red-500';

  return (
    <div 
        className={`fixed bottom-24 left-1/2 -translate-x-1/2 p-4 rounded-lg shadow-lg text-white font-semibold transition-all duration-300 ease-in-out z-50 ${bgColor} ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}
    >
      {message}
    </div>
  );
};

export default ToastComponent;