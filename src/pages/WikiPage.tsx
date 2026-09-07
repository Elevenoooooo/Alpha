import {
  ArrowLeft,
  Bell,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  Clock3,
  FileArchive,
  FileDiff,
  History,
  RotateCcw,
  ShieldCheck,
  Upload,
  X,
  XCircle,
} from "lucide-react";
import { useMemo, useRef, useState } from "react";
import { AnimatedPanel } from "../components/layout/AnimatedPanel";
import { WikiDiffPanel } from "../components/wiki/WikiDiffPanel";
import { useWorkbench } from "../context/WorkbenchContext";
import type { ApprovalStatus, RawFile, WikiApproval, WikiPage as WikiPageType } from "../domain/types";

type AssetSection = "schema" | "wiki" | "raw";
type CenterPanel = "library" | "mine" | "review";

const historicalApprovals: WikiApproval[] = [
  {
    id: "history-reviewer-submitted",
    taskId: "history-task-reviewer",
    title: "商家险承保口径补充.pdf · Wiki 变更",
    submitter: "周然",
    submittedAt: "2026-08-27 11:20",
    status: "approved",
    reviewer: "李珊",
    reviewedAt: "2026-08-27 13:05",
    comment: "来源完整，口径可发布。",
    affectedPages: [{ pageId: "underwriting", title: "商家险承保口径", additions: 4, deletions: 1 }],
  },
  {
    id: "history-approved",
    taskId: "history-task-1",
    title: "产品询报价流程说明.docx · Wiki 变更",
    submitter: "晨雨",
    submittedAt: "2026-08-22 09:10",
    status: "approved",
    reviewer: "周然",
    reviewedAt: "2026-08-22 09:35",
    comment: "流程状态与原文一致，同意发布。",
    affectedPages: [{ pageId: "inquiry", title: "产品询报价状态口径", additions: 2, deletions: 1 }],
  },
  {
    id: "history-rejected",
    taskId: "history-task-2",
    title: "延保价格口径草案.docx · Wiki 变更",
    submitter: "晨雨",
    submittedAt: "2026-08-18 14:05",
    status: "rejected",
    reviewer: "周然",
    reviewedAt: "2026-08-18 16:42",
    comment: "缺少有效期和适用类目，请补充原始依据。",
    affectedPages: [{ pageId: "pricing", title: "延保价格口径", additions: 5, deletions: 2 }],
  },
];

