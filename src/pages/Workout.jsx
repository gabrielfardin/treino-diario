import { useDailyTracking } from '../hooks/useDailyTracking';
import { workoutPlans } from '../data/initialData';
import { CheckCircle2, Circle, Info, Trophy, Play, ArrowRight, RotateCcw, Flame, Target, Youtube } from 'lucide-react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

// Circular Progress Component
const CircularProgress = ({ progress, size = 100, strokeWidth = 8 }) => {
    const radius = (size - strokeWidth) / 2;
    const circumference = radius * 2 * Math.PI;
    const offset = circumference - (progress / 100) * circumference;
    const color = progress >= 100 ? 'var(--success)' : 'var(--accent-color)';

    return (
        <svg width={size} height={size} className="progress-ring">
            <circle
                stroke="rgba(255,255,255,0.1)"
                strokeWidth={strokeWidth}
                fill="transparent"
                r={radius}
                cx={size / 2}
                cy={size / 2}
            />
            <circle
                className="progress-ring-circle"
                stroke={color}
                strokeWidth={strokeWidth}
                fill="transparent"
                r={radius}
                cx={size / 2}
                cy={size / 2}
                style={{
                    strokeDasharray: circumference,
                    strokeDashoffset: offset,
                    filter: `drop-shadow(0 0 10px ${color})`
                }}
            />
        </svg>
    );
};

