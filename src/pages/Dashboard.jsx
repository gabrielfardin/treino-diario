import { useDailyTracking } from '../hooks/useDailyTracking';
import { initialUserProfile, workoutPlans, rewardDefinitions } from '../data/initialData';
import { useNavigate } from 'react-router-dom';
import { Play, Trophy, Zap, Utensils, Droplets, Flame, Target, ChevronRight } from 'lucide-react';
import { useState, useEffect } from 'react';



// Circular Progress Component
const CircularProgress = ({ progress, size = 80, strokeWidth = 5, color = 'var(--accent-color)' }) => {
    const radius = (size - strokeWidth) / 2;
    const circumference = radius * 2 * Math.PI;
    const offset = circumference - (progress / 100) * circumference;

    return (
        <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
            {/* Background track */}
            <circle
                stroke="rgba(255,255,255,0.1)"
                strokeWidth={strokeWidth}
                fill="transparent"
                r={radius}
                cx={size / 2}
                cy={size / 2}
            />
            {/* Progress arc */}
            <circle
                stroke={color}
                strokeWidth={strokeWidth}
                strokeLinecap="round"
                fill="transparent"
                r={radius}
                cx={size / 2}
                cy={size / 2}
                style={{
                    strokeDasharray: circumference,
                    strokeDashoffset: offset,
                    transition: 'stroke-dashoffset 0.5s ease'
                }}
            />
        </svg>
    );
};

