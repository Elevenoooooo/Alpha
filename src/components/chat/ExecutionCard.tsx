import { Check, Circle, LoaderCircle, Pause } from "lucide-react";
import { useRef, useState } from "react";
import { gsap } from "gsap";
import { useGSAP } from "@gsap/react";
import { executionSteps } from "../../data/mockData";

export function ExecutionCard({ activeStep }: { activeStep: number }) {
  const root = useRef<HTMLElement>(null);
  const [paused, setPaused] = useState(false);

  useGSAP(
    () => {
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
      const current = root.current?.querySelector(".execution-step.is-active");
      if (current) {
        gsap.fromTo(current, { x: -5, autoAlpha: 0.55 }, { x: 0, autoAlpha: 1, duration: 0.32, ease: "power2.out" });
      }
    },
    { scope: root, dependencies: [activeStep], revertOnUpdate: true },
  );

  return (
    <article ref={root} className="execution-card answer-card">
      <header className="execution-head">
        <span className="thinking-orb"><LoaderCircle /></span>
        <div><h3>{paused ? "任务已暂停" : "Alpha 正在执行计划"}</h3><p>{paused ? "本页仅演示界面暂停，不改变业务结果。" : "你可以离开当前页面，完成后将通过京ME通知。"}</p></div>
        <button className="icon-text-button" onClick={() => setPaused((value) => !value)}><Pause />{paused ? "继续" : "暂停"}</button>
      </header>
      <div className="execution-progress"><i style={{ width: `${((activeStep + 1) / executionSteps.length) * 100}%` }} /></div>
      <div className="execution-steps">
        {executionSteps.map((step, index) => {
          const done = index < activeStep;
          const active = index === activeStep;
          return (
            <div className={`execution-step ${active ? "is-active" : ""} ${done ? "is-done" : ""}`} key={step}>
              {done ? <Check /> : active ? <LoaderCircle className="spin" /> : <Circle />}
              <span>{step}</span>
              <small>{done ? "已完成" : active ? "进行中" : "等待"}</small>
            </div>
          );
        })}
      </div>
    </article>
  );
}