export function WikiPage() {
  const {
    wikiPages,
    rawFiles,
    selectedWikiPageId,
    setSelectedWikiPageId,
    startWikiTask,
    wikiTask,
    approval,
    approvalHistory,
    approveWiki,
    rejectWiki,
    requestRollback,
    setView,
    notify,
  } = useWorkbench();
  const [section, setSection] = useState<AssetSection>("wiki");
  const [panel, setPanel] = useState<CenterPanel>("library");
  const [identity, setIdentity] = useState<"user" | "reviewer">("user");
  const [uploadOpen, setUploadOpen] = useState(false);
  const [uploadFile, setUploadFile] = useState<{ name: string }>();
  const [historyPage, setHistoryPage] = useState<WikiPageType>();
  const [detailApproval, setDetailApproval] = useState<WikiApproval>();
  const [mineFilter, setMineFilter] = useState<"全部" | "审核中" | "审核通过" | "审核失败">("全部");
  const [reviewFilter, setReviewFilter] = useState<"待审核" | "审核完成">("待审核");
  const [rejectOpen, setRejectOpen] = useState(false);
  const [rejectComment, setRejectComment] = useState("");
  const [selectedRawFileId, setSelectedRawFileId] = useState(initialRawId(rawFiles));
  const inputRef = useRef<HTMLInputElement>(null);
  const pageSurfaceRef = useRef<HTMLDivElement>(null);
  const selectedPage = wikiPages.find((page) => page.id === selectedWikiPageId) ?? wikiPages[0];
  const actorName = identity === "reviewer" ? "周然" : "晨雨";
  const approvals = useMemo(() => {
    const unique = new Map<string, WikiApproval>();
    [approval, ...approvalHistory, ...historicalApprovals].forEach((item) => item && unique.set(item.id, item));
    return [...unique.values()];
  }, [approval, approvalHistory]);
  const selectedRawFile = rawFiles.find((file) => file.id === selectedRawFileId) ?? rawFiles[0];
  const minePendingCount = approvals.filter((item) => item.submitter === actorName && item.status === "pending").length;
  const reviewPendingCount = approvals.filter((item) => item.submitter !== actorName && item.status === "pending").length;

  const openPage = (id: string) => {
    setSelectedWikiPageId(id);
    setSection("wiki");
    setPanel("library");
  };

  const openRaw = (id: string) => {
    setSelectedRawFileId(id);
    setSection("raw");
    setPanel("library");
    window.requestAnimationFrame(() => pageSurfaceRef.current?.scrollTo({ top: 0 }));
  };

  const openRawByName = (name: string) => {
    const raw = rawFiles.find((file) => file.name === name);
    if (raw) openRaw(raw.id);
  };

  const uploadAndStart = () => {
    if (!uploadFile) return;
    const result = startWikiTask(uploadFile.name, undefined, actorName);
    setUploadOpen(false);
    setUploadFile(undefined);
    if (result === "started") setView("conversation");
  };

  return (
    <div className="wiki-page page-surface" ref={pageSurfaceRef}>
      <AnimatedPanel className="wiki-center">
        {panel === "library" && <header className="page-header wiki-page-header">
          <div><h1>资产中心</h1><p>以 Schema 约束加工，将审批通过的业务资料沉淀为可追溯 Wiki。</p></div>
          <div className="wiki-header-actions">
            <div className="identity-switch"><button className={identity === "user" ? "active" : ""} onClick={() => { setIdentity("user"); setPanel("library"); }}>普通用户</button><button className={identity === "reviewer" ? "active" : ""} onClick={() => { setIdentity("reviewer"); setPanel("library"); }}>审核员</button></div>
            <button className="secondary-button" onClick={() => setPanel("mine")}><FileDiff />我的提交{minePendingCount > 0 && <b>{minePendingCount}</b>}</button>
            {identity === "reviewer" && <button className="secondary-button" onClick={() => setPanel("review")}><Bell />待我审核{reviewPendingCount > 0 && <b>{reviewPendingCount}</b>}</button>}
            <button className="primary-button" onClick={() => setUploadOpen(true)}><Upload />上传文件</button>
          </div>
        </header>}

        {panel === "library" ? (
          <div className="wiki-workbench">
            <aside className="asset-tree">
              <div className="tree-title">业务 Wiki</div>
              <TreeRoot title="Schema" active={section === "schema"} onClick={() => setSection("schema")}>
                <TreeLeaf title="business-wiki-schema.yaml" />
                <TreeLeaf title="page-template.md" />
              </TreeRoot>
              <TreeRoot title="Wiki" active={section === "wiki"} onClick={() => setSection("wiki")}>
                {["产品知识", "产品规则", "经营口径", "风险知识", "产品流程"].map((folder) => (
                  <div className="tree-folder" key={folder}><span><ChevronDown />{folder}</span>{wikiPages.filter((page) => page.folder === folder).map((page) => <button className={page.id === selectedWikiPageId ? "active" : ""} onClick={() => openPage(page.id)} key={page.id}>{page.title}</button>)}</div>
                ))}
              </TreeRoot>
              <TreeRoot title="Raw" active={section === "raw"} onClick={() => openRaw(selectedRawFileId || initialRawId(rawFiles))}>
                {rawFiles.map((file) => <button className={`tree-raw ${section === "raw" && file.id === selectedRawFile?.id ? "active" : ""}`} key={file.id} onClick={() => openRaw(file.id)}>{file.name}</button>)}
              </TreeRoot>
              <div className="tree-note">只有审批通过的 Wiki 和 Raw 才会出现在这里并进入检索。</div>
            </aside>

            <section className="wiki-content-pane">
              {section === "wiki" && <PublishedWikiPage page={selectedPage} onHistory={() => setHistoryPage(selectedPage)} onOpenRaw={openRawByName} />}
              {section === "schema" && <SchemaPanel />}
              {section === "raw" && <RawPanel file={selectedRawFile} />}
            </section>
          </div>
        ) : panel === "mine" ? (
          <ApprovalList
            title="我的 Wiki 提交"
            subtitle="查看自己提交的审批状态和变更详情"
            tabs={["全部", "审核中", "审核通过", "审核失败"]}
            active={mineFilter}
            onTab={(tab) => setMineFilter(tab as typeof mineFilter)}
            approvals={approvals.filter((item) => item.submitter === actorName && (mineFilter === "全部" || approvalLabel(item.status) === mineFilter))}
            onOpen={setDetailApproval}
            onBack={() => setPanel("library")}
          />
        ) : (
          <ApprovalList
            title="待我审核"
            subtitle="仅展示他人提交给你的变更；自己提交的 Wiki 会自动分配其他审核员"
            tabs={["待审核", "审核完成"]}
            active={reviewFilter}
            onTab={(tab) => setReviewFilter(tab as typeof reviewFilter)}
            approvals={approvals.filter((item) => reviewFilter === "待审核" ? item.status === "pending" && item.submitter !== actorName : item.status !== "pending" && item.reviewer === actorName)}
            onOpen={setDetailApproval}
            onBack={() => setPanel("library")}
          />
        )}
      </AnimatedPanel>

      {uploadOpen && (
        <div className="modal-backdrop" onMouseDown={(event) => event.target === event.currentTarget && setUploadOpen(false)}>
          <section className="upload-modal">
            <header><div><h2>上传文件</h2></div><button onClick={() => setUploadOpen(false)}><X /></button></header>
            <button className={`upload-dropzone ${uploadFile ? "has-file" : ""}`} onClick={() => inputRef.current?.click()}>
              {uploadFile ? <><FileArchive /><strong>{uploadFile.name}</strong><span>点击可重新选择</span></> : <><Upload /><strong>选择需要沉淀的业务资料</strong><span>支持 PDF、Word、PPT、Excel、Markdown 和图片</span></>}
            </button>
            <input ref={inputRef} hidden type="file" accept=".pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.md,.png,.jpg,.jpeg,.webp" onChange={(event) => {
              const file = event.target.files?.[0];
              setUploadFile(file ? { name: file.name } : undefined);
            }} />
            <div className="upload-demo-files">
              <span>演示文件</span>
              <button onClick={() => setUploadFile({ name: "延保险产品知识与设计规范V4-补充版.pdf" })}>新资料：延保险产品知识与设计规范V4-补充版.pdf</button>
              <button onClick={() => setUploadFile({ name: "商家险理赔口径补充.docx" })}>第二轮资料：商家险理赔口径补充.docx</button>
              <button onClick={() => setUploadFile({ name: "延保经营口径V3.pdf" })}>重复资料：延保经营口径V3.pdf</button>
            </div>
            <footer><button className="secondary-button" onClick={() => setUploadOpen(false)}>取消</button><button className="primary-button" disabled={!uploadFile} onClick={uploadAndStart}>去加工</button></footer>
          </section>
        </div>
      )}

      {historyPage && <VersionHistory page={historyPage} reviewer={identity === "reviewer"} onClose={() => setHistoryPage(undefined)} onRollback={(version) => { requestRollback(historyPage.id, version, actorName); setHistoryPage(undefined); setPanel("mine"); setIdentity("reviewer"); }} />}

      {detailApproval && (
        <WikiDiffPanel
          task={wikiTask?.id === detailApproval.taskId ? wikiTask : undefined}
          approval={detailApproval}
          onClose={() => setDetailApproval(undefined)}
          reviewActions={identity === "reviewer" && detailApproval.status === "pending" && detailApproval.submitter !== actorName ? {
            onApprove: () => { approveWiki(); setDetailApproval(undefined); },
            onReject: () => setRejectOpen(true),
          } : undefined}
          readOnlyNote={detailApproval.status === "pending" ? identity === "reviewer" && detailApproval.submitter === actorName ? "该变更由你提交，已自动隔离自审，需要其他审核员处理。" : "当前变更正在等待审核员处理。" : undefined}
        />
      )}

      {rejectOpen && (
        <div className="modal-backdrop reject-backdrop">
          <section className="confirm-modal">
            <header><div><h2>驳回 Wiki 变更</h2><p>意见会返回原加工会话，提交人可直接对话调整。</p></div><button onClick={() => setRejectOpen(false)}><X /></button></header>
            <textarea value={rejectComment} onChange={(event) => setRejectComment(event.target.value)} placeholder="请输入具体驳回意见（必填）" />
            <footer><button className="secondary-button" onClick={() => setRejectOpen(false)}>取消</button><button className="danger-button" disabled={!rejectComment.trim()} onClick={() => { rejectWiki(rejectComment.trim()); setRejectOpen(false); setDetailApproval(undefined); setRejectComment(""); }}>确认驳回</button></footer>
          </section>
        </div>
      )}
    </div>
  );
}

