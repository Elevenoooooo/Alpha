import type { Product } from "../domain/types";
import { productPlans } from "./mockData";

export type DesignPlan = {
  lead: string;
  steps: Array<{ title: string; description: string }>;
  scope: string;
  note?: string;
};
export type Evidence = { id: string; title: string; source: string; content: string; limitation: string };
export type ProcessStep = { title: string; summary: string; evidenceIds: string[]; missing?: boolean };
export type DesignDocument = { name: string; markdown: string };
export type DesignCase = {
  id: string;
  category: string;
  label: string;
  title: string;
  prompt: string;
  plan: DesignPlan;
  answerMarkdown: string;
  actionRequired?: { title: string; body: string };
  products: Product[];
  evidence: Evidence[];
  process: ProcessStep[];
  document: DesignDocument;
};

function withDetails(product: Product, details: Partial<NonNullable<Product["details"]>> = {}): Product {
  return { ...product, details: {
    serviceName: product.name,
    spuName: product.name,
    serviceCategory: "性能保障",
    underwritingCategory: "延长保修",
    waitingPeriod: "原厂质保结束后起保",
    paymentMethod: product.fulfillment === "服务补贴" ? "按实际费用核付（演示）" : "与服务商结算（演示）",
    exclusions: "不包含故意损坏、非授权拆修、外观损伤及间接损失。",
    channels: "C 延保、电销",
    underwritingNote: "仅为 Demo 评审结果；正式询价前需确认责任文本、履约资源与定价。",
    ...details,
  } };
}

const vinylProducts: Product[] = [
  withDetails({ id:"TP1789699956596", name:"一体机2年质保换新保", price:"¥226.0", serviceContent:"在服务期间，您购买的不可修一体式黑胶唱片机在正常使用过程中发生约定的机械或电气故障，经检测无法维修时，提供一次同等规格换新服务；累计保障不超过主商品实付金额的 80%。不包含唱针、皮带等耗材的自然磨损。", fulfillment:"换新", coverageLimit:"主商品实付金额 × 80%", period:"2年", priceRange:"2000–3000元", underwriting:"通过", relationship:"线上替代品", comparisonTarget:"黑胶唱片机整机全保换新（示例在售款）", relationshipReason:"面向不可修一体机，将全保换新收窄为质量故障换新，建议接替同人群原方案。" }),
  withDetails({ id:"TP1789699956597", name:"可修机型2年返厂维修保", price:"¥262.8", serviceContent:"在服务期间，您购买的唱头可拆卸、可更换式黑胶唱片机发生约定的机械或电气故障，提供返厂检测和维修服务；累计保障不超过主商品实付金额的 90%。不包含耗材自然磨损及未经授权的改装。", fulfillment:"维修", coverageLimit:"主商品实付金额 × 90%", period:"2年", priceRange:"3000–5000元", underwriting:"通过", relationship:"线上替代品", comparisonTarget:"可修机型整机换新（示例在售款）", relationshipReason:"对可维修机型优先维修，作为现有整机换新方案的替代设计。" }),
  withDetails({ id:"TP1789699956598", name:"黑胶2年唱针皮带年度焕新权益", price:"¥45.00", serviceContent:"在服务期间，我们为您购买的黑胶唱片机提供按年度节奏的唱针、皮带更换费用补贴。每个服务年度限一次，经型号及更换凭证核验后按实际费用给付，两年累计不超过主商品实付金额的 50%。不补贴整机、马达、外接配件或非正常使用损坏。", fulfillment:"服务补贴", coverageLimit:"主商品实付金额 × 50%", period:"2年", priceRange:"500–1000元", underwriting:"通过", recommended:true, relationship:"线上互补品", comparisonTarget:"黑胶唱片机整机故障保障（示例在售款）", relationshipReason:"覆盖整机故障保障未包含的唱针、皮带损耗需求，与整机保障并存。" }, { serviceCategory:"耗材服务权益", underwritingCategory:"服务补贴", waitingPeriod:"购买后第 30 天生效", exclusions:"不包含整机、马达、唱头升级、外接配件和非正常使用损坏。" }),
];

