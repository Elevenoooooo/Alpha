import { X } from "lucide-react";
import { useState } from "react";
import { demoAffectedPages, initialWikiPages } from "../../data/mockData";
import type { WikiApproval, WikiTask } from "../../domain/types";

type DiffLine = { type: "context" | "remove" | "add"; old: string; next: string; text: string };
type PageDiff = { locator: string; lines: DiffLine[]; sourceExcerpt: string[] };

const pageDiffs: Record<string, PageDiff> = {
  positioning: {
    locator: "第 2 页 · 一、险种定位与产品形态",
    sourceExcerpt: ["延保险面向耐用品在厂家质保到期后的延续保障。", "保障场景包括质量故障、意外损坏和换新。", "产品以服务类型为核心组织。", "履约方式分为维修、换新、退货和补贴。", "不同品类应差异化配置服务触发条件。", "是否包含进液、次数限制等属于关键设计变量。", "服务定义需与条款责任保持一致。"],
    lines: [
      { type: "context", old: "8", next: "8", text: "延保险面向耐用品在厂家质保到期后的延续保障。" },
      { type: "context", old: "9", next: "9", text: "保障场景包括质量故障、意外损坏和换新。" },
      { type: "context", old: "10", next: "10", text: "产品应根据品类和责任范围确定服务类型。" },
      { type: "remove", old: "11", next: "", text: "产品形态以维修和换新两类服务为主。" },
      { type: "add", old: "", next: "11", text: "产品以服务类型为核心组织，按维修、换新、退货、补贴四种履约方式进行差异化配置。" },
      { type: "add", old: "", next: "12", text: "常用服务类型包括全保修、质保维修、意外维修、碎屏维修、试用退换、复购补贴、电池维修和数据恢复等十余种。" },
      { type: "add", old: "", next: "13", text: "每种服务类型需明确触发条件、是否包含进液、次数限制和保障期限。" },
      { type: "context", old: "12", next: "14", text: "服务定义需与保险条款责任保持一致。" },
      { type: "context", old: "13", next: "15", text: "同一类目可配置不同保障范围和履约路径。" },
      { type: "context", old: "14", next: "16", text: "产品上线前需确认履约能力和核保边界。" },
    ],
  },
  fulfillment: {
    locator: "第 5 页 · 二、类目版图与履约能力",
    sourceExcerpt: ["可售版图回答该类目能不能卖。", "当前覆盖 75 个一级、1351 个二级、15967 个三级类目。", "履约能力回答卖了以后怎么赔。", "换新覆盖 3000 个三级类目，维修覆盖 532 个。", "两者皆有 497 个，仅维修不换新的有 35 个。", "履约能力是现状盘面，不是产品设计禁区。", "能力缺口可转化为履约建设需求。"],
    lines: [
      { type: "context", old: "20", next: "20", text: "可售版图回答‘能不能卖’，是产品设计可覆盖的类目上界。" },
      { type: "context", old: "21", next: "21", text: "可售上界覆盖 75 个一级类目和 1351 个二级类目。" },
      { type: "context", old: "22", next: "22", text: "三级类目总量为 15967 个。" },
      { type: "remove", old: "23", next: "", text: "换新和维修目前均覆盖约 2000 个三级类目。" },
      { type: "add", old: "", next: "23", text: "换新覆盖 3000 个三级类目，维修覆盖 532 个，两者皆有 497 个。" },
      { type: "add", old: "", next: "24", text: "仅维修不换新的有 35 个，其中 74% 是二手或官翻商品，通常没有同款新品可换。" },
      { type: "remove", old: "24", next: "", text: "未覆盖履约能力的类目暂不建议设计延保。" },
      { type: "add", old: "", next: "25", text: "履约能力是现状盘面而非准入禁区，能力外品类可以反向提出履约建设需求。" },
      { type: "context", old: "25", next: "26", text: "正式售卖前仍需确认可执行的赔付路径。" },
      { type: "context", old: "26", next: "27", text: "能力盘点按三级类目维护并定期更新。" },
      { type: "context", old: "27", next: "28", text: "可售与履约两个口径不得混用。" },
    ],
  },
  underwriting: {
    locator: "第 8 页 · 三、条款设计",
    sourceExcerpt: ["通用免责共 14 条底层规则。", "商业用途、人为故意损坏和自然衰减不属于保障责任。", "配件耗材、间接损失和非授权拆改属于通用免责。", "换新类保险期间不得超过 4 年。", "延保保障期间不得超过厂家质保期的 2 倍。", "赔偿上限不得超过主商品实付金额。", "组合品和其他类总占比不得超过 30%。"],
    lines: [
      { type: "context", old: "30", next: "30", text: "通用免责共 14 条底层规则。" },
      { type: "context", old: "31", next: "31", text: "商业用途、人为故意损坏、自然衰减和非授权拆改属于通用免责。" },
      { type: "context", old: "32", next: "32", text: "三包范围内责任和间接损失不得重复纳入延保责任。" },
      { type: "remove", old: "33", next: "", text: "特殊产品提交后由核保人员综合判断。" },
      { type: "add", old: "", next: "33", text: "线上延保与复购或试用组合时不予报价。" },
      { type: "add", old: "", next: "34", text: "换新类保险期间不得超过 4 年，延保保障期间不得超过厂家质保期的 2 倍。" },
      { type: "add", old: "", next: "35", text: "赔偿上限不得超过主商品实付金额。" },
      { type: "add", old: "", next: "36", text: "囤货或过期换新补贴比例不得超过原实付金额的 70%。" },
      { type: "add", old: "", next: "37", text: "组合品和‘其他’类总占比不得超过 30%。" },
      { type: "context", old: "34", next: "38", text: "硬性约束任一不满足时，不进入自动报价。" },
      { type: "context", old: "35", next: "39", text: "非硬性边界可进入人工核保。" },
      { type: "context", old: "36", next: "40", text: "核保结论需要保留触发规则和依据。" },
    ],
  },
  pricing: {
    locator: "第 11 页 · 四、定价逻辑",
    sourceExcerpt: ["定价由基准费率和三类调节系数共同形成。", "风险、成本和风控系数需分别记录。", "最终费率还受到目标赔付率影响。", "最终保费按预估主商品均价计算。", "基准费率按四档风险层级维护。", "目标赔付率默认采用 75%。", "冷门、高价或垄断渠道可采用 60% 策略。"],
    lines: [
      { type: "context", old: "40", next: "40", text: "定价链路从类目基准费率开始。" },
      { type: "context", old: "41", next: "41", text: "风险、成本和风控系数分别反映不同定价变量。" },
      { type: "context", old: "42", next: "42", text: "目标赔付率用于平衡转化和利润。" },
      { type: "remove", old: "43", next: "", text: "最终费率 = 基准费率 × 风险系数。" },
      { type: "add", old: "", next: "43", text: "最终费率 = 基准费率 ×（风险系数 × 成本系数 × 风控系数）÷ 目标赔付率。" },
      { type: "add", old: "", next: "44", text: "最终保费 = 预估主商品均价 × 最终费率。" },
      { type: "remove", old: "44", next: "", text: "所有类目采用统一基准费率区间。" },
      { type: "add", old: "", next: "45", text: "基准费率按极低、低、中、高危易损四档风险层级维护，分别设置纯延保与意外全保区间。" },
      { type: "add", old: "", next: "46", text: "目标赔付率默认 75%；冷门、高价或垄断渠道采用 60% 高毛利策略。" },
      { type: "context", old: "45", next: "47", text: "品牌、保障范围和期限进入风险系数。" },
      { type: "context", old: "46", next: "48", text: "履约方式和残值进入成本系数。" },
      { type: "context", old: "47", next: "49", text: "免赔、等待期和次数进入风控系数。" },
    ],
  },
  penetration: {
    locator: "第 14 页 · 五、渗透率口径",
    sourceExcerpt: ["渗透率用于衡量消费者购买延保的实际情况。", "统计范围应覆盖 C 延保、物流和电销销量。", "B 集采反映厂商配套率，不反映消费者付费意愿。", "业务合理区间通常为 1% 至 3%。", "机会判断需以实测 C 延保渗透为锚。", "GMV 规模不能直接换算保费潜力。", "珠宝与消费电子的实测销量差距接近 1000 倍。"],
    lines: [
      { type: "context", old: "50", next: "50", text: "渗透率用于衡量消费者购买延保的实际情况。" },
      { type: "context", old: "51", next: "51", text: "统计周期按支付完成日归属。" },
      { type: "context", old: "52", next: "52", text: "退款在完成退款当日回冲。" },
      { type: "remove", old: "53", next: "", text: "渗透率 = 延保总销量 ÷ 大盘销量，包含 B 集采。" },
      { type: "add", old: "", next: "53", text: "渗透率 =（C 延保销量 + 物流销量 + 电销销量）÷ 大盘销量，不含 B 集采。" },
      { type: "add", old: "", next: "54", text: "B 集采反映厂商配套率而非消费者付费意愿，纳入后会使键盘渗透率从 1.5% 虚高到 77%。" },
      { type: "remove", old: "54", next: "", text: "高 GMV 类目可直接作为高保费潜力类目。" },
      { type: "add", old: "", next: "55", text: "GMV 量级不等于 C 延保机会量级，保费潜力必须以实测 C 延保渗透为锚。" },
      { type: "context", old: "55", next: "56", text: "业务合理区间通常为 1%–3%。" },
      { type: "context", old: "56", next: "57", text: "大家电实测渗透率为 6.97%，属于第一梯队。" },
      { type: "context", old: "57", next: "58", text: "珠宝 GMV 与消费电子接近，但 C 延保销量相差约 1000 倍。" },
    ],
  },
  risk: {
    locator: "第 3 页 · 已研究品类风险画像",
    sourceExcerpt: ["当前按业务作用域已研究 29 个品类实体。", "不同品类的可保风险和履约路径存在显著差异。", "珠宝板块主要关注信任型风险。", "食品主要关注冷链与时效风险。", "消费电子与母婴主要关注意外损坏风险。", "风险画像需要转化为责任和定价变量。", "高风险且不可验证的责任应被剔除。"],
    lines: [
      { type: "context", old: "61", next: "61", text: "当前按业务作用域已研究 29 个品类实体。" },
      { type: "context", old: "62", next: "62", text: "风险画像需连接产品责任、履约和定价。" },
      { type: "context", old: "63", next: "63", text: "不同品类的可保边界存在显著差异。" },
      { type: "remove", old: "64", next: "", text: "所有品类统一按意外损坏风险设计。" },
      { type: "add", old: "", next: "64", text: "珠宝属于信任型风险：黄金和珍珠高风险剔除，铂金可修复风险可上品，文玩适合养护订阅与鉴定保险。" },
      { type: "add", old: "", next: "65", text: "食品属于冷链与时效风险，可用 1 元购模型跑量，榴莲 1.23% 渗透率提供放量实证。" },
      { type: "add", old: "", next: "66", text: "消费电子与母婴关注意外损坏，手机碎屏和安全座椅事故后必报废属于行业刚性风险。" },
      { type: "context", old: "65", next: "67", text: "高风险且不可验证的责任应被剔除。" },
      { type: "context", old: "66", next: "68", text: "可修复物理风险优先匹配维修类履约。" },
      { type: "context", old: "67", next: "69", text: "风险结论需标记适用品类和来源。" },
    ],
  },
  inquiry: {
    locator: "第 9 页 · 产品询报价状态",
    sourceExcerpt: ["产品方案使用后进入待询价。", "业务人员确认后提交询报价。", "提交成功后进入询价中。", "终态分为询价通过和询价失败。", "询价失败必须记录失败原因。", "调整方案后可以重新发起询价。", "每次询价需要保留状态更新时间。"],
    lines: [
      { type: "context", old: "10", next: "10", text: "产品方案使用后进入待询价。" },
      { type: "context", old: "11", next: "11", text: "业务人员确认后提交询报价。" },
      { type: "context", old: "12", next: "12", text: "提交成功后进入询价中。" },
      { type: "remove", old: "13", next: "", text: "询报价终态统一标记为已完成。" },
      { type: "add", old: "", next: "13", text: "询报价终态为询价通过或询价失败。" },
      { type: "add", old: "", next: "14", text: "询价失败需记录失败原因，允许调整方案后重新发起询价。" },
      { type: "context", old: "14", next: "15", text: "每次询价需保留发起人与状态更新时间。" },
      { type: "context", old: "15", next: "16", text: "通过后产品进入可配置状态。" },
      { type: "context", old: "16", next: "17", text: "失败结果不自动覆盖产品方案。" },
    ],
  },
};

