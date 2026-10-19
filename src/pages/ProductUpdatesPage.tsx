import { useRef, useState } from "react";
import { Sparkles } from "lucide-react";

type UpdateItem = {
  number: string;
  category: string;
  title: string;
  description: string;
  highlights?: readonly string[];
  note?: string;
  groups?: ReadonlyArray<readonly [string, string]>;
  groupLabel?: string;
  changes?: ReadonlyArray<readonly [string, string]>;
  changeLabel?: string;
  mediaSlots?: number;
  tone: string;
};

const octoberUpdates: readonly UpdateItem[] = [
  {
    number: "01",
    category: "能力调用",
    title: "会话中直接调用专业 Skill",
    description: "在会话框中选择并调用所需专业技能。",
    note: "当前支持：保险咨询｜星河数据服务",
    mediaSlots: 1,
    tone: "violet",
  },
  {
    number: "02",
    category: "材料理解",
    title: "支持多模态文件上传与解析",
    description: "材料可直接随会话上传。Alpha 会结合文件内容理解用户问题，减少手工摘录、格式转换和重复整理。",
    groupLabel: "支持格式：",
    groups: [
      ["图片", "JPG、JPEG、PNG、WEBP、GIF"],
      ["表格", "CSV、XLSX、XLS"],
      ["文档", "PDF、DOCX、DOC、TXT、MD"],
    ],
    mediaSlots: 2,
    tone: "blue",
  },
  {
    number: "03",
    category: "回答体验",
    title: "回答更精简，重点更清晰",
    description: "优化回答结构与信息密度，减少冗余表达。关键结论用黑体强调，帮助用户快速识别结论和差异。",
    highlights: ["结构优化", "重点加粗", "降低阅读负担"],
    mediaSlots: 1,
    tone: "amber",
  },
  {
    number: "04",
    category: "产品定品",
    title: "产品卡片更贴近业务判断",
    description: "调整产品卡片的信息口径，将“价格”调整为“费率”，将“价格段”调整为“销售渠道”，突出定品阶段更需要关注的核心业务信息。",
    changeLabel: "字段调整：",
    changes: [
      ["价格", "费率"],
      ["价格段", "销售渠道"],
    ],
    mediaSlots: 1,
    tone: "rose",
  },
  {
    number: "05",
    category: "询报价协同",
    title: "打通询报价系统，查看任务详情",
    description: "在 Alpha 发起询报价后，可以继续查看对应的询价任务、产品信息、处理状态和询价详情，减少在多个系统之间查找任务的成本。",
    highlights: ["询价任务", "处理状态", "询价详情"],
    mediaSlots: 2,
    tone: "cyan",
  },
  {
    number: "06",
    category: "业务交付",
    title: "询报价完成后，一键同步配品",
    description: "询报价完成的产品，可一键同步配品至产品库，减少重复配品和信息录入操作。",
    highlights: ["信息确认", "一键同步", "减少重复操作"],
    mediaSlots: 1,
    tone: "green",
  },
  {
    number: "07",
    category: "个性化协作",
    title: "用户个性化记忆展示",
    description: "Alpha 根据历史会话不断沉淀用户的负责品类和协作偏好，使Alpha越用越懂你；用户可以在设置中查看个性化记忆。",
    highlights: ["岗位与职责", "负责品类", "协作偏好"],
    mediaSlots: 1,
    tone: "indigo",
  },
];

const augustUpdates: readonly UpdateItem[] = [
  {
    number: "01",
    category: "核心任务",
    title: "对话式完成产品设计与经营分析",
    description: "用户可直接用自然语言描述任意关于类目机会、产品需求或经营等问题。Alpha 通过多轮对话补充条件、确认分析路径，协助完成产品方案设计或经营分析。",
    highlights: ["产品设计", "经营分析", "多轮对话"],
    mediaSlots: 2,
    tone: "violet",
  },
  {
    number: "02",
    category: "首页体验",
    title: "首页问题推荐，快速开始任务",
    description: "首页提供延保产品设计和经营分析相关的推荐问题，帮助用户从常见业务场景快速发起任务，降低首次使用和问题表达门槛。",
    highlights: ["场景推荐", "快速开始", "降低使用门槛"],
    mediaSlots: 1,
    tone: "blue",
  },
  {
    number: "03",
    category: "回答交付",
    title: "回答过程从可确认到可交付",
    description: "在任务开始前展示计划清单，由用户确认后再执行；长文本中的关键数据增加来源角标，帮助用户核对依据。产品设计任务可以生成结构化产品卡片，经营分析任务则进一步形成分析文档。",
    highlights: ["计划确认", "数据来源", "产品卡片", "分析文档"],
    mediaSlots: 4,
    tone: "amber",
  },
  {
    number: "04",
    category: "过程透明",
    title: "任务思考与执行过程可见",
    description: "在回答过程中展示任务理解、分析步骤和执行进度，让用户了解 Alpha 正在处理什么、当前进行到哪一步，以及最终结论是如何形成的。",
    highlights: ["任务拆解", "执行进度", "过程透明"],
    mediaSlots: 2,
    tone: "cyan",
  },
  {
    number: "05",
    category: "回答反馈",
    title: "支持点赞、点踩与一键复制",
    description: "用户可以对回答进行点赞或点踩，反馈结果是否有帮助；同时支持一键复制回答内容，方便继续整理、分享或用于后续业务沟通。",
    highlights: ["点赞", "点踩", "复制"],
    mediaSlots: 1,
    tone: "green",
  },
  {
    number: "06",
    category: "方案管理",
    title: "在“我的产品”统一管理待询价方案",
    description: "产品设计任务中采用的方案会进入“我的产品”。用户可以集中查看待询价产品，并通过侧边栏继续调整产品名称、服务内容和关键产品信息。",
    highlights: ["我的产品", "待询价方案", "侧边栏调整"],
    mediaSlots: 2,
    tone: "rose",
  },
  {
    number: "07",
    category: "方案优化",
    title: "从询价产品返回原会话继续优化",
    description: "对于需要调整的询价产品，用户可以一键返回原始会话继续修改，无需重新描述业务背景。",
    highlights: ["返回原会话", "继承上下文", "继续优化"],
    mediaSlots: 1,
    tone: "indigo",
  },
  {
    number: "08",
    category: "询报价发起",
    title: "产品方案支持一键发起询报价",
    description: "待询价产品确认完成后，可以直接从 Alpha 发起询报价，将已经形成的产品方案继续推进到业务询报价环节，减少跨系统重复录入。",
    highlights: ["一键询报价", "方案衔接", "减少重复录入"],
    mediaSlots: 1,
    tone: "blue",
  },
  {
    number: "09",
    category: "状态跟踪",
    title: "集中跟踪产品询报价状态",
    description: "“我的产品”按照待询价、询价中、询价通过和询价失败展示产品状态，用户可以持续了解不同产品方案的处理进度。",
    highlights: ["待询价", "询价中", "询价通过", "询价失败"],
    mediaSlots: 1,
    tone: "green",
  },
];

