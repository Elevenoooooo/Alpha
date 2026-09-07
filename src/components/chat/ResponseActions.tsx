import { Check, Copy, ThumbsDown, ThumbsUp } from "lucide-react";
import { useState } from "react";

export function ResponseActions({ copyText }: { copyText: string }) {
  const [vote, setVote] = useState<"up" | "down">();
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(copyText);
    } catch {
      const area = document.createElement("textarea");
      area.value = copyText;
      document.body.appendChild(area);
      area.select();
      document.execCommand("copy");
      area.remove();
    }
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1400);
  };

  return (
    <div className="response-actions" aria-label="回答反馈">
      <button className={vote === "up" ? "active" : ""} onClick={() => setVote(vote === "up" ? undefined : "up")} aria-label="赞">
        <ThumbsUp />
      </button>
      <button className={vote === "down" ? "active" : ""} onClick={() => setVote(vote === "down" ? undefined : "down")} aria-label="踩">
        <ThumbsDown />
      </button>
      <button onClick={copy} aria-label="复制">
        {copied ? <Check /> : <Copy />}
        {copied && <span>已复制</span>}
      </button>
    </div>
  );
}