function rollbackLines(task: WikiTask): DiffLine[] {
  const current = task.rollbackCurrentContent ?? [];
  const target = task.rollbackTargetContent ?? [];
  const currentSet = new Set(current);
  const targetSet = new Set(target);
  const result: DiffLine[] = [];
  current.forEach((text, index) => {
    if (!targetSet.has(text)) result.push({ type: "remove", old: String(index + 1), next: "", text });
  });
  target.forEach((text, index) => {
    result.push(currentSet.has(text)
      ? { type: "context", old: String(current.indexOf(text) + 1), next: String(index + 1), text }
      : { type: "add", old: "", next: String(index + 1), text });
  });
  return result;
}

function proposedFullContent(pageId?: string) {
  const page = initialWikiPages.find((item) => item.id === pageId);
  return page?.versions.find((item) => item.version === page.currentVersion)?.content ?? [];
}

function ContentLine({ line }: { line: string }) {
  if (line.startsWith("## ")) return <h2>{line.slice(3)}</h2>;
  if (line.startsWith("- ")) return <p className="wiki-bullet">{line.slice(2)}</p>;
  if (line.includes(" = ")) return <p className="wiki-formula">{line}</p>;
  return <p>{line}</p>;
}

export function WikiDiffPanel({
  task,
  approval,
  onClose,
  onSubmit,
  submitVisible = false,
  reviewActions,
  readOnlyNote,
}: {
  task?: WikiTask;
  approval?: WikiApproval;
  onClose: () => void;
  onSubmit?: () => void;
  submitVisible?: boolean;
  reviewActions?: { onApprove: () => void; onReject: () => void };
  readOnlyNote?: string;
}) {
  const [mode, setMode] = useState<"diff" | "full" | "source">("diff");
  const affected = approval?.affectedPages ?? demoAffectedPages(task?.fileName);
  const [activePage, setActivePage] = useState(affected[0]?.pageId);
  const isRollback = task?.kind === "rollback";
  const pageDiff = pageDiffs[activePage] ?? pageDiffs.penetration;
  const displayLines = isRollback && task ? rollbackLines(task) : pageDiff.lines;
  const fullContent = isRollback ? task?.rollbackTargetContent ?? [] : proposedFullContent(activePage);
  const sourceFile = task?.fileName ?? approval?.title.split(" · ")[0] ?? "本次上传文件";
  const title = affected.find((page) => page.pageId === activePage)?.title;

  return (
    <div className="drawer-backdrop" onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
      <aside className="wiki-diff-drawer" aria-label="Wiki 加工结果">
        <header className="drawer-header">
          <div><h2>{approval?.title ?? "Wiki 加工结果"}</h2><p>{sourceFile} · 受影响 Pages {affected.length}</p></div>
          <button onClick={onClose} aria-label="关闭"><X /></button>
        </header>
        <div className="diff-layout">
          <nav className="affected-pages">
            <h3>受影响 Pages <span>{affected.length}</span></h3>
            {affected.map((page) => (
              <button className={page.pageId === activePage ? "active" : ""} key={page.pageId} onClick={() => { setActivePage(page.pageId); setMode("diff"); }}>
                <span><strong>{page.title}</strong><small>修改</small></span>
                <i><b>+{page.additions}</b><em>-{page.deletions}</em></i>
              </button>
            ))}
            <div className="source-box">
              <small>{isRollback ? "回滚目标" : "原始文件"}</small>
              <strong>{sourceFile}</strong>
              <button onClick={() => setMode(isRollback ? "full" : "source")}>{isRollback ? "查看完整历史版本" : "查看 Raw 原文"}</button>
            </div>
          </nav>
          <section className="diff-content">
            <div className="diff-toolbar">
              <div>
                <button className={mode === "diff" ? "active" : ""} onClick={() => setMode("diff")}>显示 Diff</button>
                <button className={mode === "full" ? "active" : ""} onClick={() => setMode("full")}>{isRollback ? "目标版本内容" : "加工后 Page"}</button>
                {!isRollback && <button className={mode === "source" ? "active" : ""} onClick={() => setMode("source")}>Raw 原文</button>}
              </div>
              <span>{mode === "diff" ? "变更前后各 3 行" : mode === "source" ? "本次加工的事实来源" : isRollback ? "拟恢复的历史版本" : "审批通过后生成的新 Page"}</span>
            </div>
            {approval?.status === "rejected" && approval.comment && (
              <div className="approval-comment-panel">
                <div><strong>驳回原因</strong><p>{approval.comment}</p></div>
                <span>审批人：{approval.reviewer ?? "—"} · 审批时间：{approval.reviewedAt ?? "—"}</span>
              </div>
            )}
            <article className="diff-document">
              <h1>{title}</h1>
              <p className="source-position">来源：{isRollback ? `Wiki 历史版本 V${task?.targetVersion}` : pageDiff.locator}</p>
              {mode === "diff" ? (
                <div className="diff-lines">
                  {displayLines.map((line, index) => (
                    <div className={`diff-line ${line.type}`} key={`${line.type}-${index}`}>
                      <span>{line.old}</span><span>{line.next}</span><code>{line.type === "add" ? "+" : line.type === "remove" ? "−" : " "}</code><p>{line.text}</p>
                    </div>
                  ))}
                </div>
              ) : mode === "full" ? (
                <div className="full-wiki-content">
                  {fullContent.map((line, index) => <ContentLine line={line} key={`${line}-${index}`} />)}
                </div>
              ) : (
                <div className="source-locator">
                  <header><span>Raw 原文定位</span><h2>{sourceFile}</h2><p>{pageDiff.locator}</p></header>
                  <div className="source-context-lines">
                    {pageDiff.sourceExcerpt.map((line, index) => <p className={index === 3 ? "matched" : ""} key={line}><span>{index + 1}</span>{line}</p>)}
                  </div>
                  <footer>这里展示加工结论对应的原文段落，审批人可在同一页面核对来源与变更，不需要离开当前审核流程。</footer>
                </div>
              )}
            </article>
          </section>
        </div>
        {submitVisible && (
          <footer className="drawer-footer"><span>提交后，本任务将等待审核完成再释放队列。</span><button className="primary-button" onClick={onSubmit}>提交审批</button></footer>
        )}
        {reviewActions && (
          <footer className="drawer-footer review-footer"><span>请结合原始文件、完整内容和 Diff 作出审批判断。</span><div><button className="secondary-button" onClick={reviewActions.onReject}>驳回</button><button className="primary-button" onClick={reviewActions.onApprove}>通过并发布</button></div></footer>
        )}
        {!reviewActions && !submitVisible && readOnlyNote && <footer className="drawer-footer"><span>{readOnlyNote}</span></footer>}
      </aside>
    </div>
  );
}
