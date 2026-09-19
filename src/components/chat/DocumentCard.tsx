import { FileSearch, FileText } from "lucide-react";
import type { DesignDocument } from "../../data/designCases";

export function DocumentCard({ document, onOpen }: { document: DesignDocument; onOpen: () => void }) {
  return <article className="design-document-card">
    <span className="design-document-icon"><FileText /></span>
    <div><h3>{document.name}</h3><p>文件类型：text/markdown</p></div>
    <button className="primary-button" onClick={onOpen}><FileSearch />查看全文</button>
  </article>;
}
