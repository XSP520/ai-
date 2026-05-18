import Timeline from '../components/Timeline';
import { useProgress } from '../hooks/useProgress';

export default function Roadmap() {
  const { getOverallProgress, getStageProgress } = useProgress();
  const overall = getOverallProgress();

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      {/* Header */}
      <div className="text-center mb-8 sm:mb-12">
        <h1 className="text-3xl sm:text-4xl font-bold text-[#0F172A] dark:text-white mb-3">
          📚 学习路线
        </h1>
        <p className="text-[#64748B] dark:text-[#94A3B8] text-lg max-w-xl mx-auto">
          6 个阶段，从 AI 基础概念到专业应用开发，一步一个脚印
        </p>

        {/* Overall progress */}
        <div className="mt-6 inline-flex items-center gap-3 px-6 py-3 rounded-2xl bg-white dark:bg-[#1E293B] stage-card-shadow gradient-border">
          <span className="text-sm text-[#64748B] dark:text-[#94A3B8]">总进度</span>
          <div className="w-32 h-2.5 rounded-full bg-[#E2E8F0] dark:bg-[#334155] overflow-hidden">
            <div
              className="h-full rounded-full bg-gradient-to-r from-primary to-accent transition-all duration-700"
              style={{ width: `${overall}%` }}
            />
          </div>
          <span className="text-sm font-bold text-primary">{overall}%</span>
        </div>

        <p className="mt-3 text-xs text-[#94A3B8] dark:text-[#64748B]">
          预计总学习时长约 23～35 周
        </p>
      </div>

      {/* Timeline */}
      <Timeline getStageProgress={getStageProgress} />
    </div>
  );
}
