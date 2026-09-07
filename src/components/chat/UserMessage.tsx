import { BookOpen, FileText, Image as ImageIcon, MessageSquareText, Sparkles, Users } from "lucide-react";
import { useEffect, useState } from "react";
import type { MessageAttachment, ProductRequestContext } from "../../domain/types";

type UserMessageProps = {
  text: string;
  context?: ProductRequestContext;
  wikiMode?: boolean;
  attachment?: MessageAttachment;
};

export function UserMessage({ text, context, wikiMode = false, attachment }: UserMessageProps) {
  const activeAttachment = attachment ?? context?.attachment;

  return (
    <div className="user-row">
      <div className="user-message-stack">
        {(wikiMode || context?.skill || Boolean(context?.resources.length)) && (
          <div className="sent-contexts" aria-label="本轮使用的上下文">
            {wikiMode && <span className="sent-context-chip sent-wiki-mode">@Wiki</span>}
            {context?.skill && (
              <span className="sent-context-chip sent-skill"><Sparkles />{context.skill.name}</span>
            )}
            {context?.resources.map((resource) => (
              <span className="sent-context-chip" key={resource.id}>
                {resource.kind === "wiki" ? <BookOpen /> : resource.kind === "conversation" ? <MessageSquareText /> : <Users />}
                {resource.title}{resource.version ? ` · V${resource.version}` : ""}
              </span>
            ))}
          </div>
        )}
        {activeAttachment && <SentAttachment attachment={activeAttachment} />}
        {text && <div className="user-bubble">{text}</div>}
      </div>
    </div>
  );
}

function SentAttachment({ attachment }: { attachment: MessageAttachment }) {
  const [preview, setPreview] = useState<string>();
  const meta = [attachment.source === "conversation" ? "当前对话产出" : "本地上传", attachment.type, attachment.size]
    .filter(Boolean)
    .join(" · ");

  useEffect(() => {
    if (!attachment.file?.type.startsWith("image/")) {
      setPreview(undefined);
      return;
    }
    const url = URL.createObjectURL(attachment.file);
    setPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [attachment.file]);

  if (preview) {
    return (
      <figure className="sent-image-attachment">
        <img src={preview} alt={attachment.name} />
        <figcaption><ImageIcon />{attachment.name}</figcaption>
      </figure>
    );
  }

  return (
    <div className="sent-file-attachment">
      <span><FileText /></span>
      <div>
        <strong>{attachment.name}</strong>
        <small>{meta}</small>
      </div>
    </div>
  );
}
