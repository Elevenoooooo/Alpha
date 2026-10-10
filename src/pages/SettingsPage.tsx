import {
  ArrowLeft,
  Brain,
  FileText,
  PencilLine,
  Save,
  ShieldCheck,
  X,
} from "lucide-react";
import { useState } from "react";
import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { useWorkbench } from "../context/WorkbenchContext";

const MEMORY_STORAGE_KEY = "alpha-personal-memory-markdown";
const MEMORY_ENABLED_KEY = "alpha-personal-memory-enabled";

const defaultMemory = `# 关于吕涵

你是京东保险业务的产品经理，正在通过 **Alpha** 探索 AI 如何真正承接保险产品与解决方案工作，而不只是生成一段回答。

## 当前工作重点

- 持续完善 Alpha，覆盖从目标理解、分析、产品设计到后续业务动作的完整链路。
- 同时参与保险产品质检与商家险数据能力建设，重视业务口径、证据来源和真实落地边界。
- 希望逐步成长为能对模型、Agent、数据、工程和业务结果共同负责的 AI 产品经理。

## 你的协作偏好

- 先明确业务目标、成功状态和当前事实，再讨论界面或实现方案。
- 重要判断需要说明依据、边界、取舍和待确认事项，不用“看起来可行”代替验证。
- 偏好简洁、重点明确的表达；复杂方案先给结论，再展开必要信息。
- 本地 Demo、方案建议和正式线上能力需要明确区分，未验证内容不能描述为已上线。

## 你关注的产品原则

1. Agent 应完成「看见—理解—操作—验证」的闭环。
2. 优先让不必要的旧步骤消失，而不是只给旧流程增加一个 AI 页面。
3. 关键业务写入、风险动作和正式决策需要保留证据与人工确认。
4. 新能力要通过固定 Case、Baseline 和 Bad Case 验证，不凭感觉宣布效果提升。

> 当本页记忆与当前任务中的明确要求冲突时，以你在当前任务中的最新要求为准。`;

function loadMemory() {
  try {
    const stored = window.localStorage.getItem(MEMORY_STORAGE_KEY);
    const next = (stored || defaultMemory).replaceAll("晨雨", "吕涵");
    if (stored !== next) window.localStorage.setItem(MEMORY_STORAGE_KEY, next);
    return next;
  } catch {
    return defaultMemory;
  }
}

function loadMemoryEnabled() {
  try {
    return window.localStorage.getItem(MEMORY_ENABLED_KEY) !== "false";
  } catch {
    return true;
  }
}

export function SettingsPage({ onBack }: { onBack: () => void }) {
  const { notify } = useWorkbench();
  const [memory, setMemory] = useState(loadMemory);
  const [draft, setDraft] = useState(memory);
  const [editing, setEditing] = useState(false);
  const [enabled, setEnabled] = useState(loadMemoryEnabled);
  const [updatedLabel, setUpdatedLabel] = useState("2026-10-10");

  const toggleMemory = () => {
    const next = !enabled;
    setEnabled(next);
    try {
      window.localStorage.setItem(MEMORY_ENABLED_KEY, String(next));
    } catch {
      notify("当前浏览器未允许保存，开关仅在本次打开期间生效");
      return;
    }
    notify(next ? "个性化记忆已启用" : "个性化记忆已暂停使用");
  };

  const startEditing = () => {
    setDraft(memory);
    setEditing(true);
  };

  const cancelEditing = () => {
    setDraft(memory);
    setEditing(false);
  };

  const saveMemory = () => {
    const next = draft.trim();
    if (!next) {
      notify("记忆内容不能为空");
      return;
    }
    setMemory(next);
    try {
      window.localStorage.setItem(MEMORY_STORAGE_KEY, next);
    } catch {
      notify("当前浏览器未允许保存，内容仅在本次打开期间保留");
      setEditing(false);
      return;
    }
    setUpdatedLabel("刚刚");
    setEditing(false);
    notify("个性化记忆已保存到当前浏览器");
  };

  return (
    <div className="settings-page">
      <aside className="settings-sidebar">
        <button className="settings-back" onClick={onBack} aria-label="返回 Alpha" title="返回 Alpha"><ArrowLeft /></button>
        <div className="settings-nav-title">设置</div>
        <nav className="settings-nav" aria-label="设置导航">
          <button className="active"><Brain /><span>个性化</span></button>
        </nav>
        <div className="settings-user"><span className="avatar">涵</span><span><strong>吕涵</strong><small>解决方案岗</small></span></div>
      </aside>

      <main className="settings-main">
        <div className="settings-content">
          <header className="settings-page-header">
            <h1>个性化</h1>
          </header>

          <section className="settings-section">
            <header><h2>Alpha 记忆</h2></header>
            <div className="settings-card memory-control-card">
              <div>
                <span className="settings-row-icon"><Brain /></span>
                <span><strong>启用个性化记忆</strong><small>在后续任务中参考已保存的背景与偏好</small></span>
                <button className={`memory-switch ${enabled ? "is-on" : ""}`} role="switch" aria-checked={enabled} onClick={toggleMemory} aria-label="启用个性化记忆"><i /></button>
              </div>
            </div>
          </section>

          <section className="settings-section memory-content-section">
            <section className={`memory-document ${editing ? "is-editing" : ""}`}>
              <header>
                <div className="memory-document-title"><FileText /><span><strong>个性化记忆.md</strong><small>Markdown</small></span></div>
                <div className="memory-document-actions">
                  <time>更新于 {updatedLabel}</time>
                  {!editing ? (
                    <button className="secondary-button" onClick={startEditing}><PencilLine />编辑</button>
                  ) : (
                    <div className="memory-edit-actions"><button className="secondary-button" onClick={cancelEditing}><X />取消</button><button className="primary-button" onClick={saveMemory}><Save />保存</button></div>
                  )}
                </div>
              </header>
              {editing ? (
                <div className="memory-editor-grid">
                  <label className="memory-source-editor"><span>编辑 Markdown</span><textarea value={draft} onChange={(event) => setDraft(event.target.value)} spellCheck={false} aria-label="编辑个性化记忆 Markdown" /></label>
                  <section className="memory-preview" aria-label="Markdown 预览"><span>实时预览</span><div className="memory-markdown"><Markdown remarkPlugins={[remarkGfm]}>{draft}</Markdown></div></section>
                </div>
              ) : (
                <article className="memory-markdown"><Markdown remarkPlugins={[remarkGfm]}>{memory}</Markdown></article>
              )}
              <footer><ShieldCheck />本地 Demo 中，修改仅保存在当前浏览器，不会同步到线上账户。</footer>
            </section>
          </section>
        </div>
      </main>
    </div>
  );
}