function UpdateMedia({ count = 1, title }: { count?: number; title: string }) {
  return (
    <div className={`update-media-grid slots-${count}`}>
      {Array.from({ length: count }, (_, index) => (
        <div className="update-image-placeholder" aria-label={`${title}图片${index + 1}待补充`} key={index}>
          <span>{count > 1 ? `图片 ${index + 1} 待补充` : "图片待补充"}</span>
        </div>
      ))}
    </div>
  );
}

function UpdateCard({ update }: { update: UpdateItem }) {
  return (
    <article className={`update-card tone-${update.tone}`}>
      <div className="update-card-copy">
        <header>
          <span className="update-card-index">{update.number}</span>
        </header>
        <h2>{update.title}</h2>
        <p>{update.description}</p>

        {update.note && <p className="update-card-note">{update.note}</p>}

        {update.groups && (
          <div className="update-detail-block">
            {update.groupLabel && <strong>{update.groupLabel}</strong>}
            <dl className="update-format-list">
              {update.groups.map(([label, formats]) => (
                <div key={label}><dt>{label}</dt><dd>{formats}</dd></div>
              ))}
            </dl>
          </div>
        )}

        {update.changes && (
          <div className="update-detail-block">
            {update.changeLabel && <strong>{update.changeLabel}</strong>}
            <div className="update-change-list">
              {update.changes.map(([from, to]) => (
                <span key={from}><del>{from}</del><b>→</b><strong>{to}</strong></span>
              ))}
            </div>
          </div>
        )}
      </div>

      <UpdateMedia count={update.mediaSlots} title={update.title} />
    </article>
  );
}

function ReleaseSection({
  id,
  date,
  dateTime,
  version,
  updates,
}: {
  id: string;
  date: string;
  dateTime: string;
  version: string;
  updates: readonly UpdateItem[];
}) {
  return (
    <section className="updates-release" id={id}>
      <header className="updates-release-head">
        <div>
          <time dateTime={dateTime}>{date}</time>
        </div>
        <strong>{version}</strong>
      </header>
      <div className="updates-feed">
        {updates.map((update) => <UpdateCard update={update} key={update.number} />)}
      </div>
    </section>
  );
}

export function ProductUpdatesPage() {
  const pageRef = useRef<HTMLElement>(null);
  const [activeVersion, setActiveVersion] = useState<"1015" | "0828">("1015");

  const syncActiveVersion = () => {
    const page = pageRef.current;
    const augustSection = document.getElementById("alpha-update-0828");
    if (!page || !augustSection) return;
    const threshold = page.getBoundingClientRect().top + Math.min(180, page.clientHeight * .24);
    setActiveVersion(augustSection.getBoundingClientRect().top <= threshold ? "0828" : "1015");
  };

  return (
    <section className="product-updates-page" onScroll={syncActiveVersion} ref={pageRef}>
      <header className="updates-hero">
        <span className="updates-eyebrow"><Sparkles /> Alpha · What happened</span>
        <h1>产品动态</h1>
        <p>了解 Alpha 最新能力与版本更新</p>
      </header>

      <div className="updates-layout">
        <aside className="updates-version-rail" aria-label="版本记录">
          <span className="updates-version-label">版本记录</span>
          <a className={activeVersion === "1015" ? "active" : ""} href="#alpha-update-1015" aria-current={activeVersion === "1015" ? "true" : undefined}>
            <i />
            <span><strong>V1.1</strong><small>10·15</small></span>
          </a>
          <a className={activeVersion === "0828" ? "active" : ""} href="#alpha-update-0828" aria-current={activeVersion === "0828" ? "true" : undefined}>
            <i />
            <span><strong>V1.0</strong><small>08·28</small></span>
          </a>
        </aside>

        <div className="updates-releases">
          <ReleaseSection id="alpha-update-1015" date="2026年10月15日" dateTime="2026-10-15" version="V1.1" updates={octoberUpdates} />
          <ReleaseSection id="alpha-update-0828" date="2026年8月28日" dateTime="2026-08-28" version="V1.0" updates={augustUpdates} />
        </div>
      </div>
    </section>
  );
}