const translatorProducts: Product[] = [
  withDetails({ id:"DEMO-TR-001", name:"原厂到期2年延长保修", price:"¥167.85", serviceContent:"原厂质保结束后，连续两年覆盖约定的机械或电气故障，提供检测及维修服务。累计维修金额不超过主商品实付金额的 80%，不包含意外损坏和耗材自然衰减。", fulfillment:"维修", coverageLimit:"主商品实付金额 × 80%", period:"2年", priceRange:"1000–2000元", underwriting:"通过", relationship:"线上互补品", comparisonTarget:"原厂一年质保（示例在售服务）", relationshipReason:"向后延续保修时间，补足原厂质保结束后的服务空档。" }),
  withDetails({ id:"DEMO-TR-002", name:"原厂到期2年质保换新兜底", price:"¥196.20", serviceContent:"原厂质保结束后两年内发生约定的机械或电气故障，先行维修。经授权检测无法修复时提供一次同等规格换新；维修及换新累计不超过主商品实付金额的 80%。", fulfillment:"维修后换新", coverageLimit:"主商品实付金额 × 80%", period:"2年", priceRange:"1000–2000元", underwriting:"通过", relationship:"线上替代品", comparisonTarget:"直接整机换新保障（示例在售款）", relationshipReason:"以先修后换的履约路径替代直接换新，保留维修失败的结果兜底。" }),
  withDetails({ id:"DEMO-TR-003", name:"主板电控面板2年核心部件保", price:"¥195.82", serviceContent:"原厂质保结束后两年内，对主板、电控和面板的约定质量故障提供专项维修。累计不超过主商品实付金额的 60%；其他部件和意外损坏不在范围内。", fulfillment:"专项维修", coverageLimit:"主商品实付金额 × 60%", period:"2年", priceRange:"1000–2000元", underwriting:"通过", relationship:"线上互补品", comparisonTarget:"翻译机首年意外保（示例在售款）", relationshipReason:"补充原厂到期后的核心部件质量故障，与首年意外保障在时间和责任上互补；价格优势仍需报价验证。" }),
];

