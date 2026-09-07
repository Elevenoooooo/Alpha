import {
  ArrowLeft,
  ArrowUp,
  BookOpen,
  Check,
  FileText,
  FileUp,
  Image,
  Plus,
  Search,
  Sparkles,
  X,
} from "lucide-react";
import { useEffect, useMemo, useRef, useState, type KeyboardEvent, type ReactNode } from "react";
import {
  demoSkills,
  type ComposerAttachment,
  type ComposerSkill,
  type ComposerWikiReference,
} from "./composerModels";

type MenuPanel = "root" | "skills" | "wiki" | "wiki-picker";

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
  wikiReferences?: ComposerWikiReference[];
  availableWikiReferences?: ComposerWikiReference[];
  onChangeWikiReferences?: (references: ComposerWikiReference[]) => void;
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
  wikiReferences = [],
  availableWikiReferences = [],
  onChangeWikiReferences,
  wikiDepositMode = false,
  onChangeWikiDepositMode,
  onNotify,
}: ComposerProps) {
  const [panel, setPanel] = useState<MenuPanel>();
  const [skillQuery, setSkillQuery] = useState("");
  const [wikiQuery, setWikiQuery] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const menuRootRef = useRef<HTMLDivElement>(null);

  const filteredSkills = useMemo(() => {
    const query = skillQuery.trim().toLowerCase();
    if (!query) return demoSkills;
    return demoSkills.filter((skill) => `${skill.name}${skill.description}${skill.owner}`.toLowerCase().includes(query));
  }, [skillQuery]);

  const filteredWikiReferences = useMemo(() => {
    const query = wikiQuery.trim().toLowerCase();
    if (!query) return availableWikiReferences;
    return availableWikiReferences.filter((page) => `${page.title}${page.folder}`.toLowerCase().includes(query));
  }, [availableWikiReferences, wikiQuery]);

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
    onChangeWikiReferences?.([]);
    onChangeWikiDepositMode?.(true);
    setPanel(undefined);
  };

  const handleTextChange = (nextValue: string) => {
    if (/@wiki(?:\s|$)/i.test(nextValue)) {
      activateWikiDeposit();
      onChange(nextValue.replace(/@wiki\s*/i, ""));
      return;
    }
    onChange(nextValue);
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      submit();
    }
  };

  const selectSkill = (skill: ComposerSkill) => {
    onChangeWikiDepositMode?.(false);
    onSelectSkill?.(skill);
    setPanel(undefined);
  };

  const toggleWikiReference = (page: ComposerWikiReference) => {
    const exists = wikiReferences.some((item) => item.id === page.id);
    onChangeWikiReferences?.(exists ? wikiReferences.filter((item) => item.id !== page.id) : [...wikiReferences, page]);
  };

  const activePlaceholder = wikiDepositMode
    ? "请添加需要沉淀的资料，也可以补充加工要求"
    : placeholder;

  return (
    <div className={`composer ${large ? "composer-large" : ""} ${wikiDepositMode ? "is-wiki-deposit" : ""}`}>
      {(wikiDepositMode || selectedSkill || wikiReferences.length > 0 || attachment) && (
        <div className="composer-contexts" aria-label="本轮已选择的上下文">
          {wikiDepositMode && (
            <button className="context-chip wiki-mode-chip" onClick={() => onChangeWikiDepositMode?.(false)} title="退出 Wiki 沉淀模式">
              <span>@Wiki</span><X />
            </button>
          )}
          {selectedSkill && (
            <button className="context-chip skill-chip" onClick={() => onSelectSkill?.(undefined)} title="移除技能">
              <Sparkles /><span>{selectedSkill.name}</span><X />
            </button>
          )}
          {wikiReferences.map((page) => (
            <button
              key={page.id}
              className="context-chip wiki-reference-chip"
              onClick={() => onChangeWikiReferences?.(wikiReferences.filter((item) => item.id !== page.id))}
              title="移除 Wiki 引用"
            >
              <BookOpen /><span>{page.title} · V{page.version}</span><X />
            </button>
          ))}
          {attachment && <AttachmentChip attachment={attachment} onRemove={onRemoveAttachment} />}
        </div>
      )}

      <textarea
        value={value}
        onChange={(event) => handleTextChange(event.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={activePlaceholder}
        aria-label={activePlaceholder}
      />

      <div className="composer-actions">
        <div className="attach-wrap" ref={menuRootRef}>
          <button
            className={`attach-button ${panel ? "active" : ""}`}
            onClick={() => setPanel((current) => (current ? undefined : "root"))}
            aria-label="添加内容"
            aria-expanded={Boolean(panel)}
          >
            <Plus />
          </button>

          {panel && (
            <div className="attach-menu" role="dialog" aria-label="添加内容">
              {panel === "root" && (
                <>
                  <MenuAction icon={<FileUp />} title="上传本地文件" onClick={() => fileInputRef.current?.click()} />
                  <MenuAction
                    icon={<Sparkles />}
                    title="使用技能"
                    detail={wikiDepositMode ? "Wiki 沉淀模式下不可用" : "选择一个技能处理本轮任务"}
                    disabled={wikiDepositMode}
                    onClick={() => setPanel("skills")}
                  />
                  <MenuAction icon={<BookOpen />} title="业务 Wiki" detail="引用已发布内容，或开始沉淀" onClick={() => setPanel("wiki")} />
                </>
              )}

              {panel === "skills" && (
                <PickerPanel title="使用技能" onBack={() => setPanel("root")}>
                  <SearchField value={skillQuery} onChange={setSkillQuery} placeholder="搜索技能" />
                  <div className="picker-list">
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
                  </div>
                </PickerPanel>
              )}

              {panel === "wiki" && (
                <PickerPanel title="业务 Wiki" onBack={() => setPanel("root")}>
                  <div className="wiki-action-list">
                    <MenuAction
                      icon={<BookOpen />}
                      title="引用 Wiki"
                      detail={wikiDepositMode ? "请先退出 @Wiki 沉淀模式" : "选择已审批发布的 Wiki Pages"}
                      disabled={wikiDepositMode}
                      onClick={() => setPanel("wiki-picker")}
                    />
                    <MenuAction icon={<FileUp />} title="沉淀到 Wiki" detail="在输入框中开启 @Wiki 模式" onClick={activateWikiDeposit} />
                  </div>
                </PickerPanel>
              )}

              {panel === "wiki-picker" && (
                <PickerPanel title="引用 Wiki" onBack={() => setPanel("wiki")}>
                  <SearchField value={wikiQuery} onChange={setWikiQuery} placeholder="搜索 Wiki Page" />
                  <div className="picker-list wiki-picker-list">
                    {filteredWikiReferences.map((page) => {
                      const selected = wikiReferences.some((item) => item.id === page.id);
                      return (
                        <button key={page.id} className={`picker-item ${selected ? "selected" : ""}`} onClick={() => toggleWikiReference(page)}>
                          <span className="picker-item-copy">
                            <strong>{page.title}</strong>
                            <small>{page.folder} · 当前发布版本 V{page.version}</small>
                          </span>
                          {selected && <Check className="picker-check" />}
                        </button>
                      );
                    })}
                  </div>
                  <button className="picker-done" onClick={() => setPanel(undefined)}>完成 · 已选 {wikiReferences.length}</button>
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
