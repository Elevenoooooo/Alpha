import type { MessageAttachment, MessageResourceReference, WikiPage } from "../../domain/types";

export type ComposerAttachment = MessageAttachment;

export type ComposerSkill = {
  id: string;
  scope: "extended" | "merchant" | "property";
  name: string;
  description: string;
  owner: string;
  official?: boolean;
};

export type ComposerResourceReference = MessageResourceReference;

export const demoSkills: ComposerSkill[] = [
  {
    id: "knowledge-search",
    scope: "extended",
    name: "延保知识库检索",
    description: "检索已发布的延保 Wiki、口径和原始资料。",
    owner: "Alpha 官方",
    official: true,
  },
  {
    id: "product-design",
    scope: "extended",
    name: "延保产品方案设计",
    description: "结合经营数据、风险与核保约束生成产品方案。",
    owner: "产品创新组",
  },
  {
    id: "opportunity-insight",
    scope: "extended",
    name: "延保商机洞察分析",
    description: "从类目规模、渗透率与风险画像识别产品机会。",
    owner: "解决方案组",
  },
  {
    id: "pricing-trial",
    scope: "extended",
    name: "延保定价试算",
    description: "按照基准费率、风险系数与目标赔付率完成试算。",
    owner: "精算产品组",
  },
  {
    id: "terms-check",
    scope: "extended",
    name: "延保条款核验",
    description: "核验责任、免责、期限与赔偿上限等关键约束。",
    owner: "核保规则组",
  },
];

export function toWikiResource(page: WikiPage): ComposerResourceReference {
  return {
    id: page.id,
    title: page.title,
    kind: "wiki",
    meta: `${page.folder} · 当前发布版本 V${page.currentVersion}`,
    version: page.currentVersion,
  };
}

export const demoConversationResources: ComposerResourceReference[] = [
  {
    id: "conversation-phone-analysis",
    title: "手机类目延保经营与方案设计依据.docx",
    kind: "conversation",
    meta: "当前对话 · Word · 286 KB",
  },
  {
    id: "conversation-penetration-report",
    title: "手机 8 月延保渗透率分析.xlsx",
    kind: "conversation",
    meta: "历史对话 · Excel · 1.2 MB",
  },
  {
    id: "conversation-product-comparison",
    title: "延保产品方案对比.pdf",
    kind: "conversation",
    meta: "历史对话 · PDF · 2.8 MB",
  },
];

export function fileTypeLabel(fileName: string, mimeType = "") {
  const extension = fileName.split(".").pop()?.toLowerCase();
  if (mimeType.startsWith("image/") || ["png", "jpg", "jpeg", "webp"].includes(extension ?? "")) return "图片";
  if (extension === "pdf") return "PDF";
  if (["doc", "docx"].includes(extension ?? "")) return "Word";
  if (["ppt", "pptx"].includes(extension ?? "")) return "PPT";
  if (["xls", "xlsx"].includes(extension ?? "")) return "Excel";
  if (extension === "md") return "Markdown";
  if (extension === "txt") return "文本";
  return "文件";
}

export function formatFileSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${Math.ceil(bytes / 1024)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

export function localAttachment(file: File): ComposerAttachment {
  return {
    id: `local-${file.name}-${file.lastModified}`,
    name: file.name,
    type: fileTypeLabel(file.name, file.type),
    size: formatFileSize(file.size),
    source: "local",
    file,
  };
}

export const generatedAnalysisAttachment: ComposerAttachment = {
  id: "conversation-phone-analysis",
  name: "手机类目延保经营与方案设计依据.docx",
  type: "Word",
  size: "286 KB",
  source: "conversation",
};
