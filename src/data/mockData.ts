import type { Product, RawFile, WikiApproval, WikiPage } from "../domain/types";

export const recommendedQuestions = [
  { mode: "快速了解", text: "昨天手机类目保费最大的 10 个品牌是哪些？", time: "通常 1–3 分钟" },
  { mode: "快速了解", text: "手机 8 月的延保渗透率是多少？", time: "通常 1–3 分钟" },
  { mode: "深度分析", text: "看看手机类目近一个月的经营情况，跟去年同期比一比", time: "耗时较长" },
];

export const productPlans: Product[] = [
  {
    id: "TP1787915416137",
    name: "3年质保换新高价性能分列档",
    price: "¥459.0",
    serviceContent: "在服务期间，产品正常使用过程中出现三包范围内的机械或电气元件故障，提供维修或换新服务。",
    fulfillment: "换新",
    coverageLimit: "主商品实付金额 × 80%",
    period: "3年",
    priceRange: "2500–5000元",
    underwriting: "通过",
  },
  {
    id: "TP1787915416138",
    name: "2年碎屏引流保意外换屏",
    price: "¥131.49",
    serviceContent: "在服务期间，产品因不慎磕碰、挤压或跌落导致屏幕损坏时，提供一次维修或换屏服务。",
    fulfillment: "维修",
    coverageLimit: "主商品实付金额 × 90%",
    period: "2年",
    priceRange: "600–1200元",
    underwriting: "通过",
  },
  {
    id: "TP1787915416139",
    name: "2年全保换新补购稳健档",
    price: "¥265.47",
    serviceContent: "在服务期间，产品正常使用过程中出现三包范围内故障时，提供维修或符合条件的换新服务。",
    fulfillment: "换新",
    coverageLimit: "主商品实付金额 × 80%",
    period: "2年",
    priceRange: "1200–2500元",
    underwriting: "待人工确认",
  },
];

export const initialProductRecords: Product[] = [
  {
    ...productPlans[1],
    id: "ALPHA-PD-20260826-012",
    name: "手机碎屏意外换屏 2 年版",
    price: "¥129.00",
    status: "询价通过",
    used: true,
  },
  {
    ...productPlans[0],
    id: "ALPHA-PD-20260825-006",
    name: "高端手机 3 年质保换新",
    status: "询价中",
    used: true,
  },
];

