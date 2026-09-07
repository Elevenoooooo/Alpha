import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import {
  demoAffectedPages,
  initialProductRecords,
  initialRawFiles,
  initialWikiPages,
  productPlans,
} from "../data/mockData";
import type {
  AppView,
  Product,
  ProductFlow,
  ProductStatus,
  RawFile,
  WikiApproval,
  WikiPage,
  WikiTask,
} from "../domain/types";

type StartWikiResult = "started" | "duplicate" | "blocked";

type WorkbenchValue = {
  view: AppView;
  setView: (view: AppView) => void;
  productFlow: ProductFlow;
  startProductTask: (prompt: string) => void;
  confirmProductPlan: () => void;
  resetConversation: () => void;
  products: Product[];
  plans: Product[];
  useProduct: (product: Product) => void;
  requestQuote: (productId: string) => void;
  setQuoteOutcome: (productId: string, status: Extract<ProductStatus, "询价通过" | "询价失败">) => void;
  wikiPages: WikiPage[];
  rawFiles: RawFile[];
  selectedWikiPageId: string;
  setSelectedWikiPageId: (id: string) => void;
  wikiTask?: WikiTask;
  approval?: WikiApproval;
  approvalHistory: WikiApproval[];
  startWikiTask: (fileName: string, fileType?: string, submitter?: string) => StartWikiResult;
  pauseWikiTask: () => void;
  resumeWikiTask: () => void;
  reviseWikiTask: () => void;
  submitWikiApproval: () => void;
  approveWiki: (comment?: string) => void;
  rejectWiki: (comment: string) => void;
  requestRollback: (pageId: string, version: number, submitter?: string) => void;
  flash?: string;
  notify: (message: string) => void;
};

const WorkbenchContext = createContext<WorkbenchValue | null>(null);

const activeWikiStatuses = new Set(["processing", "paused", "ready", "submitted"]);

function now() {
  return new Intl.DateTimeFormat("zh-CN", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  })
    .format(new Date())
    .replaceAll("/", "-");
}

function fileKind(name: string) {
  const ext = name.split(".").pop()?.toLowerCase();
  if (ext === "pdf") return "PDF";
  if (ext === "doc" || ext === "docx") return "Word";
  if (ext === "ppt" || ext === "pptx") return "PPT";
  if (ext === "xls" || ext === "xlsx") return "Excel";
  if (ext === "md") return "Markdown";
  if (["png", "jpg", "jpeg", "webp"].includes(ext ?? "")) return "图片";
  return "文件";
}

function approvedPageUpdate(pageId: string) {
  const updates: Record<string, string> = {
    positioning: "服务类型和履约方式必须组合校验，不能只根据险种名称推断产品形态。",
    fulfillment: "产品设计可把履约缺口转化为能力建设需求，但正式售卖前必须确认可执行的赔付路径。",
    underwriting: "硬性核保约束属于报价前置门槛，任一条件不满足即不进入自动报价。",
    pricing: "费率试算需同时保留基准费率、调节系数、目标赔付率和主商品均价的来源。",
    penetration: "经营诊断应优先比较 C 延保销量和真实渗透率，避免以 GMV 规模替代机会判断。",
    risk: "品类风险结论需明确适用品类、风险类型、可保边界和推荐履约方式。",
    inquiry: "询价失败需记录失败原因，允许调整方案后重新发起询价。",
  };
  return updates[pageId];
}

