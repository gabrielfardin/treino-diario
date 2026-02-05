import { useDailyTracking } from '../hooks/useDailyTracking';
import { dietPlan, workoutPlans } from '../data/initialData';
import { ChevronLeft, ChevronRight, X, AlertCircle, CheckCircle2, Droplets, Flame, Trophy, XCircle } from 'lucide-react';
import { useState } from 'react';

const History = () => {
    const { getLog, calculateStats } = useDailyTracking();
    const [currentDate, setCurrentDate] = useState(new Date());
    const [selectedDate, setSelectedDate] = useState(null);

    const getDaysInMonth = (date) => {
        const year = date.getFullYear();
        const month = date.getMonth();
        const days = new Date(year, month + 1, 0).getDate();
        return Array.from({ length: days }, (_, i) => i + 1);
    };

    const getFirstDayOffset = (date) => {
        const firstDay = new Date(date.getFullYear(), date.getMonth(), 1);
        return firstDay.getDay();
    };

    const days = getDaysInMonth(currentDate);
    const firstDayOffset = getFirstDayOffset(currentDate);
    const monthName = currentDate.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });

    const changeMonth = (offset) => {
        const newDate = new Date(currentDate.setMonth(currentDate.getMonth() + offset));
        setCurrentDate(new Date(newDate));
    };

    const formatDayDate = (day) => {
        const year = currentDate.getFullYear();
        const month = String(currentDate.getMonth() + 1).padStart(2, '0');
        const dayStr = String(day).padStart(2, '0');
        return `${year}-${month}-${dayStr}`;
    };

    const handleDayClick = (day) => {
        const dateStr = formatDayDate(day);
        setSelectedDate(dateStr);
    };

    const closeModal = () => setSelectedDate(null);

    const getDayReport = (dateStr) => {
        const log = getLog(dateStr);
        const stats = calculateStats(dateStr);

        const missingItems = [];
        const completedItems = [];

        // 1. Analyze Workout
        const dateObj = new Date(`${dateStr}T12:00:00`);
        const isSunday = dateObj.getDay() === 0;

        if (!isSunday) {
            if (!log.workout.planId) {
                missingItems.push({ text: "Nenhum treino registrado", type: "pending" });
            } else {
                const plan = workoutPlans.find(p => p.id === log.workout.planId);
                if (plan) {
                    plan.exercises.forEach(ex => {
                        if (log.workout.exercises[ex.id]) {
                            completedItems.push(`✓ ${ex.name}`);
                        } else {
                            missingItems.push({ text: `Exercício: ${ex.name}`, type: "missed" });
                        }
                    });
                }
            }
        }

        // 2. Analyze Diet
        dietPlan.forEach(meal => {
            const status = log.diet.meals[meal.id];
            if (status === true || status === 'done') {
                completedItems.push(`✓ ${meal.name}`);
            } else if (status === 'skipped') {
                missingItems.push({ text: `${meal.name}`, type: "skipped" });
            } else {
                missingItems.push({ text: `${meal.name}`, type: "pending" });
            }
        });

        // 3. Analyze Water
        if (stats.waterProgress < 100) {
            const pct = Math.round(stats.waterProgress);
            missingItems.push({ text: `Água ${pct}% (${stats.currentWater}ml)`, type: "pending" });
        } else {
            completedItems.push("✓ Meta de água atingida");
        }

        return { missingItems, completedItems, stats, log };
    };

    return (
        <>
            <div className="container fade-in" style={{ paddingBottom: '120px' }}>
                {/* Header */}
                <header style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
                        <Flame size={24} color="var(--accent-color)" className="glow-accent" />
                        <h1 style={{ margin: 0, fontSize: '1.5rem' }}>Histórico</h1>
                    </div>
                </header>

                {/* Month Navigation */}
                <div className="card" style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '1rem',
                    padding: '1rem'
                }}>
                    <button
                        onClick={() => changeMonth(-1)}
                        className="btn-ghost"
                        style={{ padding: '0.5rem', borderRadius: '10px' }}
                    >
                        <ChevronLeft size={24} />
                    </button>
                    <h2 style={{
                        margin: 0,
                        textTransform: 'capitalize',
                        fontSize: '1.2rem',
                        fontWeight: 600
                    }}>
                        {monthName}
                    </h2>
                    <button
                        onClick={() => changeMonth(1)}
                        className="btn-ghost"
                        style={{ padding: '0.5rem', borderRadius: '10px' }}
                    >
                        <ChevronRight size={24} />
                    </button>
                </div>

                {/* Calendar Grid */}
                <div className="card" style={{ padding: '1rem', marginBottom: '1rem' }}>
                    {/* Day Headers */}
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(7, 1fr)',
                        gap: '0.25rem',
                        textAlign: 'center',
                        marginBottom: '0.5rem'
                    }}>
                        {['D', 'S', 'T', 'Q', 'Q', 'S', 'S'].map((d, i) => (
                            <span key={i} style={{
                                color: 'var(--text-muted)',
                                fontSize: '0.75rem',
                                fontWeight: 600,
                                padding: '0.5rem 0'
                            }}>
                                {d}
                            </span>
                        ))}
                    </div>

                    {/* Days */}
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(7, 1fr)',
                        gap: '0.25rem'
                    }}>
                        {/* Empty cells for offset */}
                        {Array.from({ length: firstDayOffset }).map((_, i) => (
                            <div key={`empty-${i}`} />
                        ))}

                        {days.map(day => {
                            const dateStr = formatDayDate(day);
                            const { workoutProgress, dietProgress, waterProgress, completedWorkoutsCount } = calculateStats(dateStr);
                            const hasActivity = workoutProgress > 0 || dietProgress > 0;
                            const isToday = dateStr === new Date().toLocaleDateString('en-CA');

                            const dateObj = new Date(`${dateStr}T12:00:00`);
                            const isSunday = dateObj.getDay() === 0;

                            const isPerfect = (isSunday || workoutProgress >= 100) && dietProgress >= 100 && waterProgress >= 100;

                            return (
                                <div
                                    key={day}
                                    onClick={() => handleDayClick(day)}
                                    style={{
                                        display: 'flex',
                                        flexDirection: 'column',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        aspectRatio: '1',
                                        cursor: 'pointer',
                                        background: isPerfect
                                            ? 'linear-gradient(135deg, rgba(0, 255, 127, 0.15), rgba(0, 255, 127, 0.05))'
                                            : isToday
                                                ? 'var(--accent-soft)'
                                                : 'transparent',
                                        border: isToday ? '2px solid var(--accent-color)' : '1px solid transparent',
                                        borderRadius: '12px',
                                        transition: 'all 0.2s ease'
                                    }}
                                >
                                    <span style={{
                                        fontSize: '0.9rem',
                                        fontWeight: isToday ? 'bold' : hasActivity ? 600 : 400,
                                        color: isPerfect ? 'var(--success)' : isToday ? 'var(--accent-color)' : hasActivity ? '#fff' : 'var(--text-muted)'
                                    }}>
                                        {day}
                                    </span>

                                    {/* Indicators */}
                                    <div style={{ display: 'flex', gap: '2px', marginTop: '2px', minHeight: '6px' }}>
                                        {/* Workout indicator */}
                                        {completedWorkoutsCount > 0 ? (
                                            Array.from({ length: Math.min(2, completedWorkoutsCount) }).map((_, i) => (
                                                <div key={`w-${i}`} style={{
                                                    width: '5px', height: '5px', borderRadius: '50%',
                                                    background: 'var(--success)'
                                                }} />
                                            ))
                                        ) : workoutProgress > 0 ? (
                                            <div style={{
                                                width: '5px', height: '5px', borderRadius: '50%',
                                                background: 'var(--warning)'
                                            }} />
                                        ) : null}

                                        {/* Diet indicator - green if 100%, yellow if partial */}
                                        {dietProgress > 0 && (
                                            <div style={{
                                                width: '5px', height: '5px', borderRadius: '50%',
                                                background: dietProgress >= 100 ? 'var(--accent-color)' : 'var(--warning)'
                                            }} />
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Legend */}
                <div className="card" style={{ padding: '1rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-around', flexWrap: 'wrap', gap: '0.5rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                            <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--success)' }} />
                            <span>Treino</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                            <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--accent-color)' }} />
                            <span>Dieta</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                            <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--warning)' }} />
                            <span>Parcial</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Detail Modal - OUTSIDE container */}
            {selectedDate && (
                <div
                    onClick={closeModal}
                    style={{
                        position: 'fixed',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        background: 'rgba(0, 0, 0, 0.8)',
                        backdropFilter: 'blur(8px)',
                        WebkitBackdropFilter: 'blur(8px)',
                        zIndex: 9999,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        padding: '1rem',
                        animation: 'fadeIn 0.2s ease-out'
                    }}
                >
                    <div
                        onClick={(e) => e.stopPropagation()}
                        style={{
                            width: '100%',
                            maxWidth: '380px',
                            maxHeight: '75vh',
                            overflowY: 'auto',
                            position: 'relative',
                            padding: '1.5rem',
                            background: '#1a1a1a',
                            borderRadius: '16px',
                            border: '1px solid var(--accent-color)',
                            boxShadow: '0 0 30px var(--accent-glow), 0 20px 60px rgba(0,0,0,0.5)'
                        }}
                    >
                        <button
                            onClick={closeModal}
                            style={{
                                position: 'absolute', top: '1rem', right: '1rem',
                                background: 'rgba(255,255,255,0.1)',
                                padding: '0.5rem',
                                borderRadius: '10px',
                                border: 'none',
                                color: 'var(--text-muted)'
                            }}
                        >
                            <X size={18} />
                        </button>

                        {(() => {
                            const { missingItems, stats } = getDayReport(selectedDate);
                            const dateObj = new Date(selectedDate);
                            const displayDate = new Date(dateObj.valueOf() + dateObj.getTimezoneOffset() * 60 * 1000)
                                .toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' });
                            const isPerfect = missingItems.length === 0;

                            return (
                                <>
                                    <h2 style={{
                                        paddingRight: '2rem',
                                        textTransform: 'capitalize',
                                        margin: 0,
                                        marginBottom: '1.5rem',
                                        fontSize: '1.25rem'
                                    }}>
                                        {displayDate}
                                    </h2>

                                    {/* Stats Row */}
                                    <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1.5rem' }}>
                                        <div style={{
                                            flex: 1,
                                            background: stats.workoutProgress >= 100
                                                ? 'linear-gradient(135deg, rgba(0, 255, 127, 0.1), transparent)'
                                                : 'var(--bg-primary)',
                                            padding: '1rem',
                                            borderRadius: '12px',
                                            textAlign: 'center',
                                            border: stats.workoutProgress >= 100 ? '1px solid var(--success)' : '1px solid rgba(255,255,255,0.05)'
                                        }}>
                                            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>Treino</div>
                                            <div style={{
                                                fontSize: '1.5rem',
                                                fontWeight: 'bold',
                                                color: stats.workoutProgress >= 100 ? 'var(--success)' : 'var(--text-primary)'
                                            }}>
                                                {stats.workoutProgress}%
                                            </div>
                                        </div>
                                        <div style={{
                                            flex: 1,
                                            background: stats.dietProgress >= 100
                                                ? 'linear-gradient(135deg, rgba(255, 7, 58, 0.1), transparent)'
                                                : 'var(--bg-primary)',
                                            padding: '1rem',
                                            borderRadius: '12px',
                                            textAlign: 'center',
                                            border: stats.dietProgress >= 100 ? '1px solid var(--accent-color)' : '1px solid rgba(255,255,255,0.05)'
                                        }}>
                                            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>Dieta</div>
                                            <div style={{
                                                fontSize: '1.5rem',
                                                fontWeight: 'bold',
                                                color: stats.dietProgress >= 100 ? 'var(--accent-color)' : 'var(--text-primary)'
                                            }}>
                                                {stats.dietProgress}%
                                            </div>
                                        </div>
                                    </div>

                                    {/* Water */}
                                    <div style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '0.75rem',
                                        background: 'rgba(0, 191, 255, 0.1)',
                                        padding: '1rem',
                                        borderRadius: '12px',
                                        marginBottom: '1.5rem',
                                        border: '1px solid rgba(0, 191, 255, 0.2)'
                                    }}>
                                        <Droplets color="var(--secondary-color)" size={24} />
                                        <div style={{ flex: 1 }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                                                <span style={{ fontSize: '0.85rem' }}>Hidratação</span>
                                                <span style={{ fontSize: '0.85rem', color: 'var(--secondary-color)', fontWeight: 600 }}>
                                                    {(stats.currentWater / 1000).toFixed(1)}L
                                                </span>
                                            </div>
                                            <div className="progress-bar" style={{ height: '6px' }}>
                                                <div style={{
                                                    width: `${Math.min(100, stats.waterProgress)}%`,
                                                    height: '100%',
                                                    background: 'var(--secondary-color)',
                                                    borderRadius: '3px'
                                                }} />
                                            </div>
                                        </div>
                                    </div>

                                    {/* Missing Items */}
                                    {isPerfect ? (
                                        <div style={{
                                            textAlign: 'center',
                                            padding: '1.5rem',
                                            background: 'linear-gradient(135deg, rgba(0, 255, 127, 0.1), transparent)',
                                            borderRadius: '12px',
                                            border: '1px solid var(--success)'
                                        }}>
                                            <Trophy size={40} color="var(--success)" className="glow-success" style={{ marginBottom: '0.75rem' }} />
                                            <p style={{ margin: 0, fontWeight: 'bold', color: 'var(--success)', fontSize: '1.1rem' }}>
                                                DIA PERFEITO! 🔥
                                            </p>
                                            <p style={{ margin: '0.5rem 0 0', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                                                Todas as metas foram cumpridas
                                            </p>
                                        </div>
                                    ) : (
                                        <div>
                                            <h3 style={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '0.5rem',
                                                color: 'var(--warning)',
                                                margin: 0,
                                                marginBottom: '0.75rem',
                                                fontSize: '0.95rem'
                                            }}>
                                                <AlertCircle size={18} />
                                                Pendências
                                            </h3>
                                            <ul style={{
                                                paddingLeft: 0,
                                                margin: 0,
                                                listStyle: 'none',
                                                display: 'flex',
                                                flexDirection: 'column',
                                                gap: '0.5rem'
                                            }}>
                                                {missingItems.map((item, idx) => (
                                                    <li key={idx} style={{
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        gap: '0.5rem',
                                                        padding: '0.625rem 0.75rem',
                                                        background: item.type === 'skipped'
                                                            ? 'rgba(255, 7, 58, 0.1)'
                                                            : 'rgba(255, 255, 255, 0.03)',
                                                        borderRadius: '8px',
                                                        fontSize: '0.85rem',
                                                        color: item.type === 'skipped' ? 'var(--danger)' : 'var(--text-secondary)',
                                                        border: item.type === 'skipped' ? '1px solid rgba(255, 7, 58, 0.2)' : 'none'
                                                    }}>
                                                        {item.type === 'skipped' ? (
                                                            <XCircle size={16} />
                                                        ) : (
                                                            <AlertCircle size={16} color="var(--warning)" />
                                                        )}
                                                        {item.type === 'skipped' && <span style={{ fontWeight: 600 }}>Não cumpriu:</span>}
                                                        {item.text}
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    )}
                                </>
                            );
                        })()}
                    </div>
                </div>
            )}
        </>
    );
};

export default History;