function TreeRoot({ title, active, onClick, children }: { title: string; active: boolean; onClick: () => void; children: React.ReactNode }) {
  return <div className="tree-root"><button className={active ? "active" : ""} onClick={onClick}><ChevronDown /><strong>{title}</strong></button><div>{children}</div></div>;
}

function TreeLeaf({ title }: { title: string }) {
  return <button className="tree-leaf">{title}</button>;
}

function PublishedWikiPage({ page, onHistory, onOpenRaw }: { page: WikiPageType; onHistory: () => void; onOpenRaw: (name: string) => void }) {
  const current = page.versions.find((version) => version.version === page.currentVersion) ?? page.versions.at(-1)!;
  return (
    <article className="published-wiki">
      <div className="wiki-breadcrumb">业务 Wiki <ChevronRight /> Wiki <ChevronRight /> {page.folder}</div>
      <header><div><h1>{page.title}</h1><p>当前生效版本 V{page.currentVersion} · {current.createdAt} · {current.createdBy}</p></div><button className="secondary-button" onClick={onHistory}><History />历史版本</button></header>
      <section className="wiki-article">
        {current.content.map((line, index) => <WikiArticleLine line={line} key={`${line}-${index}`} />)}
        <h2>使用边界</h2><ul><li>回答引用时必须携带当前 Page 版本。</li><li>历史版本、审核中内容和被驳回内容不进入检索。</li><li>任何内容修改都需重新审批并创建新版本。</li></ul>
      </section>
      <footer className="wiki-sources"><span>本版本关联 {(current.sources ?? page.sources).length} 个 Raw</span>{(current.sources ?? page.sources).map((source) => <button key={source} onClick={() => onOpenRaw(source)}>{source}<ChevronRight /></button>)}</footer>
    </article>
  );
}

