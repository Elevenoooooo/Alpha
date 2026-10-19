import { gsap } from "gsap";
import { useGSAP } from "@gsap/react";
import { Archive, Megaphone, MessageSquarePlus, PackageCheck, Settings2 } from "lucide-react";
import { useEffect, useRef } from "react";
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

function WorkbenchApp() {
  const { view, setView, resetConversation, productFlow, wikiTask, flash, setAssetCenterLevel } = useWorkbench();
  const returnView = useRef<Exclude<AppView, "settings">>("home");

  useEffect(() => {
    if (view !== "settings") returnView.current = view;
  }, [view]);

  const openConversation = () => {
    if (wikiTask || productFlow.stage !== "idle") setView("conversation");
    else resetConversation();
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
        onClick={() => setView("updates")}
        aria-label="产品动态"
        aria-current={view === "updates" ? "page" : undefined}
        title="产品动态"
      >
        <Megaphone />
        <span>产品动态</span>
      </button>
      <nav className="mobile-nav" aria-label="移动端主要导航">
        <Brand />
        <div>
          <button className={view === "home" || view === "conversation" ? "active" : ""} onClick={openConversation}><MessageSquarePlus /><span>对话</span></button>
          <button className={view === "products" ? "active" : ""} onClick={() => setView("products")}><PackageCheck /><span>产品</span></button>
          <button className={view === "wiki" ? "active" : ""} onClick={() => { setAssetCenterLevel("catalog"); setView("wiki"); }}><Archive /><span>资产</span></button>
          <button className={view === "updates" ? "active" : ""} onClick={() => setView("updates")}><Megaphone /><span>动态</span></button>
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
