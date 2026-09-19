import {
  ArrowRight,
  BookOpenCheck,
  Check,
  ChevronRight,
  FileSearch,
  Layers3,
  Lightbulb,
  LineChart,
  PackageCheck,
  Play,
  Sparkles,
  Target,
  X,
} from "lucide-react";
import { useEffect, useRef, useState, type CSSProperties, type KeyboardEvent, type MouseEvent } from "react";
import { Composer } from "../components/chat/Composer";
import {
  localAttachment,
  toWikiResource,
  type ComposerAttachment,
  type ComposerResourceReference,
  type ComposerSkill,
} from "../components/chat/composerModels";
import { AnimatedPanel } from "../components/layout/AnimatedPanel";
import { useWorkbench } from "../context/WorkbenchContext";

type Journey = "design" | "analysis";

type TemplateSegment =
  | { type: "text"; content: string }
  | {
      type: "slot";
      key: string;
      placeholder: string;
      required: boolean;
      prefix?: string;
      suffix?: string;
      width: number;
    };

type StarterAction = {
  id: string;
  label: string;
  description?: string;
  segments: TemplateSegment[];
};

type JourneyOption = {
  label: string;
  title: string;
  output: string[];
  icon: typeof PackageCheck;
  actions: StarterAction[];
};

const journeyOptions: Record<Journey, JourneyOption> = {
  design: {
    label: "产品设计",
    title: "把一个机会，变成可落地的产品方案",
    output: ["机会判断", "责任设计", "定价试算", "核保检查"],
    icon: PackageCheck,
    actions: [
      {
        id: "design-opportunity",
        label: "从类目找机会",
        segments: [
          { type: "text", content: "判断" },
          { type: "slot", key: "category", placeholder: "填写类目", required: true, width: 118 },
          { type: "text", content: "的延保机会。" },
          { type: "slot", key: "scene", prefix: "重点关注：", suffix: "。", placeholder: "渠道 / 场景，可留空", required: false, width: 172 },
        ],
      },
      {
        id: "design-plan",
        label: "快速出方案",
        description: "直接生成 · 无计划",
        segments: [
          { type: "text", content: "快速为" },
          { type: "slot", key: "category", placeholder: "填写类目", required: true, width: 118 },
          { type: "text", content: "设计一款" },
          { type: "slot", key: "goal", placeholder: "引流 / 利润 / 保障", required: true, width: 164 },
          { type: "text", content: "型延保产品。" },
          { type: "slot", key: "constraint", prefix: "已知约束：", suffix: "。", placeholder: "可留空", required: false, width: 136 },
        ],
      },
      {
        id: "design-optimize",
        label: "完整产品设计",
        description: "计划执行 · 产品卡",
        segments: [
          { type: "text", content: "为" },
          { type: "slot", key: "category", placeholder: "填写类目", required: true, width: 118 },
          { type: "text", content: "完整设计一套" },
          { type: "slot", key: "goal", placeholder: "引流 / 利润 / 保障", required: true, width: 164 },
          { type: "text", content: "型延保方案，覆盖责任、定价和核保，并生成产品卡。" },
          { type: "slot", key: "constraint", prefix: "已知约束：", suffix: "。", placeholder: "可留空", required: false, width: 136 },
        ],
      },
    ],
  },
  analysis: {
    label: "经营分析",
    title: "从经营现象，找到原因和下一步动作",
    output: ["核心指标", "异常定位", "同比拆解", "行动建议"],
    icon: LineChart,
    actions: [
      {
        id: "analysis-overview",
        label: "看经营全貌",
        segments: [
          { type: "text", content: "分析" },
          { type: "slot", key: "scope", placeholder: "类目或业务范围", required: true, width: 156 },
          { type: "text", content: "在" },
          { type: "slot", key: "period", placeholder: "时间范围", required: true, width: 126 },
          { type: "text", content: "的经营表现。" },
          { type: "slot", key: "focus", prefix: "特别关注：", suffix: "。", placeholder: "可留空", required: false, width: 136 },
        ],
      },
      {
        id: "analysis-anomaly",
        label: "定位指标异常",
        segments: [
          { type: "text", content: "分析" },
          { type: "slot", key: "metric", placeholder: "指标或经营现象", required: true, width: 170 },
          { type: "text", content: "在" },
          { type: "slot", key: "period", placeholder: "时间范围", required: true, width: 126 },
          { type: "text", content: "出现异常的原因。" },
          { type: "slot", key: "scope", prefix: "业务范围：", suffix: "。", placeholder: "可留空", required: false, width: 136 },
        ],
      },
      {
        id: "analysis-compare",
        label: "做类目对比",
        segments: [
          { type: "text", content: "对比" },
          { type: "slot", key: "targetA", placeholder: "对象 A", required: true, width: 118 },
          { type: "text", content: "和" },
          { type: "slot", key: "targetB", placeholder: "对象 B", required: true, width: 118 },
          { type: "text", content: "的经营表现。" },
          { type: "slot", key: "period", prefix: "对比周期：", suffix: "。", placeholder: "可留空", required: false, width: 136 },
        ],
      },
    ],
  },
};