function WikiArticleLine({ line }: { line: string }) {
  if (line.startsWith("## ")) return <h2>{line.slice(3)}</h2>;
  if (line.startsWith("- ")) return <p className="wiki-bullet">{line.slice(2)}</p>;
  if (line.includes(" = ")) return <p className="wiki-formula">{line}</p>;
  return <p>{line}</p>;
}

function SchemaPanel() {
  return <article className="schema-panel"><div className="wiki-breadcrumb">业务 Wiki <ChevronRight /> Schema</div><header><div><h1>Wiki Schema</h1><p>约束 Wiki Page 的结构、来源和版本字段。</p></div><span className="immutable-tag"><ShieldCheck />仅管理员维护</span></header><pre>{`page:\n  title: string\n  folder: string\n  version: integer\n  status: published | pending | rejected\n  sources:\n    - raw_id\n    - locator\n  content: rich_text\n  approved_by: user_id\n  approved_at: datetime`}</pre><div className="schema-note">每个加工任务绑定具体 Schema 版本，避免审批期间规则变化导致前后结果不一致。</div></article>;
}

function RawPanel({ file }: { file?: RawFile }) {
  if (!file) return <div className="raw-document-empty"><FileArchive /><h2>暂无 Raw 文件</h2></div>;
  const pages = rawDocumentPages(file.name, file.type);
  return <article className="raw-document-panel">
    <div className="wiki-breadcrumb">业务 Wiki <ChevronRight /> Raw <ChevronRight /> {file.name}</div>
    <header>
      <div><h1>{file.name}</h1><p>{file.type} · {file.size} · {file.publishedAt} 入库</p></div>
      <span className="immutable-tag"><ShieldCheck />只读原始资料</span>
    </header>
    <div className="raw-document-pages">
      {pages.map((preview, previewIndex) => <section className="raw-document-canvas" key={`${file.id}-${previewIndex}`}>
        <div className="raw-page-indicator">第 {previewIndex + 1} / {pages.length} 页</div>
        <h1>{preview.title}</h1>
        <p className="raw-document-lead">{preview.lead}</p>
        {preview.sections.map((section, sectionIndex) => <section key={`${section.title}-${sectionIndex}`}><h2>{section.title}</h2>{section.paragraphs.map((paragraph, paragraphIndex) => <p key={`${paragraph}-${paragraphIndex}`}>{paragraph}</p>)}</section>)}
      </section>)}
    </div>
  </article>;
}

function initialRawId(files: RawFile[]) {
  return files[0]?.id ?? "";
}

type RawPreviewPage = { title: string; lead: string; sections: Array<{ title: string; paragraphs: string[] }> };

function rawPdfPages(name: string): RawPreviewPage[] {
  if (name.includes("产品知识与设计规范")) return productKnowledgePdfPages;
  return operatingMetricsPdfPages;
}

function rawDocumentPages(name: string, type: RawFile["type"]): RawPreviewPage[] {
  if (type === "PDF") return rawPdfPages(name);
  const document = rawContinuousDocument(name);
  const sectionsPerPage = 2;
  const pageCount = Math.ceil(document.sections.length / sectionsPerPage);
  return Array.from({ length: pageCount }, (_, index) => ({
    title: index === 0 ? document.title : `${document.title}（续）`,
    lead: index === 0 ? document.lead : `接续上一页内容 · 第 ${index + 1} 页`,
    sections: document.sections.slice(index * sectionsPerPage, (index + 1) * sectionsPerPage),
  }));
}

