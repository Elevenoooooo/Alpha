import {
  ArrowLeft,
  ArrowUp,
  BookOpen,
  Check,
  FileText,
  FileUp,
  Image,
  MessageSquareText,
  Plus,
  Search,
  Sparkles,
  Users,
  X,
} from "lucide-react";
import { useEffect, useMemo, useRef, useState, type CSSProperties, type KeyboardEvent, type ReactNode } from "react";
import {
  demoConversationResources,
  demoSkills,
  type ComposerAttachment,
  type ComposerResourceReference,
  type ComposerSkill,
} from "./composerModels";

type MenuPanel = "root" | "skills" | "resources";
type ResourceTab = "wiki" | "conversation" | "team";
type SkillScope = ComposerSkill["scope"];

type ComposerProps = {
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
  placeholder?: string;
  large?: boolean;
  attachment?: ComposerAttachment;
  onSelectLocalFile?: (file: File) => void;
  onRemoveAttachment?: () => void;
  selectedSkill?: ComposerSkill;
  onSelectSkill?: (skill?: ComposerSkill) => void;
  resourceReferences?: ComposerResourceReference[];
  availableWikiResources?: ComposerResourceReference[];
  onChangeResourceReferences?: (references: ComposerResourceReference[]) => void;
  wikiDepositMode?: boolean;
  onChangeWikiDepositMode?: (active: boolean) => void;
  onNotify?: (message: string) => void;
};

