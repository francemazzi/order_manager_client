"use client";

import {
  Toast,
  ToastClose,
  ToastDescription,
  ToastProvider,
  ToastTitle,
  ToastViewport,
} from "@/components/ui/toast";
import { useToast } from "@/components/ui/use-toast";

export function Toaster() {
  const { toasts } = useToast();

  return (
    <ToastProvider>
      {toasts.map(function ({ id, title, description, action, ...props }) {
        return (
          <Toast
            key={id}
            {...props}
            className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700"
          >
            <div className="grid gap-1">
              {title && (
                <ToastTitle className="text-gray-900 dark:text-gray-100">
                  {title}
                </ToastTitle>
              )}
              {description && (
                <ToastDescription className="text-gray-500 dark:text-gray-400">
                  {description}
                </ToastDescription>
              )}
            </div>
            {action}
            <ToastClose className="text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100" />
          </Toast>
        );
      })}
      <ToastViewport />
    </ToastProvider>
  );
}
