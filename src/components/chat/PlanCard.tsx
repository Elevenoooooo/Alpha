import { CheckCircle2, ListChecks, RefreshCw } from "lucide-react";
import { planTasks } from "../../data/mockData";

export function PlanCard({ onConfirm, onRegenerate }: { onConfirm: () => void; onRegenerate: () => void }) {
  return (
    <article className="plan-card answer-card">
      <header className="answer-card-head">
        <span className="answer-card-icon"><ListChecks /></span>
        <div>
          <h3>产品设计任务计划</h3>
          <p>我会先明确业务边界，再形成可进入询报价的产品方案。</p>
        </div>
        <span className="soft-badge">待确认</span>
      </header>
      <div className="plan-goal">
        <small>任务目标</small>
        <strong>为手机类目设计 3 款差异化延保方案，并完成初步核保检查</strong>
      </div>
      <ol className="plan-list">
        {planTasks.map((task, index) => (
          <li key={task}>
            <span>{index + 1}</span>
            <div><strong>{task}</strong><small>{index === 0 ? "确认范围后再开始执行" : "由 Alpha 查询、分析并保留依据"}</small></div>
            {index === 0 && <CheckCircle2 />}
          </li>
        ))}
      </ol>
      <footer className="card-actions">
        <button className="primary-button" onClick={onConfirm}><CheckCircle2 />确认计划并开始</button>
        <button className="secondary-button" onClick={onRegenerate}><RefreshCw />重新生成计划</button>
      </footer>
    </article>
  );
}