const allStarterActions = Object.values(journeyOptions).flatMap((journey) => journey.actions);

function buildTemplatePrompt(action: StarterAction, values: Record<string, string>, showPlaceholders: boolean) {
  return action.segments
    .map((segment) => {
      if (segment.type === "text") return segment.content;
      const value = values[segment.key]?.trim();
      if (!value && !showPlaceholders) return "";
      if (!value) return `${segment.prefix ?? ""}【${segment.placeholder}】${segment.suffix ?? ""}`;
      return `${segment.prefix ?? ""}${value}${segment.suffix ?? ""}`;
    })
    .join("");
}

function isTemplateComplete(action: StarterAction, draft: string) {
  return action.segments.every(
    (segment) => segment.type === "text" || !segment.required || !draft.includes(segment.placeholder),
  );
}

function cleanTemplatePrompt(action: StarterAction, draft: string) {
  return action.segments
    .filter((segment): segment is Extract<TemplateSegment, { type: "slot" }> => segment.type === "slot" && !segment.required)
    .reduce(
      (text, segment) => text.replace(`${segment.prefix ?? ""}${segment.placeholder}${segment.suffix ?? ""}`, ""),
      draft,
    )
    .replace(/\s+/g, " ")
    .trim();
}

export function HomePage() {
  const { startProductTask, startWikiTask, notify, wikiPages } = useWorkbench();
  const [input, setInput] = useState("");
  const [attachment, setAttachment] = useState<ComposerAttachment>();
  const [selectedSkill, setSelectedSkill] = useState<ComposerSkill>();
  const [resourceReferences, setResourceReferences] = useState<ComposerResourceReference[]>([]);
  const [wikiDepositMode, setWikiDepositMode] = useState(false);
  const [selectedJourney, setSelectedJourney] = useState<Journey>();
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>();
  const [templateDraft, setTemplateDraft] = useState("");
  const [templateFocusRequest, setTemplateFocusRequest] = useState(0);
  const [guideOpen, setGuideOpen] = useState(false);
  const composerSectionRef = useRef<HTMLElement>(null);

  const selectedAction = selectedTemplateId
    ? allStarterActions.find((action) => action.id === selectedTemplateId)
    : undefined;
  const templateComplete = selectedAction ? isTemplateComplete(selectedAction, templateDraft) : true;
  const composerValue = selectedAction ? templateDraft : input;

  const useStarter = (journey: Journey, action: StarterAction) => {
    setSelectedJourney(journey);
    setSelectedTemplateId(action.id);
    setTemplateDraft(buildTemplatePrompt(action, {}, true));
    setInput("");
    setWikiDepositMode(false);
    setTemplateFocusRequest((value) => value + 1);
    window.requestAnimationFrame(() => composerSectionRef.current?.scrollIntoView({ behavior: "smooth", block: "center" }));
  };

  const changeWikiDepositMode = (active: boolean) => {
    setWikiDepositMode(active);
    if (!active) return;
    setSelectedJourney(undefined);
    setSelectedTemplateId(undefined);
    setTemplateDraft("");
    setInput("");
  };

  const submit = () => {
    if (wikiDepositMode) {
      if (!attachment) {
        notify("请添加需要沉淀的文件");
        return;
      }
      startWikiTask([attachment], undefined, input.trim() || undefined);
      return;
    }

    if (selectedAction && !templateComplete) {
      setTemplateFocusRequest((value) => value + 1);
      notify("请先填写紫色下划线中的必填内容");
      return;
    }

    const prompt = selectedAction
      ? cleanTemplatePrompt(selectedAction, templateDraft)
      : input.trim() || (attachment ? "请分析这份资料" : "");
    if (!prompt) return;
    startProductTask(prompt, {
      attachment,
      skill: selectedSkill ? { id: selectedSkill.id, name: selectedSkill.name } : undefined,
      resources: resourceReferences,
    });
  };

  return (
    <div className="home-page">
      <AnimatedPanel className="home-content">
        <header className="home-toolbar">
          <div className="home-presence"><span /> Alpha 工作台</div>
          <button onClick={() => setGuideOpen(true)}><Play /> 3 分钟了解 Alpha</button>
        </header>

        <section className="home-hero">
          <span className="home-eyebrow"><Sparkles /> 从一句业务问题开始</span>
          <h1>今天想解决什么问题？</h1>
          <p>直接说一句，或者从下面选择一个任务，Alpha 会帮你把问题补完整。</p>
        </section>

        <section ref={composerSectionRef} className={`home-compose-section ${selectedAction ? "is-template-mode" : ""}`}>
          <Composer
            large
            value={composerValue}
            onChange={setInput}
            onSubmit={submit}
            attachment={attachment}
            onSelectLocalFile={(file) => setAttachment(localAttachment(file))}
            onRemoveAttachment={() => setAttachment(undefined)}
            selectedSkill={selectedSkill}
            onSelectSkill={setSelectedSkill}
            resourceReferences={resourceReferences}
            availableWikiResources={wikiPages.map(toWikiResource)}
            onChangeResourceReferences={setResourceReferences}
            wikiDepositMode={wikiDepositMode}
            onChangeWikiDepositMode={changeWikiDepositMode}
            onNotify={notify}
            templateEditor={selectedAction ? (
              <TemplateSentenceEditor
                key={selectedAction.id}
                action={selectedAction}
                focusRequest={templateFocusRequest}
                onChange={setTemplateDraft}
                onSubmit={submit}
              />
            ) : undefined}
            submitDisabled={Boolean(selectedAction && !templateComplete)}
            placeholder="说一个类目、指标或经营现象，Alpha 会帮你把问题补完整"
          />
        </section>

        <section className="journey-grid" aria-label="核心任务">
          {(Object.entries(journeyOptions) as Array<[Journey, JourneyOption]>).map(([id, journey]) => {
            const Icon = journey.icon;
            const active = selectedJourney === id;
            return (
              <article key={id} className={`journey-card journey-${id} ${active ? "active" : ""}`}>
                <header>
                  <span className="journey-icon"><Icon /></span>
                  <div>
                    <small>{journey.label}</small>
                    <h2>{journey.title}</h2>
                  </div>
                </header>
                <div className="journey-output" aria-label="预计产出">
                  <span>你会得到</span>
                  <p>{journey.output.map((item) => <b key={item}><Check />{item}</b>)}</p>
                </div>
                <div className="journey-actions">
                  {journey.actions.map((action) => (
                    <button
                      key={action.id}
                      className={selectedTemplateId === action.id ? "selected" : ""}
                      onClick={() => useStarter(id, action)}
                    >
                      <span><strong>{action.label}</strong>{action.description && <small>{action.description}</small>}</span>
                      <ChevronRight />
                    </button>
                  ))}
                </div>
              </article>
            );
          })}
        </section>
      </AnimatedPanel>

      {guideOpen && (
        <div className="home-guide-backdrop" role="presentation" onMouseDown={() => setGuideOpen(false)}>
          <section className="home-guide" role="dialog" aria-modal="true" aria-labelledby="home-guide-title" onMouseDown={(event) => event.stopPropagation()}>
            <header>
              <span><BookOpenCheck /></span>
              <div><small>ALPHA 快速上手</small><h2 id="home-guide-title">不用学 Prompt，三步完成任务</h2></div>
              <button onClick={() => setGuideOpen(false)} aria-label="关闭"><X /></button>
            </header>
            <div className="guide-steps">
              <article><b>01</b><span><Target /></span><div><strong>说清目标</strong><p>选择产品设计或经营分析，也可以只说一个类目、指标或现象。</p></div></article>
              <article><b>02</b><span><FileSearch /></span><div><strong>补充上下文</strong><p>需要时上传文件、引用 Wiki 或调用 Skill，Alpha 会主动补齐缺失信息。</p></div></article>
              <article><b>03</b><span><Layers3 /></span><div><strong>确认并行动</strong><p>查看依据与过程，确认方案后再进入询价、沉淀或后续业务动作。</p></div></article>
            </div>
            <footer>
              <p><Lightbulb /> Demo 提示：选择任务不会自动发送，你可以先补充或修改。</p>
              <button onClick={() => { setGuideOpen(false); useStarter("design", journeyOptions.design.actions[1]); }}>用一个产品设计案例开始 <ArrowRight /></button>
            </footer>
          </section>
        </div>
      )}
    </div>
  );
}