const productKnowledgePdfPages: RawPreviewPage[] = [
  { title: "延保险产品知识与设计规范 V4", lead: "本文档统一说明延保险产品的定位、责任、履约、核保与定价，是业务设计和审批的共同事实来源。", sections: [{ title: "文档范围", paragraphs: ["适用于耐用品延保、意外保障、换新、退货和补贴类产品。", "涉及类目数据和履约能力的数值以对应盘点表的最新版本为准。"] }, { title: "阅读说明", paragraphs: ["第 2–5 页为产品与履约，第 6–9 页为条款与定价，第 10–12 页为经营和风险案例。"] }] },
  { title: "一、险种定位", lead: "延保险承接厂家质保到期后的延续保障，也可覆盖约定的意外损坏和换新责任。", sections: [{ title: "保障对象", paragraphs: ["核心对象是手机、电脑、家电、家具等具有明确使用寿命和维修价值的耐用品。", "保障起期、厂家质保衔接和主商品识别是产品成立的基础条件。"] }, { title: "产品目标", paragraphs: ["在风险可控的前提下延长商品可用周期，降低用户一次性故障成本，并为商家提供服务增值空间。"] }] },
  { title: "二、服务类型", lead: "产品以服务类型为核心组织，不直接用险种名称代替责任与履约设计。", sections: [{ title: "四类履约方式", paragraphs: ["维修：恢复商品核心功能；换新：提供同款或符合规则的替代商品；退货：在约定条件下退回主商品；补贴：按比例或定额给付。"] }, { title: "常见服务", paragraphs: ["全保修、质保维修、意外维修、碎屏维修、全/质/意外换新、试用退货/换新、复购补贴、囤货无忧、电池维修和数据恢复等。"] }] },
  { title: "三、关键设计变量", lead: "同一服务名称下，触发条件和限制变量会决定真实风险。", sections: [{ title: "责任变量", paragraphs: ["是否包含进液、跌落、挤压、性能衰减和人为损坏，需要逐项明确。", "保障次数、单次赔偿上限、累计上限和免赔额共同限制责任暴露。"] }, { title: "期限变量", paragraphs: ["厂家质保期、保险期间、等待期及服务有效期需保持前后衔接。"] }] },
  { title: "四、类目与履约", lead: "可售版图回答能不能卖，履约盘面回答卖了以后怎么赔，两者必须分开维护。", sections: [{ title: "可售上界", paragraphs: ["当前覆盖 75 个一级类目、1351 个二级类目和 15967 个三级类目。"] }, { title: "履约现状", paragraphs: ["换新覆盖 3000 个三级类目，维修覆盖 532 个，两者皆有 497 个。", "能力缺口不是永久禁区，可形成履约建设需求，但售卖前必须确认可执行方案。"] }] },
  { title: "五、通用免责", lead: "通用免责用于排除非保险事故、不可验证损失和已由其他责任主体承担的范围。", sections: [{ title: "十四条底层框架", paragraphs: ["包括商业用途、人为故意损坏、外观或性能自然衰减、配件耗材易损件、三包范围内责任、间接损失及非授权拆改等。", "具体产品可以补充类目特有免责，但不得与基础责任定义冲突。"] }] },
  { title: "六、硬性核保约束", lead: "以下规则任一不满足时，不进入自动报价。", sections: [{ title: "组合与期限", paragraphs: ["线上延保与复购或试用组合时不予报价；换新类保险期间不得超过 4 年；延保保障期间不得超过厂家质保期的 2 倍。"] }, { title: "金额与结构", paragraphs: ["赔偿上限不得超过主商品实付金额；囤货或过期换新补贴不超过原实付金额的 70%；组合品和其他类总占比不超过 30%。"] }] },
  { title: "七、定价公式", lead: "精算链路需要完整保留基准、系数、目标赔付率和主商品均价。", sections: [{ title: "核心公式", paragraphs: ["最终费率 = 基准费率 ×（风险系数 × 成本系数 × 风控系数）÷ 目标赔付率。", "最终保费 = 预估主商品均价 × 最终费率。"] }, { title: "系数解释", paragraphs: ["风险系数调节品牌、保障范围和期限；成本系数调节履约方式和残值；风控系数调节免赔、等待期和次数。"] }] },
  { title: "八、基准费率分层", lead: "基准费率按风险水平设置纯延保和意外全保两栏。", sections: [{ title: "Tier 1–2", paragraphs: ["Tier 1 极低风险：纯延保 0.4%–0.6%，意外全保 1.2%–1.8%。", "Tier 2 低风险：纯延保 0.8%–1.2%，意外全保 2.0%–2.5%。"] }, { title: "Tier 3–4", paragraphs: ["Tier 3 中风险：纯延保 2.5%–3.5%，意外全保 4.0%–5.5%。", "Tier 4 高危易损：纯延保 4.0%–6.0%，意外全保 6.5%–9.0%。"] }] },
  { title: "九、目标赔付率策略", lead: "目标赔付率决定产品在转化与毛利之间的策略位置。", sections: [{ title: "流量策略", paragraphs: ["默认目标赔付率采用 75%，通过更高保障价值换取转化。"] }, { title: "高毛利策略", paragraphs: ["冷门、高价或垄断渠道采用 60% 目标赔付率，并加强价格和履约成本校验。"] }] },
  { title: "十、经营判断", lead: "GMV 规模不能直接代表延保机会，必须结合真实 C 端渗透率。", sections: [{ title: "渗透率边界", paragraphs: ["业务合理区间通常为 1%–3%，B 集采需要从消费者付费渗透率中剔除。"] }, { title: "典型反例", paragraphs: ["珠宝与消费电子 GMV 接近，但 C 延保销量分别为 15 件和 16032 件，机会量级相差约 1000 倍。"] }] },
  { title: "十一、品类风险与版本说明", lead: "品类风险结论用于约束责任设计，不替代实际核保与履约确认。", sections: [{ title: "典型风险", paragraphs: ["珠宝关注信任型风险，食品关注冷链和时效，消费电子与母婴关注意外损坏。"] }, { title: "版本记录", paragraphs: ["V4 补充类目履约口径、目标赔付率策略与品类风险案例。", "任何后续修改需重新发起 Wiki 审批并生成新版本。"] }] },
];

