import { useRef, type ReactNode } from "react";
import { gsap } from "gsap";
import { useGSAP } from "@gsap/react";

export function AnimatedPanel({ children, className = "" }: { children: ReactNode; className?: string }) {
  const scope = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const media = gsap.matchMedia();
      media.add({ reduceMotion: "(prefers-reduced-motion: reduce)" }, (context) => {
        if (context.conditions?.reduceMotion) {
          gsap.set(scope.current, { autoAlpha: 1 });
          return;
        }
        gsap.fromTo(
          scope.current,
          { autoAlpha: 0, y: 12, willChange: "transform,opacity" },
          { autoAlpha: 1, y: 0, duration: 0.42, ease: "power2.out", clearProps: "transform,opacity,visibility,will-change" },
        );
      }, scope.current ?? undefined);
      return () => media.revert();
    },
    { scope },
  );

  return (
    <div ref={scope} className={className} data-animated-panel>
      {children}
    </div>
  );
}
