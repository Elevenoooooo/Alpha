import { Check, ChevronRight, Circle, LoaderCircle, X, Zap } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import type { DesignCase } from "../../data/designCases";
import type { ProductFlow } from "../../domain/types";

export function ProcessTrigger({ flow, onClick, open }: { flow: ProductFlow; onClick: () => void; open: boolean }) {
  const [, setTick] = useState(0);
  const finished = flow.stage === "result" || flow.stage === "superseded";
  useEffect(() => { if (finished) return; const timer = window.setInterval(() => setTick(value => value + 1), 1000); return () => window.clearInterval(timer); }, [finished]);
  const seconds = Math.max(0, Math.floor(((flow.completedAt ?? Date.now()) - (flow.startedAt ?? Date.now())) / 1000));
  return <button className={`design-process-trigger ${finished ? "is-complete" : ""}`} onClick={onClick} aria-expanded={open} aria-label="查看对话过程">
    {finished ? <Check /> : <LoaderCircle className="design-spin" />}<span>{flow.stage === "superseded" ? "本轮已调整" : finished ? "思考完成" : flow.stage === "planning" ? "正在组织计划" : "正在执行计划"}，耗时 {seconds} 秒</span><ChevronRight />
  </button>;
}

export function DesignProcessPanel({ data, flow, evidenceId, onEvidence, onClose }: { data: DesignCase; flow: ProductFlow; evidenceId?: string; onEvidence: (id?: string) => void; onClose: () => void }) {
  const finished = flow.stage === "result";
  const evidence = data.evidence.find(item => item.id === evidenceId);
  const panel = useRef<HTMLElement>(null);
  useEffect(() => { panel.current?.focus(); }, []);
  return <aside ref={panel} tabIndex={-1} className="design-process-panel" aria-label="对话过程" onKeyDown={event => { if (event.key === "Escape") onClose(); }}>
    <header><h2><Zap />对话过程</h2><button onClick={onClose} aria-label="关闭对话过程"><X /></button></header>
    <div className="design-process-tab">思维链<span>执行摘要</span></div>
    <div className="design-process-scroll">
      <p className="design-process-caption">演示执行步骤与依据摘要</p>
      <h3>{data.category} · {data.label}</h3>
      {evidence && <section className="design-evidence-card" aria-live="polite"><header><strong>{evidence.title}</strong><button aria-label="收起依据" onClick={() => onEvidence(undefined)}><X /></button></header><small>{evidence.source}</small><p>{evidence.content}</p><p className="design-evidence-limit">{evidence.limitation}</p></section>}
      <ol className="design-process-steps">{data.process.map((step, index) => {
        const done = finished || index < flow.executionStep;
        const active = !finished && flow.stage === "running" && index === flow.executionStep;
        return <li key={step.title} className={`${done ? "is-done" : ""} ${active ? "is-active" : ""}`}><span className="design-step-dot">{done ? <Check /> : active ? <LoaderCircle className="design-spin" /> : <Circle />}</span><div><h4>{step.title}</h4>{(done || active) && <><p>{step.summary}</p>{step.missing && <small className="design-missing-label">存在信息缺口</small>}{step.evidenceIds.map(id => <button className="design-process-source" key={id} onClick={() => onEvidence(id)}>{data.evidence.find(item => item.id === id)?.title ?? "查看依据"}<ChevronRight /></button>)}</>}</div></li>;
      })}</ol>
      {flow.stage === "superseded" && <p className="design-evidence-limit">本轮已停止，后续按新的输入要求继续。</p>}
    </div>
  </aside>;
}
