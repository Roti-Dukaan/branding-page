import { toast as sonnerToast, type ExternalToast } from "sonner";

const brandToastClass =
  "!bg-[#FFFDF7] !border !border-[#D97706] !text-[#1F2937] [&_[data-title]]:text-[#1F2937]";

/** Errors only — generic success/info toasts stay silent (UI shows state instead). */
function error(message: string, data?: ExternalToast) {
  sonnerToast.error(message, data);
}

/** Login OTP and other critical auth notices — brand cream + orange. */
function otp(message: string, data?: ExternalToast) {
  sonnerToast(message, {
    className: brandToastClass,
    duration: 5000,
    ...data,
  });
}

function noop(_message?: string, _data?: ExternalToast) {
  /* intentionally silent */
}

export const toast = {
  error,
  otp,
  success: noop,
  info: noop,
  message: noop,
  warning: noop,
  promise: sonnerToast.promise,
  dismiss: sonnerToast.dismiss,
  loading: noop,
};