export const initialWikiPages: WikiPage[] = [
  {
    id: "positioning",
    folder: "产品知识",
    title: "险种定位与产品形态",
    currentVersion: 1,
    sources: ["延保险产品知识与设计规范V4.pdf"],
    versions: [
      {
        version: 1,
        createdAt: "2026-09-02 16:20",
        createdBy: "周然",
        reason: "首次沉淀险种定位与服务类型",
        sources: ["延保险产品知识与设计规范V4.pdf"],
        content: [
          "## 险种定位",
          "延保险的核心是为耐用品在厂家质保到期后提供延续保障，覆盖质量故障、意外损坏、换新等场景。",
          "## 产品形态",
          "产品以服务类型为核心组织，按维修、换新、退货、补贴四种履约方式进行差异化配置。",
          "常用服务类型包括全保修、质保维修、意外维修、碎屏维修、全/质/意外换新、试用退货/换新、复购补贴、囤货无忧、电池维修、数据恢复等十余种。",
          "每种服务类型有独立的触发条件和关键设计变量，例如是否包含进液、服务次数限制和保障期限。",
        ],
      },
    ],
  },
  {
    id: "fulfillment",
    folder: "产品知识",
    title: "类目版图与履约能力",
    currentVersion: 1,
    sources: ["延保类目与履约能力盘点.xlsx", "延保险产品知识与设计规范V4.pdf"],
    versions: [
      {
        version: 1,
        createdAt: "2026-09-02 16:24",
        createdBy: "周然",
        reason: "拆分可售版图与履约能力口径",
        sources: ["延保类目与履约能力盘点.xlsx", "延保险产品知识与设计规范V4.pdf"],
        content: [
          "## 可售版图（回答‘能不能卖’）",
          "当前可售上界覆盖 75 个一级类目、1351 个二级类目和 15967 个三级类目。",
          "## 履约能力（回答‘卖了怎么赔’）",
          "换新覆盖 3000 个三级类目，维修覆盖 532 个，两者皆有 497 个。",
          "维修能力近似是换新能力的子集；仅维修不换新的有 35 个，其中 74% 是二手或官翻商品，通常没有同款新品可换。",
          "## 关键口径",
          "履约能力是现状盘面而非准入禁区。不在当前能力范围内的品类不代表不能设计延保，可反向提出履约建设需求。",
        ],
      },
    ],
  },
  {
    id: "underwriting",
    folder: "产品规则",
    title: "条款设计与核保约束",
    currentVersion: 1,
    sources: ["延保险产品知识与设计规范V4.pdf"],
    versions: [
      {
        version: 1,
        createdAt: "2026-09-02 16:31",
        createdBy: "周然",
        reason: "沉淀免责框架与硬性核保规则",
        sources: ["延保险产品知识与设计规范V4.pdf"],
        content: [
          "## 通用免责框架",
          "通用免责共 14 条底层规则，覆盖商业用途、人为故意损坏、外观或性能自然衰减、配件耗材易损件、三包范围内责任、间接损失及非授权拆改等情形。",
          "## 硬性核保约束",
          "- 线上延保与复购或试用组合时不予报价。",
          "- 换新类保险期间不得超过 4 年。",
          "- 延保保障期间不得超过厂家质保期的 2 倍。",
          "- 赔偿上限不得超过主商品实付金额。",
          "- 囤货或过期换新补贴比例不得超过原实付金额的 70%。",
          "- 组合品和‘其他’类总占比不得超过 30%。",
        ],
      },
    ],
  },
  {
    id: "pricing",
    folder: "产品规则",
    title: "延保定价逻辑",
    currentVersion: 1,
    sources: ["延保险产品知识与设计规范V4.pdf"],
    versions: [
      {
        version: 1,
        createdAt: "2026-09-02 16:38",
        createdBy: "周然",
        reason: "沉淀精算链路与风险分层",
        sources: ["延保险产品知识与设计规范V4.pdf"],
        content: [
          "## 核心公式",
          "最终费率 = 基准费率 ×（风险系数 × 成本系数 × 风控系数）÷ 目标赔付率",
          "最终保费 = 预估主商品均价 × 最终费率",
          "## 基准费率四档风险层级",
          "- Tier 1 极低风险（大家电、台式机、家具）：纯延保 0.4%–0.6%，意外全保 1.2%–1.8%。",
          "- Tier 2 低风险（键鼠、显示器、非电耐用品）：纯延保 0.8%–1.2%，意外全保 2.0%–2.5%。",
          "- Tier 3 中风险（音箱、TWS、笔记本、平板）：纯延保 2.5%–3.5%，意外全保 4.0%–5.5%。",
          "- Tier 4 高危易损（手机、无人机、玻璃陶瓷）：纯延保 4.0%–6.0%，意外全保 6.5%–9.0%。",
          "## 调节系数与目标赔付率",
          "风险系数调节品牌、保障范围和期限；成本系数调节履约方式和残值；风控系数调节免赔、等待期和次数。",
          "目标赔付率默认 75%，用于流量产品换取转化；冷门、高价或垄断渠道采用 60% 的高毛利策略。",
        ],
      },
    ],
  },
  {
    id: "penetration",
    folder: "经营口径",
    title: "延保渗透率口径",
    currentVersion: 4,
    sources: ["延保经营口径V3.pdf"],
    versions: [
      {
        version: 1,
        createdAt: "2026-07-18 10:30",
        createdBy: "林枫",
        reason: "首次沉淀",
        sources: ["延保经营口径V3.pdf"],
        content: [
          "延保渗透率用于衡量延保服务覆盖情况。",
          "分子为购买延保的订单量，分母为主商品订单量。",
        ],
      },
      {
        version: 2,
        createdAt: "2026-08-06 15:12",
        createdBy: "周然",
        reason: "补充分母边界",
        sources: ["延保经营口径V3.pdf"],
        content: [
          "延保渗透率用于衡量符合延保推荐条件的订单中购买延保服务的比例。",
          "分子为支付成功且购买延保的订单，分母为符合推荐条件的支付成功主商品订单。",
        ],
      },
      {
        version: 3,
        createdAt: "2026-08-20 10:18",
        createdBy: "晨雨",
        reason: "明确退款回冲及去重口径",
        sources: ["延保经营口径V3.pdf"],
        content: [
          "延保渗透率用于衡量符合延保推荐条件的订单中，最终购买延保服务的比例。",
          "分子：支付成功且延保生效的主商品订单。",
          "分母：符合延保推荐条件的支付成功主商品订单。",
          "退款订单在退款完成日回冲，同一主商品订单只计算一次。",
        ],
      },
      {
        version: 4,
        createdAt: "2026-09-03 10:42",
        createdBy: "晨雨",
        reason: "剔除 B 集采并补充机会判断边界",
        sources: ["延保经营口径V3.pdf"],
        content: [
          "## 统计公式",
          "渗透率 =（C 延保销量 + 物流销量 + 电销销量）÷ 大盘销量，不含 B 集采。",
          "B 集采是商家批量采购的出厂自带延保，反映厂商配套率而非消费者付费意愿；纳入后会导致渗透率严重虚高，例如键盘会从 1.5% 虚高到 77%。",
          "## 业务合理区间",
          "业务合理区间通常为 1%–3%。",
          "- 第一梯队 >5%：大家电 6.97%，主要受厂家质保较浅和高客单价影响。",
          "- 第二梯队 1%–3%：智能机器人 2.02%、健身装备 1.81%、消费电子 1.59%。",
          "- 第三梯队 <1%：母婴 0.97%、食品 0.36%、户外 0.20%、宠物 0.05%、珠宝 0.004%。",
          "## 机会判断边界",
          "GMV 量级不等于 C 延保机会量级。珠宝 GMV 8.12 亿接近消费电子 8.47 亿，但 C 延保仅 15 件，对比消费电子 16032 件相差约 1000 倍。",
          "保费潜力必须以实测 C 延保渗透为锚，不能直接用 GMV 换算。",
        ],
      },
    ],
  },
  {
    id: "risk",
    folder: "风险知识",
    title: "典型品类风险规律",
    currentVersion: 1,
    sources: ["延保品类风险研究摘要.docx"],
    versions: [
      {
        version: 1,
        createdAt: "2026-09-03 11:05",
        createdBy: "晨雨",
        reason: "沉淀已研究品类的风险画像",
        sources: ["延保品类风险研究摘要.docx"],
        content: [
          "## 研究范围",
          "当前按业务作用域已研究 29 个品类实体。",
          "## 信任型风险（珠宝板块）",
          "黄金克重流失、珍珠不可逆老化等高风险已剔除；铂金可修复物理风险可以上品；文玩造假更适合‘养护订阅 + 鉴定保险’，而不是传统换新。",
          "## 冷链与时效风险（食品）",
          "乳品冷链断链、生鲜时令风险可采用 1 元购模型跑量，榴莲 1.23% 的渗透率提供了放量实证。",
          "## 意外损坏风险（消费电子与母婴）",
          "手机碎屏和安全座椅事故后必报废均属于行业刚性风险，应进入保障责任与定价设计。",
        ],
      },
    ],
  },
  {
    id: "inquiry",
    folder: "产品流程",
    title: "产品询报价状态口径",
    currentVersion: 2,
    sources: ["产品询报价流程说明.docx"],
    versions: [
      {
        version: 1,
        createdAt: "2026-07-25 14:20",
        createdBy: "林枫",
        reason: "首次沉淀",
        sources: ["产品询报价流程说明.docx"],
        content: ["产品方案使用后进入待询价。", "提交后进入询价中。"],
      },
      {
        version: 2,
        createdAt: "2026-08-22 09:35",
        createdBy: "晨雨",
        reason: "补充终态",
        sources: ["产品询报价流程说明.docx"],
        content: ["产品方案使用后进入待询价。", "提交后进入询价中。", "询报价终态为询价通过或询价失败。"],
      },
    ],
  },
];

