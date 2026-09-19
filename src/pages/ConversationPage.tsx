import { ArrowLeft, Bot, CheckCircle2, Sparkles } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Composer } from "../components/chat/Composer";
import { localAttachment, toWikiResource, type ComposerAttachment, type ComposerResourceReference, type ComposerSkill } from "../components/chat/composerModels";
import { DesignCasePicker } from "../components/chat/DesignCasePicker";
import { DesignDocumentDetail, DesignProductDetail } from "../components/chat/DesignDetails";
import { DesignMarkdown } from "../components/chat/DesignMarkdown";
import { DesignProcessPanel, ProcessTrigger } from "../components/chat/DesignProcessPanel";
import { DocumentCard } from "../components/chat/DocumentCard";
import { ExecutionCard } from "../components/chat/ExecutionCard";
import { PlanCard } from "../components/chat/PlanCard";
import { ProductShelf } from "../components/chat/ProductShelf";
import { ResponseActions } from "../components/chat/ResponseActions";
import { UserMessage } from "../components/chat/UserMessage";
import { WikiProcessingCard } from "../components/chat/WikiProcessingCard";
import { AnimatedPanel } from "../components/layout/AnimatedPanel";
import { WikiDiffPanel } from "../components/wiki/WikiDiffPanel";
import { useWorkbench } from "../context/WorkbenchContext";
import { getAdjustedCase, getDesignCase, matchDesignCase, type DesignCase, type DesignDocument } from "../data/designCases";
import type { Product, ProductTurn } from "../domain/types";