export function Composer({
  value,
  onChange,
  onSubmit,
  placeholder = "继续追问…",
  large = false,
  attachment,
  onSelectLocalFile,
  onRemoveAttachment,
  selectedSkill,
  onSelectSkill,
  resourceReferences = [],
  availableWikiResources = [],
  onChangeResourceReferences,
  wikiDepositMode = false,
  onChangeWikiDepositMode,
  onNotify,
}: ComposerProps) {
  const [panel, setPanel] = useState<MenuPanel>();
  const [skillQuery, setSkillQuery] = useState("");
  const [skillScope, setSkillScope] = useState<SkillScope>("extended");
  const [resourceQuery, setResourceQuery] = useState("");
  const [resourceTab, setResourceTab] = useState<ResourceTab>("wiki");
  const [menuPlacement, setMenuPlacement] = useState({ direction: "up" as "up" | "down", resourceListHeight: 286 });
  const fileInputRef = useRef<HTMLInputElement>(null);
  const attachButtonRef = useRef<HTMLButtonElement>(null);
  const menuRootRef = useRef<HTMLDivElement>(null);

  const filteredSkills = useMemo(() => {
    const query = skillQuery.trim().toLowerCase();
    const inScope = demoSkills.filter((skill) => skill.scope === skillScope);
    if (!query) return inScope;
    return inScope.filter((skill) => `${skill.name}${skill.description}${skill.owner}`.toLowerCase().includes(query));
  }, [skillQuery, skillScope]);

  const filteredResources = useMemo(() => {
    const allResources = [...availableWikiResources, ...demoConversationResources];
    const byTab = allResources.filter((resource) => resource.kind === resourceTab);
    const query = resourceQuery.trim().toLowerCase();
    if (!query) return byTab;
    return byTab.filter((resource) => `${resource.title}${resource.meta}`.toLowerCase().includes(query));
  }, [availableWikiResources, resourceQuery, resourceTab]);

  useEffect(() => {
    if (!panel) return;
    const closeOnOutsideClick = (event: MouseEvent) => {
      if (!menuRootRef.current?.contains(event.target as Node)) setPanel(undefined);
    };
    const closeOnEscape = (event: globalThis.KeyboardEvent) => {
      if (event.key === "Escape") setPanel(undefined);
    };
    document.addEventListener("mousedown", closeOnOutsideClick);
    document.addEventListener("keydown", closeOnEscape);
    return () => {
      document.removeEventListener("mousedown", closeOnOutsideClick);
      document.removeEventListener("keydown", closeOnEscape);
    };
  }, [panel]);

  const canSubmit = wikiDepositMode ? Boolean(attachment) : Boolean(value.trim() || attachment);

  const submit = () => {
    if (wikiDepositMode && !attachment) {
      onNotify?.("请添加需要沉淀的文件");
      return;
    }
    if (!canSubmit) return;
    onSubmit();
    setPanel(undefined);
  };

  const activateWikiDeposit = () => {
    onSelectSkill?.(undefined);
    onChangeResourceReferences?.([]);
    onChangeWikiDepositMode?.(true);
    setPanel(undefined);
  };

  const handleTextChange = (nextValue: string) => {
    if (nextValue.startsWith("/")) {
      onChange(nextValue);
      setSkillQuery(nextValue.slice(1));
      if (nextValue === "/") setSkillScope("extended");
      updateMenuPlacement();
      setPanel("skills");
      return;
    }
    if (value.startsWith("/")) {
      setSkillQuery("");
      setPanel(undefined);
    }
    if (/@wiki(?:\s|$)/i.test(nextValue)) {
      activateWikiDeposit();
      onChange(nextValue.replace(/@wiki\s*/i, ""));
      return;
    }
    onChange(nextValue);
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (panel === "skills" && value.startsWith("/") && event.key === "Enter") {
      event.preventDefault();
      return;
    }
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      submit();
    }
  };

  const selectSkill = (skill: ComposerSkill) => {
    onChangeWikiDepositMode?.(false);
    onSelectSkill?.(skill);
    if (value.startsWith("/")) onChange("");
    setSkillQuery("");
    setPanel(undefined);
  };

  const toggleResourceReference = (resource: ComposerResourceReference) => {
    onChangeWikiDepositMode?.(false);
    const exists = resourceReferences.some((item) => item.id === resource.id);
    onChangeResourceReferences?.(
      exists ? resourceReferences.filter((item) => item.id !== resource.id) : [...resourceReferences, resource],
    );
  };

  const activePlaceholder = wikiDepositMode
    ? "补充本次 Wiki 的加工要求"
    : placeholder;

  const updateMenuPlacement = () => {
    const rect = attachButtonRef.current?.getBoundingClientRect();
    if (rect) {
      const direction = rect.top > window.innerHeight / 2 ? "up" : "down";
      const availableHeight = direction === "up" ? rect.top - 24 : window.innerHeight - rect.bottom - 24;
      setMenuPlacement({
        direction,
        resourceListHeight: Math.max(112, Math.min(286, availableHeight - 168)),
      });
    }
  };

  const toggleMenu = () => {
    if (panel) {
      setPanel(undefined);
      return;
    }
    updateMenuPlacement();
    setPanel("root");
  };

  return (
    <div className={`composer ${large ? "composer-large" : ""} ${wikiDepositMode ? "is-wiki-deposit" : ""}`}>
      {(selectedSkill || resourceReferences.length > 0 || attachment) && (
        <div className="composer-contexts" aria-label="本轮已选择的上下文">
          {selectedSkill && (
            <button className="context-chip skill-chip" onClick={() => onSelectSkill?.(undefined)} title="移除技能">
              <Sparkles /><span>{selectedSkill.name}</span><X />
            </button>
          )}
          {resourceReferences.map((resource) => (
            <button
              key={resource.id}
              className="context-chip resource-reference-chip"
              onClick={() => onChangeResourceReferences?.(resourceReferences.filter((item) => item.id !== resource.id))}
              title="移除引用"
            >
              {resource.kind === "wiki" ? <BookOpen /> : resource.kind === "conversation" ? <MessageSquareText /> : <Users />}
              <span>{resource.title}{resource.version ? ` · V${resource.version}` : ""}</span><X />
            </button>
          ))}
          {attachment && <AttachmentChip attachment={attachment} onRemove={onRemoveAttachment} />}
        </div>
      )}

      <div className="composer-input-line">
        {wikiDepositMode && (
          <button className="wiki-inline-mention" onClick={() => onChangeWikiDepositMode?.(false)} title="点击退出 Wiki 沉淀模式">
            @Wiki
          </button>
        )}
        <textarea
          value={value}
          onChange={(event) => handleTextChange(event.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={activePlaceholder}
          aria-label={activePlaceholder}
        />
      </div>

      <div className="composer-actions">
        <div className="attach-wrap" ref={menuRootRef}>
          <button
            ref={attachButtonRef}
            className={`attach-button ${panel ? "active" : ""}`}
            onClick={toggleMenu}
            aria-label="添加内容"
            aria-expanded={Boolean(panel)}
          >
            <Plus />
          </button>

          {panel && (
            <div
              className={`attach-menu ${panel === "resources" || panel === "skills" ? "resource-menu" : ""} ${menuPlacement.direction === "down" ? "open-down" : ""}`}
              style={{ "--resource-list-height": `${menuPlacement.resourceListHeight}px` } as CSSProperties}
              role="dialog"
              aria-label="添加内容"
            >
              {panel === "root" && (
                <>
                  <MenuAction
                    icon={<FileUp />}
                    title="上传本地文件"
                    detail="支持图片、PDF、Word、PPT、Excel 等格式"
                    onClick={() => fileInputRef.current?.click()}
                  />
                  <MenuAction
                    icon={<Sparkles />}
                    title="使用技能"
                    detail={wikiDepositMode ? "请先退出 @Wiki 沉淀模式" : "选择 Skill 辅助完成本轮任务"}
                    disabled={wikiDepositMode}
                    onClick={() => { setSkillScope("extended"); setPanel("skills"); }}
                  />
                  <MenuAction
                    icon={<BookOpen />}
                    title="引用 Wiki 或文件"
                    detail={wikiDepositMode ? "请先退出 @Wiki 沉淀模式" : "引用已发布 Wiki 或会话文档"}
                    disabled={wikiDepositMode}
                    onClick={() => setPanel("resources")}
                  />
                  <MenuAction
                    icon={<FileUp />}
                    title="沉淀 Wiki"
                    detail="也可在输入框直接输入 @Wiki"
                    onClick={activateWikiDeposit}
                  />
                </>
              )}

              {panel === "skills" && (
                <PickerPanel title="使用技能" onBack={() => setPanel("root")}>
                  <SearchField value={skillQuery} onChange={setSkillQuery} placeholder="搜索技能" />
                  <div className="resource-tabs skill-tabs" role="tablist" aria-label="技能业务线">
                    {([
                      ["extended", "延保通用"],
                      ["merchant", "商家险通用"],
                      ["property", "财产险通用"],
                    ] as Array<[SkillScope, string]>).map(([id, label]) => (
                      <button
                        key={id}
                        className={skillScope === id ? "active" : ""}
                        onClick={() => setSkillScope(id)}
                        role="tab"
                        aria-selected={skillScope === id}
                      >
                        {label}
                      </button>
                    ))}
                  </div>
                  <div className="picker-list skill-picker-list">
                    {filteredSkills.map((skill) => (
                      <button key={skill.id} className="picker-item" onClick={() => selectSkill(skill)}>
                        <span className="picker-item-icon"><Sparkles /></span>
                        <span className="picker-item-copy">
                          <strong>{skill.official && <b>官方</b>}{skill.name}</strong>
                          <small>{skill.description}</small>
                          <em>{skill.owner}</em>
                        </span>
                        {selectedSkill?.id === skill.id && <Check className="picker-check" />}
                      </button>
                    ))}
                    {!filteredSkills.length && (
                      <div className="resource-empty">
                        <Sparkles />
                        <strong>{skillScope === "merchant" ? "商家险通用 Skill" : "财产险通用 Skill"}暂未接入</strong>
                        <span>当前 Demo 先提供延保通用 Skill。</span>
                      </div>
                    )}
                  </div>
                </PickerPanel>
              )}

              {panel === "resources" && (
                <PickerPanel title="引用 Wiki 或文件" onBack={() => setPanel("root")}>
                  <SearchField value={resourceQuery} onChange={setResourceQuery} placeholder="搜索 Wiki 或会话文档" />
                  <div className="resource-tabs" role="tablist" aria-label="资源类型">
                    {([
                      ["wiki", "Wiki"],
                      ["conversation", "会话文档"],
                      ["team", "团队文档"],
                    ] as Array<[ResourceTab, string]>).map(([id, label]) => (
                      <button
                        key={id}
                        className={resourceTab === id ? "active" : ""}
                        onClick={() => setResourceTab(id)}
                        role="tab"
                        aria-selected={resourceTab === id}
                      >
                        {label}
                      </button>
                    ))}
                  </div>
                  <div className="picker-list resource-picker-list">
                    {filteredResources.map((resource) => {
                      const selected = resourceReferences.some((item) => item.id === resource.id);
                      return (
                        <button
                          key={resource.id}
                          className={`picker-item ${selected ? "selected" : ""}`}
                          onClick={() => toggleResourceReference(resource)}
                        >
                          <span className="picker-item-icon resource-item-icon">
                            {resource.kind === "wiki" ? <BookOpen /> : resource.kind === "conversation" ? <MessageSquareText /> : <Users />}
                          </span>
                          <span className="picker-item-copy">
                            <strong>{resource.title}</strong>
                            <small>{resource.meta}</small>
                          </span>
                          {selected && <Check className="picker-check" />}
                        </button>
                      );
                    })}
                    {resourceTab === "team" && (
                      <div className="resource-empty">
                        <Users />
                        <strong>团队文档即将支持</strong>
                        <span>本次 Demo 先保留能力入口，不接入团队空间。</span>
                      </div>
                    )}
                  </div>
                  <button className="picker-done" onClick={() => setPanel(undefined)}>完成 · 已选 {resourceReferences.length}</button>
                </PickerPanel>
              )}
            </div>
          )}

          <input
            ref={fileInputRef}
            hidden
            type="file"
            accept=".pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.md,.txt,.png,.jpg,.jpeg,.webp"
            onChange={(event) => {
              const file = event.target.files?.[0];
              if (file) onSelectLocalFile?.(file);
              event.currentTarget.value = "";
              setPanel(undefined);
            }}
          />
        </div>

        {wikiDepositMode && !attachment && <span className="composer-validation">请添加需要沉淀的文件</span>}
        <button className="send-button" disabled={!canSubmit} onClick={submit} aria-label="发送">
          <ArrowUp />
        </button>
      </div>
    </div>
  );
}

function MenuAction({
  icon,
  title,
  detail,
  disabled,
  onClick,
}: {
  icon: ReactNode;
  title: string;
  detail?: string;
  disabled?: boolean;
  onClick: () => void;
}) {
  return (
    <button className="menu-action" disabled={disabled} onClick={onClick}>
      <span className="menu-action-icon">{icon}</span>
      <span><strong>{title}</strong>{detail && <small>{detail}</small>}</span>
    </button>
  );
}

function PickerPanel({ title, onBack, children }: { title: string; onBack: () => void; children: ReactNode }) {
  return (
    <div className="picker-panel">
      <header>
        <button onClick={onBack} aria-label="返回"><ArrowLeft /></button>
        <strong>{title}</strong>
      </header>
      {children}
    </div>
  );
}

function SearchField({ value, onChange, placeholder }: { value: string; onChange: (value: string) => void; placeholder: string }) {
  return (
    <label className="picker-search">
      <Search />
      <input value={value} onChange={(event) => onChange(event.target.value)} placeholder={placeholder} />
    </label>
  );
}

function AttachmentChip({ attachment, onRemove }: { attachment: ComposerAttachment; onRemove?: () => void }) {
  const [preview, setPreview] = useState<string>();

  useEffect(() => {
    if (!attachment.file?.type.startsWith("image/")) {
      setPreview(undefined);
      return;
    }
    const url = URL.createObjectURL(attachment.file);
    setPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [attachment.file]);

  return (
    <div className="context-chip attachment-chip" title={`${attachment.name} · ${attachment.type} · ${attachment.size}`}>
      {preview ? <img src={preview} alt="" /> : attachment.type === "图片" ? <Image /> : <FileText />}
      <span><strong>{attachment.name}</strong><small>{attachment.source === "conversation" ? "来自当前对话" : `${attachment.type} · ${attachment.size}`}</small></span>
      <button onClick={onRemove} aria-label="移除文件"><X /></button>
    </div>
  );
}
