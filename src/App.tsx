import { gsap } from "gsap";
import { useGSAP } from "@gsap/react";
import { Archive, MessageSquarePlus, PackageCheck } from "lucide-react";
import { Sidebar } from "./components/layout/Sidebar";
import { Brand } from "./components/layout/Brand";
import { WorkbenchProvider, useWorkbench } from "./context/WorkbenchContext";
import { ConversationPage } from "./pages/ConversationPage";
import { HomePage } from "./pages/HomePage";
import { ProductsPage } from "./pages/ProductsPage";
import { WikiPage } from "./pages/WikiPage";

gsap.registerPlugin(useGSAP);

function WorkbenchApp() {
  const { view, setView, resetConversation, productFlow, wikiTask, flash, setAssetCenterLevel } = useWorkbench();
  const openConversation = () => {
    if (wikiTask || productFlow.stage !== "idle") setView("conversation");
    else resetConversation();
  };

  return (
    <div className="app-shell">
      <Sidebar />
      <nav className="mobile-nav" aria-label="移动端主要导航">
        <Brand />
        <div>
          <button className={view === "home" || view === "conversation" ? "active" : ""} onClick={openConversation}><MessageSquarePlus /><span>对话</span></button>
          <button className={view === "products" ? "active" : ""} onClick={() => setView("products")}><PackageCheck /><span>产品</span></button>
          <button className={view === "wiki" ? "active" : ""} onClick={() => { setAssetCenterLevel("catalog"); setView("wiki"); }}><Archive /><span>资产</span></button>
        </div>
      </nav>
      <main className="app-main">
        {view === "home" && <HomePage />}
        {view === "conversation" && <ConversationPage />}
        {view === "products" && <ProductsPage />}
        {view === "wiki" && <WikiPage />}
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