const rawCases: Array<Omit<DesignCase,"document">> = [
  {
    id:"vinyl", category:"黑胶唱片机", label:"明确推荐", title:"黑胶唱片机延保产品设计",
    prompt:"除了全保、意外保等常规产品，为黑胶唱片机设计三款不同履约方式的延保方案。结合主品特点和购买人群，覆盖 C 延保与电销，并告诉我优先做哪款。",
    plan:{ lead:"先把耗材损耗和整机故障分开，再匹配换新、维修与补贴方案。", steps:[
      {title:"查耗材保障空位",description:"核对唱针、皮带损耗是否已被在售产品覆盖。"},
      {title:"比较三种履约",description:"按机型、人群和成本，匹配换新、返厂维修与耗材补贴。"},
      {title:"确定渠道与优先款",description:"区分随单加购与电销补购，给出三款方案及推荐顺序。"},
    ],scope:"黑胶唱片机设备（不含唱片） · C 延保与电销"},
    answerMarkdown:"## 优先验证耗材年度焕新，另外两款按机型承接整机故障需求。\n\n「唱针皮带年度焕新权益」建议价 **45 元**，补充现有整机保障不含的耗材损耗，适合先作为随单加购方案验证需求；电销可承接后续补购。[1](#evidence-vinyl-gap)\n\n另外两款看起来接近线上品，但分别针对 **不可修一体机换新、可修机型返厂维修**，改变的是责任与履约路径。它们用于替代同类整机方案，不必与耗材权益三选一。[2](#evidence-vinyl-service)",
    products:vinylProducts,
    evidence:[
      {id:"vinyl-gap",title:"在售责任与耗材损耗对照",source:"演示资料 · 黑胶唱片机责任盘点",content:"案例设定：对标整机故障保障不含唱针、皮带自然磨损；耗材方案覆盖这两类更换需求，累计上限为主商品实付金额的 50%。",limitation:"仅在本案例的对标范围内成立，不代表已经验证全市场空白。45 元为演示建议价，未经过真实精算与报价。"},
      {id:"vinyl-service",title:"机型与履约方式匹配",source:"演示资料 · 机型及服务能力表",content:"不可修一体机采用质量故障换新；可拆卸可更换唱头机型采用返厂维修。两款分别对标同人群的整机换新方案。",limitation:"服务能力与核保结论为演示设定，需在真实任务中查询履约资源并核验。"},
    ],
    process:[
      {title:"确认类目与任务范围",summary:"本次对象是黑胶唱片机硬件；保留三种履约方式、C 延保及电销的要求。",evidenceIds:[]},
      {title:"对照在售保障",summary:"整理整机故障责任与耗材损耗的覆盖差异。",evidenceIds:["vinyl-gap"]},
      {title:"核对机型与服务条件",summary:"将不可修一体机、可修机型和耗材服务分开匹配履约路径。",evidenceIds:["vinyl-service"]},
      {title:"整理方案与推荐顺序",summary:"三款方案字段齐备；耗材权益作为优先验证方向，整机两款标记为替代设计。",evidenceIds:["vinyl-gap","vinyl-service"]},
    ],
  },
  {
    id:"translator",category:"翻译机",label:"方案比较",title:"翻译机延保方案比较",
    prompt:"为 1000–2000 元翻译机设计三款延保方案，分别考虑原厂到期维修、修不好换新和核心部件保障。比较价格与适用需求，帮助我决定怎么选。",
    plan:{lead:"先对齐主品价位和保障期限，再比较维修、换新兜底与部件专项。",steps:[
      {title:"拆分三种服务承诺",description:"核对继续维修、修不好换新与核心部件专项各自保什么。"},
      {title:"对比价差与责任",description:"同口径比较建议价、保障上限及不保范围。"},
      {title:"按售后诉求给选择",description:"说明不同需求的取舍，避免只按价格排优先级。"},
    ],scope:"1000–2000 元翻译机 · 暂按原厂质保结束后保障 2 年比较"},
    answerMarkdown:"## 三款对应不同售后诉求，先确定服务目标，再比较价格。\n\n| 方案 | 建议价 | 选择的关键 |\n| --- | --- | --- |\n| 到期延长保修 | 167.85 元 | 希望原厂保修结束后仍有人修 |\n| 维修失败换新兜底 | 196.20 元 | 更重视修不好时有明确解决结果 |\n| 核心部件保 | 195.82 元 | 只想覆盖主板、电控与面板风险 |\n\n前两款相差 **28.35 元**，主要区别是维修失败后是否换新。核心部件保责任更窄，却仅比换新兜底低 0.38 元，当前示例价格不足以体现价格优势，不建议只因“专项”就优先选择。[1](#evidence-translator-compare)",
    products:translatorProducts,
    evidence:[{id:"translator-compare",title:"同价位三方案对照",source:"演示资料 · 翻译机方案比较表",content:"主品价位统一为 1000–2000 元，原厂到期后服务 2 年。三款建议价分别为 167.85、196.20、195.82 元，责任范围、上限及履约路径不同。",limitation:"价格为演示值，差价计算不等于实际费率合理性或商业优势已被验证。"}],
    process:[
      {title:"对齐比较范围",summary:"锁定同一主品价格带、原厂到期后的两年服务，避免跨口径比较。",evidenceIds:[]},
      {title:"拆分三种服务承诺",summary:"分别整理延续维修、先修后换以及核心部件专项维修。",evidenceIds:["translator-compare"]},
      {title:"比较价格与责任差异",summary:"计算差价并核对保障范围，不从方案名称推断性价比。",evidenceIds:["translator-compare"]},
      {title:"给出条件式选择建议",summary:"按需求列出取舍，不给三款统一贴优先推荐标签。",evidenceIds:[]},
    ],
  },
  {
    id:"camera",category:"单反相机",label:"依据不足",title:"单反相机快门专项保障设计",
    prompt:"为单反相机设计一款快门专项延保，覆盖快门故障维修。请给出责任、建议价格和优先推出的机型，兼顾 C 延保与电销。",
    plan:{lead:"先划清快门专项维修的边界，再核对各机型的成本与服务能力。",steps:[
      {title:"划清快门维修范围",description:"对照原厂保修，区分快门功能故障与自然磨损。"},
      {title:"查机型成本与网点",description:"核对快门维修报价、故障频率与可用服务网点。"},
      {title:"判断能否定价推荐",description:"依据充分再给价格与机型顺序；不足时明确缺什么。"},
    ],scope:"单反快门功能故障维修，自然磨损另行评估 · C 延保与电销"},
    answerMarkdown:"## 可以提出快门专项保障方向，暂不能给出可靠价格和首推机型。\n\n本次资料缺少 **分型号维修成本、故障频率和服务覆盖**，无法判断风险成本及哪些机型能稳定履约。[1](#evidence-camera-missing)\n\n当前先把责任限定为约定的快门功能故障维修；自然磨损是否纳入，需要结合使用强度和成本单独评估。设计方向保留在分析记录中，暂不生成可直接采纳的产品卡。",
    actionRequired:{title:"需要补齐的依据",body:"请补充分型号维修报价、快门故障样本及服务覆盖清单。补齐后再确定保障上限、建议价格和优先机型；可直接在下方输入框继续提供资料。"},
    products:[],
    evidence:[{id:"camera-missing",title:"快门专项设计输入检查",source:"演示资料 · 设计输入清单",content:"已有：类目、责任方向和渠道要求。缺少：各目标机型的快门维修报价、对应故障频率和可用服务网点。",limitation:"缺失项尚未获得可靠数据，不用类目均值替代机型成本，也不输出占位价格。"}],
    process:[
      {title:"整理已知设计条件",summary:"记录快门专项维修、C 延保和电销要求。",evidenceIds:[]},
      {title:"核对责任边界",summary:"将功能故障与自然磨损区分，后者保留为待评估范围。",evidenceIds:[]},
      {title:"检查定价与履约依据",summary:"分型号成本、故障频率及服务覆盖缺失，价格与机型排序停止生成。",evidenceIds:["camera-missing"],missing:true},
      {title:"交付设计记录与补数清单",summary:"保留可用方向及缺口，不输出可采纳产品卡，也不标优先推荐。",evidenceIds:["camera-missing"]},
    ],
  },
];

