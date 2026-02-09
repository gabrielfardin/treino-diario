import { useDailyTracking } from '../hooks/useDailyTracking';
import { Bug, RotateCcw } from 'lucide-react';

const DebugSettings = () => {
    const { updateWorkout } = useDailyTracking();
    const today = new Date().toLocaleDateString('en-CA');

    const handleResetToday = () => {
        if (window.confirm('RESETAR todo o histórico de hoje? (Treinos, Dieta e Água)')) {
            const STORAGE_KEY = 'treino_diario_logs';

            // Resetar treinos usando a função existente
            updateWorkout(today, 'A', '__reset__', false);

            // Aguardar para garantir que o updateWorkout foi processado
            setTimeout(() => {
                // Manipular logs diretamente para resetar água e dieta
                const logs = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');

                if (logs[today]) {
                    // Resetar água e refeições
                    logs[today].diet = {
                        meals: {},
                        water: 0
                    };

                    // Salvar de volta
                    localStorage.setItem(STORAGE_KEY, JSON.stringify(logs));
                }

                alert('Dia resetado! (Treinos, Dieta e Água)');
                window.location.reload();
            }, 100);
        }
    };

    return (
        <div className="card" style={{ padding: '1.5rem', marginBottom: '1.5rem' }}>
            <h3 style={{ margin: '0 0 1rem 0', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <Bug size={24} color="#ff073a" />
                Debug
            </h3>

            <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
                Ferramentas de desenvolvedor para testes e depuração.
            </p>

            <button
                onClick={handleResetToday}
                className="btn-ghost"
                style={{
                    width: '100%',
                    padding: '0.75rem',
                    background: 'rgba(255, 0, 0, 0.1)',
                    border: '1px dashed rgba(255, 0, 0, 0.3)',
                    borderRadius: '8px',
                    color: '#ff073a',
                    fontSize: '0.9rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.5rem'
                }}
            >
                <RotateCcw size={18} />
                Resetar Dia de Hoje
            </button>

            <p style={{
                marginTop: '0.75rem',
                fontSize: '0.75rem',
                color: 'var(--text-muted)',
                textAlign: 'center'
            }}>
                ⚠️ Isso irá remover todos os treinos, refeições e água de hoje
            </p>
        </div>
    );
};

export default DebugSettings;
