import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { AnimatePresence, motion } from "framer-motion";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "relative inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive overflow-hidden",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground shadow-xs hover:bg-primary/90",
        destructive:
          "bg-destructive text-white shadow-xs hover:bg-destructive/90 focus-visible:ring-destructive/20 dark:focus-visible:ring-destructive/40 dark:bg-destructive/60",
        outline:
          "border bg-background shadow-xs hover:bg-accent hover:text-accent-foreground dark:bg-input/30 dark:border-input dark:hover:bg-input/50",
        secondary: "bg-secondary text-secondary-foreground shadow-xs hover:bg-secondary/80",
        ghost: "hover:bg-accent hover:text-accent-foreground dark:hover:bg-accent/50",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default: "h-9 px-4 py-2 has-[>svg]:px-3",
        sm: "h-8 rounded-md gap-1.5 px-3 has-[>svg]:px-2.5",
        lg: "h-10 rounded-md px-6 has-[>svg]:px-4",
        icon: "size-9",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

interface Ripple {
  x: number;
  y: number;
  size: number;
  key: number;
}

function Button({
  className,
  variant,
  size,
  asChild = false,
  onClick,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean;
  }) {
  const Comp = asChild ? Slot : "button";
  const [ripples, setRipples] = React.useState<Ripple[]>([]);

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (asChild) {
      onClick?.(e);
      return;
    }

    const button = e.currentTarget;
    const rect = button.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height);
    const x = e.clientX - rect.left - size / 2;
    const y = e.clientY - rect.top - size / 2;

    const newRipple = { x, y, size, key: Date.now() };
    setRipples((prev) => [...prev, newRipple]);
    
    onClick?.(e);
  };

  return (
    <Comp
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      onClick={handleClick}
      {...props}
    >
      {/* 按钮内容 */}
      <span className="relative z-10 flex items-center gap-2">
        {props.children}
      </span>

      {/* 液态涟漪 */}
      {!asChild && (
        <span className="absolute inset-0 z-0 pointer-events-none">
          <AnimatePresence>
            {ripples.map((ripple) => (
              <motion.span
                key={ripple.key}
                initial={{ 
                  scale: 0, 
                  opacity: 0.35,
                  x: ripple.x,
                  y: ripple.y,
                }}
                animate={{ 
                  scale: 2.5, 
                  opacity: 0,
                }}
                exit={{ opacity: 0 }}
                transition={{ 
                  duration: 0.8, 
                  ease: "easeOut" 
                }}
                onAnimationComplete={() => {
                  setRipples((prev) => prev.filter((r) => r.key !== ripple.key));
                }}
                className="absolute rounded-full bg-current"
                style={{
                  width: ripple.size,
                  height: ripple.size,
                }}
              />
            ))}
          </AnimatePresence>
        </span>
      )}
    </Comp>
  );
}

export { Button, buttonVariants };