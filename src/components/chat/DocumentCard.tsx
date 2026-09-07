import { Download, FileText, Maximize2 } from "lucide-react";

export function DocumentCard({ onOpen }: { onOpen: () => void }) {
  return (
    <article className="document-card answer-card">
      <header className="answer-card-head">
        <span className="answer-card-icon"><FileText /></span>
        <div>
          <h3>手机类目延保经营与方案设计依据</h3>
          <p>顶部摘要 + 四象限结论，数值与产品责任设计保持一致。</p>
        </div>
      </header>
      <div className="document-preview">
        手机主品月 GMV 4.67 亿，但延保渗透仅 2.1%，核心缺口集中在碎屏、核心部件故障和换新需求。建议采用不同价位段与责任边界形成三档方案。
      </div>
      <footer className="card-actions">
        <button className="primary-button" onClick={onOpen}><Maximize2 />查看全文</button>
        <button className="secondary-button"><Download />下载</button>
      </footer>
    </article>
  );
}
