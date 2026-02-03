import { useState, useEffect } from 'react';

export const useWorkoutData = () => {
    const [history, setHistory] = useState(() => {
        const saved = localStorage.getItem('workout_history');
        return saved ? JSON.parse(saved) : {};
    });

    const [currentWorkout, setCurrentWorkout] = useState(() => {
        const saved = localStorage.getItem('current_workout_state');
        return saved ? JSON.parse(saved) : null;
    });

    useEffect(() => {
        localStorage.setItem('workout_history', JSON.stringify(history));
    }, [history]);
    
    useEffect(() => {
        if (currentWorkout) {
            localStorage.setItem('current_workout_state', JSON.stringify(currentWorkout));
        } else {
            localStorage.removeItem('current_workout_state');
        }
    }, [currentWorkout]);

    const startWorkout = (planId) => {
        const today = new Date().toISOString().split('T')[0];
        setCurrentWorkout({
            planId,
            date: today,
            exercises: {}, // { exerciseId: { done: true, weight: 10 } }
            startTime: Date.now()
        });
    };

    const toggleExercise = (exerciseId, weight = null) => {
        if (!currentWorkout) return;
        
        setCurrentWorkout(prev => {
            const isDone = !!prev.exercises[exerciseId]?.done;
            return {
                ...prev,
                exercises: {
                    ...prev.exercises,
                    [exerciseId]: {
                        done: !isDone,
                        weight: weight || prev.exercises[exerciseId]?.weight
                    }
                }
            };
        });
    };

    const finishWorkout = () => {
        if (!currentWorkout) return;
        
        const timestamp = new Date().toISOString();
        setHistory(prev => ({
            ...prev,
            [timestamp]: { ...currentWorkout, completedAt: timestamp }
        }));
        setCurrentWorkout(null);
    };

    const cancelWorkout = () => {
        setCurrentWorkout(null);
    };

    return {
        history,
        currentWorkout,
        startWorkout,
        toggleExercise,
        finishWorkout,
        cancelWorkout
    };
};
