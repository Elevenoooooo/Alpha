import { Check, FileSearch, Grid2X2 } from "lucide-react";
import { useRef } from "react";
import { gsap } from "gsap";
import { useGSAP } from "@gsap/react";
import { Flip } from "gsap/Flip";
import type { Product } from "../../domain/types";

gsap.registerPlugin(Flip);

export function ProductShelf({
  products,
  onUse,
  onDetail,
}: {
  products: Product[];
  onUse: (product: Product) => void;
  onDetail: (product: Product) => void;
}) {
  const root = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
      gsap.from(".product-plan-card", { autoAlpha: 0, y: 14, stagger: 0.08, duration: 0.38, ease: "power2.out" });
    },
    { scope: root },
  );

  const usePlan = (product: Product) => {
    const state = root.current ? Flip.getState(root.current.querySelectorAll(".product-plan-card")) : undefined;
    onUse(product);
    if (state && !window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      window.requestAnimationFrame(() => Flip.from(state, { duration: 0.4, ease: "power2.inOut", absolute: false }));
    }
  };

  return (
    <section ref={root} className="product-shelf answer-card">
      <header className="shelf-head">
        <h3><span><Grid2X2 /></span>产品方案货架</h3>
        <small>{products.filter((product) => product.underwriting === "通过").length} / {products.length} 通过</small>
      </header>
      <div className="product-grid">
        {products.map((product) => (
          <article className={`product-plan-card ${product.used ? "is-used" : ""}`} key={product.id}>
            <div className="product-title-row"><h4>{product.name}</h4><strong>{product.price}</strong></div>
            <div className="product-id">产品ID：{product.id}</div>
            <p>{product.serviceContent}</p>
            <dl>
              <div><dt>履约方式</dt><dd>{product.fulfillment}</dd></div>
              <div><dt>保障上限</dt><dd>{product.coverageLimit}</dd></div>
              <div><dt>服务有效期</dt><dd>{product.period}</dd></div>
              <div><dt>型号/价位段</dt><dd>{product.priceRange}</dd></div>
            </dl>
            <div className="product-card-actions">
              <button onClick={() => onDetail(product)}><FileSearch />查看详情</button>
              <button className="use-button" disabled={product.used} onClick={() => usePlan(product)}>
                <Check />{product.used ? "已使用" : "使用方案"}
              </button>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
