import { ArrowRight, CheckCircle2, Clock3, FileSearch, PackageCheck, RotateCcw, Send, X, XCircle } from "lucide-react";
import { useMemo, useState } from "react";
import { AnimatedPanel } from "../components/layout/AnimatedPanel";
import { useWorkbench } from "../context/WorkbenchContext";
import type { Product, ProductStatus } from "../domain/types";

const filters: Array<"全部" | ProductStatus> = ["全部", "待询价", "询价中", "询价通过", "询价失败"];

export function ProductsPage() {
  const { products, requestQuote, setQuoteOutcome, setView, startProductTask } = useWorkbench();
  const [filter, setFilter] = useState<(typeof filters)[number]>("全部");
  const [confirmProduct, setConfirmProduct] = useState<Product>();
  const [detail, setDetail] = useState<Product>();
  const visible = useMemo(() => (filter === "全部" ? products : products.filter((product) => product.status === filter)), [filter, products]);

  return (
    <div className="products-page page-surface">
      <AnimatedPanel>
        <header className="page-header">
          <div><h1>我的产品</h1><p>会话中确认使用的方案在这里进入正式询报价流转。</p></div>
          <button className="primary-button" onClick={() => { startProductTask("为手机类目设计 3 款差异化延保方案"); }}><PackageCheck />设计新产品</button>
        </header>

        <div className="status-summary">
          {filters.slice(1).map((status) => <div key={status}><span>{status}</span><strong>{products.filter((product) => product.status === status).length}</strong></div>)}
        </div>

        <nav className="filter-tabs">
          {filters.map((item) => <button className={filter === item ? "active" : ""} onClick={() => setFilter(item)} key={item}>{item}</button>)}
        </nav>

        <div className="product-record-list">
          {visible.map((product) => (
            <article className="product-record" key={product.id}>
              <div className="record-main">
                <span className={`record-status status-${product.status}`}>{statusIcon(product.status)}{product.status}</span>
                <div><h2>{product.name}</h2><p>{product.id} · {product.period} · {product.priceRange}</p></div>
              </div>
              <p className="record-description">{product.serviceContent}</p>
              <dl className="record-fields"><div><dt>建议单价</dt><dd>{product.price}</dd></div><div><dt>履约方式</dt><dd>{product.fulfillment}</dd></div><div><dt>保障上限</dt><dd>{product.coverageLimit}</dd></div><div><dt>核保建议</dt><dd>{product.underwriting}</dd></div></dl>
              <footer>
                <button className="secondary-button" onClick={() => setDetail(product)}><FileSearch />查看详情</button>
                {product.status === "待询价" && <button className="primary-button" onClick={() => setConfirmProduct(product)}><Send />发起询价</button>}
                {product.status === "询价中" && <div className="demo-outcomes"><span>Demo 结果：</span><button onClick={() => setQuoteOutcome(product.id, "询价通过")}><CheckCircle2 />通过</button><button onClick={() => setQuoteOutcome(product.id, "询价失败")}><XCircle />失败</button></div>}
                {product.status === "询价失败" && <button className="primary-button" onClick={() => setConfirmProduct(product)}><RotateCcw />调整后重新询价</button>}
                {product.status === "询价通过" && <button className="link-button" onClick={() => setView("conversation")}>问问 Alpha <ArrowRight /></button>}
              </footer>
            </article>
          ))}
          {!visible.length && <div className="empty-list"><PackageCheck /><h2>当前没有{filter}产品</h2><p>在会话中点击“使用方案”后，产品会进入这里。</p></div>}
        </div>
      </AnimatedPanel>

      {confirmProduct && (
        <div className="modal-backdrop" onMouseDown={(event) => event.target === event.currentTarget && setConfirmProduct(undefined)}>
          <section className="confirm-modal">
            <header><div><h2>提交询报价系统</h2><p>确认后产品状态将更新为“询价中”</p></div><button onClick={() => setConfirmProduct(undefined)}><X /></button></header>
            <div className="confirm-product"><strong>{confirmProduct.name}</strong><span>{confirmProduct.id}</span></div>
            <div className="confirm-warning"><Clock3 />询价结果由外部询报价系统返回；Demo 中可手动演示通过或失败。</div>
            <footer><button className="secondary-button" onClick={() => setConfirmProduct(undefined)}>取消</button><button className="primary-button" onClick={() => { requestQuote(confirmProduct.id); setConfirmProduct(undefined); }}>确认提交</button></footer>
          </section>
        </div>
      )}
      {detail && (
        <div className="drawer-backdrop" onMouseDown={(event) => event.target === event.currentTarget && setDetail(undefined)}>
          <aside className="detail-drawer">
            <header className="drawer-header"><div><h2>{detail.name}</h2><p>{detail.id}</p></div><button onClick={() => setDetail(undefined)}><X /></button></header>
            <div className="detail-body"><span className={`record-status status-${detail.status}`}>{statusIcon(detail.status)}{detail.status}</span><section><h3>服务内容</h3><p>{detail.serviceContent}</p></section><section><h3>产品字段</h3><dl className="detail-fields"><div><dt>建议单价</dt><dd>{detail.price}</dd></div><div><dt>履约方式</dt><dd>{detail.fulfillment}</dd></div><div><dt>保障上限</dt><dd>{detail.coverageLimit}</dd></div><div><dt>服务有效期</dt><dd>{detail.period}</dd></div><div><dt>型号/价位段</dt><dd>{detail.priceRange}</dd></div></dl></section></div>
          </aside>
        </div>
      )}
    </div>
  );
}

function statusIcon(status?: ProductStatus) {
  if (status === "询价通过") return <CheckCircle2 />;
  if (status === "询价失败") return <XCircle />;
  return <Clock3 />;
}
