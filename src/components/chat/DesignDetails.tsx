import { BookOpen, Download, X } from "lucide-react";
import { useEffect, useRef, type ReactNode } from "react";
import type { DesignCase, DesignDocument } from "../../data/designCases";
import type { Product } from "../../domain/types";
import { DesignMarkdown } from "./DesignMarkdown";

function DetailDialog({ title, subtitle, children, onClose, className = "" }: { title: string; subtitle?: string; children: ReactNode; onClose: () => void; className?: string }) {
  const dialog = useRef<HTMLDialogElement>(null);
  useEffect(() => { const element = dialog.current; element?.showModal(); return () => element?.close(); }, []);
  return <dialog ref={dialog} className={`design-dialog ${className}`} aria-label={title} onCancel={onClose} onClick={event => { if (event.target === event.currentTarget) onClose(); }}>
    <div className="design-dialog-surface">
      <header className="drawer-header"><div><h2>{title}</h2>{subtitle && <p>{subtitle}</p>}</div><button aria-label="关闭详情" onClick={onClose}><X /></button></header>
      {children}
    </div>
  </dialog>;
}

export function downloadDesignDocument(document: DesignDocument) {
  const url = URL.createObjectURL(new Blob([document.markdown], { type: "text/markdown;charset=utf-8" }));
  const link = window.document.createElement("a");
  link.href = url; link.download = document.name;
  window.document.body.append(link); link.click(); link.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export function DesignDocumentDetail({ data, onClose, onDeposit }: { data: DesignCase; onClose: () => void; onDeposit: (document: DesignDocument) => void }) {
  const article = useRef<HTMLElement>(null);
  return <DetailDialog title={data.document.name} subtitle="产品设计文档 · Demo" className="design-document-dialog" onClose={onClose}>
    <div className="design-document-tools"><button className="secondary-button" onClick={() => downloadDesignDocument(data.document)}><Download />下载 Markdown</button><button className="secondary-button" onClick={() => onDeposit(data.document)}><BookOpen />沉淀到 Wiki</button></div>
    <article ref={article} className="design-document-body"><DesignMarkdown onEvidence={id => {
      const item = data.evidence.find(item => item.id === id);
      const entry = item && Array.from(article.current?.querySelectorAll("h3") ?? []).find(heading => heading.textContent?.includes(item.title));
      entry?.scrollIntoView({ behavior: "smooth", block: "center" });
      entry?.setAttribute("tabindex", "-1");
      (entry as HTMLElement | undefined)?.focus({preventScroll:true});
    }}>{data.document.markdown}</DesignMarkdown>
    </article>
  </DetailDialog>;
}

function ReadField({ label, value, wide = false }: { label: string; value: string; wide?: boolean }) {
  return <label className={wide ? "field-wide" : ""}><span>{label}</span><div className="design-read-field">{value}</div></label>;
}

export function DesignProductDetail({ product, onClose, onUse }: { product: Product; onClose: () => void; onUse?: (product: Product) => void }) {
  const detail = product.details;
  return <DetailDialog title="产品详情" subtitle={`${product.id} · 演示方案`} onClose={onClose}>
    <div className="design-product-detail-body">
      <div className="design-product-tags">{product.recommended && <span className="recommend-tag">优先推荐</span>}{product.relationship && <span className={product.relationship === "线上互补品" ? "complement-tag" : "substitute-tag"}>{product.relationship}</span>}</div>
      <section><h3>基础信息</h3><div className="design-field-grid"><ReadField label="产品标题" value={product.name} wide /><ReadField label="销售价格（AI 建议）" value={product.price} wide /></div></section>
      {product.comparisonTarget && <section className="design-relationship"><h3>与线上产品的关系</h3><p><strong>对标产品：</strong>{product.comparisonTarget}</p><p>{product.relationshipReason}</p></section>}
      <section><h3>规格属性</h3><div className="design-field-grid">
        <ReadField label="服务名称" value={detail?.serviceName ?? product.name} /><ReadField label="SPU 名称" value={detail?.spuName ?? product.name} />
        <ReadField label="增值服务分类" value={detail?.serviceCategory ?? "性能保障"} /><ReadField label="核保产品分类" value={detail?.underwritingCategory ?? "延长保修"} />
        <ReadField label="有效期" value={product.period} /><ReadField label="服务等待期 / 生效条件" value={detail?.waitingPeriod ?? "待确认"} />
        <ReadField label="适用价段" value={product.priceRange} /><ReadField label="打款方式" value={detail?.paymentMethod ?? "待确认"} />
        <ReadField label="履约方式" value={product.fulfillment} /><ReadField label="保障上限" value={product.coverageLimit} />
        <ReadField label="销售渠道" value={detail?.channels ?? "待确认"} wide />
      </div></section>
      <section><h3>服务条款</h3><div className="design-field-grid"><ReadField label="服务内容描述" value={product.serviceContent} wide />{detail && <ReadField label="不包含的责任" value={detail.exclusions} wide />}</div></section>
      <section><h3>评审信息</h3><p>Demo 评审状态：{product.underwriting}</p><p className="design-evidence-limit">{detail?.underwritingNote ?? "正式询价前需确认责任边界、履约资源与定价。"}</p></section>
    </div>
    {onUse && <footer className="design-detail-footer"><span>使用后进入「我的产品」继续询价</span><button className="primary-button" disabled={product.used} onClick={() => onUse(product)}>{product.used ? "已使用方案" : "使用方案"}</button></footer>}
  </DetailDialog>;
}
