import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";

export function DesignMarkdown({ children, onEvidence }: { children: string; onEvidence?: (id: string) => void }) {
  return <div className="design-markdown"><Markdown remarkPlugins={[remarkGfm]} components={{
    a: ({ href, children }) => href?.startsWith("#evidence-") && onEvidence
      ? <button className="design-citation" aria-label={`查看依据 ${String(children)}`} onClick={() => onEvidence(href.slice(10))}>{children}</button>
      : <a href={href} target={href?.startsWith("http") ? "_blank" : undefined} rel="noreferrer">{children}</a>,
    table: ({ children }) => <div className="design-table-scroll"><table>{children}</table></div>,
  }}>{children}</Markdown></div>;
}
