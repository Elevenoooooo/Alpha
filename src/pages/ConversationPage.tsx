import { ArrowLeft, Bot, CheckCircle2, FileText, Sparkles, X } from "lucide-react";
import { useState } from "react";
import { Composer } from "../components/chat/Composer";
import {
  generatedAnalysisAttachment,
  localAttachment,
  toWikiReference,
  type ComposerAttachment,
  type ComposerSkill,
  type ComposerWikiReference,
} from "../components/chat/composerModels";
import { DocumentCard } from "../components/chat/DocumentCard";
import { ExecutionCard } from "../components/chat/ExecutionCard";
import { PlanCard } from "../components/chat/PlanCard";
import { ProductShelf } from "../components/chat/ProductShelf";
import { ResponseActions } from "../components/chat/ResponseActions";
import { WikiProcessingCard } from "../components/chat/WikiProcessingCard";
import { AnimatedPanel } from "../components/layout/AnimatedPanel";
import { WikiDiffPanel } from "../components/wiki/WikiDiffPanel";
import { useWorkbench } from "../context/WorkbenchContext";
import type { Product } from "../domain/types";

export function ConversationPage() {
  const {
    productFlow,
    confirmProductPlan,
    startProductTask,
    plans,
    useProduct,
    setView,
    wikiTask,
    approval,
    pauseWikiTask,
    resumeWikiTask,
    reviseWikiTask,
    submitWikiApproval,
    startWikiTask,
    notify,
    wikiPages,
  } = useWorkbench();
  const [input, setInput] = useState("");
  const [attachment, setAttachment] = useState<ComposerAttachment>();
  const [selectedSkill, setSelectedSkill] = useState<ComposerSkill>();
  const [wikiReferences, setWikiReferences] = useState<ComposerWikiReference[]>([]);
  const [wikiDepositMode, setWikiDepositMode] = useState(false);
  const [detailProduct, setDetailProduct] = useState<Product>();
  const [docOpen, setDocOpen] = useState(false);
  const [diffOpen, setDiffOpen] = useState(false);

  const isWikiConversation = Boolean(wikiTask && productFlow.stage === "idle");

  const submit = () => {
    if (wikiDepositMode) {
      if (!attachment) {
        notify("请添加需要沉淀的文件");
        return;
      }
      const result = startWikiTask(attachment.name, attachment.type);
      if (result === "blocked") return;
      setInput("");
      setAttachment(undefined);
      setWikiDepositMode(false);
      return;
    }
    if (isWikiConversation && wikiTask && ["ready", "rejected"].includes(wikiTask.status)) {
      reviseWikiTask();
      setInput("");
      return;
    }
    if (input.trim() || attachment) {
      const context = [
        selectedSkill ? `使用「${selectedSkill.name}」` : "",
        wikiReferences.length ? `引用 Wiki：${wikiReferences.map((page) => `${page.title} V${page.version}`).join("、")}` : "",
        attachment ? `附件：${attachment.name}` : "",
      ].filter(Boolean).join("；");
      const prompt = input.trim() || `请分析「${attachment?.name}」`;
      startProductTask(context ? `${prompt}（${context}）` : prompt);
      setInput("");
      setAttachment(undefined);
      setSelectedSkill(undefined);
      setWikiReferences([]);
    }
  };

  const depositGeneratedDocument = () => {
    setAttachment(generatedAnalysisAttachment);
    setSelectedSkill(undefined);
    setWikiReferences([]);
    setWikiDepositMode(true);
    notify("已带入当前对话产出的文档，请补充加工要求后发送");
  };

  const resultText =
    productFlow.kind === "quick"
      ? "昨天手机类目保费规模前三的品牌为 Apple、华为和小米；前 10 品牌合计贡献约 78% 的延保保费。该结果为 Demo 数据，正式使用时需要连接经营数据源。"
      : productFlow.kind === "analysis"
        ? "手机主品月 GMV 4.67 亿，但延保渗透率仅 2.1%，同比增长主要来自高端机型。核心缺口集中在碎屏与高价值部件，建议分别设计引流档、稳健档和高保障档。"
        : "基于手机主品价格带、故障分布与当前延保渗透，我形成了 3 套差异化方案。两套已通过初步核保，一套需要人工确认责任边界。";

  return (
    <div className="conversation-page">
      <header className="conversation-topbar">
        <button onClick={() => setView("home")}><ArrowLeft /></button>
        <div><strong>{isWikiConversation ? "业务 Wiki 加工" : "手机类目延保产品设计"}</strong><small>{isWikiConversation ? "加工结果仅在当前会话调整" : "产品设计任务"}</small></div>
        {isWikiConversation && wikiTask?.status === "submitted" && <span className="queue-lock">全局 Wiki 队列已锁定至审批完成</span>}
      </header>

      <div className="conversation-scroll">
        <div className="conversation-feed">
          {isWikiConversation && wikiTask ? (
            <AnimatedPanel className="turn-block">
              <div className="user-row"><div className="user-bubble">@Wiki 请加工并沉淀「{wikiTask.fileName}」</div></div>
              <div className="assistant-row">
                <span className="assistant-avatar"><Bot /></span>
                <div className="assistant-content">
                  <div className="thinking-label"><Sparkles />已读取本次上传文件，正在按业务 Wiki Schema 加工</div>
                  <WikiProcessingCard
                    task={wikiTask}
                    onPause={pauseWikiTask}
                    onResume={resumeWikiTask}
                    onOpen={() => setDiffOpen(true)}
                    onSubmit={submitWikiApproval}
                    rejectionComment={approval?.comment}
                  />
                  {wikiTask.status === "rejected" && <p className="conversation-hint">直接在下方输入修改要求，Alpha 会让当前结果失效并重新加工。</p>}
                </div>
              </div>
            </AnimatedPanel>
          ) : productFlow.stage === "idle" ? (
            <div className="empty-conversation"><Bot /><h2>开始一个新任务</h2><p>说出目标，Alpha 会根据任务复杂度选择合适的回答形态。</p></div>
          ) : (
            <AnimatedPanel className="turn-block">
              <div className="user-row"><div className="user-bubble">{productFlow.prompt}</div></div>
              <div className="assistant-row">
                <span className="assistant-avatar"><Bot /></span>
                <div className="assistant-content">
                  {productFlow.stage === "planning" && (
                    <>
                      <div className="thinking-label"><Sparkles />已完成任务理解，需要你确认执行计划</div>
                      <PlanCard onConfirm={confirmProductPlan} onRegenerate={() => notify("已重新生成计划，任务目标保持不变")} />
                      <ResponseActions copyText="产品设计任务计划" />
                    </>
                  )}
                  {productFlow.stage === "running" && <ExecutionCard activeStep={productFlow.executionStep} />}
                  {productFlow.stage === "result" && (
                    <>
                      <div className="thinking-label complete"><CheckCircle2 />已完成思考，耗时 3 秒</div>
                      <p className="text-answer">{resultText}<button className="citation" title="查看引用依据">1</button></p>
                      {productFlow.kind !== "quick" && <DocumentCard onOpen={() => setDocOpen(true)} onDeposit={depositGeneratedDocument} />}
                      {productFlow.kind === "product" && <ProductShelf products={plans} onUse={useProduct} onDetail={setDetailProduct} />}
                      <ResponseActions copyText={resultText} />
                    </>
                  )}
                </div>
              </div>
            </AnimatedPanel>
          )}
        </div>
      </div>

      <div className="conversation-composer-wrap">
        <Composer
          value={input}
          onChange={setInput}
          onSubmit={submit}
          attachment={attachment}
          onSelectLocalFile={(file) => setAttachment(localAttachment(file))}
          onRemoveAttachment={() => setAttachment(undefined)}
          selectedSkill={selectedSkill}
          onSelectSkill={setSelectedSkill}
          wikiReferences={wikiReferences}
          availableWikiReferences={wikiPages.map(toWikiReference)}
          onChangeWikiReferences={setWikiReferences}
          wikiDepositMode={wikiDepositMode}
          onChangeWikiDepositMode={setWikiDepositMode}
          onNotify={notify}
          placeholder={isWikiConversation && wikiTask?.status === "rejected" ? "根据驳回意见告诉 Alpha 如何调整…" : "继续追问，或提一个新目标…"}
        />
        <p>Alpha 提供建议与依据，最终决策始终由你掌控</p>
      </div>

      {detailProduct && <ProductDetail product={detailProduct} onClose={() => setDetailProduct(undefined)} />}
      {docOpen && <DocumentDetail onClose={() => setDocOpen(false)} />}
      {diffOpen && (
        <WikiDiffPanel
          task={wikiTask}
          approval={approval}
          onClose={() => setDiffOpen(false)}
          onSubmit={submitWikiApproval}
          submitVisible={wikiTask?.status === "ready"}
        />
      )}
    </div>
  );
}