export function WorkbenchProvider({ children }: { children: ReactNode }) {
  const [view, setView] = useState<AppView>("home");
  const [productFlow, setProductFlow] = useState<ProductFlow>({
    stage: "idle",
    kind: "product",
    prompt: "",
    executionStep: 0,
  });
  const [products, setProducts] = useState<Product[]>(initialProductRecords);
  const [plans, setPlans] = useState<Product[]>(productPlans);
  const [wikiPages, setWikiPages] = useState<WikiPage[]>(initialWikiPages);
  const [rawFiles, setRawFiles] = useState<RawFile[]>(initialRawFiles);
  const [selectedWikiPageId, setSelectedWikiPageId] = useState(initialWikiPages[0].id);
  const [wikiTask, setWikiTask] = useState<WikiTask>();
  const [approval, setApproval] = useState<WikiApproval>();
  const [approvalHistory, setApprovalHistory] = useState<WikiApproval[]>([]);
  const [flash, setFlash] = useState<string>();
  const timersRef = useRef<number[]>([]);

  const notify = useCallback((message: string) => {
    setFlash(message);
    window.setTimeout(() => setFlash(undefined), 3000);
  }, []);

  useEffect(
    () => () => {
      timersRef.current.forEach((timer) => window.clearTimeout(timer));
    },
    [],
  );

  useEffect(() => {
    if (wikiTask?.status !== "processing") return;
    const timer = window.setInterval(() => {
      setWikiTask((current) => {
        if (!current || current.status !== "processing") return current;
        const progress = Math.min(100, current.progress + 8);
        return {
          ...current,
          progress,
          status: progress >= 100 ? "ready" : "processing",
        };
      });
    }, 320);
    return () => window.clearInterval(timer);
  }, [wikiTask?.status, wikiTask?.id]);

  const startProductTask = useCallback((prompt: string) => {
    const kind = /设计|方案|产品/.test(prompt) ? "product" : /经营|分析|同比|原因/.test(prompt) ? "analysis" : "quick";
    setProductFlow({ stage: kind === "product" ? "planning" : kind === "quick" ? "result" : "running", kind, prompt, executionStep: 0 });
    setView("conversation");
    if (kind === "analysis") {
      timersRef.current.push(
        window.setTimeout(() => setProductFlow((flow) => ({ ...flow, executionStep: 2 })), 700),
        window.setTimeout(() => setProductFlow((flow) => ({ ...flow, stage: "result", executionStep: 4 })), 1900),
      );
    }
  }, []);

  const confirmProductPlan = useCallback(() => {
    setProductFlow((flow) => ({ ...flow, stage: "running", executionStep: 0 }));
    timersRef.current.forEach((timer) => window.clearTimeout(timer));
    timersRef.current = [];
    [1, 2, 3, 4].forEach((step, index) => {
      const timer = window.setTimeout(() => {
        setProductFlow((flow) => ({ ...flow, executionStep: step }));
      }, 550 * (index + 1));
      timersRef.current.push(timer);
    });
    timersRef.current.push(
      window.setTimeout(() => {
        setProductFlow((flow) => ({ ...flow, stage: "result", executionStep: 4 }));
      }, 2900),
    );
  }, []);

  const resetConversation = useCallback(() => {
    timersRef.current.forEach((timer) => window.clearTimeout(timer));
    timersRef.current = [];
    setProductFlow({ stage: "idle", kind: "product", prompt: "", executionStep: 0 });
    setView("home");
  }, []);

  const useProduct = useCallback(
    (product: Product) => {
      setPlans((items) => items.map((item) => (item.id === product.id ? { ...item, used: true } : item)));
      setProducts((items) => {
        if (items.some((item) => item.id === product.id)) return items;
        return [{ ...product, used: true, status: "待询价" }, ...items];
      });
      notify(`已使用「${product.name}」，产品进入“我的产品 · 待询价”`);
    },
    [notify],
  );

  const requestQuote = useCallback(
    (productId: string) => {
      setProducts((items) => items.map((item) => (item.id === productId ? { ...item, status: "询价中" } : item)));
      notify("已提交询报价系统，当前状态：询价中");
    },
    [notify],
  );

  const setQuoteOutcome = useCallback(
    (productId: string, status: Extract<ProductStatus, "询价通过" | "询价失败">) => {
      setProducts((items) => items.map((item) => (item.id === productId ? { ...item, status } : item)));
      notify(`询报价结果已更新：${status}`);
    },
    [notify],
  );

  const startWikiTask = useCallback(
    (fileName: string, explicitType?: string, submitter = "晨雨"): StartWikiResult => {
      const published = rawFiles.find((file) => file.name === fileName);
      if (published) {
        setSelectedWikiPageId(published.relatedPageIds[0] ?? initialWikiPages[0].id);
        setView("wiki");
        notify("该文件内容已沉淀，已为你定位到相关 Wiki Page");
        return "duplicate";
      }
      if (wikiTask && activeWikiStatuses.has(wikiTask.status)) {
        if (wikiTask.fileName === fileName) {
          notify(wikiTask.status === "submitted" ? "同一文件正在审核中" : "同一文件正在加工中");
        } else {
          notify("前方 Wiki 任务尚未审批完成，当前文件已暂缓进入加工");
        }
        return "blocked";
      }
      const id = `wiki-${Date.now()}`;
      setProductFlow({ stage: "idle", kind: "product", prompt: "", executionStep: 0 });
      setWikiTask({
        id,
        kind: "deposit",
        fileName,
        fileType: explicitType || fileKind(fileName),
        status: "processing",
        progress: 8,
        revision: 1,
        conversationId: `conversation-${id}`,
        submitter,
      });
      setApproval(undefined);
      setView("conversation");
      notify("Wiki 加工已开始，可在当前会话中暂停或继续");
      return "started";
    },
    [notify, rawFiles, wikiTask],
  );

  const pauseWikiTask = useCallback(() => {
    setWikiTask((task) => (task?.status === "processing" ? { ...task, status: "paused" } : task));
  }, []);

  const resumeWikiTask = useCallback(() => {
    setWikiTask((task) => (task?.status === "paused" ? { ...task, status: "processing" } : task));
  }, []);

  const reviseWikiTask = useCallback(() => {
    setApproval(undefined);
    setWikiTask((task) =>
      task
        ? {
            ...task,
            status: "processing",
            progress: 44,
            revision: task.revision + 1,
            submittedAt: undefined,
          }
        : task,
    );
    notify("已根据你的消息重新加工，旧结果已失效");
  }, [notify]);

  const submitWikiApproval = useCallback(() => {
    if (!wikiTask || wikiTask.status !== "ready") return;
    const submittedAt = now();
    setWikiTask({ ...wikiTask, status: "submitted", submittedAt });
    setApproval({
      id: `approval-${Date.now()}`,
      taskId: wikiTask.id,
      title: `${wikiTask.fileName} · Wiki 变更`,
      submitter: wikiTask.submitter,
      submittedAt,
      status: "pending",
      affectedPages: demoAffectedPages(wikiTask.fileName),
    });
    notify("已提交 Wiki 审批，下一项加工将在本次审批完成后开始");
  }, [notify, wikiTask]);

  const approveWiki = useCallback(
    (comment = "内容与原始材料一致，同意发布") => {
      if (!approval || !wikiTask) return;
      const reviewedAt = now();
      const completedApproval = { ...approval, status: "approved" as const, reviewer: "周然", reviewedAt, comment };
      setApproval(completedApproval);
      setApprovalHistory((items) => [completedApproval, ...items.filter((item) => item.id !== completedApproval.id)]);

      if (wikiTask.kind === "rollback" && wikiTask.pageId && wikiTask.targetVersion) {
        setWikiPages((pages) =>
          pages.map((page) => {
            if (page.id !== wikiTask.pageId) return page;
            const target = page.versions.find((version) => version.version === wikiTask.targetVersion);
            if (!target) return page;
            const version = page.currentVersion + 1;
            return {
              ...page,
              currentVersion: version,
              versions: [
                ...page.versions,
                {
                  version,
                  createdAt: reviewedAt,
                  createdBy: "周然",
                  reason: `恢复 V${target.version} 内容，保留全部历史版本`,
                  content: [...target.content],
                  sources: [...(target.sources ?? page.sources)],
                },
              ],
              sources: [...(target.sources ?? page.sources)],
            };
          }),
        );
        notify("回滚审批通过：已创建新版本，中间版本完整保留");
      } else {
        const affectedPageIds = approval.affectedPages.map((page) => page.pageId);
        setRawFiles((files) => [
          ...files,
          {
            id: `raw-${Date.now()}`,
            name: wikiTask.fileName,
            type: wikiTask.fileType,
            size: "1.8 MB",
            publishedAt: reviewedAt,
            relatedPageIds: affectedPageIds,
          },
        ]);
        setWikiPages((pages) =>
          pages.map((page) => {
            if (!affectedPageIds.includes(page.id)) return page;
            const version = page.currentVersion + 1;
            const current = page.versions.find((item) => item.version === page.currentVersion) ?? page.versions.at(-1)!;
            const extra = approvedPageUpdate(page.id);
            return {
              ...page,
              currentVersion: version,
              sources: Array.from(new Set([...page.sources, wikiTask.fileName])),
              versions: [
                ...page.versions,
                {
                  version,
                  createdAt: reviewedAt,
                  createdBy: "周然",
                  reason: `审批通过：${wikiTask.fileName}`,
                  content: extra && !current.content.includes(extra) ? [...current.content, extra] : [...current.content],
                  sources: Array.from(new Set([...(current.sources ?? page.sources), wikiTask.fileName])),
                },
              ],
            };
          }),
        );
        notify("审批通过：Raw、Wiki Page 版本与检索索引已同时发布");
      }
      setWikiTask({ ...wikiTask, status: "approved" });
    },
    [approval, notify, wikiTask],
  );

  const rejectWiki = useCallback(
    (comment: string) => {
      if (!approval || !wikiTask) return;
      const reviewedAt = now();
      const completedApproval = { ...approval, status: "rejected" as const, reviewer: "周然", reviewedAt, comment };
      setApproval(completedApproval);
      setApprovalHistory((items) => [completedApproval, ...items.filter((item) => item.id !== completedApproval.id)]);
      setWikiTask({ ...wikiTask, status: "rejected" });
      notify("审批已完成并释放队列；你仍可回原会话继续调整后再次提交");
    },
    [approval, notify, wikiTask],
  );

  const requestRollback = useCallback(
    (pageId: string, version: number, submitter = "周然") => {
      if (wikiTask && activeWikiStatuses.has(wikiTask.status)) {
        notify("当前已有 Wiki 任务占用队列，请在其审批完成后再发起回滚");
        return;
      }
      const page = wikiPages.find((item) => item.id === pageId);
      if (!page || version === page.currentVersion) return;
      const current = page.versions.find((item) => item.version === page.currentVersion) ?? page.versions.at(-1)!;
      const target = page.versions.find((item) => item.version === version);
      if (!target) return;
      const currentSet = new Set(current.content);
      const targetSet = new Set(target.content);
      const additions = target.content.filter((line) => !currentSet.has(line)).length;
      const deletions = current.content.filter((line) => !targetSet.has(line)).length;
      const id = `rollback-${Date.now()}`;
      const submittedAt = now();
      setWikiTask({
        id,
        kind: "rollback",
        fileName: `${page.title} · 恢复 V${version}`,
        fileType: "ROLLBACK",
        status: "submitted",
        progress: 100,
        revision: 1,
        conversationId: `rollback-${pageId}`,
        submitter,
        pageId,
        targetVersion: version,
        rollbackCurrentContent: [...current.content],
        rollbackTargetContent: [...target.content],
        submittedAt,
      });
      setApproval({
        id: `approval-${Date.now()}`,
        taskId: id,
        title: `${page.title}：恢复 V${version} 内容`,
        submitter,
        submittedAt,
        status: "pending",
        affectedPages: [{ pageId, title: page.title, additions, deletions }],
      });
      notify("已发起回滚审批；通过后将创建新版本，不会删除中间版本");
    },
    [notify, wikiPages, wikiTask],
  );

  const value = useMemo<WorkbenchValue>(
    () => ({
      view,
      setView,
      productFlow,
      startProductTask,
      confirmProductPlan,
      resetConversation,
      products,
      plans,
      useProduct,
      requestQuote,
      setQuoteOutcome,
      wikiPages,
      rawFiles,
      selectedWikiPageId,
      setSelectedWikiPageId,
      wikiTask,
      approval,
      approvalHistory,
      startWikiTask,
      pauseWikiTask,
      resumeWikiTask,
      reviseWikiTask,
      submitWikiApproval,
      approveWiki,
      rejectWiki,
      requestRollback,
      flash,
      notify,
    }),
    [
      approval,
      approvalHistory,
      approveWiki,
      confirmProductPlan,
      flash,
      notify,
      pauseWikiTask,
      plans,
      productFlow,
      products,
      rawFiles,
      rejectWiki,
      requestQuote,
      requestRollback,
      resetConversation,
      resumeWikiTask,
      reviseWikiTask,
      selectedWikiPageId,
      setQuoteOutcome,
      startProductTask,
      startWikiTask,
      submitWikiApproval,
      useProduct,
      view,
      wikiPages,
      wikiTask,
    ],
  );

  return <WorkbenchContext.Provider value={value}>{children}</WorkbenchContext.Provider>;
}

export function useWorkbench() {
  const value = useContext(WorkbenchContext);
  if (!value) throw new Error("useWorkbench must be used within WorkbenchProvider");
  return value;
}