const operatingMetricsPdfPages: RawPreviewPage[] = [
  { title: "延保经营口径 V3", lead: "本文档定义延保渗透率及相关经营指标的统一统计口径。", sections: [{ title: "文档用途", paragraphs: ["用于经营看板、类目诊断、产品机会识别和月度复盘。", "所有引用该口径的任务必须携带版本号和统计周期。"] }, { title: "章节导航", paragraphs: ["第 2–8 页说明统计范围、公式、退款与去重；第 9–12 页说明梯队、机会判断和质量校验。"] }] },
  { title: "一、统计对象与周期", lead: "指标以主商品订单为连接对象，以支付完成日作为基础归属日期。", sections: [{ title: "统计对象", paragraphs: ["主商品订单需满足延保推荐条件并完成支付。", "延保服务单通过主商品订单号关联，不独立进入分母。"] }, { title: "统计周期", paragraphs: ["支持日、周、月三个粒度；跨周期退款在完成退款当日回冲。"] }] },
  { title: "二、渗透率公式", lead: "渗透率衡量消费者在可推荐订单中的真实购买情况。", sections: [{ title: "计算公式", paragraphs: ["渗透率 =（C 延保销量 + 物流销量 + 电销销量）÷ 大盘销量。"] }, { title: "使用限制", paragraphs: ["B 集采不进入消费者付费渗透率；取消、关闭和未支付订单不进入分子分母。"] }] },
  { title: "三、分子数据来源", lead: "分子覆盖 C 端页面购买、物流环节推荐和电销成交三条来源。", sections: [{ title: "C 延保", paragraphs: ["用户在商品详情、结算页或订单页主动购买的延保服务。"] }, { title: "物流与电销", paragraphs: ["物流销量按履约触点归因，电销销量按有效成交和支付结果归因。"] }] },
  { title: "四、分母与推荐条件", lead: "分母不是全量 GMV 订单，而是符合当前延保推荐条件的支付成功主商品订单。", sections: [{ title: "进入分母", paragraphs: ["类目可售、商品状态有效、价格与责任范围满足推荐规则。"] }, { title: "不进入分母", paragraphs: ["B 集采、非耐用品、虚拟商品、无有效主商品映射及取消订单。"] }] },
  { title: "五、B 集采排除", lead: "B 集采反映厂商配套率，而不是消费者付费意愿。", sections: [{ title: "业务差异", paragraphs: ["B 集采由商家批量采购并随主商品出厂配置，购买决策主体与 C 端用户不同。"] }, { title: "数据影响", paragraphs: ["纳入 B 集采会导致部分品类严重虚高，例如键盘渗透率可能从 1.5% 上升到 77%。"] }] },
  { title: "六、退款回冲", lead: "退款订单在退款完成日回冲，不按申请日或审核日归属。", sections: [{ title: "跨自然日", paragraphs: ["支付和退款发生在不同自然日时，在完成退款当日冲减对应销量。"] }, { title: "部分退款", paragraphs: ["仅主商品或延保服务部分退款时，按有效服务状态判断是否冲减。"] }] },
  { title: "七、订单去重", lead: "同一主商品订单只计算一次，避免服务单拆分导致重复统计。", sections: [{ title: "主键", paragraphs: ["使用主商品订单号和有效延保服务状态生成统计主键。"] }, { title: "异常处理", paragraphs: ["一单多服务、服务换绑和重复回调进入异常明细，不直接重复累计。"] }] },
  { title: "八、业务梯队", lead: "业务合理区间通常为 1%–3%，不同类目应结合风险和触点解释。", sections: [{ title: "第一与第二梯队", paragraphs: ["大家电 6.97% 位于第一梯队；智能机器人 2.02%、健身装备 1.81%、消费电子 1.59% 位于第二梯队。"] }, { title: "第三梯队", paragraphs: ["母婴 0.97%、食品 0.36%、户外 0.20%、宠物 0.05%、珠宝 0.004%。"] }] },
  { title: "九、GMV 与机会量级", lead: "GMV 量级不等于 C 延保机会量级。", sections: [{ title: "对比案例", paragraphs: ["珠宝 GMV 8.12 亿，消费电子 GMV 8.47 亿，两者规模接近。", "珠宝 C 延保仅 15 件，消费电子为 16032 件，相差约 1000 倍。"] }, { title: "结论", paragraphs: ["保费潜力必须以实测 C 延保渗透为锚，不能用 GMV 直接换算。"] }] },
  { title: "十、质量校验", lead: "每次发布经营数据前需完成分子、分母、时间和去重四类检查。", sections: [{ title: "必检项", paragraphs: ["检查 B 集采是否剔除、退款是否按完成日回冲、主商品订单是否去重、统计周期是否完整。"] }, { title: "异常阈值", paragraphs: ["类目渗透率突变、销量为零但保费非零、跨周期大额回冲均进入人工复核。"] }] },
  { title: "十一、版本记录", lead: "V3 统一了 B 集采、退款回冲和机会判断口径。", sections: [{ title: "本版变更", paragraphs: ["明确消费者付费渗透率不含 B 集采；补充跨自然日退款回冲和同一主商品订单去重。"] }, { title: "维护要求", paragraphs: ["口径修改需要业务审批并创建新版本，历史版本不进入当前检索。"] }] },
];

