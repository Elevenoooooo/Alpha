import { BookOpen, Check, ChevronDown, Download, X } from "lucide-react";
import { useEffect, useRef, useState, type ReactNode } from "react";
import type { DesignCase, DesignDocument } from "../../data/designCases";
import { SALES_CHANNEL_OPTIONS, type Product, type SalesChannel } from "../../domain/types";
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

function FieldLabel({ label, required = false, hint }: { label: string; required?: boolean; hint?: string }) {
  return <span className="product-form-label">{required && <i>*</i>}{label}{hint && <small>{hint}</small>}</span>;
}

function TextField({ label, value, required = false, disabled = false, suffix, wide = false }: { label: string; value: string; required?: boolean; disabled?: boolean; suffix?: string; wide?: boolean }) {
  return <label className={wide ? "field-wide" : ""}><FieldLabel label={label} required={required} hint={disabled ? "（不可修改）" : undefined} /><div className={`product-form-control ${disabled ? "is-disabled" : ""}`}><input defaultValue={value} disabled={disabled} />{suffix && <b>{suffix}</b>}</div></label>;
}

function SelectField({ label, value, options, required = false, wide = false }: { label: string; value: string; options: string[]; required?: boolean; wide?: boolean }) {
  const choices = Array.from(new Set([value, ...options].filter(Boolean)));
  return <label className={wide ? "field-wide" : ""}><FieldLabel label={label} required={required} /><select className="product-form-select" defaultValue={value}>{choices.map(option => <option value={option} key={option}>{option}</option>)}</select></label>;
}

function TextareaField({ label, value, required = false }: { label: string; value: string; required?: boolean }) {
  return <label className="field-wide"><FieldLabel label={label} required={required} /><textarea className="product-form-textarea" defaultValue={value} /></label>;
}

function ChannelField({ value }: { value: SalesChannel[] }) {
  const [selected, setSelected] = useState<SalesChannel[]>(value);
  const toggle = (channel: SalesChannel) => setSelected(items => items.includes(channel) ? items.filter(item => item !== channel) : [...items, channel]);
  return <fieldset className="field-wide product-channel-field">
    <legend><FieldLabel label="销售渠道" required /></legend>
    <details className="product-multiselect">
      <summary><span className={selected.length ? "" : "is-placeholder"}>{selected.length ? selected.join("、") : "请选择销售渠道"}</span><ChevronDown /></summary>
      <div className="product-multiselect-menu" role="group" aria-label="销售渠道选项">
        {SALES_CHANNEL_OPTIONS.map(channel => <button type="button" aria-pressed={selected.includes(channel)} onClick={() => toggle(channel)} key={channel}><span className="multiselect-check">{selected.includes(channel) && <Check />}</span>{channel}</button>)}
      </div>
    </details>
  </fieldset>;
}

export function DesignProductDetail({ product, onClose, onUse }: { product: Product; onClose: () => void; onUse?: (product: Product) => void }) {
  const detail = product.details;
  const [tab, setTab] = useState<"detail" | "history">("detail");
  const numericPrice = product.price.replace(/[^\d.]/g, "");
  const numericRatio = product.coverageRatio.replace("%", "");
  return <DetailDialog title="产品详情" onClose={onClose}>
    <nav className="product-detail-tabs"><button className={tab === "detail" ? "active" : ""} onClick={() => setTab("detail")}>产品详情</button><button className={tab === "history" ? "active" : ""} onClick={() => setTab("history")}>修订记录</button></nav>
    {tab === "detail" ? <div className="design-product-detail-body">
      <div className="product-detail-summary"><div><h2>{product.name}</h2><p>{product.id}</p></div><span className={`record-status status-${product.status ?? "待询价"}`}>{product.status ?? "待询价"}</span></div>
      <section><h3>基础信息</h3><div className="design-field-grid">
        <TextField label="产品标题" value={product.name} disabled wide />
        <TextField label="建议单价" value={numericPrice} required suffix="元" />
        <TextField label="投保比例（%）" value={numericRatio} required suffix="%" />
        <TextField label="型号/价位段" value={product.priceRange} disabled wide />
      </div></section>
      <section><h3>规格属性</h3><div className="design-field-grid">
        <TextField label="服务名称" value={detail?.serviceName ?? product.name} required />
        <TextField label="SPU 名称" value={detail?.spuName ?? product.name} required />
        <SelectField label="增值服务分类" value={detail?.serviceCategory ?? "性能保障"} options={["性能保障", "意外保障", "服务补贴"]} required />
        <SelectField label="核保产品分类" value={detail?.underwritingCategory ?? "延长保修"} options={["质保换新", "延长保修", "意外保障", "服务补贴"]} required />
        <SelectField label="服务有效期" value={product.period} options={["1年", "2年", "3年", "4年"]} required />
        <SelectField label="服务等待期" value={detail?.waitingPeriod ?? "T+1年"} options={["即时生效", "T+30天", "T+1年", "原厂质保结束后起保"]} required />
        <SelectField label="打款方式" value={detail?.paymentMethod ?? "待确认"} options={["与服务商结算", "按实际费用核付", "待确认"]} required />
        <ChannelField value={product.salesChannels} />
      </div></section>
      <section><h3>服务条款</h3><div className="design-field-grid">
        <TextareaField label="服务内容" value={product.serviceContent} required />
        <SelectField label="履约方式" value={product.fulfillment} options={["维修", "换新", "维修后换新", "服务补贴"]} required />
        <SelectField label="处理方式" value={detail?.processingMethod ?? product.fulfillment} options={["维修", "换新", "维修后换新", "定额补贴"]} required />
        <SelectField label="保障上限" value={product.coverageLimit} options={["主商品实付金额 × 50%", "主商品实付金额 × 80%", "主商品实付金额 × 90%", "主商品实付金额 × 100%"]} required />
        <TextField label="服务方式" value={detail?.serviceMethod ?? product.fulfillment} required />
      </div></section>
    </div> : <div className="product-revision-empty"><ClockIcon /><h3>暂无修订记录</h3><p>产品字段调整后，修订内容将在这里留痕。</p></div>}
    {onUse && <footer className="design-detail-footer"><span>使用后进入「我的产品」继续询价</span><button className="primary-button" disabled={product.used} onClick={() => onUse(product)}>{product.used ? "已使用方案" : "使用方案"}</button></footer>}
  </DetailDialog>;
}

function ClockIcon() {
  return <span className="revision-clock" aria-hidden="true">↻</span>;
}
