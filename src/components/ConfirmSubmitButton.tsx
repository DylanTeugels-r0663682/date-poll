"use client";

type Props = {
  confirmText: string;
  className?: string;
  children: React.ReactNode;
};

export function ConfirmSubmitButton({ confirmText, className, children }: Props) {
  return (
    <button
      type="submit"
      className={className}
      onClick={(e) => {
        if (!window.confirm(confirmText)) {
          e.preventDefault();
        }
      }}
    >
      {children}
    </button>
  );
}
