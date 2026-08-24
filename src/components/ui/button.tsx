import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

/**
 * 버튼 문법은 두 가지뿐이다.
 *  - 액션(pill)   : 파란 알약. "이것을 누르세요" 신호는 오직 Action Blue.
 *  - 유틸리티(8px): 보조 동작. 검정/흰색 사각.
 * 눌림 상태는 시스템 전체에서 scale(0.96) 하나로 통일한다. 그림자는 쓰지 않는다.
 */
const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap font-normal transition-transform duration-150 active:scale-[0.96] disabled:pointer-events-none disabled:opacity-40 select-none",
  {
    variants: {
      variant: {
        primary: "bg-action text-white rounded-pill hover:bg-[#0071e3]",
        ghost: "bg-transparent text-action rounded-pill border border-action/60 hover:bg-action/5",
        dark: "bg-ink text-white rounded-sm hover:bg-black",
        pearl: "bg-canvas-pearl text-ink-80 rounded-md border border-divider-soft hover:bg-[#f2f2f5]",
        quiet: "bg-transparent text-ink-80 rounded-md hover:bg-canvas-parchment",
        link: "bg-transparent text-action underline-offset-4 hover:underline p-0 h-auto",
      },
      size: {
        sm: "text-caption px-[15px] py-2",
        md: "text-body px-[22px] py-[11px]",
        lg: "text-[1.125rem] font-light px-7 py-[14px]",
        icon: "h-11 w-11 p-0",
      },
    },
    defaultVariants: { variant: "primary", size: "md" },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return <Comp ref={ref} className={cn(buttonVariants({ variant, size }), className)} {...props} />;
  },
);
Button.displayName = "Button";
