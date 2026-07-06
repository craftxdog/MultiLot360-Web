declare module "bynana-ui/count-up" {
  import type { ComponentType } from "react";

  export type CountUpProps = {
    end: number;
    start?: number;
    duration?: number;
    className?: string;
    prefix?: string;
    suffix?: string;
    decimals?: number;
  };

  export const CountUp: ComponentType<CountUpProps>;
  export default CountUp;
}

declare module "bynana-ui/blur-fade" {
  import type { ComponentType, HTMLAttributes, PropsWithChildren } from "react";
  export type BlurFadeProps = PropsWithChildren<HTMLAttributes<HTMLDivElement> & {
    delay?: number;
    duration?: number;
    blur?: number;
    inView?: boolean;
    inViewMargin?: string;
    yOffset?: number;
  }>;
  export const BlurFade: ComponentType<BlurFadeProps>;
  export default BlurFade;
}

declare module "bynana-ui/input-otp" {
  import type { ComponentType, HTMLAttributes, PropsWithChildren } from "react";
  export type InputOTPProps = PropsWithChildren<Omit<HTMLAttributes<HTMLDivElement>, "onChange"> & {
    maxLength?: number;
    value?: string;
    onChange?: (value: string) => void;
    onComplete?: (value: string) => void;
  }>;
  export const InputOTP: ComponentType<InputOTPProps>;
  export const InputOTPGroup: ComponentType<PropsWithChildren<HTMLAttributes<HTMLDivElement>>>;
  export const InputOTPSeparator: ComponentType<HTMLAttributes<HTMLDivElement>>;
  export const InputOTPSlot: ComponentType<HTMLAttributes<HTMLDivElement> & { index: number }>;
  export default InputOTP;
}
