import { ArrowUpRight } from "lucide-react";
import { designCases } from "../../data/designCases";

export function DesignCasePicker({ activeId, compact = false, onSelect }: { activeId?: string; compact?: boolean; onSelect: (id: string) => void }) {
  return <section className={`design-case-picker ${compact ? "is-compact" : ""}`} aria-label="产品设计演示案例">
    <div className="design-case-heading"><strong>产品设计案例</strong><span>Demo</span></div>
    <div className="design-case-options">{designCases.map((item, index) => <button key={item.id} aria-pressed={activeId === item.id} onClick={() => onSelect(item.id)}>
      {!compact && <span className="design-case-index">0{index + 1}</span>}<span><strong>{item.category}</strong><small>{item.label}</small></span><ArrowUpRight />
    </button>)}</div>
  </section>;
}
