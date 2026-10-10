import { CheckCircle2, Clock3, MessageCircleMore, RotateCcw, Send, Trash2, X, XCircle } from "lucide-react";
import { useMemo, useState } from "react";
import { AnimatedPanel } from "../components/layout/AnimatedPanel";
import { useWorkbench } from "../context/WorkbenchContext";
import { DesignProductDetail } from "../components/chat/DesignDetails";
import type { Product, ProductStatus } from "../domain/types";

const filters: ProductStatus[] = ["待询价", "询价中", "询价通过", "询价失败"];

export function ProductsPage() {
  const { products, requestQuote, setQuoteOutcome, startProductTask } = useWorkbench();
  const [filter, setFilter] = useState<ProductStatus>("待询价");
  const [confirmProduct, setConfirmProduct] = useState<Product>();
  const [deleteProduct, setDeleteProduct] = useState<Product>();
  const [hiddenIds, setHiddenIds] = useState<string[]>([]);
  const [detail, setDetail] = useState<Product>();
  const visible = useMemo(() => products.filter(product => product.status === filter && !hiddenIds.includes(product.id)), [filter, hiddenIds, products]);

  return (
    <div className="products-page page-surface">
      <AnimatedPanel>
        <header className="products-title"><h1>我的产品</h1></header>
        <nav className="product-status-tabs" aria-label="产品询价状态">
          {filters.map(item => <button className={filter === item ? "active" : ""} onClick={() => setFilter(item)} key={item}>{item}</button>)}
        </nav>
        <div className="product-record-list">
          {visible.map(product => (
            <article className="product-record" key={product.id}>
              <header className="record-head" role="button" tabIndex={0} aria-label={`查看${product.name}详情`} onClick={() => setDetail(product)} onKeyDown={event => { if (event.key === "Enter" || event.key === " ") { event.preventDefault(); setDetail(product); } }}>
                <div className="record-name"><h2>{product.name}</h2><span className={`record-status status-${product.status}`}>{product.status}</span></div>
                <div className="record-metric"><strong>{product.coverageRatio}</strong><span>投保比例</span></div>
              </header>
              <p className="record-product-id">产品ID：{product.id}</p>
              <p className="record-description">{product.serviceContent}</p>
              <dl className="record-fields">
                <div><dt>履约方式</dt><dd>{product.fulfillment}</dd></div>
                <div><dt>服务上限</dt><dd title={product.coverageLimit}>{product.coverageLimit}</dd></div>
                <div><dt>服务期间/有效期</dt><dd>{product.period}</dd></div>
                <div><dt>销售渠道</dt><dd>{product.salesChannels.join("、")}</dd></div>
              </dl>
              <footer>
                {product.status === "待询价" && <button className="primary-button" onClick={() => setConfirmProduct(product)}><Send />去询价</button>}
                {product.status === "询价中" && <div className="demo-outcomes"><span>Demo 结果：</span><button onClick={() => setQuoteOutcome(product.id, "询价通过")}><CheckCircle2 />通过</button><button onClick={() => setQuoteOutcome(product.id, "询价失败")}><XCircle />失败</button></div>}
                {product.status === "询价失败" && <button className="primary-button" onClick={() => setConfirmProduct(product)}><RotateCcw />重新询价</button>}
                {product.status === "询价通过" && <button className="primary-button" onClick={() => setDetail(product)}><CheckCircle2 />查看产品</button>}
                <button className="secondary-button" onClick={() => startProductTask(`优化产品：${product.name}`)}><MessageCircleMore />产品优化</button>
                <button className="record-delete" onClick={() => setDeleteProduct(product)}><Trash2 />删除方案</button>
              </footer>
            </article>
          ))}
          {!visible.length && <div className="empty-list"><Clock3 /><h2>当前没有{filter}产品</h2><p>在会话中点击“使用方案”后，产品会进入这里。</p></div>}
        </div>
      </AnimatedPanel>
      {confirmProduct && (
        <div className="modal-backdrop" onMouseDown={event => event.target === event.currentTarget && setConfirmProduct(undefined)}>
          <section className="confirm-modal">
            <header><div><h2>提交询报价系统</h2><p>确认后产品状态将更新为“询价中”</p></div><button onClick={() => setConfirmProduct(undefined)}><X /></button></header>
            <div className="confirm-product"><strong>{confirmProduct.name}</strong><span>产品ID：{confirmProduct.id}</span></div>
            <div className="confirm-warning"><Clock3 />询价结果由外部询报价系统返回；Demo 中可手动演示通过或失败。</div>
            <footer><button className="secondary-button" onClick={() => setConfirmProduct(undefined)}>取消</button><button className="primary-button" onClick={() => { requestQuote(confirmProduct.id); setConfirmProduct(undefined); }}>确认提交</button></footer>
          </section>
        </div>
      )}
      {deleteProduct && (
        <div className="modal-backdrop" onMouseDown={event => event.target === event.currentTarget && setDeleteProduct(undefined)}>
          <section className="confirm-modal compact-confirm">
            <header><div><h2>删除方案</h2><p>仅删除当前 Demo 中的产品方案</p></div><button onClick={() => setDeleteProduct(undefined)}><X /></button></header>
            <div className="confirm-product"><strong>{deleteProduct.name}</strong><span>产品ID：{deleteProduct.id}</span></div>
            <footer><button className="secondary-button" onClick={() => setDeleteProduct(undefined)}>取消</button><button className="danger-button" onClick={() => { setHiddenIds(ids => [...ids, deleteProduct.id]); setDeleteProduct(undefined); }}>确认删除</button></footer>
          </section>
        </div>
      )}
      {detail && <DesignProductDetail product={detail} onClose={() => setDetail(undefined)} />}
    </div>
  );
}
