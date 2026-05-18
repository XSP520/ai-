import { Link } from 'react-router-dom';
import ProgressRing from './ProgressRing';

export default function StageCard({ stage, progress, index }) {
  const isComplete = progress === 100;

  return (
    <div className="relative flex items-start gap-6 group">
      {/* Timeline line and node */}
      <div className="hidden sm:flex flex-col items-center shrink-0">
        <div className="w-12 h-12 rounded-full flex items-center justify-center text-xl font-bold bg-primary text-white shadow-lg shadow-primary/25 z-10 transition-transform group-hover:scale-110">
          {stage.icon}
        </div>
        {index < 5 && (
          <div className="w-0.5 h-full min-h-[60px] bg-gradient-to-b from-primary to-accent mt-2" />
        )}
      </div>

      {/* Card */}
      <Link
        to={`/stage/${stage.id}`}
        className="flex-1 stage-card-shadow rounded-2xl p-5 sm:p-6 bg-white dark:bg-[#1E293B] gradient-border transition-all duration-300 hover:scale-[1.02]"
      >
        <div className="flex items-start justify-between gap-4 mb-3">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="sm:hidden text-xl">{stage.icon}</span>
              <h3 className="text-lg sm:text-xl font-bold text-[#0F172A] dark:text-white">
                {stage.title}
              </h3>
              {isComplete && (
                <span className="text-sm" title="阶段完成">
                  🏆
                </span>
              )}
            </div>
            <p className="text-sm text-[#64748B] dark:text-[#94A3B8]">
              {stage.subtitle}
            </p>
          </div>
          <div className="shrink-0">
            <ProgressRing progress={progress} size={56} strokeWidth={4} />
          </div>
        </div>

        <div className="flex items-center gap-4 text-xs text-[#64748B] dark:text-[#94A3B8]">
          <span className="flex items-center gap-1">
            <span>⏱️</span> {stage.duration}
          </span>
          <span className="flex items-center gap-1">
            <span>📖</span> {stage.topics.length} 个主题
          </span>
          <span className="flex items-center gap-1">
            <span>🛠️</span> {stage.projects.length} 个项目
          </span>
        </div>

        {/* Progress bar */}
        <div className="mt-3 h-1.5 rounded-full bg-[#E2E8F0] dark:bg-[#334155] overflow-hidden">
          <div
            className="h-full rounded-full bg-gradient-to-r from-primary to-accent transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* Completed badge */}
        {isComplete && (
          <div className="mt-3 flex items-center gap-1 text-xs font-medium text-accent">
            <span>✅</span> 阶段已完成
          </div>
        )}
      </Link>
    </div>
  );
}
