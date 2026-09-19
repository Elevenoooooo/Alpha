import { ChevronDown, ListChecks } from "lucide-react";
import { useEffect, useState } from "react";
import type { DesignPlan } from "../../data/designCases";
import type { ProductFlowStage } from "../../domain/types";

export function PlanCard({ plan, stage }: { plan: DesignPlan; stage: ProductFlowStage }) {
  const finished = stage === "result" || stage === "superseded";
  const [expanded, setExpanded] = useState(!finished);
  useEffect(() => { if (finished) setExpanded(false); }, [finished]);
  return (
    <section className={`design-plan ${expanded ? "is-expanded" : ""}`} aria-label="计划清单">
      <button className="design-plan-toggle" onClick={() => setExpanded(value => !value)} aria-expanded={expanded}>
        <ListChecks /><span>计划清单</span><small>{stage === "superseded" ? "已按新要求调整" : finished ? "已完成" : "执行中"}</small><ChevronDown />
      </button>
      {expanded && <div className="design-plan-body">
        <p className="design-plan-lead">{plan.lead}</p>
        <p className="design-plan-scope"><span>本次范围</span>{plan.scope}</p>
        <ol>{plan.steps.map((step, index) => <li key={step.title}><span>{index + 1}</span><div><strong>{step.title}</strong><p>{step.description}</p></div></li>)}</ol>
        {!finished && <p className="design-plan-hint">如需调整，直接在下方输入要求。</p>}
      </div>}
      {plan.note && <p className="design-plan-note">{plan.note}</p>}
    </section>
  );
}
