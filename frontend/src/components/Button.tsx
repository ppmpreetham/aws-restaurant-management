import React from "react"

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "danger"
  size?: "sm" | "md" | "lg"
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className = "", variant = "primary", size = "md", children, ...props }, ref) => {
    const baseStyles =
      "inline-flex items-center justify-center font-[var(--font-mono)] text-[var(--label)] uppercase tracking-widest transition-colors focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed"

    const variants = {
      primary: "bg-[var(--text-secondary)] text-[var(--black)] hover:bg-white hover:text-black",
      secondary:
        "bg-[var(--surface-raised)] text-[var(--text-primary)] hover:bg-[var(--border-visible)]",
      outline:
        "bg-transparent border border-[var(--border-visible)] text-[var(--text-primary)] hover:border-[var(--text-secondary)]",
      danger: "bg-[var(--accent)] text-[var(--text-display)] hover:bg-red-700",
    }

    const sizes = {
      sm: "px-3 py-1.5 rounded-sm",
      md: "px-6 py-3 rounded",
      lg: "px-8 py-4 text-sm rounded",
    }

    return (
      <button
        ref={ref}
        className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
        {...props}
      >
        {children}
      </button>
    )
  },
)

Button.displayName = "Button"
