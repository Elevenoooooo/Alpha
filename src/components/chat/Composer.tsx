import { ArrowUp, FileUp, Plus, X } from "lucide-react";
import { useRef, useState, type KeyboardEvent } from "react";

type ComposerProps = {
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
  placeholder?: string;
  large?: boolean;
  selectedFile?: File;
  onSelectFile?: (file: File) => void;
  onRemoveFile?: () => void;
};

export function Composer({
  value,
  onChange,
  onSubmit,
  placeholder = "继续追问…",
  large = false,
  selectedFile,
  onSelectFile,
  onRemoveFile,
}: ComposerProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const submit = () => {
    if (!value.trim() && !selectedFile) return;
    onSubmit();
    setMenuOpen(false);
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      submit();
    }
  };

  return (
    <div className={`composer ${large ? "composer-large" : ""}`}>
      {selectedFile && (
        <div className="file-chip">
          <FileUp />
          <span>{selectedFile.name}</span>
          <button onClick={onRemoveFile} aria-label="移除文件"><X /></button>
        </div>
      )}
      <textarea
        value={value}
        onChange={(event) => onChange(event.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        aria-label={placeholder}
      />
      <div className="composer-actions">
        <div className="attach-wrap">
          <button className="attach-button" onClick={() => setMenuOpen((open) => !open)}>
            <Plus />
            <span>添加引用</span>
          </button>
          {menuOpen && (
            <div className="attach-menu">
              <button onClick={() => inputRef.current?.click()}>
                <FileUp />
                <span><strong>上传本地文件</strong><small>支持 PDF、Word、PPT、Excel、Markdown 和图片</small></span>
              </button>
              <div className="attach-tip">上传后输入 @Wiki，即可在当前会话加工。</div>
            </div>
          )}
          <input
            ref={inputRef}
            hidden
            type="file"
            accept=".pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.md,.png,.jpg,.jpeg,.webp"
            onChange={(event) => {
              const file = event.target.files?.[0];
              if (file) {
                onSelectFile?.(file);
                if (!value.trim()) onChange("@Wiki 请加工并沉淀这份业务资料");
              }
              event.currentTarget.value = "";
              setMenuOpen(false);
            }}
          />
        </div>
        <button className="send-button" disabled={!value.trim() && !selectedFile} onClick={submit} aria-label="发送">
          <ArrowUp />
        </button>
      </div>
    </div>
  );
}
