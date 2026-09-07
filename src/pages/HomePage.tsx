import { ArrowRight, Play, Sparkles } from "lucide-react";
import { useState } from "react";
import { Composer } from "../components/chat/Composer";
import {
  localAttachment,
  toWikiReference,
  type ComposerAttachment,
  type ComposerSkill,
  type ComposerWikiReference,
} from "../components/chat/composerModels";
import { AnimatedPanel } from "../components/layout/AnimatedPanel";
import { useWorkbench } from "../context/WorkbenchContext";
import { recommendedQuestions } from "../data/mockData";

export function HomePage() {
  const { startProductTask, startWikiTask, notify, wikiPages } = useWorkbench();
  const [input, setInput] = useState("");
  const [attachment, setAttachment] = useState<ComposerAttachment>();
  const [selectedSkill, setSelectedSkill] = useState<ComposerSkill>();
  const [wikiReferences, setWikiReferences] = useState<ComposerWikiReference[]>([]);
  const [wikiDepositMode, setWikiDepositMode] = useState(false);

  const submit = () => {
    if (wikiDepositMode) {
      if (!attachment) {
        notify("请添加需要沉淀的文件");
        return;
      }
      startWikiTask(attachment.name, attachment.type);
      return;
    }
    const context = [
      selectedSkill ? `使用「${selectedSkill.name}」` : "",
      wikiReferences.length ? `引用 Wiki：${wikiReferences.map((page) => `${page.title} V${page.version}`).join("、")}` : "",
      attachment ? `附件：${attachment.name}` : "",
    ].filter(Boolean).join("；");
    const prompt = input.trim() || (attachment ? `请分析「${attachment.name}」` : "");
    if (!prompt) return;
    startProductTask(context ? `${prompt}（${context}）` : prompt);
  };

  return (
    <div className="home-page">
      <AnimatedPanel className="home-content">
        <header className="hero-heading">
          <span className="hero-alpha">Alpha</span>
          <h1>与你一同创造产品</h1>
        </header>

        <Composer
          large
          value={input}
          onChange={setInput}
          onSubmit={submit}
          attachment={attachment}
          onSelectLocalFile={(file) => setAttachment(localAttachment(file))}
          onRemoveAttachment={() => setAttachment(undefined)}
          selectedSkill={selectedSkill}
          onSelectSkill={setSelectedSkill}
          wikiReferences={wikiReferences}
          availableWikiReferences={wikiPages.map(toWikiReference)}
          onChangeWikiReferences={setWikiReferences}
          wikiDepositMode={wikiDepositMode}
          onChangeWikiDepositMode={setWikiDepositMode}
          onNotify={notify}
          placeholder="随心输入，说出你的创意"
        />

        <section className="recommendations">
          <div className="recommendation-head">
            <h2><span><Sparkles /></span>试试这些问题</h2>
            <button onClick={() => notify("已为你换一批推荐问题")}>换一批</button>
          </div>
          <div className="recommendation-list" aria-label="推荐问题">
            {recommendedQuestions.map((question) => (
              <button key={question.text} onClick={() => startProductTask(question.text)}>
                <span className="mode-pill">{question.mode}</span>
                <strong>{question.text}</strong>
                <small>{question.time}</small>
                <i><ArrowRight /></i>
              </button>
            ))}
          </div>
        </section>
      </AnimatedPanel>

      <button className="tour-button" onClick={() => startProductTask("为手机类目设计 3 款差异化延保方案")}>
        <Play />
        <span>功能导览</span>
      </button>
    </div>
  );
}
