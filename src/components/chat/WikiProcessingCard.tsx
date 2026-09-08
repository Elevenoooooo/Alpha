import { CheckCircle2, FileDiff, FileText, Pause, Play, Send } from "lucide-react";
import { demoAffectedPages } from "../../data/mockData";
import type { WikiTask } from "../../domain/types";

export function WikiProcessingCard({
  task,
  onPause,
  onResume,
  onOpen,
  onSubmit,
  rejectionComment,
}: {
  task: WikiTask;
  onPause: () => void;
  onResume: () => void;
  onOpen: () => void;
  onSubmit: () => void;
  rejectionComment?: string;
}) {
  const ready = task.status === "ready";
  const submitted = task.status === "submitted";
  const rejected = task.status === "rejected";
  const approved = task.status === "approved";
  const sourceAttachments = task.attachments?.length ? task.attachments : task.attachment ? [task.attachment] : [];
  const affectedPageCount = demoAffectedPages(sourceAttachments.map((item) => item.name).join(" ") || task.fileName).length;

  return (
    <article className="wiki-result-card answer-card">
      <header className="answer-card-head">
        <span className="answer-card-icon"><FileText /></span>
        <div>
          <h3>{task.fileName}</h3>
          <p>Wiki 加工任务 · 第 {task.revision} 版结果</p>
        </div>
        <span className={`status-chip status-${task.status}`}>
          {task.status === "processing" && "加工中"}
          {task.status === "paused" && "已暂停"}
          {ready && "待提交"}
          {submitted && "审核中"}
          {rejected && "审核失败"}
          {approved && "已发布"}
        </span>
      </header>

      {sourceAttachments.length > 1 && (
        <div className="wiki-task-files">
          <span>本次共 {sourceAttachments.length} 个原始文件</span>
          <div>{sourceAttachments.map((file) => <small key={file.id}><FileText />{file.name}</small>)}</div>
        </div>
      )}

      {(task.status === "processing" || task.status === "paused") && (
        <div className="wiki-progress-block">
          <div><span>正在识别原文、匹配 Schema 并生成 Page Diff</span><strong>{task.progress}%</strong></div>
          <div className="wiki-progress"><i style={{ width: `${task.progress}%` }} /></div>
        </div>
      )}

      {(ready || submitted || rejected || approved) && (
        <div className="document-preview">
          已完成原文解析，共影响 {affectedPageCount} 个 Wiki Pages。你可以查看完整加工内容及逐行 Diff；如果结果有问题，直接在当前会话发送消息即可重新加工。
        </div>
      )}

      {rejected && <div className="rejection-note"><strong>驳回意见</strong>{rejectionComment ?? "退款回冲口径需要与原文件第 6 页保持一致，请补充来源定位后重新提交。"}</div>}

      <footer className="card-actions">
        {task.status === "processing" && <button className="secondary-button" onClick={onPause}><Pause />暂停加工</button>}
        {task.status === "paused" && <button className="primary-button" onClick={onResume}><Play />继续加工</button>}
        {(ready || submitted || rejected || approved) && <button className="secondary-button" onClick={onOpen}><FileDiff />查看加工结果</button>}
        {ready && <button className="primary-button" onClick={onSubmit}><Send />提交审批</button>}
        {submitted && <span className="inline-state"><CheckCircle2 />已提交，等待审核员处理</span>}
        {approved && <span className="inline-state success"><CheckCircle2 />Raw 与 Wiki 已正式发布</span>}
      </footer>
    </article>
  );
}
