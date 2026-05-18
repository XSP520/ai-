import { useCallback, useMemo } from 'react';
import { useLocalStorage } from './useLocalStorage';
import roadmapData from '../data/roadmapData';

const STORAGE_KEY = 'ai-roadmap-progress';

function buildInitialProgress() {
  const progress = {};
  roadmapData.forEach((stage) => {
    progress[stage.id] = {
      topics: {},
      projects: {},
      notes: '',
      started: false,
    };
    stage.topics.forEach((t) => {
      progress[stage.id].topics[t.id] = false;
    });
    stage.projects.forEach((p) => {
      progress[stage.id].projects[p.id] = false;
    });
  });
  return progress;
}

export function useProgress() {
  const [progress, setProgress] = useLocalStorage(
    STORAGE_KEY,
    buildInitialProgress()
  );

  const toggleTopic = useCallback(
    (stageId, topicId) => {
      setProgress((prev) => {
        const stage = prev[stageId] || {};
        const topics = { ...(stage.topics || {}) };
        const newValue = !topics[topicId];
        topics[topicId] = newValue;
        return {
          ...prev,
          [stageId]: {
            ...stage,
            topics,
            started: true,
          },
        };
      });
    },
    [setProgress]
  );

  const toggleProject = useCallback(
    (stageId, projectId) => {
      setProgress((prev) => {
        const stage = prev[stageId] || {};
        const projects = { ...(stage.projects || {}) };
        projects[projectId] = !projects[projectId];
        return {
          ...prev,
          [stageId]: {
            ...stage,
            projects,
            started: true,
          },
        };
      });
    },
    [setProgress]
  );

  const setNotes = useCallback(
    (stageId, notes) => {
      setProgress((prev) => ({
        ...prev,
        [stageId]: {
          ...(prev[stageId] || {}),
          notes,
          started: true,
        },
      }));
    },
    [setProgress]
  );

  const getStageProgress = useCallback(
    (stageId) => {
      const stage = progress[stageId];
      if (!stage) return 0;
      const topicValues = Object.values(stage.topics || {});
      const projectValues = Object.values(stage.projects || {});
      const all = [...topicValues, ...projectValues];
      if (all.length === 0) return 0;
      const completed = all.filter(Boolean).length;
      return Math.round((completed / all.length) * 100);
    },
    [progress]
  );

  const getOverallProgress = useCallback(() => {
    const percentages = roadmapData.map((s) => getStageProgress(s.id));
    if (percentages.length === 0) return 0;
    return Math.round(percentages.reduce((a, b) => a + b, 0) / percentages.length);
  }, [getStageProgress]);

  const getCompletedStages = useCallback(() => {
    return roadmapData.filter((s) => getStageProgress(s.id) === 100);
  }, [getStageProgress]);

  const getStageData = useCallback(
    (stageId) => {
      return progress[stageId] || buildInitialProgress()[stageId];
    },
    [progress]
  );

  const resetAll = useCallback(() => {
    setProgress(buildInitialProgress());
  }, [setProgress]);

  return {
    progress,
    toggleTopic,
    toggleProject,
    setNotes,
    getStageProgress,
    getOverallProgress,
    getCompletedStages,
    getStageData,
    resetAll,
  };
}