export function makeDocument(data: Omit<DesignCase,"document">): DesignDocument {
  const name = `${data.category}·${data.products.length ? "产品方案决策书" : "设计记录与补数清单"}.md`;
  const products = data.products.map(product => `### ${product.name}\n\n- 产品 ID：${product.id}\n- 建议单价：${product.price}\n- 履约方式：${product.fulfillment}\n- 保障上限：${product.coverageLimit}\n- 服务有效期：${product.period}\n- 型号/价位段：${product.priceRange}\n- 渠道：${product.details?.channels ?? "按实际场景确认"}\n- 定位：${[product.recommended ? "优先推荐" : "",product.relationship].filter(Boolean).join("、") || "候选方案"}\n- 对标对象：${product.comparisonTarget ?? "未指定"}\n\n${product.relationshipReason ?? ""}\n\n**服务内容**\n\n${product.serviceContent}\n\n**不包含**\n\n${product.details?.exclusions ?? "以完整责任文本为准"}`).join("\n\n");
  const evidence = data.evidence.map((item,index) => `### 依据 ${index+1}：${item.title}\n\n${item.source}\n\n${item.content}\n\n**边界**：${item.limitation}`).join("\n\n");
  return { name, markdown:`# ${data.title}\n\n> Demo 演示资料：用于体验产品设计流程，不代表真实经营数据、正式定价或核保结论。\n\n${data.answerMarkdown}\n\n## 设计范围\n\n${data.plan.scope}\n\n${data.plan.note ? `${data.plan.note}\n\n` : ""}${data.actionRequired ? `## ${data.actionRequired.title}\n\n${data.actionRequired.body}\n\n` : ""}${products ? `## 产品方案\n\n${products}\n\n` : ""}## 依据与未验证边界\n\n${evidence}` };
}

export const designCases: DesignCase[] = rawCases.map(data => ({...data, document:makeDocument(data)}));
const phoneCaseBase: Omit<DesignCase,"document"> = {
  id:"phone", category:"手机",label:"已有演示",title:"手机类目延保产品设计",prompt:"为手机类目设计 3 款差异化延保方案",
  plan:{lead:"结合价格带和主要故障，比较三种保障方案。",steps:[{title:"识别需求",description:"对照主品价格带、用户场景和已有保障。"},{title:"比较责任",description:"核对碎屏、质量故障及换新的服务边界。"},{title:"形成方案",description:"给出价格、履约及需要人工确认的事项。"}],scope:"手机 · 三款延保方案"},
  answerMarkdown:"## 两款方案可进入后续核验，第三款还需确认责任边界。\n\n三款分别承接质量故障、碎屏和补购需求。具体责任、价格及保障上限见产品卡片；当前均为已有 Demo 数据。",
  actionRequired:{title:"需要确认",body:"第三款的补购责任边界尚未确认，正式询价前需人工核对。"},products:productPlans,evidence:[],process:[{title:"核对任务范围",summary:"保留原有手机设计示例。",evidenceIds:[]},{title:"整理方案",summary:"读取演示方案字段。",evidenceIds:[]},{title:"检查未决事项",summary:"第三款责任边界需要人工确认。",evidenceIds:[],missing:true}],
};
const phoneCase: DesignCase = {...phoneCaseBase,document:makeDocument(phoneCaseBase)};
export function matchDesignCase(prompt:string) {
  if (/黑胶|唱片机/.test(prompt)) return "vinyl";
  if (/翻译机/.test(prompt)) return "translator";
  if (/单反|快门/.test(prompt)) return "camera";
  return undefined;
}
export function getDesignCase(id?:string): DesignCase { return designCases.find(item => item.id === id) ?? phoneCase; }

// Bounded Demo commands: reject mixed or unknown changes instead of claiming an LLM applied them.
type DemoAdjustment = { channel?: "C 延保随单购" | "电销补购"; scenarioFirst?: boolean; noPricing?: boolean };
function parseAdjustment(text: string): DemoAdjustment | undefined {
  const clauses = text.trim().replace(/[。！!]+$/, "").split(/[，,；;、\n]+/).filter(Boolean);
  if (!clauses.length) return;
  const result: DemoAdjustment = {};
  for (const clause of clauses) {
    const normalized = clause.replace(/\s+/g, "").replace(/^请/, "");
    if (/^(?:只|仅|先只)(?:做|考虑|保留)?(?:C端|C延保|随单购|随单)(?:渠道)?$/i.test(normalized) || /^(?:不要|不考虑|暂不考虑|暂不做|不做)电销(?:渠道)?$/.test(normalized)) result.channel = "C 延保随单购";
    else if (/^(?:只|仅|先只)(?:做|考虑|保留)?电销(?:渠道)?$/.test(normalized) || /^(?:不要|不考虑|暂不考虑|暂不做|不做)(?:C端|C延保|随单购|随单)(?:渠道)?$/i.test(normalized)) result.channel = "电销补购";
    else if (/^(?:先|优先)(?:看|分析|考虑)?(?:人群|使用场景|人群场景|人群与场景|人群和场景|场景)$/.test(normalized)) result.scenarioFirst = true;
    else if (/^(?:先不|暂不|不要)(?:定价|报价|给价格)$/.test(normalized)) result.noPricing = true;
    else return;
  }
  return result;
}
export function canApplyAdjustment(text: string) { return Boolean(parseAdjustment(text)); }
export function getAdjustedCase(id?: string, adjustments: string[] = []): DesignCase {
  const original = getDesignCase(id);
  if (!adjustments.length) return original;
  const options = Object.assign({}, ...adjustments.map(parseAdjustment).filter(Boolean)) as DemoAdjustment;
  let { plan, products, answerMarkdown, actionRequired } = original;
  let process = original.process;
  const notes: string[] = [];
  if (options.channel) {
    const channel = options.channel;
    plan = {...plan,scope:plan.scope.replace(/C 延保(?:与|及|、)电销(?:渠道)?/g, channel)};
    if (!plan.scope.includes(channel)) plan.scope += ` · ${channel}`;
    if (original.id === "vinyl") plan = {...plan,steps:plan.steps.map((step,index) => index === 2
      ? {title:channel === "C 延保随单购" ? "确定随单优先款" : "确定补购优先款",description:channel === "C 延保随单购" ? "围绕新购用户，给出三款随单加购方案及推荐顺序。" : "核对已有设备与适用型号，给出三款电销补购方案及推荐顺序。"}
      : step)};
    products = products.map(product => ({...product,id:`${product.id}-${channel === "C 延保随单购" ? "C" : "T"}`,details:product.details ? {...product.details,channels:channel} : undefined}));
    answerMarkdown = answerMarkdown.replace("适合先作为随单加购方案验证需求；电销可承接后续补购", channel === "C 延保随单购" ? "本轮仅作为 C 延保随单加购方案验证需求" : "本轮面向已有设备用户，通过电销核对适用型号与当前设备状况后再补购");
    answerMarkdown += `\n\n本轮仅考虑 **${channel}**，渠道适用性仍需后续核验。`;
    process = process.map(step => ({...step,summary:step.summary.replace(/C 延保(?:及|和)电销/g,channel)}));
    notes.push(`本轮仅考虑${channel}。`);
  }
  if (options.scenarioFirst) {
    plan = {...plan,lead:"先按购买人群与使用场景找需求，再核对保障和履约。",steps:[{title:"先看人群与场景",description:"区分新购、已有设备及使用强度，识别保障诉求。"},...plan.steps.slice(1)]};
    const scene = options.channel === "电销补购" ? "已有设备用户先核对现有保修、设备状况和适用型号，再判断是否补购。" : options.channel === "C 延保随单购" ? "新购用户先按机型与使用强度判断保障需求，再选择随单服务。" : "新购用户重视随单保障，已有设备用户需先核对现有保修和设备状况。";
    answerMarkdown += `\n\n**先看人群场景：**${scene}`;
    notes.push("已将人群与使用场景作为分析起点。");
  }
  if (options.noPricing) {
    plan = {...plan,lead:"先确认保障方向与履约边界，本轮暂不定价。",steps:plan.steps.map((step,index)=>index===2?{title:"交付设计方向",description:"说明责任取舍与后续依据，暂不生成带价格的方案卡。"}:step)};
    products = [];
    const directions: Record<string,string> = {
      vinyl:"耗材权益补足唱针与皮带的损耗需求；整机故障按不可修机型换新、可修机型返厂维修分别设计，三种履约路径各自匹配服务条件。",
      translator:"原厂到期保修延续维修服务，先修后换提供维修失败兜底，核心部件保限定主板、电控与面板。先按目标服务承诺取舍，价格留待测算。",
      camera:"快门专项先限定约定功能故障，自然损耗责任另行评估。分型号成本和服务覆盖仍待补齐。",
    };
    answerMarkdown = `## 本轮先确定${original.category}的保障方向，暂不定价。\n\n${directions[original.id] ?? "先比较责任范围和履约路径，价格留待后续测算。"}${options.channel ? `\n\n本轮仅考虑 **${options.channel}**。` : ""}`;
    process = [{title:"核对设计范围",summary:plan.scope,evidenceIds:[]},{title:"整理责任与履约方向",summary:directions[original.id] ?? plan.lead,evidenceIds:[]},{title:"交付设计方向",summary:"按要求暂不定价，不生成带价格的产品卡。",evidenceIds:[]}];
    notes.push("按本轮要求暂不定价。");
  }
  plan = {...plan,note:notes.join(" ")};
  process = [{title:"应用本轮调整",summary:notes.join(" "),evidenceIds:[]},...process];
  const revised = {...original,plan,products,answerMarkdown,process,actionRequired};
  return {...revised,document:makeDocument(revised)};
}