const Dashboard = () => {
    const { logs, getSuggestedWorkout, setSuggestedOverride, getTodayDate, updateWorkout, calculateStats, vouchers, useVoucher, addVoucher, getCurrentStreak, canClaimLootbox, claimLootbox, lootboxData } = useDailyTracking();
    const navigate = useNavigate();
    const profile = initialUserProfile;
    const today = getTodayDate();

    // Gamification State
    const [timeLeft, setTimeLeft] = useState('');

    useEffect(() => {
        const timer = setInterval(() => {
            const now = new Date();
            const tomorrow = new Date(now);
            tomorrow.setDate(tomorrow.getDate() + 1);
            tomorrow.setHours(0, 0, 0, 0);
            const diff = tomorrow - now;
            if (diff <= 0) {
                setTimeLeft('00:00:00');
            } else {
                const h = Math.floor(diff / (1000 * 60 * 60));
                const m = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
                const s = Math.floor((diff % (1000 * 60)) / 1000);
                setTimeLeft(`${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`);
            }
        }, 1000);
        return () => clearInterval(timer);
    }, []);



    // Loot Box state
    const [showRewardModal, setShowRewardModal] = useState(false);
    const [claimedReward, setClaimedReward] = useState(null);
    const [isRevealing, setIsRevealing] = useState(false);
    const currentStreak = getCurrentStreak();
    const canClaim = canClaimLootbox();
    const visualStreak = canClaim ? 7 : (currentStreak % 7);

    // Casino animation states
    const [spinPhase, setSpinPhase] = useState(0); // 0=idle, 1=shake, 2=spin, 3=slowdown, 4=reveal
    const [spinningIcons, setSpinningIcons] = useState([]);
    const [currentSpinIcon, setCurrentSpinIcon] = useState(0);

    const allRewardsForSpin = [...rewardDefinitions.vouchers, ...rewardDefinitions.rewards];

    const handleOpenLootbox = () => {
        setClaimedReward(null);
        setSpinPhase(1);
        setShowRewardModal(true);
        setIsRevealing(true);

        // Phase 1: Shake (1s)
        setTimeout(() => setSpinPhase(2), 1000);

        // Phase 2: Fast spin (2s)
        const spinInterval = setInterval(() => {
            setCurrentSpinIcon(prev => (prev + 1) % allRewardsForSpin.length);
        }, 80);

        // Phase 3: Slowdown (1.5s)
        setTimeout(() => {
            clearInterval(spinInterval);
            setSpinPhase(3);

            // Slow spin
            let slowCount = 0;
            const slowInterval = setInterval(() => {
                setCurrentSpinIcon(prev => (prev + 1) % allRewardsForSpin.length);
                slowCount++;
                if (slowCount > 8) {
                    clearInterval(slowInterval);

                    // Get actual reward
                    const reward = claimLootbox();
                    setClaimedReward(reward);
                    setSpinPhase(4);
                    setIsRevealing(false);
                }
            }, 200 + slowCount * 50);
        }, 3000);
    };

    // TEST: Force open loot box (temporary)
    const handleTestLootbox = () => {
        setClaimedReward(null);
        setSpinPhase(1);
        setShowRewardModal(true);
        setIsRevealing(true);

        setTimeout(() => setSpinPhase(2), 1000);

        const spinInterval = setInterval(() => {
            setCurrentSpinIcon(prev => (prev + 1) % allRewardsForSpin.length);
        }, 80);

        setTimeout(() => {
            clearInterval(spinInterval);
            setSpinPhase(3);

            let slowCount = 0;
            const slowInterval = setInterval(() => {
                setCurrentSpinIcon(prev => (prev + 1) % allRewardsForSpin.length);
                slowCount++;
                if (slowCount > 8) {
                    clearInterval(slowInterval);

                    // Roll reward manually for testing
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

                    const possibleRewards = allRewardsForSpin.filter(r => r.rarity === selectedRarity);
                    const reward = possibleRewards[Math.floor(Math.random() * possibleRewards.length)];

                    if (rewardDefinitions.vouchers.some(v => v.id === reward.id)) {
                        addVoucher(reward.id);
                    }

                    setClaimedReward({ ...reward, rolledRarity: selectedRarity });
                    setSpinPhase(4);
                    setIsRevealing(false);
                }
            }, 200 + slowCount * 50);
        }, 3000);
    };

    // History toggle
    const [showHistory, setShowHistory] = useState(false);

    // Determine plan to display
    const todayLog = logs[today]?.workout || {};
    const isTodayCompleted = todayLog.completed;
    const todayPlanId = todayLog.planId;

    const suggestedPlanId = getSuggestedWorkout();
    const displayPlanId = isTodayCompleted ? todayPlanId : suggestedPlanId;
    const displayPlan = workoutPlans.find(p => p.id === displayPlanId);

    // Nutrition Stats
    const { mealsDone, totalMeals, currentWater, waterGoal, dietProgress, workoutProgress } = calculateStats(today);

    // Weekly Stats
    const getWeeklyStats = () => {
        let count = 0;
        const now = new Date();
        for (let i = 0; i < 7; i++) {
            const d = new Date();
            d.setDate(now.getDate() - i);
            const dateStr = d.toLocaleDateString('en-CA');
            if (logs[dateStr]?.workout?.completed) count++;
        }
        return count;
    };

    const handleStartWorkout = (force = false) => {
        if (localStorage.getItem('treino_next_override') === suggestedPlanId) {
            setSuggestedOverride(null);
        }
        updateWorkout(today, suggestedPlanId, force ? '__reset__' : '__init__', false);
        navigate('/workout');
    };

    // Urgency & Casino Logic
    const urgencyLevel = currentStreak >= 6 ? 'critical' : currentStreak >= 4 ? 'high' : currentStreak >= 2 ? 'medium' : 'low';

    const getUrgencyStyles = () => {
        switch (urgencyLevel) {
            case 'critical': return {
                border: '2px solid #FFD700',
                boxShadow: '0 0 20px #FFD700, inset 0 0 10px #FF0000',
                animation: 'pulse-critical 0.8s infinite'
            };
            case 'high': return {
                border: '1px solid #FF4D6D',
                boxShadow: '0 0 15px rgba(255, 77, 109, 0.4)',
                animation: 'pulse-high 2s infinite'
            };
            case 'medium': return {
                border: '1px solid #3B82F6',
                boxShadow: '0 0 10px rgba(59, 130, 246, 0.3)'
            };
            default: return {
                border: '1px solid rgba(255,255,255,0.1)'
            };
        }
    };

    const getUrgencyText = () => {
        if (canClaim) return "🚨 JACKPOT DISPONÍVEL! ABRA AGORA! 🚨";
        if (visualStreak === 6) return "🔥 SÓ FALTA UM DIA! NÃO OUSE DESISTIR AGORA! 🔥";
        if (visualStreak >= 4) return "⚡ VOCÊ TÁ QUENTE! O PRÊMIO TÁ LOGO ALI!";
        return "🎰 A SORTE FAVORECE OS FORTES. CONTINUE.";
    };

    const getProjectedDate = () => {
        if (canClaim) return "HOJE!";
        const daysRemaining = 7 - visualStreak;
        const target = new Date();
        target.setDate(target.getDate() + daysRemaining);
        const weekday = target.toLocaleDateString('pt-BR', { weekday: 'short' }).toUpperCase();
        const day = target.getDate();
        return `${weekday} ${day}`;
    };

    const weeklyCount = getWeeklyStats();

    return (
        <>
            <div className="container fade-in" style={{ paddingBottom: '120px' }}>



                {/* Hero Greeting */}
                <header style={{ marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                        <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold', margin: 0 }}>
                            Olá, {profile.name} <span style={{ fontSize: '1.2rem' }}>👋</span>
                        </h1>
                        <p style={{ margin: '0.25rem 0 0', color: 'rgba(255,255,255,0.3)', fontSize: '0.7rem', fontStyle: 'italic', letterSpacing: '0.5px' }}>
                            Desenvolvido por Gabriel Fardin
                        </p>
                    </div>
                    <div style={{ cursor: 'default' }}>
                        <div style={{
                            width: '45px', height: '45px',
                            borderRadius: '50%',
                            overflow: 'hidden',
                            border: '2px solid var(--accent-color)',
                            boxShadow: '0 0 15px rgba(168, 85, 247, 0.4)'
                        }}>
                            <img src="/profile.png" alt="Profile" style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center 20%' }} />
                        </div>
                    </div>
                </header>

                {/* Quick Stats Row */}
                <section style={{ display: 'flex', gap: '0.75rem', marginBottom: '1.5rem' }}>
                    <div className="card" style={{ flex: 1, padding: '1rem', textAlign: 'center', margin: 0 }}>
                        <div style={{ fontSize: '1.75rem', fontWeight: 'bold', color: 'var(--success)' }}>{weeklyCount}</div>
                        <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Treinos/Semana</div>
                    </div>
                    <div className="card" style={{ flex: 1, padding: '1rem', textAlign: 'center', margin: 0 }}>
                        <div style={{ fontSize: '1.75rem', fontWeight: 'bold', color: 'var(--accent-color)' }}>{mealsDone}/{totalMeals}</div>
                        <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Refeições</div>
                    </div>
                    <div className="card" style={{ flex: 1, padding: '1rem', textAlign: 'center', margin: 0 }}>
                        <div style={{ fontSize: '1.75rem', fontWeight: 'bold', color: 'var(--secondary-color)' }}>{(currentWater / 1000).toFixed(1)}L</div>
                        <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Água</div>
                    </div>
                </section>

                {/* CASINO STREAK TRACKER */}
                <section className="card" style={{
                    padding: '1.25rem',
                    marginBottom: '1.5rem',
                    background: urgencyLevel === 'critical' ? 'linear-gradient(135deg, rgba(255,0,0,0.1), rgba(255,215,0,0.1))' : 'var(--bg-card)',
                    transition: 'all 0.5s ease',
                    ...getUrgencyStyles()
                }}>
                    {/* Header with pulsating status */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                        <h3 style={{ margin: 0, fontSize: '0.9rem', color: '#fff', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: '800' }}>
                            🎰 ROTA DO JACKPOT
                        </h3>
                        <div style={{
                            background: '#000',
                            padding: '0.25rem 0.75rem',
                            borderRadius: '20px',
                            fontSize: '0.7rem',
                            color: '#FFD700',
                            border: '1px solid #FFD700',
                            fontWeight: 'bold',
                            boxShadow: '0 0 10px rgba(255, 215, 0, 0.3)'
                        }}>
                            {visualStreak}/7 DIAS
                        </div>
                    </div>

                    {/* Urgency Message */}
                    <div style={{
                        textAlign: 'center',
                        marginBottom: '1.25rem',
                        fontSize: '0.85rem',
                        fontWeight: 'bold',
                        color: urgencyLevel === 'critical' ? '#FFD700' : urgencyLevel === 'high' ? '#FF4D6D' : 'var(--text-muted)',
                        textShadow: urgencyLevel === 'critical' ? '0 0 10px rgba(255,215,0,0.5)' : 'none',
                        animation: urgencyLevel === 'critical' ? 'pulse 1s infinite' : 'none'
                    }}>
                        {getUrgencyText()}
                    </div>

                    {/* Urgency Countdown */}
                    <div style={{ textAlign: 'center', marginBottom: '1.5rem', marginTop: '-0.75rem' }}>
                        <div style={{ fontSize: '1.2rem', fontFamily: 'monospace', color: '#ff4d4d', fontWeight: 'bold', textShadow: '0 0 15px rgba(255, 0, 0, 0.4)', letterSpacing: '2px' }}>
                            ⏱️ {timeLeft}
                        </div>
                        <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px' }}>
                            PARA PERDER O STREAK
                        </div>
                    </div>

                    {/* Calendar / Timeline Visual (PREDATORY DESIGN) */}
                    <div style={{ position: 'relative', margin: '2rem 0.5rem 2.5rem 0.5rem' }}>

                        {/* Background Line */}
                        <div style={{ position: 'absolute', top: '50%', left: '10px', right: '10px', height: '2px', background: 'rgba(255,255,255,0.1)', transform: 'translateY(-50%)', zIndex: 0 }} />

                        {/* Progress Line */}
                        <div style={{
                            position: 'absolute',
                            top: '50%',
                            left: '10px',
                            width: `calc(${Math.min((visualStreak / 6) * 100, 100)}% - 20px)`,
                            height: '2px',
                            background: '#ff4d4d',
                            transform: 'translateY(-50%)',
                            zIndex: 0,
                            boxShadow: '0 0 10px rgba(255, 77, 77, 0.5)',
                            transition: 'width 0.5s ease'
                        }} />

                        <div style={{ display: 'flex', justifyContent: 'space-between', position: 'relative', zIndex: 1 }}>
                            {[...Array(7)].map((_, i) => {
                                const dayNum = i + 1;
                                const isActive = dayNum === visualStreak + 1;
                                const isPast = dayNum <= visualStreak;
                                const isTarget = dayNum === 7;
                                const isTargetActive = isTarget && visualStreak >= 6; // Almost there

                                return (
                                    <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                                        <div style={{
                                            width: isTarget ? '40px' : '32px',
                                            height: isTarget ? '40px' : '32px',
                                            borderRadius: '50%',
                                            background: isPast && !isTarget
                                                ? '#1a1a1a' // Past
                                                : isActive
                                                    ? '#ff4d4d' // Active (Red)
                                                    : isTarget
                                                        ? 'linear-gradient(135deg, #FFD700, #FFA500)' // Target
                                                        : '#1a1a1a', // Future
                                            border: isActive ? '3px solid rgba(255, 77, 77, 0.3)' : isTarget ? 'none' : '2px solid rgba(255,255,255,0.1)',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            fontSize: isTarget ? '1.2rem' : '0.9rem',
                                            fontWeight: 'bold',
                                            color: isPast && !isTarget ? 'var(--text-muted)' : '#fff',
                                            boxShadow: isActive
                                                ? '0 0 20px rgba(255, 77, 77, 0.6)'
                                                : isTarget
                                                    ? '0 0 25px rgba(255, 215, 0, 0.6)'
                                                    : 'none',
                                            transform: isActive || isTargetActive ? 'scale(1.1)' : 'scale(1)',
                                            transition: 'all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
                                            animation: isActive ? 'pulse-slow 2s infinite' : isTargetActive ? 'shake 2s infinite' : 'none'
                                        }}>
                                            {isTarget ? '🎁' : dayNum}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* PROJECTED DATE */}
                    <div style={{
                        background: 'rgba(0,0,0,0.3)',
                        borderRadius: '12px',
                        padding: '0.75rem',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        border: canClaim ? '1px solid #FFD700' : '1px solid rgba(255,255,255,0.05)'
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <div style={{ fontSize: '1.25rem' }}>📅</div>
                            <div>
                                <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                                    Previsão do Loot
                                </div>
                                <div style={{ fontSize: '0.9rem', fontWeight: 'bold', color: '#fff' }}>
                                    {getProjectedDate()}
                                </div>
                            </div>
                        </div>
                        {canClaim ? (
                            <button
                                onClick={handleOpenLootbox}
                                style={{
                                    padding: '0.5rem 1rem',
                                    background: 'linear-gradient(135deg, #A855F7, #3B82F6)',
                                    border: 'none',
                                    borderRadius: '8px',
                                    color: '#fff',
                                    fontWeight: 'bold',
                                    fontSize: '0.8rem',
                                    cursor: 'pointer',
                                    animation: 'pulse 1s infinite'
                                }}
                            >
                                ABRIR AGORA!
                            </button>
                        ) : (
                            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textAlign: 'right' }}>
                                {7 - currentStreak} dias restantes
                            </div>
                        )}
                    </div>

                    {/* DEBUG: Reset Today Button */}
                    <button
                        onClick={() => {
                            if (window.confirm('RESETAR todo o histórico de hoje? (Debug)')) {
                                updateWorkout(today, 'A', '__reset__', false);
                                // Also clear 'B' and 'C' just in case? 
                                // The __reset__ logic clears the DAY log's completedPlans.
                                // It depends on planId passed but inside __reset__ block I used ...dayLog.workout which has planId. 
                                // Actually, my __reset__ implementation sets planId: planId.
                                // But it wipes completedPlans: [].
                                // So calling it once is enough.
                                alert('Dia resetado!');
                            }
                        }}
                        style={{
                            marginTop: '1rem',
                            width: '100%',
                            padding: '0.25rem',
                            background: 'rgba(255, 0, 0, 0.1)',
                            border: '1px dashed rgba(255, 0, 0, 0.3)',
                            borderRadius: '4px',
                            color: 'rgba(255, 0, 0, 0.5)',
                            fontSize: '0.6rem',
                            cursor: 'pointer'
                        }}
                    >
                        [DEBUG] Resetar Dia de Hoje
                    </button>

                    {/* History Toggle */}
                    {lootboxData.rewardHistory.length > 0 && (
                        <button
                            onClick={() => setShowHistory(!showHistory)}
                            style={{
                                marginTop: '0.5rem',
                                background: 'none',
                                border: 'none',
                                color: 'var(--text-muted)',
                                fontSize: '0.7rem',
                                cursor: 'pointer',
                                display: 'block',
                                margin: '0.5rem auto 0'
                            }}
                        >
                            {showHistory ? '▲ Ocultar histórico' : '▼ Histórico de Prêmios'}
                        </button>
                    )}
                    {/* Reward History Content */}
                    {showHistory && lootboxData.rewardHistory.length > 0 && (
                        <div style={{ marginTop: '0.75rem', borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '0.75rem' }}>
                            {lootboxData.rewardHistory.slice().reverse().map((reward, idx) => (
                                <div
                                    key={idx}
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '0.5rem',
                                        padding: '0.5rem 0',
                                        borderBottom: idx < lootboxData.rewardHistory.length - 1 ? '1px solid rgba(255,255,255,0.05)' : 'none'
                                    }}
                                >
                                    <span style={{ fontSize: '1.25rem' }}>{reward.icon}</span>
                                    <div style={{ flex: 1 }}>
                                        <div style={{ fontSize: '0.8rem', color: rewardDefinitions.rarities[reward.rarity]?.color || '#fff' }}>
                                            {reward.name}
                                        </div>
                                        <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>
                                            {new Date(reward.claimedAt).toLocaleDateString('pt-BR')}
                                        </div>
                                    </div>
                                    <span style={{
                                        fontSize: '0.6rem',
                                        padding: '0.15rem 0.4rem',
                                        borderRadius: '4px',
                                        background: `${rewardDefinitions.rarities[reward.rarity]?.color}22`,
                                        color: rewardDefinitions.rarities[reward.rarity]?.color
                                    }}>
                                        {rewardDefinitions.rarities[reward.rarity]?.name}
                                    </span>
                                </div>
                            ))}
                        </div>
                    )}
                </section>

                {/* Voucher Inventory */}
                <section className="card" style={{ padding: '1rem', marginBottom: '1.5rem' }}>
                    <h3 style={{ margin: '0 0 0.75rem 0', fontSize: '0.85rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                        🎟️ Meus Vales
                    </h3>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                        {rewardDefinitions.vouchers.map(v => (
                            <div
                                key={v.id}
                                style={{
                                    flex: 1,
                                    background: vouchers[v.id] > 0 ? 'rgba(0, 255, 136, 0.1)' : 'rgba(255,255,255,0.03)',
                                    border: vouchers[v.id] > 0 ? '1px solid var(--success)' : '1px solid rgba(255,255,255,0.1)',
                                    borderRadius: '12px',
                                    padding: '0.5rem',
                                    textAlign: 'center'
                                }}
                            >
                                <div style={{ fontSize: '1.25rem', marginBottom: '0.15rem' }}>{v.icon}</div>
                                <div style={{
                                    fontSize: '1.1rem',
                                    fontWeight: 'bold',
                                    color: vouchers[v.id] > 0 ? 'var(--success)' : 'var(--text-muted)'
                                }}>
                                    {vouchers[v.id] || 0}
                                </div>
                                <div style={{ fontSize: '0.55rem', color: 'var(--text-muted)', marginTop: '0.1rem', marginBottom: '0.3rem' }}>
                                    {v.name.replace('Vale-', '')}
                                </div>
                                {vouchers[v.id] > 0 && (
                                    <button
                                        onClick={() => useVoucher(v.id)}
                                        style={{
                                            width: '100%',
                                            padding: '0.25rem',
                                            background: 'var(--success)',
                                            border: 'none',
                                            borderRadius: '6px',
                                            color: '#000',
                                            fontSize: '0.6rem',
                                            fontWeight: 'bold',
                                            cursor: 'pointer'
                                        }}
                                    >
                                        USAR
                                    </button>
                                )}
                            </div>
                        ))}
                    </div>
                </section>

                {/* Main Workout Card */}
                <section className={`card ${isTodayCompleted ? 'card-success' : 'card-accent'}`} style={{
                    padding: 0,
                    overflow: 'hidden',
                    marginBottom: '1.5rem'
                }}>
                    {/* Card Header */}
                    <div style={{
                        background: isTodayCompleted
                            ? 'linear-gradient(135deg, #00FF7F, #00AA55)'
                            : 'linear-gradient(135deg, var(--accent-color), #FF4D6D)',
                        padding: '1.5rem',
                        position: 'relative',
                        overflow: 'hidden'
                    }}>
                        {/* Decorative circles */}
                        <div style={{
                            position: 'absolute', top: '-20px', right: '-20px',
                            width: '100px', height: '100px', borderRadius: '50%',
                            background: 'rgba(255,255,255,0.1)'
                        }} />
                        <div style={{
                            position: 'absolute', bottom: '-30px', left: '-30px',
                            width: '80px', height: '80px', borderRadius: '50%',
                            background: 'rgba(255,255,255,0.05)'
                        }} />

                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', position: 'relative', zIndex: 1 }}>
                            <div>
                                <span style={{
                                    fontSize: '0.7rem', fontWeight: 'bold', textTransform: 'uppercase',
                                    opacity: 0.9, letterSpacing: '0.1em'
                                }}>
                                    {isTodayCompleted ? '✓ Concluído Hoje' : '⚡ Próximo Treino'}
                                </span>
                                <h2 style={{ fontSize: '2.25rem', margin: '0.25rem 0 0 0', fontFamily: 'var(--font-display)', letterSpacing: '0.05em' }}>
                                    TREINO {displayPlan?.id}
                                </h2>
                                <p style={{ margin: '0.25rem 0 0 0', opacity: 0.9, fontSize: '0.9rem' }}>{displayPlan?.subtitle}</p>
                            </div>
                            <div style={{
                                background: 'rgba(255,255,255,0.2)',
                                padding: '0.75rem',
                                borderRadius: '16px',
                                backdropFilter: 'blur(10px)'
                            }}>
                                {isTodayCompleted ? <Trophy size={28} /> : <Zap size={28} />}
                            </div>
                        </div>
                    </div>

                    {/* Card Body */}
                    <div style={{ padding: '1.5rem' }}>
                        {isTodayCompleted ? (
                            <div style={{ textAlign: 'center' }}>
                                <div style={{
                                    width: '64px', height: '64px', borderRadius: '50%',
                                    background: 'rgba(0, 255, 127, 0.1)',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    margin: '0 auto 1rem'
                                }}>
                                    <Trophy size={32} color="var(--success)" className="glow-success" />
                                </div>
                                <p style={{ color: 'var(--text-secondary)', marginBottom: '1rem', fontSize: '0.9rem' }}>
                                    Mandou bem! Próximo: <strong style={{ color: 'var(--text-primary)' }}>Treino {suggestedPlanId}</strong>
                                </p>
                                <button
                                    onClick={() => {
                                        if (window.confirm(`Fazer o Treino ${suggestedPlanId} agora? (Treino extra)`)) {
                                            handleStartWorkout(true);
                                        }
                                    }}
                                    className="btn-ghost"
                                    style={{ width: '100%', padding: '0.875rem' }}
                                >
                                    <Play size={18} /> Fazer Treino Extra
                                </button>
                            </div>
                        ) : (
                            <>
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                        <Target size={18} color="var(--text-muted)" />
                                        <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                                            {displayPlan?.exercises.length} exercícios
                                        </span>
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                        <Trophy size={18} color="var(--success)" />
                                        <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                                            {weeklyCount} na semana
                                        </span>
                                    </div>
                                </div>

                                <button
                                    onClick={() => handleStartWorkout(false)}
                                    className="btn-primary pulse-glow"
                                    style={{
                                        width: '100%',
                                        padding: '1.125rem',
                                        fontSize: '1.1rem',
                                        display: 'flex',
                                        justifyContent: 'center',
                                        alignItems: 'center',
                                        gap: '0.5rem',
                                        fontFamily: 'var(--font-heading)',
                                        letterSpacing: '0.05em'
                                    }}
                                >
                                    <Play size={22} fill="currentColor" />
                                    COMEÇAR TREINO
                                </button>
                            </>
                        )}
                    </div>
                </section>

                {/* Today's Progress */}
                <section className="card" style={{ marginBottom: '1.5rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                        <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 600 }}>Progresso de Hoje</h3>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-around', alignItems: 'center' }}>
                        {/* Workout Progress */}
                        <div style={{ textAlign: 'center' }} onClick={() => navigate('/workout')}>
                            <div style={{ position: 'relative', display: 'inline-block' }}>
                                <CircularProgress progress={workoutProgress} color={workoutProgress >= 100 ? 'var(--success)' : 'var(--accent-color)'} />
                                <div style={{
                                    position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
                                    fontSize: '1.25rem', fontWeight: 'bold'
                                }}>
                                    {workoutProgress}%
                                </div>
                            </div>
                            <div style={{ marginTop: '0.5rem', fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                                Treino
                            </div>
                        </div>

                        {/* Diet Progress */}
                        <div style={{ textAlign: 'center' }} onClick={() => navigate('/nutrition')}>
                            <div style={{ position: 'relative', display: 'inline-block' }}>
                                <CircularProgress progress={dietProgress} color={dietProgress >= 100 ? 'var(--success)' : 'var(--warning)'} />
                                <div style={{
                                    position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
                                    fontSize: '1.25rem', fontWeight: 'bold'
                                }}>
                                    {dietProgress}%
                                </div>
                            </div>
                            <div style={{ marginTop: '0.5rem', fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                                Dieta
                            </div>
                        </div>

                        {/* Water Progress */}
                        <div style={{ textAlign: 'center' }} onClick={() => navigate('/nutrition')}>
                            <div style={{ position: 'relative', display: 'inline-block' }}>
                                <CircularProgress
                                    progress={Math.min(100, (currentWater / waterGoal) * 100)}
                                    color="var(--secondary-color)"
                                />
                                <div style={{
                                    position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)'
                                }}>
                                    <Droplets size={24} color="var(--secondary-color)" />
                                </div>
                            </div>
                            <div style={{ marginTop: '0.5rem', fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                                Água
                            </div>
                        </div>
                    </div>
                </section>

                {/* Quick Actions */}
                <section className="card" onClick={() => navigate('/nutrition')} style={{
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    background: 'linear-gradient(135deg, var(--bg-card), rgba(255, 7, 58, 0.05))',
                    borderColor: 'rgba(255, 7, 58, 0.2)'
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <div style={{
                            background: 'var(--accent-soft)',
                            padding: '0.75rem',
                            borderRadius: '12px'
                        }}>
                            <Utensils size={24} color="var(--accent-color)" />
                        </div>
                        <div>
                            <div style={{ fontWeight: 600, marginBottom: '0.125rem' }}>Registrar Refeição</div>
                            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{totalMeals - mealsDone} pendentes</div>
                        </div>
                    </div>
                    <ChevronRight size={20} color="var(--text-muted)" />
                </section>

            </div>

            {/* Loot Box Reward Modal - Outside container for proper centering */}
            {showRewardModal && (
                <div
                    style={{
                        position: 'fixed',
                        top: 0, left: 0, right: 0, bottom: 0,
                        background: spinPhase === 4 && claimedReward?.rarity === 'epic'
                            ? 'radial-gradient(circle, rgba(168,85,247,0.3) 0%, rgba(0,0,0,0.95) 70%)'
                            : 'rgba(0, 0, 0, 0.95)',
                        backdropFilter: 'blur(15px)',
                        zIndex: 9999,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexDirection: 'column',
                        overflow: 'hidden'
                    }}
                    onClick={() => !isRevealing && setShowRewardModal(false)}
                >
                    {/* Animated background particles */}
                    <div style={{
                        position: 'absolute',
                        top: 0, left: 0, right: 0, bottom: 0,
                        background: spinPhase >= 2
                            ? 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' viewBox=\'0 0 100 100\'%3E%3Ccircle cx=\'50\' cy=\'50\' r=\'2\' fill=\'%23fff\' opacity=\'0.3\'/%3E%3C/svg%3E")'
                            : 'none',
                        backgroundSize: '50px 50px',
                        animation: spinPhase >= 2 ? 'bgPulse 0.5s ease infinite' : 'none',
                        opacity: 0.5
                    }} />

                    {/* Phase 1: Shaking Chest */}
                    {spinPhase === 1 && (
                        <div style={{ textAlign: 'center', zIndex: 1 }}>
                            <div style={{
                                fontSize: '6rem',
                                animation: 'shake 0.1s ease infinite'
                            }}>
                                🎁
                            </div>
                            <p style={{ color: '#FFD700', marginTop: '1rem', fontSize: '1.5rem', fontWeight: 'bold', textShadow: '0 0 20px #FFD700' }}>
                                Preparando...
                            </p>
                        </div>
                    )}

                    {/* Phase 2 & 3: Slot Machine Spinning */}
                    {(spinPhase === 2 || spinPhase === 3) && (
                        <div style={{ textAlign: 'center', zIndex: 1 }}>
                            {/* Slot frame */}
                            <div style={{
                                background: 'linear-gradient(180deg, #1a1a2e 0%, #16213e 100%)',
                                border: '4px solid #FFD700',
                                borderRadius: '20px',
                                padding: '1.5rem 2rem',
                                boxShadow: '0 0 40px rgba(255, 215, 0, 0.5), inset 0 0 20px rgba(0,0,0,0.5)'
                            }}>
                                {/* Blinking lights */}
                                <div style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
                                    {[0, 1, 2, 3, 4, 5, 6, 7].map(i => (
                                        <div key={i} style={{
                                            width: '10px',
                                            height: '10px',
                                            borderRadius: '50%',
                                            background: '#FFD700',
                                            animation: `blink 0.3s ease infinite ${i * 0.1}s`
                                        }} />
                                    ))}
                                </div>

                                {/* Spinning reward */}
                                <div style={{
                                    fontSize: '5rem',
                                    height: '100px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    background: 'rgba(0,0,0,0.5)',
                                    borderRadius: '10px',
                                    border: '2px solid rgba(255,255,255,0.2)',
                                    overflow: 'hidden'
                                }}>
                                    <span style={{
                                        animation: spinPhase === 2 ? 'none' : 'none',
                                        filter: spinPhase === 2 ? 'blur(2px)' : 'none'
                                    }}>
                                        {allRewardsForSpin[currentSpinIcon]?.icon}
                                    </span>
                                </div>

                                <p style={{
                                    color: spinPhase === 2 ? '#FFD700' : '#FF6B6B',
                                    marginTop: '1rem',
                                    fontSize: '1.25rem',
                                    fontWeight: 'bold',
                                    animation: 'pulse 0.5s ease infinite'
                                }}>
                                    {spinPhase === 2 ? '🎰 GIRANDO...' : '✨ PARANDO...'}
                                </p>
                            </div>
                        </div>
                    )}

                    {/* Phase 4: Epic Reveal */}
                    {spinPhase === 4 && claimedReward && (
                        <div
                            onClick={(e) => e.stopPropagation()}
                            style={{
                                background: `linear-gradient(145deg, ${rewardDefinitions.rarities[claimedReward.rarity].color}22, ${rewardDefinitions.rarities[claimedReward.rarity].color}55)`,
                                border: `3px solid ${rewardDefinitions.rarities[claimedReward.rarity].color}`,
                                borderRadius: '24px',
                                padding: '2.5rem 2rem',
                                textAlign: 'center',
                                maxWidth: '320px',
                                animation: 'epicReveal 0.8s ease',
                                boxShadow: `0 0 60px ${rewardDefinitions.rarities[claimedReward.rarity].color}88, 0 0 120px ${rewardDefinitions.rarities[claimedReward.rarity].color}44`,
                                zIndex: 1
                            }}
                        >
                            {/* Rarity label */}
                            <div style={{
                                fontSize: '0.9rem',
                                fontWeight: 'bold',
                                color: rewardDefinitions.rarities[claimedReward.rarity].color,
                                textTransform: 'uppercase',
                                letterSpacing: '4px',
                                marginBottom: '1rem',
                                textShadow: `0 0 20px ${rewardDefinitions.rarities[claimedReward.rarity].color}`
                            }}>
                                ✨ {rewardDefinitions.rarities[claimedReward.rarity].name} ✨
                            </div>

                            {/* Icon with glow */}
                            <div style={{
                                fontSize: '5rem',
                                marginBottom: '1rem',
                                filter: `drop-shadow(0 0 30px ${rewardDefinitions.rarities[claimedReward.rarity].color})`,
                                animation: 'float 2s ease-in-out infinite'
                            }}>
                                {claimedReward.icon}
                            </div>

                            <h2 style={{
                                color: '#fff',
                                margin: '0 0 0.5rem 0',
                                fontSize: '1.5rem',
                                textShadow: '0 2px 10px rgba(0,0,0,0.5)'
                            }}>
                                {claimedReward.name}
                            </h2>

                            <p style={{
                                color: 'rgba(255,255,255,0.8)',
                                fontSize: '0.95rem',
                                margin: '0 0 1.5rem 0'
                            }}>
                                {claimedReward.description}
                            </p>

                            <button
                                onClick={() => {
                                    setShowRewardModal(false);
                                    setSpinPhase(0);
                                }}
                                style={{
                                    background: `linear-gradient(135deg, ${rewardDefinitions.rarities[claimedReward.rarity].color}, ${rewardDefinitions.rarities[claimedReward.rarity].color}88)`,
                                    border: 'none',
                                    borderRadius: '12px',
                                    padding: '1rem 3rem',
                                    color: '#fff',
                                    fontWeight: 'bold',
                                    fontSize: '1.1rem',
                                    cursor: 'pointer',
                                    boxShadow: `0 4px 20px ${rewardDefinitions.rarities[claimedReward.rarity].color}66`,
                                    textTransform: 'uppercase',
                                    letterSpacing: '2px'
                                }}
                            >
                                🎉 COLETAR
                            </button>
                        </div>
                    )}
                </div>
            )}

            {/* Casino animation keyframes */}
            <style>{`
                @keyframes shake {
                    0%, 100% { transform: translateX(0) rotate(0deg); }
                    25% { transform: translateX(-10px) rotate(-5deg); }
                    75% { transform: translateX(10px) rotate(5deg); }
                }
                @keyframes blink {
                    0%, 100% { opacity: 1; box-shadow: 0 0 10px #FFD700; }
                    50% { opacity: 0.3; box-shadow: none; }
                }
                @keyframes pulse {
                    0%, 100% { transform: scale(1); }
                    50% { transform: scale(1.05); }
                }
                @keyframes pulse-critical {
                    0% { transform: scale(1); box-shadow: 0 0 20px #FFD700; border-color: #FFD700; }
                    50% { transform: scale(1.02); box-shadow: 0 0 40px #FFD700, 0 0 20px #FF0000; border-color: #FF0000; }
                    100% { transform: scale(1); box-shadow: 0 0 20px #FFD700; border-color: #FFD700; }
                }
                @keyframes pulse-high {
                    0% { box-shadow: 0 0 10px rgba(255, 77, 109, 0.4); }
                    50% { box-shadow: 0 0 25px rgba(255, 77, 109, 0.8); }
                    100% { box-shadow: 0 0 10px rgba(255, 77, 109, 0.4); }
                }
                @keyframes bgPulse {
                    0%, 100% { opacity: 0.3; }
                    50% { opacity: 0.6; }
                }
                @keyframes epicReveal {
                    0% { transform: scale(0) rotate(-10deg); opacity: 0; }
                    50% { transform: scale(1.1) rotate(3deg); }
                    100% { transform: scale(1) rotate(0deg); opacity: 1; }
                }
                @keyframes float {
                    0%, 100% { transform: translateY(0); }
                    50% { transform: translateY(-10px); }
                }
                @keyframes spin {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                }
                @keyframes fadeInScale {
                    from { opacity: 0; transform: scale(0.8); }
                    to { opacity: 1; transform: scale(1); }
                }
            `}</style>
        </>
    );
};

export default Dashboard;

