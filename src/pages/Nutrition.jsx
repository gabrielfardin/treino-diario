import { dietPlan } from '../data/initialData';
import { useDailyTracking } from '../hooks/useDailyTracking';
import { useState } from 'react';
import { Utensils, Coffee, Moon, Sun, Home, GraduationCap, CheckCircle2, Circle, Droplets, Plus, Minus, X, Flame } from 'lucide-react';

const Nutrition = () => {
    const { getLog, updateDiet, addWater, getTodayDate, calculateStats } = useDailyTracking();
    const [snackScenario, setSnackScenario] = useState('A');
    const today = getTodayDate();
    const log = getLog(today);
    const { dietProgress, currentWater, waterGoal, waterProgress, mealsDone, totalMeals } = calculateStats(today);

    const handleToggleMeal = (mealId, isChecked) => {
        updateDiet(today, mealId, null, isChecked);
    };

    const getMealIcon = (id) => {
        switch (id) {
            case 'breakfast': return <Coffee size={20} />;
            case 'lunch': return <Utensils size={20} />;
            case 'snack': return <Sun size={20} />;
            case 'dinner': return <Utensils size={20} />;
            case 'supper': return <Moon size={20} />;
            default: return <Utensils size={20} />;
        }
    };

    const getMealColor = (id) => {
        switch (id) {
            case 'breakfast': return '#FF6B35';
            case 'lunch': return '#FFD700';
            case 'snack': return '#FF073A';
            case 'dinner': return '#00BFFF';
            case 'supper': return '#8B5CF6';
            default: return 'var(--accent-color)';
        }
    };

    return (
        <div className="container fade-in" style={{ paddingBottom: '120px' }}>

            {/* Header Stats */}
            <header style={{ marginBottom: '1.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
                    <div style={{
                        background: 'var(--accent-soft)',
                        padding: '0.5rem',
                        borderRadius: '12px'
                    }}>
                        <Flame size={24} color="var(--accent-color)" />
                    </div>
                    <div>
                        <h1 style={{ margin: 0, fontSize: '1.5rem' }}>Nutrição</h1>
                        <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                            {mealsDone}/{totalMeals} refeições concluídas
                        </p>
                    </div>
                </div>

                {/* Progress Bar */}
                <div className="progress-bar">
                    <div className="progress-bar-fill" style={{
                        width: `${dietProgress}%`,
                        background: dietProgress >= 100
                            ? 'linear-gradient(90deg, var(--success), #00FF7F)'
                            : 'linear-gradient(90deg, var(--accent-color), #FF4D6D)'
                    }} />
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '0.5rem', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                    <span>Progresso</span>
                    <span style={{ color: dietProgress >= 100 ? 'var(--success)' : 'var(--text-primary)' }}>{dietProgress}%</span>
                </div>
            </header>

            {/* Water Tracking Card */}
            <section className="card" style={{
                background: 'linear-gradient(135deg, rgba(0, 191, 255, 0.1), rgba(0, 191, 255, 0.02))',
                border: '1px solid rgba(0, 191, 255, 0.3)',
                marginBottom: '1.5rem',
                position: 'relative',
                overflow: 'hidden'
            }}>
                {/* Animated Water Background */}
                <div style={{
                    position: 'absolute',
                    bottom: 0,
                    left: 0,
                    right: 0,
                    height: `${Math.min(100, waterProgress)}%`,
                    background: 'linear-gradient(to top, rgba(0, 191, 255, 0.2), rgba(0, 191, 255, 0.05))',
                    transition: 'height 0.5s ease-out',
                    borderRadius: '0 0 16px 16px'
                }} />

                <div style={{ position: 'relative', zIndex: 1 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                            <div style={{
                                background: 'var(--secondary-color)',
                                padding: '0.625rem',
                                borderRadius: '12px',
                                boxShadow: '0 0 20px var(--secondary-glow)'
                            }}>
                                <Droplets size={22} color="#fff" fill="#fff" />
                            </div>
                            <div>
                                <h2 style={{ fontSize: '1.1rem', margin: 0, fontWeight: 600 }}>Hidratação</h2>
                                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: 0 }}>
                                    Meta: {(waterGoal / 1000).toFixed(1)}L
                                </p>
                            </div>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                            <div style={{ fontSize: '1.75rem', fontWeight: 'bold', color: 'var(--secondary-color)' }}>
                                {(currentWater / 1000).toFixed(1)}L
                            </div>
                            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                                {waterProgress >= 100 ? '✓ Meta atingida!' : `${Math.round(waterProgress)}%`}
                            </div>
                        </div>
                    </div>

                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <button
                            onClick={() => addWater(today, 250)}
                            style={{
                                flex: 1, padding: '0.75rem',
                                background: 'rgba(0, 191, 255, 0.15)',
                                border: '1px solid rgba(0, 191, 255, 0.3)',
                                color: 'var(--secondary-color)',
                                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.25rem',
                                fontSize: '0.9rem', fontWeight: 600
                            }}
                        >
                            <Plus size={16} /> 250ml
                        </button>
                        <button
                            onClick={() => addWater(today, 500)}
                            style={{
                                flex: 1, padding: '0.75rem',
                                background: 'var(--secondary-color)',
                                color: '#000',
                                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.25rem',
                                fontSize: '0.9rem', fontWeight: 600
                            }}
                        >
                            <Plus size={16} /> 500ml
                        </button>
                        {currentWater > 0 && (
                            <button
                                onClick={() => addWater(today, -250)}
                                style={{
                                    padding: '0.75rem 1rem',
                                    background: 'rgba(255, 7, 58, 0.1)',
                                    border: '1px solid rgba(255, 7, 58, 0.3)',
                                    color: 'var(--danger)',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center'
                                }}
                            >
                                <Minus size={16} />
                            </button>
                        )}
                    </div>
                </div>
            </section>

            {/* Meals Section */}
            <div style={{ marginBottom: '1rem' }}>
                <h2 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '1rem', color: 'var(--text-muted)' }}>
                    REFEIÇÕES DO DIA
                </h2>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {dietPlan.map((meal) => {
                    let options = meal.options;
                    const status = log.diet.meals[meal.id];
                    const isDone = status === true;
                    const isSkipped = status === 'skipped';
                    const mealColor = getMealColor(meal.id);

                    if (meal.hasScenarios) {
                        const scenario = meal.scenarios.find(s => s.id === snackScenario);
                        options = scenario.options;
                    }

                    return (
                        <section
                            key={meal.id}
                            className="card"
                            style={{
                                margin: 0,
                                padding: 0,
                                overflow: 'hidden',
                                border: isDone ? '1px solid var(--success)'
                                    : isSkipped ? '1px solid var(--danger)'
                                        : '1px solid rgba(255,255,255,0.06)',
                                opacity: isSkipped ? 0.6 : 1,
                                transition: 'all 0.25s ease'
                            }}
                        >
                            {/* Meal Header */}
                            <div style={{
                                background: isDone
                                    ? 'linear-gradient(135deg, rgba(0, 255, 127, 0.1), transparent)'
                                    : isSkipped
                                        ? 'linear-gradient(135deg, rgba(255, 7, 58, 0.1), transparent)'
                                        : 'rgba(255,255,255,0.02)',
                                padding: '1rem',
                                borderBottom: '1px solid rgba(255,255,255,0.05)'
                            }}>
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                        <div style={{
                                            width: '40px', height: '40px', borderRadius: '12px',
                                            background: isDone
                                                ? 'var(--success)'
                                                : isSkipped
                                                    ? 'var(--danger)'
                                                    : `${mealColor}20`,
                                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                                            color: isDone || isSkipped ? '#000' : mealColor,
                                            transition: 'all 0.25s ease'
                                        }}>
                                            {isDone ? <CheckCircle2 size={20} /> : isSkipped ? <X size={20} /> : getMealIcon(meal.id)}
                                        </div>
                                        <div>
                                            <h2 style={{
                                                margin: 0, fontSize: '1rem', fontWeight: 600,
                                                color: isDone ? 'var(--text-muted)' : 'var(--text-primary)',
                                                textDecoration: isSkipped ? 'line-through' : 'none'
                                            }}>
                                                {meal.name}
                                            </h2>
                                            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                                                {meal.name.split(' - ')[0]}
                                            </span>
                                        </div>
                                    </div>

                                    <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                                        {/* Skip Button */}
                                        <button
                                            onClick={() => handleToggleMeal(meal.id, isSkipped ? null : 'skipped')}
                                            style={{
                                                background: isSkipped ? 'var(--danger)' : 'rgba(255,255,255,0.05)',
                                                border: '1px solid',
                                                borderColor: isSkipped ? 'var(--danger)' : 'rgba(255,255,255,0.15)',
                                                color: isSkipped ? '#fff' : 'var(--text-muted)',
                                                borderRadius: '8px',
                                                width: '40px',
                                                height: '40px',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                padding: 0
                                            }}
                                        >
                                            <X size={18} />
                                        </button>

                                        {/* Done Button */}
                                        <button
                                            onClick={() => handleToggleMeal(meal.id, isDone ? null : true)}
                                            style={{
                                                background: isDone ? 'var(--success)' : 'rgba(255,255,255,0.05)',
                                                border: '1px solid',
                                                borderColor: isDone ? 'var(--success)' : 'rgba(255,255,255,0.15)',
                                                color: isDone ? '#000' : 'var(--success)',
                                                borderRadius: '8px',
                                                width: '40px',
                                                height: '40px',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                padding: 0
                                            }}
                                        >
                                            {isDone ? <CheckCircle2 size={20} /> : <Circle size={20} />}
                                        </button>
                                    </div>
                                </div>

                                {meal.note && (
                                    <p style={{ fontSize: '0.8rem', color: 'var(--warning)', margin: 0, marginTop: '0.75rem' }}>
                                        ⚠️ {meal.note}
                                    </p>
                                )}

                                {/* Scenario Toggle */}
                                {meal.hasScenarios && (
                                    <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem' }}>
                                        <button
                                            onClick={() => setSnackScenario('A')}
                                            style={{
                                                flex: 1, padding: '0.625rem', borderRadius: '10px',
                                                background: snackScenario === 'A' ? 'var(--accent-color)' : 'transparent',
                                                color: snackScenario === 'A' ? '#fff' : 'var(--text-muted)',
                                                border: snackScenario === 'A' ? 'none' : '1px solid rgba(255,255,255,0.1)',
                                                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
                                                fontSize: '0.85rem', fontWeight: 600
                                            }}
                                        >
                                            <GraduationCap size={16} /> UFES
                                        </button>
                                        <button
                                            onClick={() => setSnackScenario('B')}
                                            style={{
                                                flex: 1, padding: '0.625rem', borderRadius: '10px',
                                                background: snackScenario === 'B' ? 'var(--accent-color)' : 'transparent',
                                                color: snackScenario === 'B' ? '#fff' : 'var(--text-muted)',
                                                border: snackScenario === 'B' ? 'none' : '1px solid rgba(255,255,255,0.1)',
                                                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
                                                fontSize: '0.85rem', fontWeight: 600
                                            }}
                                        >
                                            <Home size={16} /> Casa
                                        </button>
                                    </div>
                                )}
                            </div>

                            {/* Meal Options */}
                            <div style={{ padding: '1rem', opacity: isDone || isSkipped ? 0.5 : 1 }}>
                                {options.map((option, idx) => (
                                    <div key={idx} style={{ marginBottom: idx === options.length - 1 ? 0 : '1.25rem' }}>
                                        <h3 style={{
                                            fontSize: '0.9rem',
                                            color: mealColor,
                                            marginBottom: '0.5rem',
                                            fontWeight: 600
                                        }}>
                                            {option.name}
                                        </h3>
                                        <ul style={{ paddingLeft: '1.25rem', margin: 0 }}>
                                            {option.items.map((item, i) => (
                                                <li key={i} style={{
                                                    fontSize: '0.85rem',
                                                    color: 'var(--text-secondary)',
                                                    marginBottom: '0.25rem',
                                                    lineHeight: 1.5
                                                }}>
                                                    {item}
                                                </li>
                                            ))}
                                        </ul>
                                        {option.note && (
                                            <p style={{ fontSize: '0.75rem', color: 'var(--danger)', marginTop: '0.5rem', fontStyle: 'italic' }}>
                                                * {option.note}
                                            </p>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </section>
                    );
                })}
            </div>
        </div>
    );
};

export default Nutrition;