const Workout = () => {
    const { getLog, updateWorkout, getTodayDate, calculateStats, getSuggestedWorkout, setSuggestedOverride, markWorkoutCompleted } = useDailyTracking();
    const today = getTodayDate();
    const log = getLog(today);
    const workoutLog = log.workout;

    const [showCompletionModal, setShowCompletionModal] = useState(false);
    const [celebrateId, setCelebrateId] = useState(null);

    const navigate = useNavigate();

    const plan = workoutPlans.find(p => p.id === workoutLog.planId);
    const { workoutProgress } = calculateStats(today);

    const toggleExercise = (planId, exerciseId, currentStatus) => {
        if (!currentStatus) {
            setCelebrateId(exerciseId);
            setTimeout(() => setCelebrateId(null), 500);
        }
        updateWorkout(today, planId, exerciseId, !currentStatus);
    };

    const handleFinish = () => {
        setShowCompletionModal(true);
    };

    const confirmNextStep = (choice) => {
        markWorkoutCompleted(today);

        if (choice === 'next') {
            setSuggestedOverride(null);
        } else {
            setSuggestedOverride(plan.id);
        }

        navigate('/');
    };

    if (!workoutLog.planId) {
        return (
            <div className="container fade-in" style={{ textAlign: 'center', marginTop: '4rem' }}>
                <div style={{
                    width: '80px', height: '80px', borderRadius: '50%',
                    background: 'var(--accent-soft)', margin: '0 auto 1.5rem',
                    display: 'flex', alignItems: 'center', justifyContent: 'center'
                }}>
                    <Target size={40} color="var(--accent-color)" />
                </div>
                <h2>Nenhum Treino Iniciado</h2>
                <p style={{ marginBottom: '2rem' }}>Volte ao início para começar um treino.</p>
                <button onClick={() => navigate('/')} className="btn-primary">
                    <ArrowRight size={20} /> Ir para o Início
                </button>
            </div>
        );
    }

    const nextPlanId = plan.id === 'A' ? 'B' : plan.id === 'B' ? 'C' : 'A';
    const doneCount = Object.values(workoutLog.exercises || {}).filter(Boolean).length;
    const totalCount = plan?.exercises.length || 0;

    // Completed View
    if (workoutLog.completed) {
        return (
            <div className="container fade-in" style={{ paddingBottom: '120px', textAlign: 'center' }}>
                <div className="celebrate" style={{
                    background: workoutProgress === 100 ? 'linear-gradient(135deg, var(--success), #00AA55)' : 'linear-gradient(135deg, var(--warning), #F59E0B)',
                    width: '100px', height: '100px', borderRadius: '50%',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    margin: '2rem auto 1.5rem',
                    boxShadow: workoutProgress === 100 ? '0 0 40px var(--success-glow)' : '0 0 40px rgba(245, 158, 11, 0.4)'
                }}>
                    <Trophy size={48} color="#fff" />
                </div>
                <h1 style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>
                    {workoutProgress === 100 ? 'TREINO COMPLETO!' : 'TREINO FINALIZADO!'}
                </h1>
                <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem', fontSize: '1rem' }}>
                    Você finalizou o <strong style={{ color: workoutProgress === 100 ? 'var(--success)' : 'var(--warning)' }}>{plan?.name}</strong>
                </p>

                <div className="card" style={{ textAlign: 'left', marginBottom: '1.5rem' }}>
                    <h3 style={{ margin: 0, marginBottom: '1rem', fontSize: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <Flame size={18} color="var(--accent-color)" /> Resumo
                    </h3>
                    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.75rem', background: 'var(--bg-primary)', borderRadius: '12px' }}>
                        <span style={{ color: 'var(--text-muted)' }}>Exercícios Concluídos</span>
                        <span style={{ fontWeight: 'bold', color: workoutProgress === 100 ? 'var(--success)' : 'var(--warning)' }}>{doneCount} / {totalCount}</span>
                    </div>
                </div>

                <button onClick={() => navigate('/')} className="btn-primary" style={{ width: '100%', marginBottom: '1rem' }}>
                    <ArrowRight size={20} /> Voltar ao Início
                </button>

                <button
                    onClick={() => updateWorkout(today, plan.id, '__reset__', false)}
                    className="btn-ghost"
                    style={{ width: '100%', fontSize: '0.9rem', color: 'var(--text-muted)' }}
                >
                    <RotateCcw size={16} style={{ marginRight: '0.5rem' }} /> Refazer Treino (Resetar Hoje)
                </button>
            </div>
        );
    }

    return (
        <div className="container fade-in" style={{ paddingBottom: '140px' }}>
            {/* Header */}
            <header style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
                <div style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    padding: '0.5rem 1rem',
                    background: 'var(--accent-soft)',
                    borderRadius: 'var(--border-radius-full)',
                    marginBottom: '0.75rem'
                }}>
                    <Flame size={18} color="var(--accent-color)" />
                    <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--accent-color)' }}>EM ANDAMENTO</span>
                </div>
                <h1 style={{ marginBottom: '0.25rem', fontFamily: 'var(--font-display)', fontSize: '2.5rem', letterSpacing: '0.05em' }}>
                    TREINO {plan?.id}
                </h1>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '1rem' }}>{plan?.subtitle}</p>

                {/* SWITCH PLAN UI */}
                <details style={{ fontSize: '0.8rem', color: 'var(--text-muted)', cursor: 'pointer' }}>
                    <summary style={{ listStyle: 'none', display: 'inline-flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(255,255,255,0.05)', padding: '0.5rem 1rem', borderRadius: '20px' }}>
                        <RotateCcw size={14} /> Trocar Treino
                    </summary>
                    <div className="card" style={{ marginTop: '1rem', padding: '1rem', textAlign: 'left', border: '1px solid var(--warning)' }}>
                        <p style={{ color: 'var(--warning)', margin: '0 0 1rem', fontSize: '0.85rem' }}>
                            ⚠️ <strong>Atenção:</strong> Mudar a ordem sugerida pode prejudicar seu descanso muscular.
                        </p>
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                            {workoutPlans.map(p => (
                                <button
                                    key={p.id}
                                    onClick={() => updateWorkout(today, p.id, '__init__', false)}
                                    disabled={p.id === plan.id}
                                    style={{
                                        flex: 1,
                                        padding: '0.5rem',
                                        background: p.id === plan.id ? 'var(--accent-color)' : 'rgba(255,255,255,0.1)',
                                        border: 'none',
                                        borderRadius: '8px',
                                        color: '#fff',
                                        opacity: p.id === plan.id ? 1 : 0.7,
                                        cursor: p.id === plan.id ? 'default' : 'pointer'
                                    }}
                                >
                                    Treino {p.id}
                                </button>
                            ))}
                        </div>
                    </div>
                </details>
            </header>

            {/* Circular Progress */}
            <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                <div style={{ position: 'relative', display: 'inline-block' }}>
                    <CircularProgress progress={workoutProgress} />
                    <div style={{
                        position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
                        textAlign: 'center'
                    }}>
                        <div style={{ fontSize: '1.75rem', fontWeight: 'bold' }}>{workoutProgress}%</div>
                        <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{doneCount}/{totalCount}</div>
                    </div>
                </div>
            </div>

            {/* Exercise List */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {plan?.exercises.map((exercise, index) => {
                    const isDone = workoutLog.exercises[exercise.id] || false;
                    const isCelebrating = celebrateId === exercise.id;

                    return (
                        <div
                            key={exercise.id}
                            className={`card exercise-card ${isDone ? 'done' : ''} ${isCelebrating ? 'celebrate' : ''}`}
                            onClick={() => toggleExercise(plan.id, exercise.id, isDone)}
                            style={{
                                margin: 0,
                                padding: '1rem',
                                border: isDone ? '1px solid var(--success)' : '1px solid rgba(255,255,255,0.08)',
                                background: isDone
                                    ? 'linear-gradient(135deg, var(--bg-card), rgba(0, 255, 127, 0.05))'
                                    : 'var(--bg-card)',
                                cursor: 'pointer',
                                transition: 'all 0.25s ease'
                            }}
                        >
                            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                {/* Number Badge */}
                                <div style={{
                                    width: '36px', height: '36px', borderRadius: '10px',
                                    background: isDone ? 'var(--success)' : 'rgba(255,255,255,0.05)',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    fontWeight: 'bold', fontSize: '0.9rem',
                                    color: isDone ? '#000' : 'var(--text-muted)',
                                    transition: 'all 0.25s ease'
                                }}>
                                    {isDone ? <CheckCircle2 size={20} /> : index + 1}
                                </div>

                                {/* Content */}
                                <div style={{ flex: 1 }}>
                                    <h3 style={{
                                        margin: 0, marginBottom: '0.25rem',
                                        fontSize: '1rem',
                                        color: isDone ? 'var(--text-muted)' : 'var(--text-primary)',
                                        textDecoration: isDone ? 'line-through' : 'none'
                                    }}>
                                        {exercise.name}
                                    </h3>
                                    <div style={{ display: 'flex', gap: '0.75rem', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                                        <span>{exercise.sets} séries</span>
                                        <span>•</span>
                                        <span>{exercise.reps} reps</span>

                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                if (!navigator.onLine) {
                                                    alert('Você está offline. O vídeo requer conexão com a internet.');
                                                    return;
                                                }
                                                window.open(`https://www.youtube.com/results?search_query=execução+correta+${exercise.name}`, '_blank');
                                            }}
                                            style={{
                                                marginLeft: 'auto',
                                                background: 'transparent',
                                                border: 'none',
                                                padding: '0',
                                                fontSize: '0.75rem',
                                                color: 'var(--text-muted)',
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '4px',
                                                cursor: 'pointer',
                                                opacity: 0.7
                                            }}
                                        >
                                            <Youtube size={14} /> Vídeo
                                        </button>
                                    </div>

                                </div>

                                {/* Status Icon */}
                                <div style={{ color: isDone ? 'var(--success)' : 'var(--text-muted)' }}>
                                    {isDone ? <CheckCircle2 size={24} className="glow-success" /> : <Circle size={24} />}
                                </div>
                            </div>

                            {/* Observation */}
                            {exercise.obs && (
                                <div style={{
                                    marginTop: '0.75rem',
                                    paddingTop: '0.75rem',
                                    borderTop: '1px solid rgba(255,255,255,0.05)',
                                    display: 'flex', alignItems: 'flex-start', gap: '0.5rem',
                                    fontSize: '0.8rem', color: 'var(--warning)'
                                }}>
                                    <Info size={14} style={{ flexShrink: 0, marginTop: '2px' }} />
                                    <span>{exercise.obs}</span>
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>

            {/* Floating Finish Button */}
            {
                workoutProgress > 0 && (
                    <div style={{
                        position: 'fixed',
                        bottom: 'calc(80px + env(safe-area-inset-bottom, 0px))',
                        left: '1rem',
                        right: '1rem',
                        zIndex: 100
                    }}>
                        <button
                            onClick={handleFinish}
                            className={workoutProgress === 100 ? 'btn-primary pulse-glow' : 'btn-primary'}
                            style={{
                                width: '100%',
                                padding: '1rem',
                                background: workoutProgress === 100 ? 'var(--success)' : 'var(--bg-elevated)',
                                color: workoutProgress === 100 ? '#000' : '#fff',
                                display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem',
                                boxShadow: workoutProgress === 100
                                    ? '0 0 30px var(--success-glow), 0 4px 20px rgba(0,0,0,0.4)'
                                    : '0 4px 20px rgba(0,0,0,0.3)',
                                fontSize: '1rem',
                                fontFamily: 'var(--font-heading)',
                                fontWeight: 600,
                                letterSpacing: '0.05em',
                                border: workoutProgress < 100 ? '1px solid rgba(255,255,255,0.1)' : 'none'
                            }}
                        >
                            {workoutProgress === 100 ? <Trophy size={22} /> : <Play size={22} />}
                            {workoutProgress === 100 ? 'FINALIZAR TREINO 🔥' : `Continue... ${doneCount}/${totalCount}`}
                        </button>
                    </div>
                )
            }

            {/* Completion Modal */}
            {
                showCompletionModal && (
                    <div className="modal-overlay fade-in-scale" onClick={() => setShowCompletionModal(false)}>
                        <div className="card card-accent" onClick={(e) => e.stopPropagation()} style={{
                            width: '100%', maxWidth: '380px',
                            textAlign: 'center',
                            padding: '2rem'
                        }}>
                            <div className="celebrate" style={{
                                background: 'linear-gradient(135deg, var(--accent-color), #FF4D6D)',
                                width: '80px', height: '80px', borderRadius: '50%',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                margin: '0 auto 1.5rem',
                                boxShadow: '0 0 30px var(--accent-glow)'
                            }}>
                                <Trophy size={40} color="#fff" />
                            </div>
                            <h2 style={{ fontSize: '1.75rem', marginBottom: '0.5rem', fontFamily: 'var(--font-display)', letterSpacing: '0.05em' }}>
                                TREINO CONCLUÍDO!
                            </h2>
                            <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem', fontSize: '0.95rem' }}>
                                Você é uma máquina! 💪
                            </p>

                            <div style={{ textAlign: 'left', marginBottom: '1.5rem', fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                                Próximo passo:
                            </div>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                                <button
                                    onClick={() => confirmNextStep('next')}
                                    className="btn-primary"
                                    style={{
                                        padding: '1rem',
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        alignItems: 'center'
                                    }}
                                >
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                        <div style={{
                                            width: '36px', height: '36px', borderRadius: '10px',
                                            background: 'rgba(255,255,255,0.2)',
                                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                                            fontWeight: 'bold', fontSize: '1rem'
                                        }}>
                                            {nextPlanId}
                                        </div>
                                        <div style={{ textAlign: 'left' }}>
                                            <span style={{ display: 'block', fontWeight: 'bold' }}>Treino {nextPlanId} Amanhã</span>
                                            <span style={{ fontSize: '0.75rem', opacity: 0.8 }}>Sequência recomendada</span>
                                        </div>
                                    </div>
                                    <ArrowRight size={20} />
                                </button>

                                <button
                                    onClick={() => confirmNextStep('repeat')}
                                    className="btn-ghost"
                                    style={{ padding: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
                                >
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                        <div style={{
                                            width: '36px', height: '36px', borderRadius: '10px',
                                            background: 'rgba(255, 255, 255, 0.05)',
                                            display: 'flex', alignItems: 'center', justifyContent: 'center'
                                        }}>
                                            <RotateCcw size={16} />
                                        </div>
                                        <span>Repetir Treino {plan.id}</span>
                                    </div>
                                </button>
                            </div>
                        </div>
                    </div>
                )
            }
        </div>
    );
};

export default Workout;