function rawContinuousDocument(name: string): RawPreviewPage {
  if (name.includes("类目与履约能力")) return { title: "延保类目与履约能力盘点", lead: "本文档展示可售上界、维修与换新能力以及当前类目缺口。", sections: [{ title: "一、可售版图", paragraphs: ["一级类目 75 个，二级类目 1351 个，三级类目 15967 个。", "可售版图是产品设计上界，不代表现有履约能力。"] }, { title: "二、换新能力", paragraphs: ["换新覆盖 3000 个三级类目，主要集中在消费电子、家电和标准化耐用品。", "换新依赖同款新品供给、残值处置和价格波动控制。"] }, { title: "三、维修能力", paragraphs: ["维修覆盖 532 个三级类目，与换新重合 497 个。", "仅维修不换新的 35 个类目中，74% 是二手或官翻商品。"] }, { title: "四、能力缺口", paragraphs: ["当前无履约能力不等于禁止设计，可形成服务商引入、备件建设或现金补贴方案。"] }, { title: "五、更新说明", paragraphs: ["盘点按三级类目维护，变更需记录负责人、更新时间和验证结果。"] }] };
  if (name.includes("品类风险研究")) return { title: "延保品类风险研究摘要", lead: "按业务作用域汇总 29 个已研究品类实体的风险画像与产品化方向。", sections: [{ title: "一、研究方法", paragraphs: ["结合故障类型、损失可验证性、维修价值、替代供给和用户付费意愿形成风险画像。"] }, { title: "二、珠宝与文玩", paragraphs: ["黄金克重流失和珍珠不可逆老化属于高风险并已剔除。", "铂金可修复物理风险可上品；文玩造假更适合养护订阅与鉴定保险。"] }, { title: "三、食品", paragraphs: ["乳品关注冷链断链，生鲜关注时令和交付时效。", "1 元购模型可以用于低门槛跑量，榴莲 1.23% 渗透率提供放量实证。"] }, { title: "四、消费电子", paragraphs: ["手机碎屏属于高频、责任清晰的意外损坏风险，可配置维修或换屏服务。"] }, { title: "五、母婴", paragraphs: ["安全座椅事故后必报废属于行业刚性风险，需明确事故证明和一次性责任。"] }, { title: "六、使用边界", paragraphs: ["风险画像用于产品设计输入，正式报价仍需核保、定价和履约能力共同确认。"] }] };
  if (name.includes("询报价")) return { title: "产品询报价流程说明", lead: "本文档说明产品方案确认使用后的询报价状态与处理要求。", sections: [{ title: "一、适用范围", paragraphs: ["适用于产品方案完成设计并确认使用后的询报价流程。"] }, { title: "二、待询价", paragraphs: ["产品方案使用后进入待询价，业务人员补充商品、责任、期限和预估规模。"] }, { title: "三、提交询价", paragraphs: ["确认信息完整后提交询报价，系统记录发起人和提交时间。"] }, { title: "四、询价中", paragraphs: ["提交成功后进入询价中，等待询报价系统返回承保、价格与限制条件。"] }, { title: "五、结果处理", paragraphs: ["终态分为询价通过和询价失败。通过后产品进入可配置状态。"] }, { title: "六、失败重试", paragraphs: ["询价失败必须记录失败原因，允许调整方案后重新发起询价，失败结果不覆盖原方案。"] }] };
  return { title: "延保退款口径补充说明", lead: "该文档连续说明退款回冲、订单去重及异常处理口径。", sections: [{ title: "一、适用范围", paragraphs: ["适用于延保销量、保费和渗透率相关经营指标。"] }, { title: "二、退款完成日", paragraphs: ["退款订单在退款完成日回冲，不以申请日或审核日作为归属时间。"] }, { title: "三、跨自然日", paragraphs: ["跨自然日退款在完成退款当日冲减，不回写已封账的历史日报。"] }, { title: "四、订单去重", paragraphs: ["同一主商品订单只计算一次，附属服务单不重复进入分母。"] }, { title: "五、异常处理", paragraphs: ["部分退款、重复回调和服务换绑进入异常明细，由运营确认有效状态。"] }, { title: "六、版本维护", paragraphs: ["任何口径变化必须审批并创建新版本。"] }] };
}

