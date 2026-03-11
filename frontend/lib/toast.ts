import { toast } from "sonner";

export const toastSuccess = (message: string) =>
  toast.success(message, {
    className: "border border-[var(--backlog-purple)]/50 backdrop-blur-xl",
    style: {
      background: "rgba(135,86,241,0.25)",
      boxShadow: "0 0 20px rgba(135,86,241,0.4)",
      color: "white",
    },
  });

export const toastError = (message: string) =>
  toast.error(message, {
    className: "border border-[var(--backlog-pink)]/50 backdrop-blur-xl",
    style: {
      background: "rgba(255,38,132,0.25)",
      boxShadow: "0 0 20px rgba(255,38,132,0.4)",
      color: "white",
    },
  });

export const toastInfo = (message: string) =>
  toast(message, {
    className: "border border-[var(--backlog-orange)]/50 backdrop-blur-xl",
    style: {
      background: "rgba(255,123,69,0.25)",
      boxShadow: "0 0 20px rgba(255,123,69,0.4)",
      color: "white",
    },
  });