export function ConversationPage() {
  const { productFlow, productHistory, startProductTask, startDesignCase, reviseProductTask, plans, products, useProduct, setView, wikiTask, approval, pauseWikiTask, resumeWikiTask, reviseWikiTask, submitWikiApproval, startWikiTask, notify, wikiPages } = useWorkbench();
  const [input, setInput] = useState("");
  const [attachment, setAttachment] = useState<ComposerAttachment>();
  const [selectedSkill, setSelectedSkill] = useState<ComposerSkill>();
  const [resourceReferences, setResourceReferences] = useState<ComposerResourceReference[]>([]);
  const [wikiDepositMode, setWikiDepositMode] = useState(false);
  const [detailProduct, setDetailProduct] = useState<Product>();
  const [documentCase, setDocumentCase] = useState<DesignCase>();
  const [diffOpen, setDiffOpen] = useState(false);
  const [processRunId, setProcessRunId] = useState<string>();
  const [evidenceId, setEvidenceId] = useState<string>();
  const feed = useRef<HTMLDivElement>(null);
  const isWikiConversation = Boolean(wikiTask && productFlow.stage === "idle");
  const turns: ProductTurn[] = [...productHistory, {flow:productFlow,products:plans}];
  const processTurn = turns.find(turn => turn.flow.runId === processRunId);
  const data = getAdjustedCase(productFlow.caseId, productFlow.adjustments);
  const usedIds = new Set(products.map(product => product.id));

  useEffect(() => {
    const current = feed.current?.querySelector(".design-turn:last-child");
    current?.scrollIntoView({behavior:"smooth",block:"start"});
  }, [productFlow.runId]);

  const selectCase = (id: string) => {
    setProcessRunId(undefined); setEvidenceId(undefined); setInput("");
    setAttachment(undefined); setSelectedSkill(undefined); setResourceReferences([]); setWikiDepositMode(false);
    startDesignCase(id);
  };

  const submit = () => {
    if (wikiDepositMode) {
      if (!attachment) { notify("请添加需要沉淀的文件"); return; }
      const result = startWikiTask([attachment], undefined, input.trim() || undefined);
      if (result === "blocked") return;
      setInput(""); setAttachment(undefined); setWikiDepositMode(false); setProcessRunId(undefined);
      return;
    }
    if (isWikiConversation && wikiTask && ["ready", "rejected"].includes(wikiTask.status)) {
      reviseWikiTask(); setInput(""); return;
    }
    if (!input.trim() && !attachment) return;
    const prompt = input.trim() || "请分析这份资料";
    const context = { attachment, skill: selectedSkill ? {id:selectedSkill.id,name:selectedSkill.name} : undefined, resources:resourceReferences };
    const nextCase = matchDesignCase(prompt);
    if (productFlow.caseId && productFlow.stage !== "idle" && (!nextCase || nextCase === productFlow.caseId)) {
      if (attachment) { notify("文件已选中，但当前产品设计 Demo 尚未接入文件分析；不会据此更新价格或结论。"); return; }
      if (!reviseProductTask(prompt, context)) return;
    } else startProductTask(prompt, context);
    setProcessRunId(undefined); setEvidenceId(undefined); setInput(""); setAttachment(undefined); setSelectedSkill(undefined); setResourceReferences([]);
  };

  const depositDocument = (document: DesignDocument) => {
    const file = new File([document.markdown], document.name, {type:"text/markdown"});
    setAttachment({...localAttachment(file),source:"conversation"});
    setSelectedSkill(undefined); setResourceReferences([]); setWikiDepositMode(true); setDocumentCase(undefined);
    notify("已带入当前文档，请补充加工要求后发送");
    window.requestAnimationFrame(() => window.document.querySelector<HTMLTextAreaElement>("#conversation-composer textarea")?.focus());
  };

  const showProcess = (runId?: string, id?: string) => { setProcessRunId(runId); setEvidenceId(id); };
  const isQuickDesign = productFlow.kind === "quick" && /设计|方案|产品/.test(productFlow.prompt);
  const legacyText = productFlow.kind === "quick"
    ? isQuickDesign
      ? "已按快速模式直接给出一版延保方向：优先从低门槛基础保障切入，并根据类目风险补充意外或换新责任。本次不展开计划清单，也不生成正式产品卡；如需完整责任、定价与核保校验，可继续要求深度设计。以上为 Demo 结果。"
      : "昨天手机类目保费规模前三的品牌为 Apple、华为和小米；前 10 品牌合计贡献约 78% 的延保保费。该结果为 Demo 数据，正式使用时需要连接经营数据源。"
    : "手机主品月 GMV 4.67 亿，但延保渗透率仅 2.1%，同比增长主要来自高端机型。核心缺口集中在碎屏与高价值部件，建议分别设计引流档、稳健档和高保障档。以上为 Demo 数据。";
  const analysisDocumentCase: DesignCase = {
    ...getDesignCase(),
    document: {
      name: "手机类目延保经营与方案设计依据.md",
      markdown: `# 手机类目延保经营与方案设计依据\n\n> Demo 演示资料，未连接真实经营数据源。\n\n${legacyText}\n\n## 核心发现\n\n- 手机主品月 GMV 4.67 亿，延保渗透率为 2.1%。\n- 碎屏与核心部件故障是主要可保风险。\n- 高价机型适合更长保障周期，中低价机型更适合低门槛引流。\n\n## 建议动作\n\n核对真实经营与风险数据，再分别设计引流档、稳健档和高保障档。\n\n依据：手机类目经营日报、故障标签库、延保 Wiki（均为 Demo 数据）。`,
    },
  };

  return <div className={`conversation-page design-conversation ${processTurn && !isWikiConversation ? "with-process" : ""}`}>
    <div className="design-conversation-main">
      <header className="conversation-topbar">
        <button aria-label="返回首页" onClick={() => setView("home")}><ArrowLeft /></button>
        <div><strong>{isWikiConversation ? "延保 Wiki 加工" : productFlow.caseId ? data.title : isQuickDesign ? "快速产品设计" : productFlow.kind === "analysis" ? "经营分析" : "Alpha 对话"}</strong></div>
        {!isWikiConversation && <span className="design-demo-badge">Demo 演示</span>}
        {isWikiConversation && wikiTask?.status === "submitted" && <span className="queue-lock">全局 Wiki 队列已锁定至审批完成</span>}
      </header>
      {!isWikiConversation && <DesignCasePicker compact activeId={productFlow.caseId} onSelect={selectCase} />}
      <div className="conversation-scroll">
        <div className="conversation-feed" ref={feed}>
          {isWikiConversation && wikiTask ? <AnimatedPanel className="turn-block">
            <UserMessage wikiMode text={wikiTask.instruction || "请按延保 Wiki Schema 提取可复用知识"} attachments={wikiTask.attachments?.length ? wikiTask.attachments : [wikiTask.attachment ?? {id:`wiki-message-${wikiTask.id}`,name:wikiTask.fileName,type:wikiTask.fileType,size:"",source:"local"}]} />
            <div className="assistant-row"><span className="assistant-avatar"><Bot /></span><div className="assistant-content">
              <div className="thinking-label"><Sparkles />已读取本次上传文件，正在按延保 Wiki Schema 加工</div>
              <WikiProcessingCard task={wikiTask} onPause={pauseWikiTask} onResume={resumeWikiTask} onOpen={() => setDiffOpen(true)} onSubmit={submitWikiApproval} rejectionComment={approval?.comment} />
              {wikiTask.status === "rejected" && <p className="conversation-hint">直接在下方输入修改要求，Alpha 会让当前结果失效并重新加工。</p>}
            </div></div>
          </AnimatedPanel> : productFlow.stage === "idle" ? <div className="empty-conversation"><Bot /><h2>开始一个新任务</h2><p>说出目标，Alpha 会根据任务复杂度选择合适的回答形态。</p></div>
          : productFlow.kind === "product" ? turns.map(turn => <DesignTurn key={turn.flow.runId} turn={turn} usedIds={usedIds} processOpen={processRunId === turn.flow.runId} onProcess={id => showProcess(processRunId === turn.flow.runId && !id ? undefined : turn.flow.runId,id)} onDocument={setDocumentCase} onDetail={setDetailProduct} onUse={useProduct} />)
          : <AnimatedPanel className="turn-block"><UserMessage text={productFlow.prompt} context={productFlow.context} /><div className="assistant-row"><span className="assistant-avatar"><Bot /></span><div className="assistant-content">
            {productFlow.stage === "running" ? <ExecutionCard activeStep={productFlow.executionStep} /> : <><div className="thinking-label complete"><CheckCircle2 />{isQuickDesign ? "已快速生成方案" : "已完成分析"}</div><p className="text-answer">{legacyText}</p>{productFlow.kind === "analysis" && <DocumentCard document={analysisDocumentCase.document} onOpen={() => setDocumentCase(analysisDocumentCase)} />}<ResponseActions copyText={legacyText} /></>}
          </div></div></AnimatedPanel>}
        </div>
      </div>
      <div className="conversation-composer-wrap" id="conversation-composer">
        <Composer value={input} onChange={setInput} onSubmit={submit} attachment={attachment} onSelectLocalFile={file => setAttachment(localAttachment(file))} onRemoveAttachment={() => setAttachment(undefined)} selectedSkill={selectedSkill} onSelectSkill={setSelectedSkill} resourceReferences={resourceReferences} availableWikiResources={wikiPages.map(toWikiResource)} onChangeResourceReferences={setResourceReferences} wikiDepositMode={wikiDepositMode} onChangeWikiDepositMode={setWikiDepositMode} onNotify={notify} placeholder={isWikiConversation && wikiTask?.status === "rejected" ? "根据驳回意见告诉 Alpha 如何调整…" : "继续追问，或直接输入对计划的调整…"} />
        <p>Alpha 提供建议与依据，最终决策始终由你掌控</p>
      </div>
    </div>
    {processTurn && !isWikiConversation && <DesignProcessPanel data={getAdjustedCase(processTurn.flow.caseId,processTurn.flow.adjustments)} flow={processTurn.flow} evidenceId={evidenceId} onEvidence={setEvidenceId} onClose={() => setProcessRunId(undefined)} />}
    {detailProduct && <DesignProductDetail product={{...detailProduct,used:usedIds.has(detailProduct.id)}} onClose={() => setDetailProduct(undefined)} onUse={useProduct} />}
    {documentCase && <DesignDocumentDetail data={documentCase} onClose={() => setDocumentCase(undefined)} onDeposit={depositDocument} />}
    {diffOpen && <WikiDiffPanel task={wikiTask} approval={approval} onClose={() => setDiffOpen(false)} onSubmit={submitWikiApproval} submitVisible={wikiTask?.status === "ready"} />}
  </div>;
}

