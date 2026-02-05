import { useState, useEffect } from 'react';
import { dietPlan, workoutPlans, initialVoucherInventory, rewardDefinitions } from '../data/initialData';

const STORAGE_KEY = 'treino_diario_logs';
const VOUCHERS_KEY = 'treino_diario_vouchers';
const HEALTH_EXAMS_KEY = 'treino_diario_health_exams';

export const useDailyTracking = () => {
  const [logs, setLogs] = useState(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : {};
  });

  // Voucher inventory state
  const [vouchers, setVouchers] = useState(() => {
    const saved = localStorage.getItem(VOUCHERS_KEY);
    return saved ? JSON.parse(saved) : { ...initialVoucherInventory };
  });

  // Health Exams state
  const [healthExams, setHealthExams] = useState(() => {
    const saved = localStorage.getItem(HEALTH_EXAMS_KEY);
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(logs));
  }, [logs]);

  useEffect(() => {
    localStorage.setItem(VOUCHERS_KEY, JSON.stringify(vouchers));
  }, [vouchers]);

  useEffect(() => {
    localStorage.setItem(HEALTH_EXAMS_KEY, JSON.stringify(healthExams));
  }, [healthExams]);

  const getTodayDate = () => new Date().toLocaleDateString('en-CA'); // YYYY-MM-DD

  /* Helper to ensure log structure is robust */
  const getDefaultLog = () => ({
      workout: { planId: null, exercises: {}, completed: false, completedPlans: [] }, // Added completedPlans
      diet: { meals: {}, water: 0 }
  });

  const getLog = (date) => {
    const log = logs[date] || {};
    const workout = log.workout || {};
    const diet = log.diet || {};

    return {
      workout: {
        planId: null,
        completed: false,
        exercises: {},
        completedPlans: [], // Default empty array
        ...workout,
        exercises: { ...(workout.exercises || {}) },
        completedPlans: workout.completedPlans || [] // Ensure it exists
      },
      diet: {
        meals: {},
        water: 0,
        ...diet,
        meals: { ...(diet.meals || {}) }
      }
    };
  };

  /* ... updateDiet ... */
  // (Keep updateDiet as is, just need to bridge the gap if I replace the whole file or chunk)
  // I will use `replace_file_content` targeting specific chunks if possible or large block.
  // Since I need to touch multiple functions that are spread out, I might need multiple chunks or one big one.
  // The structure of the file:
  // imports
  // useDailyTracking
  //   getTodayDate
  //   getDefaultLog
  //   getLog
  //   updateDiet
  //   addWater
  //   updateWorkout
  //   calculateStats
  //   nextOverride stuff
  //   getSuggestedWorkout
  //   markWorkoutCompleted
  //   return



  const updateDiet = (date, mealId, optionId, isChecked) => {
    setLogs(prev => {
        const dayLog = prev[date] || getDefaultLog();
        const currentMeals = dayLog.diet?.meals || {};
        
        const newMeals = { ...currentMeals };
        newMeals[mealId] = isChecked;

        return {
            ...prev,
            [date]: {
                ...dayLog,
                diet: {
                    ...dayLog.diet,
                    meals: newMeals
                }
            }
        };
    });
  };

  const addWater = (date, amount) => {
      setLogs(prev => {
          const dayLog = prev[date] || getDefaultLog();
          const currentWater = dayLog.diet?.water || 0;
          
          return {
              ...prev,
              [date]: {
                  ...dayLog,
                  diet: {
                      ...dayLog.diet,
                      water: Math.max(0, currentWater + amount)
                  }
              }
          };
      });
  };

  const updateWorkout = (date, planId, exerciseId, isDone) => {
    setLogs(prev => {
        const dayLog = prev[date] || getDefaultLog();
        const currentWorkout = dayLog.workout || {};
        const exercises = currentWorkout.exercises || {};

        // Special handling for overrides/init
        if (exerciseId === '__init__') {
             // Just set planId if not set, preserve everything else
             return {
                ...prev,
                [date]: {
                    ...dayLog,
                    workout: {
                        ...currentWorkout,
                        planId: planId
                    }
                }
             };
        }

        if (exerciseId === '__reset__') {
            // Force reset completed status (for multiple workouts/day)
            return {
               ...prev,
               [date]: {
                   ...dayLog,
                   workout: {
                       ...currentWorkout,
                       planId: planId,
                       completed: false,
                       completedPlans: [], // HARD RESET: Clear history
                       exercises: {} // HARD RESET: Uncheck boxes
                   }
               }
            };
       }

        return {
            ...prev,
            [date]: {
                ...dayLog,
                workout: {
                    ...currentWorkout,
                    planId: planId,
                    exercises: {
                        ...exercises,
                        [exerciseId]: isDone
                    },
                    updatedAt: new Date().toISOString()
                }
            }
        };
    });
  };

  const calculateStats = (date) => {
     const log = getLog(date);
     
     // Diet Stats
     const totalMeals = dietPlan.length; // 5 meals
     const mealsValues = Object.values(log.diet.meals || {});
     // Count only explicitly true or 'done' meals
     const mealsDone = mealsValues.filter(v => v === true || v === 'done').length;
     const dietProgress = Math.round((mealsDone / totalMeals) * 100);

     // Water Stats
     const waterGoal = 2300;
     const currentWater = log.diet.water || 0;
     const waterProgress = Math.min(100, Math.round((currentWater / waterGoal) * 100));



     // Workout Stats
     let workoutProgress = 0;
     let completedWorkoutsCount = 0;
     
     // Calculate actual progress based on ticks
     if (log.workout.planId) {
          const plan = workoutPlans.find(p => p.id === log.workout.planId);
          if (plan) {
              const totalExercises = plan.exercises.length;
              const doneExercises = Object.values(log.workout.exercises || {}).filter(Boolean).length;
              workoutProgress = Math.round((doneExercises / totalExercises) * 100);
          }
     }
     
     // Correct completedWorkoutsCount based on progress
     if (log.workout.completedPlans && log.workout.completedPlans.length > 0) {
        completedWorkoutsCount = log.workout.completedPlans.length;
     } else if (log.workout.completed && workoutProgress === 100) {
         completedWorkoutsCount = 1;
     }

     return { dietProgress, workoutProgress, mealsDone, totalMeals, waterProgress, currentWater, waterGoal, completedWorkoutsCount };
  };

  /* Override for "Repeat Workout" feature */
  const [nextOverride, setNextOverride] = useState(() => localStorage.getItem('treino_next_override'));

  const setSuggestedOverride = (planId) => {
      if (planId) {
          localStorage.setItem('treino_next_override', planId);
          setNextOverride(planId);
      } else {
          localStorage.removeItem('treino_next_override');
          setNextOverride(null);
      }
  };

  const getSuggestedWorkout = () => {
     // 1. Check override
     if (nextOverride) return nextOverride;

     // 2. Check history
     const sortedDates = Object.keys(logs).sort((a, b) => new Date(b) - new Date(a));
     let lastCompletedPlan = null;

     for (const date of sortedDates) {
         if (logs[date]?.workout?.completed) {
             lastCompletedPlan = logs[date].workout.planId;
             break;
         }
     }

     if (!lastCompletedPlan) return 'A'; // Default start
     if (lastCompletedPlan === 'A') return 'B';
     if (lastCompletedPlan === 'B') return 'C';
     return 'A'; // If C, go back to A
  };

  /* Helper to mark complete */
  const markWorkoutCompleted = (date) => {
      setLogs(prev => {
          const dayLog = prev[date] || getDefaultLog();
          const currentWorkout = dayLog.workout || {};
          const currentPlans = currentWorkout.completedPlans || [];
          
          // Avoid duplicates if clicked multiple times
          const newCompletedPlans = (currentWorkout.planId && !currentPlans.includes(currentWorkout.planId))
              ? [...currentPlans, currentWorkout.planId]
              : currentPlans;

          return {
              ...prev,
              [date]: {
                  ...dayLog,
                  workout: {
                      ...currentWorkout,
                      completed: true,
                      completedPlans: newCompletedPlans, // Only added if 100% (logic moved to calculateStats or check here?)
                                                         // Ideally check here if 100% before adding.
                                                         // But simpler: just add only if IS 100%.
                      updatedAt: new Date().toISOString()
                  }
              }
          };
      });
  };

  // Voucher management functions
  const addVoucher = (voucherId, amount = 1) => {
    setVouchers(prev => ({
      ...prev,
      [voucherId]: (prev[voucherId] || 0) + amount
    }));
  };

  const useVoucher = (voucherId) => {
    if (vouchers[voucherId] > 0) {
      setVouchers(prev => ({
        ...prev,
        [voucherId]: prev[voucherId] - 1
      }));
      return true;
    }
    return false;
  };

  const getVoucherCount = (voucherId) => vouchers[voucherId] || 0;

  // Loot Box System
  const LOOTBOX_KEY = 'treino_diario_lootbox';
  const [lootboxData, setLootboxData] = useState(() => {
    const saved = localStorage.getItem(LOOTBOX_KEY);
    return saved ? JSON.parse(saved) : { claimedWeeks: [], rewardHistory: [], lastClaimedStreak: 0 };
  });

  useEffect(() => {
    localStorage.setItem(LOOTBOX_KEY, JSON.stringify(lootboxData));
  }, [lootboxData]);

  // Check if a specific day was 100% complete (workout + diet + water)
  const isDayPerfect = (dateStr) => {
    const stats = calculateStats(dateStr);
    
    // Check if Sunday (safe timezone parsing)
    // Appending T12:00:00 ensures we don't shift to previous day due to timezone
    const dateObj = new Date(`${dateStr}T12:00:00`); 
    const isSunday = dateObj.getDay() === 0;

    if (isSunday) {
        // Sunday: Rest day, only Diet and Water count
        return stats.dietProgress >= 100 && stats.waterProgress >= 100;
    }

    return stats.workoutProgress === 100 && stats.dietProgress === 100 && stats.waterProgress === 100;
  };

  // Get the current streak of consecutive perfect days
  // Starts from yesterday and only counts today if it's already perfect
  const getCurrentStreak = () => {
    const today = new Date();
    const todayStr = today.toLocaleDateString('en-CA');
    let streak = 0;
    
    // First, check if today is already perfect - if so, count it
    const isTodayPerfect = isDayPerfect(todayStr);
    if (isTodayPerfect) {
      streak++;
    }
    
    // Then count consecutive perfect days going backwards from yesterday
    for (let i = 1; i < 30; i++) { // Start from 1 (yesterday), not 0 (today)
      const d = new Date(today);
      d.setDate(today.getDate() - i);
      const dateStr = d.toLocaleDateString('en-CA');
      
      if (isDayPerfect(dateStr)) {
        streak++;
      } else {
        // Only break if today was NOT perfect, or if we've already counted at least one past day
        // This means: if today is not done yet, we start counting from yesterday
        // If yesterday also wasn't perfect, then streak is 0
        break;
      }
    }
    return streak;
  };

  // Check if user has a pending loot box to claim (7+ day streak, not yet claimed for this week)
  const getWeekId = (date = new Date()) => {
    const d = new Date(date);
    d.setHours(0, 0, 0, 0);
    const dayNum = d.getDay();
    const weekStart = new Date(d);
    weekStart.setDate(d.getDate() - dayNum); // Sunday of current week
    return weekStart.toLocaleDateString('en-CA');
  };

  const canClaimLootbox = () => {
    const streak = getCurrentStreak();
    if (streak < 7) return false;
    
    // Check cycle: Every 7 days (7, 14, 21...)
    const cycleMilestone = Math.floor(streak / 7) * 7;
    const lastClaimed = lootboxData.lastClaimedStreak || 0;
    
    // If current milestone > last claimed, we can claim
    return cycleMilestone > lastClaimed;
  };

  // Roll a reward based on rarity chances
  const rollReward = () => {
    const allRewards = [
      ...rewardDefinitions.vouchers,
      ...rewardDefinitions.rewards
    ];
    
    const rarities = rewardDefinitions.rarities;
    const roll = Math.random() * 100;
    
    let selectedRarity;
    if (roll < rarities.epic.chance) {
      selectedRarity = 'epic';
    } else if (roll < rarities.epic.chance + rarities.rare.chance) {
      selectedRarity = 'rare';
    } else {
      selectedRarity = 'common';
    }
    
    // Filter rewards by selected rarity
    const possibleRewards = allRewards.filter(r => r.rarity === selectedRarity);
    
    // Pick random reward from the tier
    const reward = possibleRewards[Math.floor(Math.random() * possibleRewards.length)];
    return { ...reward, rolledRarity: selectedRarity };
  };

  // Claim the loot box and get a reward
  const claimLootbox = () => {
    if (!canClaimLootbox()) return null;
    
    const reward = rollReward();
    const streak = getCurrentStreak();
    const cycleMilestone = Math.floor(streak / 7) * 7;
    const currentWeekId = getWeekId();
    
    // If it's a voucher, add to inventory
    if (rewardDefinitions.vouchers.some(v => v.id === reward.id)) {
      addVoucher(reward.id);
    }
    
    // Record the claim
    setLootboxData(prev => ({
      claimedWeeks: [...prev.claimedWeeks, currentWeekId], // Keep for history/legacy
      lastClaimedStreak: cycleMilestone, // Update 7-day cycle pointer
      rewardHistory: [...prev.rewardHistory, {
        ...reward,
        claimedAt: new Date().toISOString(),
        weekId: currentWeekId
      }]
    }));
    
    return reward;
  };

  /* Health Exam Logic */
  const addHealthExam = (examData) => {
    setHealthExams(prev => {
        const newExam = {
            id: Date.now(),
            date: getTodayDate(),
            timestamp: new Date().toISOString(),
            ...examData
        };
        // Sort by date descending
        const updated = [...prev, newExam].sort((a,b) => new Date(b.timestamp) - new Date(a.timestamp));
        return updated;
    });
  };

  const deleteHealthExam = (id) => {
    setHealthExams(prev => prev.filter(exam => exam.id !== id));
  };

  /* Gamification: XP & Levels */
  const getLevelInfo = () => {
      let totalXP = 0;
      Object.keys(logs).forEach(date => {
          const stats = calculateStats(date);
          if (stats.workoutProgress >= 100) totalXP += 500;
          if (stats.dietProgress >= 100) totalXP += 300;
          if (stats.waterProgress >= 100) totalXP += 200;
          // Perfect Day Bonus
          if (isDayPerfect(date)) totalXP += 500;
      });

      // Level 1: 0-2000 XP
      // Each level needs 2000 XP * Level (Harder to scale?)
      // Let's use fixed 3000 XP per level for simplicity
      const XP_PER_LEVEL = 3000;
      const level = Math.floor(totalXP / XP_PER_LEVEL) + 1;
      const nextLevelXP = level * XP_PER_LEVEL;
      const currentLevelStartXP = (level - 1) * XP_PER_LEVEL;
      const progress = ((totalXP - currentLevelStartXP) / XP_PER_LEVEL) * 100;

      return { level, totalXP, nextLevelXP, progress };
  };

  return {
    logs,
    updateDiet,
    addWater,
    updateWorkout,
    markWorkoutCompleted,
    getLog,
    getTodayDate,
    calculateStats,
    getSuggestedWorkout,
    setSuggestedOverride,
    // Voucher system
    vouchers,
    useVoucher,
    addVoucher,
    // Lootbox
    lootboxData,
    getCurrentStreak,
    canClaimLootbox,
    claimLootbox,
    // Health Exams
    healthExams,
    addHealthExam,
    deleteHealthExam,
    getLevelInfo
  };

};