function ProductDetail({ product, onClose }: { product: Product; onClose: () => void }) {
  return (
    <div className="drawer-backdrop" onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
      <aside className="detail-drawer">
        <header className="drawer-header"><div><h2>{product.name}</h2><p>{product.id}</p></div><button onClick={onClose}><X /></button></header>
        <div className="detail-body">
          <span className="underwrite-tag">大模型核保建议：{product.underwriting}</span>
          <section><h3>产品概览</h3><dl className="detail-fields"><div><dt>建议单价</dt><dd>{product.price}</dd></div><div><dt>履约方式</dt><dd>{product.fulfillment}</dd></div><div><dt>保障上限</dt><dd>{product.coverageLimit}</dd></div><div><dt>服务有效期</dt><dd>{product.period}</dd></div><div><dt>型号/价位段</dt><dd>{product.priceRange}</dd></div></dl></section>
          <section><h3>服务内容</h3><p>{product.serviceContent}</p></section>
          <section><h3>核保判断</h3><p>方案责任边界整体清晰；正式进入询报价前仍需人工确认定价数据及承保限制。</p></section>
        </div>
      </aside>
    </div>
  );
}

function DocumentDetail({ onClose }: { onClose: () => void }) {
  return (
    <div className="drawer-backdrop" onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
      <aside className="document-detail">
        <header className="drawer-header"><div><h2>手机类目延保经营与方案设计依据</h2><p>Alpha 分析文档 · Demo</p></div><button onClick={onClose}><X /></button></header>
        <article>
          <h1>手机类目延保经营与方案设计依据</h1>
          <p className="doc-lead">围绕经营规模、用户风险、责任设计和询报价可行性，形成三档差异化产品建议。</p>
          <h2>核心发现</h2>
          <ul><li>手机主品月 GMV 4.67 亿，延保渗透率为 2.1%。</li><li>碎屏与核心部件故障是主要可保风险。</li><li>高价机型适合更长保障周期，中低价机型更适合低门槛引流。</li></ul>
          <h2>建议动作</h2>
          <p>优先使用通过初步核保的两套方案进入询报价；第三套补充责任边界后再提交。</p>
          <div className="doc-source"><FileText />依据：手机类目经营日报、故障标签库、业务 Wiki（均为 Demo 数据）</div>
        </article>
      </aside>
    </div>
  );
}
