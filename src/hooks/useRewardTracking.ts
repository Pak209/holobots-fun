import { useCallback } from 'react';
import { useRewardStore } from '@/stores/rewardStore';
import { DailyMissionType } from '@/types/rewards';
import { useToast } from '@/components/ui/use-toast';

export const useRewardTracking = () => {
  const { toast } = useToast();
  
  const {
    updateMissionProgress,
    updateTrainingStreak,
    updateArenaStreak,
    updateLeagueProgression
  } = useRewardStore();

  // Track daily login
  const trackDailyLogin = useCallback(() => {
    updateMissionProgress('daily_login', 1);
  }, [updateMissionProgress]);

  // Track quest completion
  const trackQuestCompletion = useCallback(() => {
    updateMissionProgress('complete_quest', 1);
    toast({
      title: "Quest Progress!",
      description: "You've made progress on your daily quests mission.",
    });
  }, [updateMissionProgress, toast]);

  // Track training/fitness activity
  const trackTrainingSession = useCallback(() => {
    updateMissionProgress('train_holobot', 1);
    updateTrainingStreak(true);
    toast({
      title: "Training Progress!",
      description: "Training session tracked! Your streak continues.",
    });
  }, [updateMissionProgress, updateTrainingStreak, toast]);

  // Track arena battle participation
  const trackArenaBattle = useCallback((won: boolean = false) => {
    updateMissionProgress('arena_battle', 1);
    updateArenaStreak(won);
    
    if (won) {
      toast({
        title: "Arena Victory!",
        description: "Great win! Your arena streak continues.",
      });
    }
  }, [updateMissionProgress, updateArenaStreak, toast]);

  // Track booster pack opening
  const trackBoosterPackOpening = useCallback(() => {
    updateMissionProgress('open_booster_pack', 1);
    toast({
      title: "Pack Opening Progress!",
      description: "You've made progress on your pack collector mission.",
    });
  }, [updateMissionProgress, toast]);

  // Track fitness goal achievement
  const trackFitnessGoal = useCallback((steps: number) => {
    if (steps >= 10000) {
      updateMissionProgress('sync_fitness', steps);
    }
  }, [updateMissionProgress]);

  // Track holobot level up
  const trackHolobotLevelUp = useCallback(() => {
    updateMissionProgress('level_up_holobot', 1);
    toast({
      title: "Level Up Progress!",
      description: "Holobot leveled up! Mission progress updated.",
    });
  }, [updateMissionProgress, toast]);

  // Track league tier completion
  const trackLeagueTierCompletion = useCallback((tier: string) => {
    updateLeagueProgression(tier);
    toast({
      title: "League Tier Advanced!",
      description: `Congratulations on advancing to ${tier.replace('_', ' ')} league!`,
    });
  }, [updateLeagueProgression, toast]);

  // Update specific mission progress by type
  const updateMissionProgressByType = useCallback((type: DailyMissionType, amount: number = 1) => {
    updateMissionProgress(type, amount);
  }, [updateMissionProgress]);

  return {
    trackDailyLogin,
    trackQuestCompletion,
    trackTrainingSession,
    trackArenaBattle,
    trackBoosterPackOpening,
    trackFitnessGoal,
    trackHolobotLevelUp,
    trackLeagueTierCompletion,
    updateMissionProgressByType
  };
}; 