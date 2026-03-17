import * as React from "react";
import { cva } from "class-variance-authority";
import { Loader2 } from "lucide-react";
import { Slot } from "@radix-ui/react-slot";
import { cn } from "../../lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center rounded-md font-medium transition-all focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-brand-primary disabled:pointer-events-none disabled:opacity-50 relative group",
  {
    variants: {
      variant: {
        primary: "bg-brand-primary text-white hover:bg-brand-primary/90 shadow-sm",
        secondary: "bg-brand-surface text-brand-primary-dark hover:bg-brand-surface/80",
        ghost: "bg-transparent text-brand-primary-dark hover:bg-brand-primary/10",
        cta: "bg-transparent border-none px-[18px] py-[12px] h-auto active:scale-95 before:content-[''] before:absolute before:top-0 before:left-0 before:block before:rounded-[50px] before:bg-brand-primary before:w-[45px] before:h-[45px] before:transition-all before:duration-300 hover:before:w-full",
        link: "bg-transparent p-0 h-auto text-brand-text-secondary hover:text-brand-primary transition-colors",
      },
      size: {
        sm: "h-8 px-3 text-xs",
        md: "h-10 px-4 py-2 text-sm",
        lg: "h-12 px-8 text-base",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "md",
    },
  }
);

const Button = React.forwardRef(
  ({ className, variant, size, asChild = false, loading = false, children, disabled, ...props }, ref) => {
    const isPrimary = variant === "primary";
    const isSecondary = variant === "secondary";
    const isCTA = variant === "cta";
    const isLink = variant === "link";
    const showArrow = isCTA || isPrimary || isSecondary || isLink;

    // This internal renderer ensures decorations (like the CTA/Primary/Secondary arrow) 
    // are present even when using asChild.
    const renderContent = (content) => (
      <>
        <span
          className={cn(
            "relative flex items-center justify-center gap-2 z-10 transition-colors duration-300",
            loading && "opacity-0",
            isCTA && "font-['Ubuntu'] font-bold tracking-[0.05em] text-brand-surface text-[18px]"
          )}
        >
          {content}
          {showArrow && (
            <svg
              width="15px"
              height="10px"
              viewBox="0 0 13 10"
              className={cn(
                "relative top-0 ml-[10px] fill-none stroke-[2] transform transition-all duration-300",
                (isCTA || isPrimary || isSecondary) ? "-translate-x-[5px] group-hover:translate-x-0" : "translate-x-0 opacity-50 group-hover:translate-x-2 group-hover:opacity-100",
                isCTA && "stroke-brand-surface",
                isPrimary && "stroke-white",
                isSecondary && "stroke-brand-primary-dark",
                isLink && "stroke-current"
              )}
            >
              <path
                d="M1,5 L11,5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <polyline
                points="8 1 12 5 8 9"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          )}
        </span>
        {loading && (
          <div className="absolute inset-0 flex items-center justify-center z-20">
            <Loader2 className="h-5 w-5 animate-spin" />
          </div>
        )}
      </>
    );

    if (asChild && React.isValidElement(children)) {
      const Comp = Slot;
      return (
        <Comp
          className={cn(buttonVariants({ variant, size, className }))}
          ref={ref}
          disabled={loading || disabled}
          {...props}
        >
          {React.cloneElement(children, {
            children: renderContent(children.props.children)
          })}
        </Comp>
      );
    }

    return (
      <button
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        disabled={loading || disabled}
        {...props}
      >
        {renderContent(children)}
      </button>
    );
  }
);

Button.displayName = "Button";

export { Button, buttonVariants };
