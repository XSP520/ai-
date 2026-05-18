import { useState, useMemo, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { useProgress } from '../hooks/useProgress';
import { useAI } from '../context/AIContext';
import { toast } from '../components/Toast';
import ProgressRing from '../components/ProgressRing';
import ChatPanel from '../components/ChatPanel';
import CodeDebugger from '../components/CodeDebugger';
import roadmapData from '../data/roadmapData';

export default function StageDetail() {
  const { stageId } = useParams();
  const {
    toggleTopic,
    toggleProject,
    setNotes,
    getStageProgress,
    getStageData,
  } = useProgress();
  const { isConfigured } = useAI();
  const [chatOpen, setChatOpen] = useState(false);

  const stage = useMemo(
    () => roadmapData.find((s) => s.id === stageId),
    [stageId]
  );
  const stageData = getStageData(stageId);
  const progress = getStageProgress(stageId);
  const [selectedTopicId, setSelectedTopicId] = useState(null);
  const [notesDraft, setNotesDraft] = useState(stageData?.notes || '');

  const selectedTopic = useMemo(
    () =>
      selectedTopicId
        ? stage?.topics.find((t) => t.id === selectedTopicId)
        : null,
    [selectedTopicId, stage]
  );

  const allTopicsComplete = useMemo(
    () =>
      stage?.topics.every((t) => stageData?.topics?.[t.id]) &&
      stage?.projects.every((p) => stageData?.projects?.[p.id]),
    [stage, stageData]
  );

  const handleToggleTopic = useCallback(
    (topicId) => {
      const wasChecked = stageData?.topics?.[topicId];
      toggleTopic(stageId, topicId);
      if (!wasChecked) {
        const topic = stage?.topics.find((t) => t.id === topicId);
        toast(`👍 「${topic?.name}」已掌握！`);
      }

      // Check if stage is now complete
      if (!allTopicsComplete) {
        const topics = { ...stageData?.topics, [topicId]: true };
        const allTopicsOk = stage?.topics.every((t) => topics[t.id]);
        const allProjectsOk = stage?.projects.every(
          (p) => stageData?.projects?.[p.id]
        );
        if (allTopicsOk && allProjectsOk) {
          setTimeout(
            () => toast('🏆 恭喜！本阶段全部完成！', 'stage'),
            500
          );
        }
      }
    },
    [stageId, toggleTopic, stageData, stage, allTopicsComplete]
  );

  const handleToggleProject = useCallback(
    (projectId) => {
      const wasChecked = stageData?.projects?.[projectId];
      toggleProject(stageId, projectId);
      if (!wasChecked) {
        toast('🎉 项目完成，干得漂亮！');

        // Check if stage is now complete
        const projects = { ...stageData?.projects, [projectId]: true };
        const allTopicsOk = stage?.topics.every(
          (t) => stageData?.topics?.[t.id]
        );
        const allProjectsOk = stage?.projects.every((p) => projects[p.id]);
        if (allTopicsOk && allProjectsOk) {
          setTimeout(
            () => toast('🏆 恭喜！本阶段全部完成！', 'stage'),
            500
          );
        }
      }
    },
    [stageId, toggleProject, stageData, stage]
  );

  const handleNotesSave = useCallback(() => {
    setNotes(stageId, notesDraft);
    toast('📝 笔记已保存');
  }, [stageId, notesDraft, setNotes]);

  const markdownComponents = useMemo(
    () => ({
      code({ node, inline, className, children, ...props }) {
        const match = /language-(\w+)/.exec(className || '');
        return !inline && match ? (
          <SyntaxHighlighter
            style={oneDark}
            language={match[1]}
            PreTag="div"
            {...props}
          >
            {String(children).replace(/\n$/, '')}
          </SyntaxHighlighter>
        ) : (
          <code className={className} {...props}>
            {children}
          </code>
        );
      },
    }),
    []
  );

  if (!stage) {
    return (
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
        <p className="text-xl text-[#64748B] dark:text-[#94A3B8] mb-4">
          未找到该学习阶段
        </p>
        <Link
          to="/roadmap"
          className="text-primary hover:underline font-medium"
        >
          ← 返回学习路线
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      {/* Back link */}
      <Link
        to="/roadmap"
        className="inline-flex items-center gap-1 text-sm text-[#64748B] dark:text-[#94A3B8] hover:text-primary transition-colors mb-6"
      >
        ← 返回学习路线
      </Link>

      {/* Stage header */}
      <div className="mb-8">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <span className="text-4xl">{stage.icon}</span>
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-[#0F172A] dark:text-white">
                  {stage.title}
                </h1>
                <p className="text-sm text-[#64748B] dark:text-[#94A3B8]">
                  {stage.subtitle} · {stage.duration}
                </p>
              </div>
            </div>
            <p className="text-[#64748B] dark:text-[#94A3B8] mt-3 max-w-2xl leading-relaxed">
              <strong className="text-[#334155] dark:text-[#CBD5E1]">学习目标：</strong>
              {stage.objective}
            </p>
          </div>
          <ProgressRing progress={progress} size={72} strokeWidth={6} />
        </div>

        {/* Progress bar */}
        <div className="mt-4 h-2 rounded-full bg-[#E2E8F0] dark:bg-[#334155] overflow-hidden">
          <div
            className="h-full rounded-full bg-gradient-to-r from-primary to-accent transition-all duration-700"
            style={{ width: `${progress}%` }}
          />
        </div>
        <p className="text-xs text-right mt-1 text-[#94A3B8]">{progress}% 完成</p>

        {allTopicsComplete && (
          <div className="mt-4 p-4 rounded-xl bg-gradient-to-r from-primary/10 to-accent/10 border border-primary/20 dark:border-primary/30 text-center animate-fade-in">
            <span className="text-xl mr-2">🏆</span>
            <span className="font-bold text-primary dark:text-accent">
              恭喜！你已经完成了本阶段全部学习内容！
            </span>
          </div>
        )}
      </div>

      {/* Main content: dual panel on desktop, stacked on mobile */}
      <div className="flex flex-col lg:flex-row gap-6">
        {/* Left panel: Topics & Projects list */}
        <div className="lg:w-1/3 flex flex-col gap-4">
          {/* Topics */}
          <div className="stage-card-shadow rounded-2xl p-5 bg-white dark:bg-[#1E293B] gradient-border">
            <h2 className="font-bold text-lg text-[#0F172A] dark:text-white mb-4">
              📖 知识点
            </h2>
            <div className="flex flex-col gap-2">
              {stage.topics.map((topic) => {
                const done = stageData?.topics?.[topic.id];
                const isSelected = selectedTopicId === topic.id;
                return (
                  <div
                    key={topic.id}
                    className={`rounded-xl transition-all ${
                      isSelected
                        ? 'ring-2 ring-primary dark:ring-accent bg-primary/5 dark:bg-primary/10'
                        : ''
                    }`}
                  >
                    <button
                      onClick={() =>
                        setSelectedTopicId(
                          selectedTopicId === topic.id ? null : topic.id
                        )
                      }
                      className="w-full flex items-center gap-3 px-4 py-3 text-left"
                    >
                      <input
                        type="checkbox"
                        checked={done || false}
                        onChange={(e) => {
                          e.stopPropagation();
                          handleToggleTopic(topic.id);
                        }}
                        className="w-5 h-5 rounded accent-primary cursor-pointer shrink-0"
                      />
                      <span
                        className={`text-sm font-medium flex-1 ${
                          done
                            ? 'line-through text-[#94A3B8] dark:text-[#64748B]'
                            : 'text-[#334155] dark:text-[#CBD5E1]'
                        }`}
                      >
                        {topic.name}
                      </span>
                      <span className="text-xs text-[#94A3B8]">
                        {isSelected ? '▲' : '▼'}
                      </span>
                    </button>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Projects */}
          <div className="stage-card-shadow rounded-2xl p-5 bg-white dark:bg-[#1E293B] gradient-border">
            <h2 className="font-bold text-lg text-[#0F172A] dark:text-white mb-4">
              🛠️ 实践项目
            </h2>
            <div className="flex flex-col gap-2">
              {stage.projects.map((project) => {
                const done = stageData?.projects?.[project.id];
                return (
                  <label
                    key={project.id}
                    className="flex items-center gap-3 px-4 py-3 rounded-xl cursor-pointer hover:bg-[#F8FAFC] dark:hover:bg-[#0F172A] transition-colors"
                  >
                    <input
                      type="checkbox"
                      checked={done || false}
                      onChange={() => handleToggleProject(project.id)}
                      className="w-5 h-5 rounded accent-primary cursor-pointer shrink-0"
                    />
                    <span
                      className={`text-sm ${
                        done
                          ? 'line-through text-[#94A3B8] dark:text-[#64748B]'
                          : 'text-[#334155] dark:text-[#CBD5E1]'
                      }`}
                    >
                      {project.name}
                    </span>
                    {done && <span className="text-xs ml-auto">✅</span>}
                  </label>
                );
              })}
            </div>
          </div>

          {/* Code Debugger */}
          <CodeDebugger stageId={stageId} currentTopic={selectedTopic} />

          {/* Resources */}
          <div className="stage-card-shadow rounded-2xl p-5 bg-white dark:bg-[#1E293B] gradient-border">
            <h2 className="font-bold text-lg text-[#0F172A] dark:text-white mb-4">
              🔗 扩展阅读
            </h2>
            <div className="flex flex-col gap-2">
              {stage.resources.map((res, i) => (
                <a
                  key={i}
                  href={res.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-primary dark:text-accent hover:underline px-3 py-1.5 rounded-lg hover:bg-primary/5 dark:hover:bg-primary/10 transition-colors"
                >
                  {res.type === 'course' && '🎓 '}
                  {res.type === 'video' && '🎬 '}
                  {res.type === 'book' && '📖 '}
                  {res.type === 'doc' && '📄 '}
                  {res.type === 'tutorial' && '📝 '}
                  {res.type === 'article' && '📰 '}
                  {res.title}
                </a>
              ))}
            </div>
          </div>
        </div>

        {/* Right panel: Content area */}
        <div className="lg:w-2/3">
          <div className="stage-card-shadow rounded-2xl p-5 sm:p-6 bg-white dark:bg-[#1E293B] gradient-border min-h-[400px]">
            {selectedTopic ? (
              <div className="animate-fade-in">
                <h2 className="text-xl font-bold text-[#0F172A] dark:text-white mb-4 pb-3 border-b border-[#E2E8F0] dark:border-[#334155]">
                  {selectedTopic.name}
                </h2>
                <div className="prose dark:prose-invert max-w-none">
                  <ReactMarkdown components={markdownComponents}>{selectedTopic.content}</ReactMarkdown>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center min-h-[400px] text-center">
                <span className="text-6xl mb-4">{stage.icon}</span>
                <p className="text-lg text-[#94A3B8] dark:text-[#64748B]">
                  请从左侧选择一个知识点开始学习
                </p>
                <p className="text-sm text-[#CBD5E1] dark:text-[#475569] mt-2">
                  点击主题名称展开详细讲解，勾选复选框标记完成
                </p>
              </div>
            )}
          </div>

          {/* Notes */}
          <div className="mt-6 stage-card-shadow rounded-2xl p-5 bg-white dark:bg-[#1E293B] gradient-border">
            <h2 className="font-bold text-lg text-[#0F172A] dark:text-white mb-3">
              📝 个人笔记
            </h2>
            <textarea
              value={notesDraft}
              onChange={(e) => setNotesDraft(e.target.value)}
              placeholder="在这里记录你的学习心得和笔记..."
              rows={4}
              className="w-full rounded-xl border border-[#E2E8F0] dark:border-[#334155] bg-[#F8FAFC] dark:bg-[#0F172A] p-4 text-sm text-[#1E293B] dark:text-[#E2E8F0] placeholder-[#94A3B8] dark:placeholder-[#64748B] resize-y focus:outline-none focus:ring-2 focus:ring-primary/50 dark:focus:ring-accent/50 transition-all"
            />
            <button
              onClick={handleNotesSave}
              className="mt-3 px-4 py-2 rounded-xl bg-primary text-white text-sm font-medium hover:bg-primary/90 transition-colors"
            >
              保存笔记
            </button>
          </div>
        </div>
      </div>

      {/* AI Chat FAB */}
      <button
        onClick={() => setChatOpen(true)}
        className={`fixed bottom-6 right-6 z-30 w-14 h-14 rounded-full shadow-lg flex items-center justify-center text-2xl transition-all duration-300 hover:scale-110 ${
          isConfigured
            ? 'bg-gradient-to-r from-primary to-accent text-white shadow-primary/30'
            : 'bg-[#CBD5E1] dark:bg-[#475569] text-[#94A3B8] dark:text-[#64748B] cursor-not-allowed'
        }`}
        title={isConfigured ? 'AI 学习助手' : '请先配置 API Key'}
      >
        🤖
      </button>

      {/* AI Chat Panel */}
      <ChatPanel
        stageId={stageId}
        stage={stage}
        currentTopic={selectedTopic}
        isOpen={chatOpen}
        onClose={() => setChatOpen(false)}
      />
    </div>
  );
}
