import { gsap } from "gsap";
import { useGSAP } from "@gsap/react";
import { Archive, Megaphone, MessageSquarePlus, PackageCheck, Settings2 } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Sidebar } from "./components/layout/Sidebar";
import { Brand } from "./components/layout/Brand";
import { WorkbenchProvider, useWorkbench } from "./context/WorkbenchContext";
import { ConversationPage } from "./pages/ConversationPage";
import { HomePage } from "./pages/HomePage";
import { ProductsPage } from "./pages/ProductsPage";
import { ProductUpdatesPage } from "./pages/ProductUpdatesPage";
import { WikiPage } from "./pages/WikiPage";
import { SettingsPage } from "./pages/SettingsPage";
import type { AppView } from "./domain/types";

gsap.registerPlugin(useGSAP);

const CURRENT_UPDATES_VERSION = "v1.1-2026-10-15";
const UPDATES_STORAGE_KEY = "alpha-product-updates-last-seen";

function hasUnreadProductUpdates() {
  try {
    return window.localStorage.getItem(UPDATES_STORAGE_KEY) !== CURRENT_UPDATES_VERSION;
  } catch {
    return true;
  }
}

function rememberCurrentProductUpdates() {
  try {
    window.localStorage.setItem(UPDATES_STORAGE_KEY, CURRENT_UPDATES_VERSION);
  } catch {
    // The page still works when browser storage is unavailable.
  }
}

function WorkbenchApp() {
  const { view, setView, resetConversation, productFlow, wikiTask, flash, setAssetCenterLevel } = useWorkbench();
  const returnView = useRef<Exclude<AppView, "settings">>("home");
  const [hasUnreadUpdates, setHasUnreadUpdates] = useState(hasUnreadProductUpdates);

  useEffect(() => {
    if (view !== "settings") returnView.current = view;
  }, [view]);

  useEffect(() => {
    if (view !== "updates") return;
    rememberCurrentProductUpdates();
    setHasUnreadUpdates(false);
  }, [view]);

  const openConversation = () => {
    if (wikiTask || productFlow.stage !== "idle") setView("conversation");
    else resetConversation();
  };

  const openProductUpdates = () => {
    rememberCurrentProductUpdates();
    setHasUnreadUpdates(false);
    setView("updates");
  };

  if (view === "settings") {
    return (
      <>
        <SettingsPage onBack={() => setView(returnView.current)} />
        {flash && <div className="toast" role="status">{flash}</div>}
      </>
    );
  }

  return (
    <div className="app-shell">
      <Sidebar />
      <button
        className={`global-updates-entry global-updates-entry-${view} ${view === "updates" ? "active" : ""}`}
        onClick={openProductUpdates}
        aria-label={hasUnreadUpdates ? "产品动态，有新版本" : "产品动态"}
        aria-current={view === "updates" ? "page" : undefined}
        title="产品动态"
      >
        <Megaphone />
        <span>产品动态</span>
        {hasUnreadUpdates && <i className="global-updates-dot" aria-hidden="true" />}
      </button>
      <nav className="mobile-nav" aria-label="移动端主要导航">
        <Brand />
        <div>
          <button className={view === "home" || view === "conversation" ? "active" : ""} onClick={openConversation}><MessageSquarePlus /><span>对话</span></button>
          <button className={view === "products" ? "active" : ""} onClick={() => setView("products")}><PackageCheck /><span>产品</span></button>
          <button className={view === "wiki" ? "active" : ""} onClick={() => { setAssetCenterLevel("catalog"); setView("wiki"); }}><Archive /><span>资产</span></button>
          <button className={view === "updates" ? "active" : ""} onClick={openProductUpdates} aria-label={hasUnreadUpdates ? "产品动态，有新版本" : "产品动态"}><Megaphone /><span>动态</span>{hasUnreadUpdates && <i className="global-updates-dot" aria-hidden="true" />}</button>
          <button onClick={() => setView("settings")}><Settings2 /><span>设置</span></button>
        </div>
      </nav>
      <main className="app-main">
        {view === "home" && <HomePage />}
        {view === "conversation" && <ConversationPage />}
        {view === "products" && <ProductsPage />}
        {view === "wiki" && <WikiPage />}
        {view === "updates" && <ProductUpdatesPage />}
      </main>
      {flash && <div className="toast" role="status">{flash}</div>}
    </div>
  );
}

export default function App() {
  return (
    <WorkbenchProvider>
      <WorkbenchApp />
    </WorkbenchProvider>
  );
}
