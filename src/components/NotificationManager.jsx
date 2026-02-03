import { useEffect, useState } from 'react';
import { dietPlan, workoutPlans } from '../data/initialData';

const NotificationManager = () => {
    const [lastMealNotification, setLastMealNotification] = useState({});
    const [lastWorkoutReminder, setLastWorkoutReminder] = useState(0);

    const getTodayDate = () => new Date().toLocaleDateString('en-CA');

    useEffect(() => {
        // Request permission immediately
        if ('Notification' in window && Notification.permission === 'default') {
            Notification.requestPermission();
        }

        const interval = setInterval(() => {
            if ('Notification' in window && Notification.permission === 'granted') {
                checkNotifications();
            }
        }, 30000); // Check every 30 seconds

        return () => clearInterval(interval);
    }, [lastWorkoutReminder]); // Re-bind if state changes (though state updater handles it)

    const checkNotifications = () => {
        const now = new Date();
        const currentHour = now.getHours();
        const currentMinute = now.getMinutes();
        const timeStr = `${String(currentHour).padStart(2, '0')}:${String(currentMinute).padStart(2, '0')}`;

        const today = getTodayDate();
        const logs = JSON.parse(localStorage.getItem('treino_diario_logs') || '{}');
        const currentLog = logs[today] || { diet: { meals: {} }, workout: { completed: false, completedPlans: [], exercises: {} } };

        // 1. MEAL NOTIFICATIONS
        dietPlan.forEach(meal => {
            if (meal.time === timeStr) {
                // Check if we already notified for this meal ID today (in this session) to avoid multi-fire in the same minute
                if (!lastMealNotification[meal.id]) {
                    // Check if already done? Maybe remind anyway if it's correct time.
                    const isDone = currentLog.diet?.meals?.[meal.id];
                    if (!isDone) {
                        new Notification("🍽️ Hora de Comer!", {
                            body: `${meal.name}\nManter a constância é o segredo!`,
                            icon: '/pwa-192x192.png' // Utilizing public icon path if available
                        });
                        setLastMealNotification(prev => ({ ...prev, [meal.id]: true }));
                    }
                }
            } else {
                // Reset flag if time passed (simple latch)
                if (lastMealNotification[meal.id] && meal.time !== timeStr) {
                    setLastMealNotification(prev => ({ ...prev, [meal.id]: false }));
                }
            }
        });

        // 2. WORKOUT REMINDER (Persistent after Pre-Workout)
        const preWorkoutMeal = dietPlan.find(m => m.isPreWorkout);
        if (preWorkoutMeal) {
            const isPreWorkoutDone = currentLog.diet?.meals?.[preWorkoutMeal.id];

            // Check workout status
            // Consider "Done" if completed=true OR if completedPlans has entries (legacy/partial)
            // User said "nao precisa ser 100%".
            // Let's check raw exercise count vs total.

            let totalExercises = 0;
            let doneExercises = 0;
            const planId = currentLog.workout?.planId;
            if (planId) {
                const plan = workoutPlans.find(p => p.id === planId);
                if (plan) {
                    totalExercises = plan.exercises.length;
                    doneExercises = Object.values(currentLog.workout.exercises || {}).filter(Boolean).length;
                }
            }

            const isHardCompleted = currentLog.workout?.completed || (currentLog.workout?.completedPlans?.length > 0);
            const progress = totalExercises > 0 ? (doneExercises / totalExercises) * 100 : 0;

            // Logic: Pre-Workout Done AND Workout NOT started (progress === 0)
            if ((isPreWorkoutDone === true || isPreWorkoutDone === 'done') && !isHardCompleted && progress === 0) {

                // Remind every 30 min
                const nowTs = Date.now();
                if (nowTs - lastWorkoutReminder > 30 * 60 * 1000) {
                    new Notification("💪 BORA TREINAR!", {
                        body: "Você já mandou o pré-treino. Foco no objetivo! 🔥",
                        icon: '/pwa-192x192.png'
                    });
                    setLastWorkoutReminder(nowTs);
                }
            }
        }
    };

    return null;
};

export default NotificationManager;