export const initialRawFiles: RawFile[] = [
  {
    id: "raw-knowledge",
    folder: "产品基础",
    name: "延保险产品知识与设计规范V4.pdf",
    type: "PDF",
    size: "5.8 MB",
    publishedAt: "2026-09-02 16:38",
    relatedPageIds: ["positioning", "fulfillment", "underwriting", "pricing"],
  },
  {
    id: "raw-capability",
    folder: "产品基础",
    name: "延保类目与履约能力盘点.xlsx",
    type: "Excel",
    size: "1.2 MB",
    publishedAt: "2026-09-02 16:24",
    relatedPageIds: ["fulfillment"],
  },
  {
    id: "raw-001",
    folder: "经营口径",
    name: "延保经营口径V3.pdf",
    type: "PDF",
    size: "2.4 MB",
    publishedAt: "2026-08-20 10:18",
    relatedPageIds: ["penetration"],
  },
  {
    id: "raw-002",
    folder: "产品流程",
    name: "产品询报价流程说明.docx",
    type: "Word",
    size: "846 KB",
    publishedAt: "2026-08-22 09:35",
    relatedPageIds: ["inquiry"],
  },
  {
    id: "raw-risk",
    folder: "风险研究",
    name: "延保品类风险研究摘要.docx",
    type: "Word",
    size: "968 KB",
    publishedAt: "2026-09-03 11:05",
    relatedPageIds: ["risk"],
  },
];

