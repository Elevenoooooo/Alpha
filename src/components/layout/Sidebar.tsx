import {
  Archive,
  BellDot,
  BookOpen,
  ChevronRight,
  CircleHelp,
  Copy,
  FileText,
  FolderClosed,
  LockKeyhole,
  MessageCircle,
  MessageSquarePlus,
  PackageCheck,
  Plus,
  Settings2,
  Sparkles,
  X,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useWorkbench } from "../../context/WorkbenchContext";
import { Brand } from "./Brand";

const projects = ["新项目 1", "新项目 2", "新项目 3", "新项目 4"];
const ALPHA_GROUP_NUMBER = "10233037620";
const ACCESS_CONTACTS = "mamengjiao.1, lvhan.16";

export function Sidebar() {
  const { view, setView, resetConversation, productFlow, wikiTask, setAssetCenterLevel, startDesignCase, openGuide, notify } = useWorkbench();
  const currentTask = productFlow.prompt || "昨天手机类目保费最大的10个品牌...";
  const [profileOpen, setProfileOpen] = useState(false);
  const [helpOpen, setHelpOpen] = useState(false);
  const [contactOpen, setContactOpen] = useState(false);
  const accountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!profileOpen && !helpOpen) return;
    const closeMenu = (event: PointerEvent) => {
      if (accountRef.current?.contains(event.target as Node)) return;
      setProfileOpen(false);
      setHelpOpen(false);
    };
    const closeWithEscape = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      setProfileOpen(false);
      setHelpOpen(false);
    };
    window.addEventListener("pointerdown", closeMenu);
    window.addEventListener("keydown", closeWithEscape);
    return () => {
      window.removeEventListener("pointerdown", closeMenu);
      window.removeEventListener("keydown", closeWithEscape);
    };
  }, [helpOpen, profileOpen]);

  useEffect(() => {
    if (!contactOpen) return;
    const closeWithEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setContactOpen(false);
    };
    window.addEventListener("keydown", closeWithEscape);
    return () => window.removeEventListener("keydown", closeWithEscape);
  }, [contactOpen]);

  const openManual = () => {
    setHelpOpen(false);
    openGuide();
  };

  const copyText = async (value: string, successMessage: string) => {
    try {
      await navigator.clipboard.writeText(value);
      notify(successMessage);
    } catch {
      notify("复制失败，请手动复制");
    }
  };

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
        <button className="design-sidebar-entry" onClick={() => startDesignCase("vinyl")}>
          <Sparkles /><span>产品设计演示</span><small>Demo</small>
        </button>
        <button className={view === "wiki" ? "active" : ""} onClick={() => { setAssetCenterLevel("catalog"); setView("wiki"); }}>
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
        <div className="sidebar-account" ref={accountRef}>
          {profileOpen && (
            <div className="profile-popover" role="menu">
              <div className="profile-popover-head">
                <span className="avatar">涵</span>
                <span><strong>吕涵</strong><small>解决方案岗</small></span>
              </div>
              <button role="menuitem" onClick={() => { setView("settings"); setProfileOpen(false); }}>
                <span className="profile-action-icon"><Settings2 /></span>
                <span><strong>设置</strong></span>
                <ChevronRight />
              </button>
            </div>
          )}
          {helpOpen && (
            <div className="help-popover" role="dialog" aria-label="帮助与支持">
              <header><strong>帮助与支持</strong></header>
              <div className="help-menu">
                <button onClick={openManual}><span><BookOpen /></span><strong>使用手册</strong><ChevronRight /></button>
                <button onClick={() => { setHelpOpen(false); setContactOpen(true); }}><span><MessageCircle /></span><strong>联系我们</strong><ChevronRight /></button>
              </div>
            </div>
          )}
          {contactOpen && (
            <div className="contact-modal-backdrop" onPointerDown={() => setContactOpen(false)}>
              <section className="contact-modal" role="dialog" aria-modal="true" aria-labelledby="contact-modal-title" onPointerDown={(event) => event.stopPropagation()}>
                <header>
                  <div>
                    <span className="contact-modal-mark"><MessageCircle /></span>
                    <span><strong id="contact-modal-title">联系与支持</strong><small>加入用户群交流，或联系 ERP 开通权限</small></span>
                  </div>
                  <button onClick={() => setContactOpen(false)} aria-label="关闭联系与支持"><X /></button>
                </header>
                <div className="contact-options">
                  <article>
                    <span className="contact-option-icon"><MessageCircle /></span>
                    <div><small>Alpha 用户交流群</small><strong>{ALPHA_GROUP_NUMBER}</strong></div>
                    <button onClick={() => copyText(ALPHA_GROUP_NUMBER, "Alpha 用户群群号已复制")} aria-label="复制 Alpha 用户群群号"><Copy /><span>复制</span></button>
                  </article>
                  <article>
                    <span className="contact-option-icon permission"><LockKeyhole /></span>
                    <div><small>权限开通请联系 ERP</small><strong>{ACCESS_CONTACTS}</strong></div>
                    <button onClick={() => copyText(ACCESS_CONTACTS, "权限联系人 ERP 已复制")} aria-label="复制权限联系人 ERP"><Copy /><span>复制</span></button>
                  </article>
                </div>
              </section>
            </div>
          )}
          <button className={`profile-row ${profileOpen ? "active" : ""}`} onClick={() => { setHelpOpen(false); setContactOpen(false); setProfileOpen((open) => !open); }} aria-haspopup="menu" aria-expanded={profileOpen}>
            <span className="avatar">涵</span>
            <span><strong>吕涵</strong><small>解决方案岗</small></span>
          </button>
          <button className={`sidebar-help-button ${helpOpen ? "active" : ""}`} onClick={() => { setProfileOpen(false); setContactOpen(false); setHelpOpen((open) => !open); }} aria-label="帮助与支持" aria-haspopup="dialog" aria-expanded={helpOpen} title="帮助与支持"><CircleHelp /></button>
        </div>
      </div>
    </aside>
  );
}
