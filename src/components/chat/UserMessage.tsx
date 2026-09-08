import { BookOpen, FileText, Image as ImageIcon, MessageSquareText, Sparkles, Users } from "lucide-react";
import { useEffect, useState } from "react";
import type { MessageAttachment, ProductRequestContext } from "../../domain/types";

type UserMessageProps = {
  text: string;
  context?: ProductRequestContext;
  wikiMode?: boolean;
  attachment?: MessageAttachment;
  attachments?: MessageAttachment[];
};

export function UserMessage({ text, context, wikiMode = false, attachment, attachments }: UserMessageProps) {
  const activeAttachments = attachments?.length
    ? attachments
    : context?.attachments?.length
      ? context.attachments
      : attachment ?? context?.attachment
        ? [attachment ?? context?.attachment!]
        : [];

  return (
    <div className="user-row">
      <div className="user-message-stack">
        {(context?.skill || Boolean(context?.resources.length)) && (
          <div className="sent-contexts" aria-label="本轮使用的上下文">
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
        {activeAttachments.length > 0 && (
          <div className={`sent-attachment-grid ${activeAttachments.length > 1 ? "is-multiple" : ""}`}>
            {activeAttachments.map((item) => <SentAttachment attachment={item} key={item.id} />)}
          </div>
        )}
        {text && (wikiMode
          ? <div className="sent-wiki-query"><span>@Wiki</span>{text}</div>
          : <div className="user-bubble">{text}</div>)}
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