type AffectedPage = WikiApproval["affectedPages"][number];

export function demoAffectedPages(fileName = ""): AffectedPage[] {
  if (/退款/.test(fileName)) return [
    { pageId: "penetration", title: "延保渗透率口径", additions: 3, deletions: 1 },
  ];
  if (/询报价/.test(fileName)) return [
    { pageId: "inquiry", title: "产品询报价状态口径", additions: 2, deletions: 1 },
  ];
  if (/理赔/.test(fileName)) return [
    { pageId: "underwriting", title: "条款设计与核保约束", additions: 3, deletions: 1 },
    { pageId: "risk", title: "典型品类风险规律", additions: 2, deletions: 1 },
  ];
  return [
    { pageId: "positioning", title: "险种定位与产品形态", additions: 3, deletions: 1 },
    { pageId: "fulfillment", title: "类目版图与履约能力", additions: 4, deletions: 2 },
    { pageId: "underwriting", title: "条款设计与核保约束", additions: 6, deletions: 1 },
    { pageId: "pricing", title: "延保定价逻辑", additions: 5, deletions: 2 },
    { pageId: "penetration", title: "延保渗透率口径", additions: 4, deletions: 2 },
    { pageId: "risk", title: "典型品类风险规律", additions: 3, deletions: 1 },
  ];
}

export const planTasks = [
  "确认目标类目、方案数量和核心约束",
  "查询手机价位段、故障与延保经营数据",
  "形成差异化责任与履约设计",
  "完成核保边界检查并输出可用产品方案",
];

export const executionSteps = ["理解目标", "查询经营与故障数据", "设计保障责任", "核保校验", "生成产品方案"];