function TemplateSentenceEditor({
  action,
  focusRequest,
  onChange,
  onSubmit,
}: {
  action: StarterAction;
  focusRequest: number;
  onChange: (value: string) => void;
  onSubmit: () => void;
}) {
  const editorRef = useRef<HTMLDivElement>(null);

  const selectSlot = (slot: HTMLElement) => {
    editorRef.current?.querySelectorAll(".template-slot.is-active").forEach((node) => node.classList.remove("is-active"));
    slot.classList.add("is-active");
    const range = document.createRange();
    range.selectNodeContents(slot);
    const selection = window.getSelection();
    selection?.removeAllRanges();
    selection?.addRange(range);
    editorRef.current?.focus();
  };

  useEffect(() => {
    const requiredSlots = Array.from(
      editorRef.current?.querySelectorAll<HTMLElement>(".template-slot[data-required='true']") ?? [],
    );
    const target = requiredSlots.find((slot) => slot.textContent === slot.dataset.placeholder)
      ?? editorRef.current?.querySelector<HTMLElement>(".template-slot");
    if (target) selectSlot(target);
  }, [action.id, focusRequest]);

  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key === "Enter") {
      event.preventDefault();
      onSubmit();
      return;
    }
    if (event.key !== "Tab") return;
    const slots = Array.from(editorRef.current?.querySelectorAll<HTMLElement>(".template-slot") ?? []);
    if (!slots.length) return;
    const anchor = window.getSelection()?.anchorNode;
    const anchorElement = anchor instanceof Element ? anchor : anchor?.parentElement;
    const current = anchorElement?.closest<HTMLElement>(".template-slot");
    const currentIndex = current ? slots.indexOf(current) : -1;
    const direction = event.shiftKey ? -1 : 1;
    const nextIndex = (currentIndex + direction + slots.length) % slots.length;
    event.preventDefault();
    selectSlot(slots[nextIndex]);
  };

  const handlePointerUp = (event: MouseEvent<HTMLDivElement>) => {
    editorRef.current?.querySelectorAll(".template-slot.is-active").forEach((node) => node.classList.remove("is-active"));
    const target = (event.target as Element).closest<HTMLElement>(".template-slot");
    if (target) target.classList.add("is-active");
  };

  return (
    <div
      ref={editorRef}
      className="composer-template-editor"
      contentEditable
      suppressContentEditableWarning
      role="textbox"
      aria-multiline="false"
      aria-label={`${action.label}问题模板，可直接删除或改写`}
      onInput={(event) => onChange(event.currentTarget.innerText)}
      onKeyDown={handleKeyDown}
      onMouseUp={handlePointerUp}
    >
      {action.segments.map((segment, index) => {
        if (segment.type === "text") return <span key={`${segment.content}-${index}`}>{segment.content}</span>;
        return (
          <span key={segment.key} className="template-slot-wrap">
            {segment.prefix && <span>{segment.prefix}</span>}
            <span
              className={`template-slot ${segment.required ? "is-required" : "is-optional"}`}
              data-required={segment.required}
              data-placeholder={segment.placeholder}
              style={{ "--slot-width": `${segment.width}px` } as CSSProperties}
            >
              {segment.placeholder}
            </span>
            {segment.suffix && <span>{segment.suffix}</span>}
          </span>
        );
      })}
    </div>
  );
}