function DesignTurn({ turn, usedIds, processOpen, onProcess, onDocument, onDetail, onUse }: { turn: ProductTurn; usedIds: Set<string>; processOpen: boolean; onProcess: (id?: string) => void; onDocument: (data: DesignCase) => void; onDetail: (product: Product) => void; onUse: (product: Product) => void }) {
  const {flow} = turn;
  const data = getAdjustedCase(flow.caseId,flow.adjustments);
  return <section className="turn-block design-turn">
    <UserMessage text={flow.prompt} context={flow.context} />
    <div className="assistant-row"><span className="assistant-avatar"><Bot /></span><div className="assistant-content">
      <PlanCard plan={data.plan} stage={flow.stage} />
      <ProcessTrigger flow={flow} onClick={() => onProcess()} open={processOpen} />
      {flow.stage === "running" && <div className="design-running-status" role="status"><span />{data.process[flow.executionStep]?.title}…</div>}
      {flow.stage === "result" && <div className="design-result">
        <DesignMarkdown onEvidence={onProcess}>{data.answerMarkdown}</DesignMarkdown>
        {data.actionRequired && <aside className="design-action-required"><strong>{data.actionRequired.title}</strong><p>{data.actionRequired.body}</p></aside>}
        <DocumentCard document={data.document} onOpen={() => onDocument(data)} />
        {turn.products.length > 0 && <ProductShelf products={turn.products.map(product => ({...product,used:usedIds.has(product.id)}))} onUse={onUse} onDetail={onDetail} />}
        <ResponseActions copyText={data.answerMarkdown} />
      </div>}
    </div></div>
  </section>;
}
