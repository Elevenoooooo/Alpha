import { ArrowRight, Play, Sparkles } from "lucide-react";
import { useState } from "react";
import { Composer } from "../components/chat/Composer";
import { AnimatedPanel } from "../components/layout/AnimatedPanel";
import { useWorkbench } from "../context/WorkbenchContext";
import { recommendedQuestions } from "../data/mockData";

export function HomePage() {
  const { startProductTask, startWikiTask, notify } = useWorkbench();
  const [input, setInput] = useState("");
  const [file, setFile] = useState<File>();

  const submit = () => {
    if (file || /@wiki/i.test(input)) {
      if (!file) {
        notify("请先通过“添加引用”上传需要加工的文件");
        return;
      }
      startWikiTask(file.name);
      return;
    }
    const prompt = input.trim();
    if (!prompt) return;
    startProductTask(prompt);
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
          selectedFile={file}
          onSelectFile={setFile}
          onRemoveFile={() => setFile(undefined)}
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
