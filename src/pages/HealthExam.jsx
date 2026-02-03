import { useState, useEffect } from 'react';
import { useDailyTracking } from '../hooks/useDailyTracking';
import { Activity, Scale, Ruler, Heart, Info, ChevronRight, ArrowLeft, TrendingUp, TrendingDown, Minus, Trash2 } from 'lucide-react';

const HealthExam = () => {
    const { healthExams, addHealthExam, deleteHealthExam } = useDailyTracking();
    const [view, setView] = useState('dashboard'); // dashboard, form, report
    const [step, setStep] = useState(1);

    // Form State
    const [formData, setFormData] = useState({
        weight: '',
        height: '',
        age: '',
        gender: 'male',
        neck: '',
        waist: '',
        hip: '',
        activityLevel: 1.2
    });

    // Temp result for animation
    const [calculating, setCalculating] = useState(false);
    const [lastResult, setLastResult] = useState(null);

    const latestExam = healthExams[0];
    const previousExam = healthExams[1];

    const activityLevels = [
        { value: 1.2, label: 'Sedentário', desc: 'Pouco ou nenhum exercício' },
        { value: 1.375, label: 'Levemente Ativo', desc: 'Exercício leve 1-3 dias/sem' },
        { value: 1.55, label: 'Moderadamente Ativo', desc: 'Exercício moderado 3-5 dias/sem' },
        { value: 1.725, label: 'Muito Ativo', desc: 'Exercício pesado 6-7 dias/sem' },
        { value: 1.9, label: 'Extremamente Ativo', desc: 'Treino muito pesado + trabalho físico' }
    ];

    const handleInputChange = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const calculateMetrics = () => {
        const { weight, height, age, gender, neck, waist, hip, activityLevel } = formData;
        const hM = height / 100; // height in meters

        // 1. BMI
        const bmi = weight / (hM * hM);

        // 2. Body Fat (Navy Method)
        // Log10 is Math.log10
        let bodyFat = 0;
        if (gender === 'male') {
            bodyFat = 495 / (1.0324 - 0.19077 * Math.log10(waist - neck) + 0.15456 * Math.log10(height)) - 450;
        } else {
            bodyFat = 495 / (1.29579 - 0.35004 * Math.log10(Number(waist) + Number(hip) - Number(neck)) + 0.22100 * Math.log10(height)) - 450;
        }
        // Clamp bodyfat
        bodyFat = Math.max(2, Math.min(60, bodyFat));

        // 3. Fat Free Mass & FFMI
        const leanMass = weight * (1 - bodyFat / 100);
        const ffmi = leanMass / (hM * hM);
        const normalizedFfmi = ffmi + 6.1 * (1.8 - hM); // Normalized for height

        // 4. TMB (Mifflin-St Jeor)
        let tmb = 10 * weight + 6.25 * height - 5 * age + (gender === 'male' ? 5 : -161);

        // 5. TDEE
        const tdee = tmb * activityLevel;

        // 6. Health Score (Gamified)
        // Ideal Body Fat: Men 10-15%, Women 18-24%
        // Ideal BMI: 18.5-25
        let score = 70; // Base score

        // Penalty/Bonus based on deviation from ideal BMI
        if (bmi >= 18.5 && bmi <= 25) score += 10;
        else score -= Math.abs(22 - bmi) * 2;

        // Penalty/Bonus based on Body Fat
        const idealFat = gender === 'male' ? 13 : 21;
        score -= Math.abs(idealFat - bodyFat) * 1.5;

        // Bonus for FFMI (Muscle)
        if (ffmi > 20) score += (ffmi - 20) * 2;

        score = Math.max(0, Math.min(100, Math.round(score)));

        return {
            bmi: parseFloat(bmi.toFixed(1)),
            bodyFat: parseFloat(bodyFat.toFixed(1)),
            leanMass: parseFloat(leanMass.toFixed(1)),
            ffmi: parseFloat(ffmi.toFixed(1)),
            tmb: Math.round(tmb),
            tdee: Math.round(tdee),
            healthScore: score
        };
    };

    const handleSubmit = () => {
        setCalculating(true);
        const results = calculateMetrics();

        setTimeout(() => {
            const finalData = {
                metrics: formData,
                results: results
            };
            addHealthExam(finalData);
            setLastResult(finalData);
            setCalculating(false);
            setView('report');
            setStep(1);
        }, 2000); // Fake processing time for "Premium" feel
    };

    const renderDashboard = () => (
        <div className="fade-in">
            <header style={{ marginBottom: '2rem', textAlign: 'center' }}>
                <h1 style={{ fontSize: '1.75rem', fontWeight: '800', margin: '0 0 0.5rem', background: 'linear-gradient(135deg, #fff, #aaa)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                    Central de Saúde
                </h1>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                    Monitore sua evolução biológica com precisão clínica.
                </p>
            </header>

            {/* Main Action */}
            <div className="card" style={{ padding: '2rem', textAlign: 'center', marginBottom: '2rem', border: '1px dashed var(--accent-color)' }}>
                <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: 'rgba(168, 85, 247, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem' }}>
                    <Activity size={32} color="var(--accent-color)" />
                </div>
                <h3 style={{ margin: '0 0 0.5rem' }}>Realizar Novo Exame</h3>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
                    Atualize suas métricas para recalcular seu Score de Saúde e TDEE.
                </p>
                <button
                    onClick={() => setView('form')}
                    style={{
                        background: 'var(--accent-color)',
                        color: 'white',
                        border: 'none',
                        padding: '0.75rem 2rem',
                        borderRadius: '30px',
                        fontWeight: 'bold',
                        fontSize: '1rem',
                        cursor: 'pointer',
                        boxShadow: '0 4px 15px var(--accent-glow)'
                    }}
                >
                    INICIAR CHECK-UP
                </button>
            </div>

            {/* Latest Stats Summary */}
            {latestExam ? (
                <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                        <h3 style={{ margin: 0, fontSize: '1rem' }}>Último Relatório</h3>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{new Date(latestExam.date).toLocaleDateString()}</span>
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    if (window.confirm('Excluir este exame?')) deleteHealthExam(latestExam.id);
                                }}
                                style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
                            >
                                <Trash2 size={16} color="var(--text-muted)" />
                            </button>
                        </div>
                    </div>

                    <div className="card" style={{ padding: '1.5rem', marginBottom: '1rem', background: 'linear-gradient(135deg, #1f2937, #111827)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                            <div>
                                <div style={{ fontSize: '0.8rem', color: '#9CA3AF' }}>HEALTH SCORE</div>
                                <div style={{ fontSize: '3rem', fontWeight: '800', lineHeight: 1, color: latestExam.results.healthScore >= 80 ? '#10B981' : latestExam.results.healthScore >= 60 ? '#F59E0B' : '#EF4444' }}>
                                    {latestExam.results.healthScore}
                                </div>
                            </div>
                            <div style={{ textAlign: 'right' }}>
                                <div style={{ fontSize: '0.8rem', color: '#9CA3AF' }}>GORDURA CORPORAL</div>
                                <div style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>{latestExam.results.bodyFat}%</div>
                                <div style={{ fontSize: '0.75rem', color: '#fff' }}>
                                    {previousExam ? (
                                        latestExam.results.bodyFat < previousExam.results.bodyFat
                                            ? <span style={{ color: '#10B981' }}>▼ {Math.abs(latestExam.results.bodyFat - previousExam.results.bodyFat).toFixed(1)}%</span>
                                            : <span style={{ color: '#EF4444' }}>▲ {Math.abs(latestExam.results.bodyFat - previousExam.results.bodyFat).toFixed(1)}%</span>
                                    ) : '-'}
                                </div>
                            </div>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                            <div style={{ background: 'rgba(255,255,255,0.05)', padding: '0.75rem', borderRadius: '8px' }}>
                                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>PESO</div>
                                <div style={{ fontSize: '1.1rem', fontWeight: 'bold' }}>{latestExam.metrics.weight}kg</div>
                            </div>
                            <div style={{ background: 'rgba(255,255,255,0.05)', padding: '0.75rem', borderRadius: '8px' }}>
                                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>METABOLISMO</div>
                                <div style={{ fontSize: '1.1rem', fontWeight: 'bold' }}>{latestExam.results.tmb} kcal</div>
                            </div>
                        </div>

                        <button
                            onClick={() => { setLastResult(latestExam); setView('report'); }}
                            style={{
                                width: '100%', marginTop: '1rem', padding: '0.75rem',
                                background: 'transparent', border: '1px solid rgba(255,255,255,0.1)',
                                borderRadius: '8px', color: '#fff', fontSize: '0.8rem', cursor: 'pointer'
                            }}
                        >
                            Ver Detalhes Completos
                        </button>
                    </div>
                </div>
            ) : null}

            {healthExams.length >= 2 && (
                <div style={{ marginTop: '2rem', textAlign: 'center', opacity: 0.5 }}>
                    <p style={{ fontSize: '0.8rem' }}>Histórico disponível: {healthExams.length} exames</p>
                </div>
            )}
        </div>
    );

    const renderInput = (label, field, type = 'number', placeholder = '0') => (
        <div style={{ marginBottom: '1.25rem' }}>
            <label style={{ display: 'block', fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                {label}
            </label>
            <input
                type={type}
                value={formData[field]}
                onChange={(e) => handleInputChange(field, e.target.value)}
                placeholder={placeholder}
                style={{
                    width: '100%',
                    padding: '1rem',
                    background: 'var(--bg-card)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: '12px',
                    color: '#fff',
                    fontSize: '1.1rem',
                    outline: 'none'
                }}
            />
        </div>
    );

    const renderForm = () => (
        <div className="fade-in">
            <header style={{ display: 'flex', alignItems: 'center', marginBottom: '2rem' }}>
                <button onClick={() => setStep(prev => prev > 1 ? prev - 1 : setView('dashboard'))} style={{ background: 'none', border: 'none', color: '#fff', padding: 0, cursor: 'pointer', marginRight: '1rem' }}>
                    <ArrowLeft />
                </button>
                <div style={{ flex: 1 }}>
                    <div style={{ height: '4px', background: 'rgba(255,255,255,0.1)', borderRadius: '2px', overflow: 'hidden' }}>
                        <div style={{ width: `${(step / 3) * 100}%`, height: '100%', background: 'var(--accent-color)', transition: 'width 0.3s ease' }} />
                    </div>
                </div>
                <span style={{ marginLeft: '1rem', fontSize: '0.9rem', fontWeight: 'bold' }}>{step}/3</span>
            </header>

            <h2 style={{ marginBottom: '1.5rem' }}>
                {step === 1 && "Dados Básicos"}
                {step === 2 && "Medidas Corporais"}
                {step === 3 && "Nível de Atividade"}
            </h2>

            {step === 1 && (
                <>
                    {renderInput("Peso (kg)", "weight")}
                    {renderInput("Altura (cm)", "height")}
                    {renderInput("Idade", "age")}
                    <div style={{ marginBottom: '1.25rem' }}>
                        <label style={{ display: 'block', fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '0.5rem', textTransform: 'uppercase' }}>GÊNERO</label>
                        <div style={{ display: 'flex', gap: '1rem' }}>
                            {['male', 'female'].map(g => (
                                <button
                                    key={g}
                                    onClick={() => handleInputChange('gender', g)}
                                    style={{
                                        flex: 1,
                                        padding: '1rem',
                                        background: formData.gender === g ? 'var(--accent-color)' : 'var(--bg-card)',
                                        border: '1px solid rgba(255,255,255,0.1)',
                                        borderRadius: '12px',
                                        color: '#fff',
                                        fontWeight: 'bold',
                                        cursor: 'pointer'
                                    }}
                                >
                                    {g === 'male' ? 'Masculino' : 'Feminino'}
                                </button>
                            ))}
                        </div>
                    </div>
                </>
            )}

            {step === 2 && (
                <>
                    <div style={{ background: 'rgba(59, 130, 246, 0.1)', border: '1px solid #3B82F6', borderRadius: '8px', padding: '1rem', marginBottom: '1.5rem', fontSize: '0.85rem' }}>
                        <Info size={16} style={{ marginBottom: '0.5rem', display: 'block' }} />
                        Use uma fita métrica. Meça o pescoço logo abaixo do pomo de adão. Cintura na altura do umbigo.
                    </div>
                    {renderInput("Pescoço (cm)", "neck")}
                    {renderInput("Cintura (cm)", "waist")}
                    {formData.gender === 'female' && renderInput("Quadril (cm)", "hip")}
                </>
            )}

            {step === 3 && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    {activityLevels.map((level) => (
                        <button
                            key={level.value}
                            onClick={() => handleInputChange('activityLevel', level.value)}
                            style={{
                                padding: '1.25rem',
                                background: formData.activityLevel === level.value ? 'var(--accent-color)' : 'var(--bg-card)',
                                border: '1px solid rgba(255,255,255,0.1)',
                                borderRadius: '12px',
                                color: '#fff',
                                textAlign: 'left',
                                cursor: 'pointer',
                                transition: 'all 0.2s'
                            }}
                        >
                            <div style={{ fontWeight: 'bold', marginBottom: '0.25rem' }}>{level.label}</div>
                            <div style={{ fontSize: '0.8rem', opacity: 0.8 }}>{level.desc}</div>
                        </button>
                    ))}
                </div>
            )}

            <button
                onClick={() => {
                    if (step < 3) setStep(prev => prev + 1);
                    else handleSubmit();
                }}
                disabled={!formData.weight || !formData.height} // Simple validation
                style={{
                    width: '100%',
                    marginTop: '2rem',
                    padding: '1rem',
                    background: '#fff',
                    color: '#000',
                    border: 'none',
                    borderRadius: '30px',
                    fontWeight: 'bold',
                    fontSize: '1rem',
                    cursor: 'pointer',
                    opacity: (!formData.weight || !formData.height) ? 0.5 : 1
                }}
            >
                {step === 3 ? "CALCULAR PONTUAÇÃO" : "CONTINUAR"}
            </button>
        </div>
    );

    const renderReport = () => {
        if (!lastResult) return null;
        const { results } = lastResult;

        return (
            <div className="fade-in">
                <header style={{ display: 'flex', alignItems: 'center', marginBottom: '1.5rem' }}>
                    <button onClick={() => setView('dashboard')} style={{ background: 'none', border: 'none', color: '#fff', padding: 0, cursor: 'pointer', marginRight: '1rem' }}>
                        <ArrowLeft />
                    </button>
                    <h2 style={{ margin: 0 }}>Relatório Completo</h2>
                </header>

                <div style={{ textAlign: 'center', padding: '2rem 0', position: 'relative' }}>
                    <div style={{
                        width: '180px', height: '180px', borderRadius: '50%',
                        background: `conic-gradient(
                            ${results.healthScore >= 80 ? '#10B981' : results.healthScore >= 60 ? '#F59E0B' : '#EF4444'} ${results.healthScore}%, 
                            rgba(255,255,255,0.1) 0
                        )`,
                        margin: '0 auto',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        boxShadow: `0 0 30px ${results.healthScore >= 80 ? 'rgba(16, 185, 129, 0.3)' : results.healthScore >= 60 ? 'rgba(245, 158, 11, 0.3)' : 'rgba(239, 68, 68, 0.3)'}`
                    }}>
                        <div style={{
                            width: '160px', height: '160px', borderRadius: '50%', background: 'var(--bg-primary)',
                            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center'
                        }}>
                            <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>HEALTH SCORE</div>
                            <div style={{ fontSize: '4rem', fontWeight: '800', lineHeight: 1 }}>{results.healthScore}</div>
                        </div>
                    </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '2rem' }}>
                    <div className="card" style={{ padding: '1rem' }}>
                        <div style={{ fontSize: '3rem', marginBottom: '0.5rem' }}>💧</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>GORDURA CORPORAL</div>
                        <div style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>{results.bodyFat}%</div>
                        <div style={{ fontSize: '0.7rem', color: results.bodyFat <= 20 ? '#10B981' : '#F59E0B' }}>
                            {results.bodyFat <= 15 ? "Atleta" : results.bodyFat <= 24 ? "Fitness" : "Acima"}
                        </div>
                    </div>
                    <div className="card" style={{ padding: '1rem' }}>
                        <div style={{ fontSize: '3rem', marginBottom: '0.5rem' }}>🔥</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>GASTO DIÁRIO (TDEE)</div>
                        <div style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>{results.tdee}</div>
                        <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>kcal para manter</div>
                    </div>
                    <div className="card" style={{ padding: '1rem' }}>
                        <div style={{ fontSize: '3rem', marginBottom: '0.5rem' }}>⚖️</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>IMC</div>
                        <div style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>{results.bmi}</div>
                        <div style={{ fontSize: '0.7rem' }}>Normal: 18.5 - 25</div>
                    </div>
                    <div className="card" style={{ padding: '1rem' }}>
                        <div style={{ fontSize: '3rem', marginBottom: '0.5rem' }}>💪</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>FFMI (Músculo)</div>
                        <div style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>{results.ffmi}</div>
                        <div style={{ fontSize: '0.7rem' }}>{results.ffmi > 20 ? "Alto" : "Normal"}</div>
                    </div>
                </div>

                <div className="card" style={{ padding: '1.5rem' }}>
                    <h3 style={{ margin: '0 0 1rem' }}>Análise Metabólica</h3>
                    <p style={{ fontSize: '0.9rem', lineHeight: '1.6', color: '#ccc' }}>
                        Seu metabolismo basal é de <strong>{results.tmb} kcal</strong>. Para ganhar massa muscular, você deve consumir aproximadamente <strong>{results.tdee + 300} kcal</strong>. Para perder gordura, mire em <strong>{results.tdee - 500} kcal</strong>.
                    </p>
                </div>
            </div>
        );
    };

    if (calculating) {
        return (
            <div className="container" style={{ height: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column' }}>
                <div style={{ width: '60px', height: '60px', border: '5px solid rgba(255,255,255,0.1)', borderTopColor: 'var(--accent-color)', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
                <p style={{ marginTop: '1.5rem', color: 'var(--text-muted)' }}>Processando biometria...</p>
                <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
            </div>
        );
    }

    return (
        <div className="container" style={{ paddingBottom: '100px', paddingTop: '1rem' }}>
            {view === 'dashboard' && renderDashboard()}
            {view === 'form' && renderForm()}
            {view === 'report' && renderReport()}
        </div>
    );
};

export default HealthExam;
