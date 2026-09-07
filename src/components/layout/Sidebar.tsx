import {
  Archive,
  BellDot,
  ChevronRight,
  FileText,
  FolderClosed,
  MessageSquarePlus,
  PackageCheck,
  Plus,
} from "lucide-react";
import { useWorkbench } from "../../context/WorkbenchContext";
import { Brand } from "./Brand";

const projects = ["新项目 1", "新项目 2", "新项目 3", "新项目 4"];

export function Sidebar() {
  const { view, setView, resetConversation, productFlow, wikiTask } = useWorkbench();
  const currentTask = productFlow.prompt || "昨天手机类目保费最大的10个品牌...";

  return (
    <aside className="sidebar">
      <div className="sidebar-brand">
        <Brand />
      </div>

      <nav className="sidebar-primary" aria-label="主要导航">
        <button className={view === "home" ? "active" : ""} onClick={resetConversation}>
          <MessageSquarePlus />
          <span>新建对话</span>
        </button>
        <button className={view === "products" ? "active" : ""} onClick={() => setView("products")}>
          <PackageCheck />
          <span>我的产品</span>
        </button>
        <button className={view === "wiki" ? "active" : ""} onClick={() => setView("wiki")}>
          <Archive />
          <span>资产中心</span>
          {wikiTask?.status === "submitted" && <i className="nav-dot" />}
        </button>
      </nav>

      <div className="sidebar-scroll">
        <section className="sidebar-section">
          <header>
            <span>项目</span>
            <button aria-label="新建项目"><Plus /></button>
          </header>
          <div className="project-list">
            {projects.map((project) => (
              <button key={project}>
                <span className="project-icon"><FolderClosed /></span>
                <span>{project}</span>
                <ChevronRight />
              </button>
            ))}
          </div>
        </section>

        <section className="sidebar-section task-section">
          <header><span>任务</span></header>
          <button className={view === "conversation" && wikiTask ? "active task-row" : "task-row"} onClick={() => setView("conversation")}>
            <FileText />
            <span>{wikiTask && wikiTask.status !== "approved" ? `沉淀：${wikiTask.fileName}` : "沉淀一条知识"}</span>
          </button>
          <button className={view === "conversation" && productFlow.stage !== "idle" ? "active task-row" : "task-row"} onClick={() => productFlow.stage !== "idle" && setView("conversation")}>
            <FileText />
            <span>{currentTask}</span>
          </button>
          <button className="task-row">
            <FileText />
            <span>手机 8 月延保渗透率分析</span>
          </button>
          <button className="task-row">
            <FileText />
            <span>运动户外延保方案</span>
          </button>
        </section>
      </div>

      <div className="sidebar-footer">
        <button className="subscription"><BellDot /><span>我的订阅</span><b>4</b></button>
        <div className="profile-row">
          <span className="avatar">晨</span>
          <span><strong>晨雨</strong><small>解决方案岗</small></span>
          <span className="profile-menu">☰</span>
        </div>
      </div>
    </aside>
  );
}