function ApprovalList({ title, subtitle, tabs, active, onTab, approvals, onOpen, onBack }: { title: string; subtitle: string; tabs: string[]; active: string; onTab: (tab: string) => void; approvals: WikiApproval[]; onOpen: (approval: WikiApproval) => void; onBack: () => void }) {
  return <section className="approval-page"><header><button className="approval-back-button" onClick={onBack} aria-label="返回资产中心" title="返回资产中心"><ArrowLeft /></button><div><h1>{title}</h1><p>{subtitle}</p></div></header><nav className="filter-tabs">{tabs.map((tab) => <button key={tab} className={active === tab ? "active" : ""} onClick={() => onTab(tab)}>{tab}</button>)}</nav><div className="approval-table"><div className="approval-row approval-head"><span>变更名称</span><span>提交人</span><span>影响 Pages</span><span>提交时间</span><span>审批人</span><span>状态</span><span></span></div>{approvals.map((item) => <div className="approval-row" key={item.id}><span><strong>{item.title}</strong></span><span>{item.submitter}</span><span>{item.affectedPages.length}</span><span>{item.submittedAt}</span><span className="reviewer-cell">{item.reviewer ?? "—"}</span><span>{approvalBadge(item.status)}</span><button onClick={() => onOpen(item)}>{item.status === "pending" ? "查看变更" : "查看详情"} <ChevronRight /></button></div>)}{!approvals.length && <div className="approval-empty"><h2>当前没有相关审批</h2></div>}</div></section>;
}

function VersionHistory({ page, reviewer, onClose, onRollback }: { page: WikiPageType; reviewer: boolean; onClose: () => void; onRollback: (version: number) => void }) {
  const [selected, setSelected] = useState(page.currentVersion);
  const version = page.versions.find((item) => item.version === selected) ?? page.versions.at(-1)!;
  return <div className="drawer-backdrop"><aside className="version-drawer"><header className="drawer-header"><div><h2>{page.title} · 历史版本</h2><p>恢复历史内容会创建新版本，不会覆盖现有历史。</p></div><button onClick={onClose}><X /></button></header><div className="version-layout"><nav>{[...page.versions].reverse().map((item) => <button className={selected === item.version ? "active" : ""} key={item.version} onClick={() => setSelected(item.version)}><span>V{item.version}{item.version === page.currentVersion && <b>当前</b>}</span><strong>{item.reason}</strong><small>{item.createdBy} · {item.createdAt}</small></button>)}</nav><article><h1>V{version.version} 完整内容</h1>{version.content.map((line, index) => <WikiArticleLine line={line} key={`${line}-${index}`} />)}</article></div><footer className="drawer-footer"><span>{reviewer ? "审核员可以发起回滚审批。" : "只有审核员有权发起版本回滚。"}</span>{reviewer && selected !== page.currentVersion && <button className="primary-button" onClick={() => onRollback(selected)}><RotateCcw />发起恢复 V{selected}</button>}</footer></aside></div>;
}

function approvalLabel(status: ApprovalStatus) {
  return status === "pending" ? "审核中" : status === "approved" ? "审核通过" : "审核失败";
}

function approvalBadge(status: ApprovalStatus) {
  if (status === "approved") return <span className="approval-badge approved"><CheckCircle2 />审核通过</span>;
  if (status === "rejected") return <span className="approval-badge rejected"><XCircle />审核失败</span>;
  return <span className="approval-badge pending"><Clock3 />审核中</span>;
}
