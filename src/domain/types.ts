export type AppView = "home" | "conversation" | "products" | "wiki";

export type ProductStatus = "待询价" | "询价中" | "询价通过" | "询价失败";

export type Product = {
  id: string;
  name: string;
  price: string;
  serviceContent: string;
  fulfillment: string;
  coverageLimit: string;
  period: string;
  priceRange: string;
  underwriting: "通过" | "待人工确认";
  status?: ProductStatus;
  used?: boolean;
};

export type ProductFlowStage = "idle" | "planning" | "running" | "result";

export type MessageAttachment = {
  id: string;
  name: string;
  type: string;
  size: string;
  source: "local" | "conversation";
  file?: File;
};

export type MessageSkillReference = {
  id: string;
  name: string;
};

export type MessageResourceReference = {
  id: string;
  title: string;
  kind: "wiki" | "conversation" | "team";
  meta: string;
  version?: number;
};

export type ProductRequestContext = {
  attachment?: MessageAttachment;
  attachments?: MessageAttachment[];
  skill?: MessageSkillReference;
  resources: MessageResourceReference[];
};

export type ProductFlow = {
  stage: ProductFlowStage;
  kind: "product" | "quick" | "analysis";
  prompt: string;
  executionStep: number;
  context?: ProductRequestContext;
};

export type WikiVersion = {
  version: number;
  createdAt: string;
  createdBy: string;
  reason: string;
  content: string[];
  sources?: string[];
};

export type WikiPage = {
  id: string;
  folder: string;
  title: string;
  currentVersion: number;
  sources: string[];
  versions: WikiVersion[];
};

export type RawFile = {
  id: string;
  folder: string;
  name: string;
  type: string;
  size: string;
  publishedAt: string;
  relatedPageIds: string[];
};

export type WikiTaskStatus =
  | "processing"
  | "paused"
  | "ready"
  | "submitted"
  | "rejected"
  | "approved";

export type WikiTask = {
  id: string;
  kind: "deposit" | "rollback";
  fileName: string;
  fileType: string;
  status: WikiTaskStatus;
  progress: number;
  revision: number;
  conversationId: string;
  submitter: string;
  pageId?: string;
  targetVersion?: number;
  rollbackCurrentContent?: string[];
  rollbackTargetContent?: string[];
  submittedAt?: string;
  attachment?: MessageAttachment;
  attachments?: MessageAttachment[];
  instruction?: string;
};

export type ApprovalStatus = "pending" | "approved" | "rejected";

export type WikiApproval = {
  id: string;
  taskId: string;
  title: string;
  submitter: string;
  submittedAt: string;
  status: ApprovalStatus;
  reviewer?: string;
  reviewedAt?: string;
  comment?: string;
  affectedPages: Array<{
    pageId: string;
    title: string;
    additions: number;
    deletions: number;
  }>;
};
