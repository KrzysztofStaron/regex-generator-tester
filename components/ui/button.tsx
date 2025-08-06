import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all duration-200 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive shadow-lg",
  {
    variants: {
      variant: {
        default:
          "bg-gradient-to-r from-blue-600 via-blue-700 to-blue-800 border border-blue-500/50 text-white hover:from-blue-500 hover:via-blue-600 hover:to-blue-700 hover:text-white",
        destructive:
          "bg-gradient-to-r from-red-600 via-red-700 to-red-800 border border-red-500/50 text-white hover:from-red-500 hover:via-red-600 hover:to-red-700 hover:text-white",
        outline:
          "bg-gradient-to-r from-zinc-800 via-zinc-700 to-zinc-800 border border-zinc-600/50 text-zinc-200 hover:from-zinc-700 hover:via-zinc-600 hover:to-zinc-700 hover:text-white",
        secondary:
          "bg-gradient-to-r from-zinc-700 via-zinc-600 to-zinc-700 border border-zinc-500/50 text-zinc-200 hover:from-zinc-600 hover:via-zinc-500 hover:to-zinc-600 hover:text-white",
        ghost: "bg-transparent border border-transparent text-zinc-300 hover:bg-zinc-800/50 hover:text-white",
        link: "text-blue-400 underline-offset-4 hover:underline hover:text-blue-300",
        success:
          "bg-gradient-to-r from-green-600 via-green-700 to-green-800 border border-green-500/50 text-white hover:from-green-500 hover:via-green-600 hover:to-green-700 hover:text-white",
        warning:
          "bg-gradient-to-r from-yellow-600 via-yellow-700 to-yellow-800 border border-yellow-500/50 text-white hover:from-yellow-500 hover:via-yellow-600 hover:to-yellow-700 hover:text-white",
        info: "bg-gradient-to-r from-cyan-600 via-cyan-700 to-cyan-800 border border-cyan-500/50 text-white hover:from-cyan-500 hover:via-cyan-600 hover:to-cyan-700 hover:text-white",
        purple:
          "bg-gradient-to-r from-purple-600 via-purple-700 to-purple-800 border border-purple-500/50 text-white hover:from-purple-500 hover:via-purple-600 hover:to-purple-700 hover:text-white",
        orange:
          "bg-gradient-to-r from-orange-600 via-orange-700 to-orange-800 border border-orange-500/50 text-white hover:from-orange-500 hover:via-orange-600 hover:to-orange-700 hover:text-white",
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
  }
);

function Button({
  className,
  variant,
  size,
  asChild = false,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean;
  }) {
  const Comp = asChild ? Slot : "button";

  return <Comp data-slot="button" className={cn(buttonVariants({ variant, size, className }))} {...props} />;
}

export { Button, buttonVariants };
