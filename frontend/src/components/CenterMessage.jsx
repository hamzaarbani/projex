import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircleIcon, XCircleIcon, InformationCircleIcon } from '@heroicons/react/24/outline';

const CenterMessage = ({ isOpen, onClose, message, type = 'success', duration = 3000 }) => {
  useEffect(() => {
    if (isOpen && duration > 0) {
      const timer = setTimeout(() => {
        onClose();
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [isOpen, duration, onClose]);

  if (!isOpen) return null;

  const icons = {
    success: <CheckCircleIcon className="w-12 h-12 text-green-500" />,
    error: <XCircleIcon className="w-12 h-12 text-red-500" />,
    info: <InformationCircleIcon className="w-12 h-12 text-blue-500" />,
  };

  const bgColors = {
    success: 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800',
    error: 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800',
    info: 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800',
  };

  const textColors = {
    success: 'text-green-800 dark:text-green-300',
    error: 'text-red-800 dark:text-red-300',
    info: 'text-blue-800 dark:text-blue-300',
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          className={`max-w-md w-full ${bgColors[type]} border rounded-2xl shadow-2xl p-8 text-center`}
        >
          <div className="flex flex-col items-center">
            {icons[type]}
            <p className={`mt-4 text-lg font-medium ${textColors[type]}`}>{message}</p>
            <button
              onClick={onClose}
              className="mt-6 px-6 py-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition"
            >
              Okay
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default CenterMessage;