import { Link } from 'react-router-dom';
import { useProgress } from '../hooks/useProgress';
import roadmapData from '../data/roadmapData';
import DailyInspiration from '../components/DailyInspiration';
import AISuggestions from '../components/AISuggestions';

function getStudyDays() {
  const key = 'ai-roadmap-first-visit';
  try {
    let first = localStorage.getItem(key);
    if (!first) {
      first = new Date().toISOString();
      localStorage.setItem(key, first);
    }
    const ms = new Date() - new Date(first);
    return Math.max(1, Math.floor(ms / (1000 * 60 * 60 * 24)));
  } catch {
    return 1;
  }
}

const encouragements = [
  '每一步都是进步，坚持就是胜利！💪',
  '伟大的旅程始于勇敢的第一步 🚀',
  '今天的努力，是明天惊喜的铺垫 ✨',
  '学习 AI 最好的时间是十年前，其次是现在 🌟',
  '不要害怕犯错，每个 Bug 都是成长的机会 🔧',
];

export default function Home() {
  const { getOverallProgress, getStageProgress } = useProgress();
  const studyDays = getStudyDays();
  const overall = getOverallProgress();
  const encouragement = encouragements[studyDays % encouragements.length];

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      {/* Hero section */}
      <div className="text-center mb-12">
        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-[#0F172A] dark:text-white mb-4">
          <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            AI 进化之路
          </span>
        </h1>
        <p className="text-lg sm:text-xl text-[#64748B] dark:text-[#94A3B8] max-w-2xl mx-auto leading-relaxed">
          从零基础到 AI 应用开发的结构化学习路线
          <br />
          6 个阶段，循序渐进，带你走入人工智能的奇妙世界
        </p>
      </div>

      {/* Stats */}
      <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-8 mb-12">
        <div className="text-center px-8 py-4 rounded-2xl bg-white dark:bg-[#1E293B] stage-card-shadow gradient-border">
          <p className="text-3xl font-bold text-primary">{studyDays}</p>
          <p className="text-sm text-[#64748B] dark:text-[#94A3B8]">累计学习天数</p>
        </div>
        <div className="text-center px-8 py-4 rounded-2xl bg-white dark:bg-[#1E293B] stage-card-shadow gradient-border">
          <p className="text-3xl font-bold text-accent">{overall}%</p>
          <p className="text-sm text-[#64748B] dark:text-[#94A3B8]">总体完成度</p>
        </div>
        <div className="text-center px-8 py-4 rounded-2xl bg-white dark:bg-[#1E293B] stage-card-shadow gradient-border">
          <p className="text-3xl font-bold text-primary">{roadmapData.length}</p>
          <p className="text-sm text-[#64748B] dark:text-[#94A3B8]">学习阶段</p>
        </div>
      </div>

      {/* Daily Inspiration */}
      <div className="mb-12 max-w-2xl mx-auto">
        <DailyInspiration />
      </div>

      {/* Encouragement */}
      <div className="text-center mb-12 animate-fade-in">
        <p className="text-lg text-[#64748B] dark:text-[#94A3B8] italic">{encouragement}</p>
      </div>

      {/* Quick overview */}
      <div className="mb-12">
        <h2 className="text-2xl sm:text-3xl font-bold text-center text-[#0F172A] dark:text-white mb-6">
          学习路线概览
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {roadmapData.map((stage, i) => {
            const p = getStageProgress(stage.id);
            return (
              <Link
                key={stage.id}
                to={`/stage/${stage.id}`}
                className="stage-card-shadow rounded-xl p-5 bg-white dark:bg-[#1E293B] gradient-border hover:scale-[1.02] transition-all duration-300"
              >
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-2xl">{stage.icon}</span>
                  <div>
                    <h3 className="font-bold text-[#0F172A] dark:text-white">{stage.title}</h3>
                    <p className="text-xs text-[#64748B] dark:text-[#94A3B8]">{stage.duration}</p>
                  </div>
                </div>
                <p className="text-sm text-[#64748B] dark:text-[#94A3B8] line-clamp-2 mb-3">
                  {stage.subtitle}
                </p>
                <div className="h-1.5 rounded-full bg-[#E2E8F0] dark:bg-[#334155] overflow-hidden">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-primary to-accent transition-all duration-500"
                    style={{ width: `${p}%` }}
                  />
                </div>
                <p className="text-xs text-right mt-1 text-[#94A3B8] dark:text-[#64748B]">{p}%</p>
              </Link>
            );
          })}
        </div>
      </div>

      {/* AI Suggestions */}
      <div className="mb-12 max-w-2xl mx-auto">
        <AISuggestions />
      </div>

      {/* CTA */}
      <div className="text-center">
        <Link
          to="/roadmap"
          className="inline-flex items-center gap-2 px-8 py-4 rounded-2xl bg-gradient-to-r from-primary to-accent text-white font-bold text-lg shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30 transition-all hover:scale-105"
        >
          开始学习 🚀
        </Link>
      </div>
    </div>
  );
}
