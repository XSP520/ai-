import { Link } from 'react-router-dom';
import { useProgress } from '../hooks/useProgress';
import ProgressRing from '../components/ProgressRing';
import roadmapData from '../data/roadmapData';

export default function Progress() {
  const { getOverallProgress, getStageProgress, getCompletedStages } =
    useProgress();
  const overall = getOverallProgress();
  const completedStages = getCompletedStages();

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      <div className="text-center mb-8 sm:mb-12">
        <h1 className="text-3xl sm:text-4xl font-bold text-[#0F172A] dark:text-white mb-3">
          📊 学习进度
        </h1>
        <p className="text-[#64748B] dark:text-[#94A3B8] text-lg">
          追踪你的每一步成长
        </p>
      </div>

      {/* Overall progress */}
      <div className="flex flex-col sm:flex-row items-center justify-center gap-6 mb-12">
        <div className="text-center">
          <ProgressRing progress={overall} size={120} strokeWidth={8} />
        </div>
        <div className="text-center sm:text-left">
          <p className="text-4xl font-bold text-primary">{overall}%</p>
          <p className="text-[#64748B] dark:text-[#94A3B8]">总体完成度</p>
          <p className="text-sm text-[#94A3B8] dark:text-[#64748B] mt-1">
            已完成 {completedStages.length} / {roadmapData.length} 个阶段
          </p>
        </div>
      </div>

      {/* Stage progress list */}
      <div className="max-w-2xl mx-auto mb-12">
        <h2 className="text-xl font-bold text-[#0F172A] dark:text-white mb-4 text-center">
          各阶段进度
        </h2>
        <div className="flex flex-col gap-3">
          {roadmapData.map((stage) => {
            const p = getStageProgress(stage.id);
            return (
              <Link
                key={stage.id}
                to={`/stage/${stage.id}`}
                className="stage-card-shadow rounded-xl p-4 bg-white dark:bg-[#1E293B] gradient-border hover:scale-[1.01] transition-all duration-300"
              >
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{stage.icon}</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <h3 className="font-medium text-[#0F172A] dark:text-white text-sm sm:text-base">
                        {stage.title}
                      </h3>
                      <span className="text-sm font-bold text-primary ml-2">
                        {p}%
                      </span>
                    </div>
                    <div className="h-2 rounded-full bg-[#E2E8F0] dark:bg-[#334155] overflow-hidden">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-primary to-accent transition-all duration-500"
                        style={{ width: `${p}%` }}
                      />
                    </div>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Achievement wall */}
      <div className="max-w-2xl mx-auto">
        <h2 className="text-xl font-bold text-[#0F172A] dark:text-white mb-4 text-center">
          🏆 成就墙
        </h2>
        {completedStages.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {completedStages.map((stage) => (
              <Link
                key={stage.id}
                to={`/stage/${stage.id}`}
                className="stage-card-shadow rounded-xl p-5 bg-white dark:bg-[#1E293B] gradient-border text-center hover:scale-[1.02] transition-all duration-300"
              >
                <span className="text-4xl block mb-2">{stage.icon}</span>
                <h3 className="font-bold text-[#0F172A] dark:text-white">
                  {stage.title}
                </h3>
                <p className="text-sm text-[#64748B] dark:text-[#94A3B8] mt-1">
                  {stage.subtitle}
                </p>
                <p className="text-accent font-medium text-sm mt-2">✅ 已完成</p>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 text-[#94A3B8] dark:text-[#64748B]">
            <p className="text-4xl mb-3">🎯</p>
            <p>还没有完成的阶段</p>
            <p className="text-sm mt-1">开始学习，解锁你的第一个成就吧！</p>
            <Link
              to="/roadmap"
              className="inline-block mt-4 text-primary hover:underline font-medium"
            >
              前往学习路线 →
            </Link>
          </div>
        )}
      </div>

      {/* Stats summary */}
      <div className="max-w-2xl mx-auto mt-12">
        <div className="stage-card-shadow rounded-2xl p-6 bg-white dark:bg-[#1E293B] gradient-border">
          <h3 className="font-bold text-lg text-[#0F172A] dark:text-white mb-4 text-center">
            📈 学习统计
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
            <div>
              <p className="text-2xl font-bold text-primary">{roadmapData.length}</p>
              <p className="text-xs text-[#64748B] dark:text-[#94A3B8]">总阶段</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-accent">
                {roadmapData.reduce((sum, s) => sum + s.topics.length, 0)}
              </p>
              <p className="text-xs text-[#64748B] dark:text-[#94A3B8]">总知识点</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-primary">
                {roadmapData.reduce((sum, s) => sum + s.projects.length, 0)}
              </p>
              <p className="text-xs text-[#64748B] dark:text-[#94A3B8]">总项目</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-accent">
                {completedStages.length}
              </p>
              <p className="text-xs text-[#64748B] dark:text-[#94A3B8]">已完成阶段</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
