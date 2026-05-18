import StageCard from './StageCard';
import roadmapData from '../data/roadmapData';

export default function Timeline({ getStageProgress }) {
  return (
    <div className="flex flex-col gap-6 sm:gap-8">
      {roadmapData.map((stage, index) => (
        <StageCard
          key={stage.id}
          stage={stage}
          progress={getStageProgress(stage.id)}
          index={index}
        />
      ))}
    </div>
  );
}
