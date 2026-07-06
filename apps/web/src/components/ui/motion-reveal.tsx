"use client";

import { BlurFade } from "bynana-ui/blur-fade";
import type { ReactNode } from "react";

type MotionRevealProps = {
  children: ReactNode;
  className?: string;
  delay?: number;
};

export function MotionReveal({
  children,
  className,
  delay = 0,
}: MotionRevealProps) {
  return (
    <BlurFade className={className} delay={delay} duration={0.55} blur={8}>
      {children}
    </BlurFade>
  );
}
