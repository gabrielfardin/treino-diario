import React, { useRef, useState } from 'react';
import { useDailyTracking } from '../hooks/useDailyTracking';
import { Download, Upload, AlertCircle, CheckCircle2, FileJson } from 'lucide-react';

const BackupSettings = () => {
    const { logs, vouchers, healthExams, lootboxData } = useDailyTracking();
    const fileInputRef = useRef(null);
    const [importStatus, setImportStatus] = useState(null); // 'success' | 'error' | null

    const handleExport = () => {
        const data = {
            logs,
            vouchers,
            healthExams,
            lootboxData,
            userProfile: JSON.parse(localStorage.getItem('initialUserProfile') || '{}'),
            workoutHistory: JSON.parse(localStorage.getItem('workout_history') || '{}'),
            meta: {
                backupDate: new Date().toISOString(),
                version: 1
            }
        };

        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        const dateStr = new Date().toISOString().split('T')[0];
        link.download = `backup-treino-diario-${dateStr}.json`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    };

    const handleImportClick = () => {
        fileInputRef.current.click();
    };

    const handleFileChange = (event) => {
        const file = event.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const backupData = JSON.parse(e.target.result);

                if (confirm('Isso irá SUBSTITUIR todos os seus dados atuais pelos do arquivo. Tem certeza?')) {
                    // Restore Logic
                    if (backupData.logs) localStorage.setItem('treino_diario_logs', JSON.stringify(backupData.logs));
                    if (backupData.vouchers) localStorage.setItem('treino_diario_vouchers', JSON.stringify(backupData.vouchers));
                    if (backupData.healthExams) localStorage.setItem('treino_diario_health_exams', JSON.stringify(backupData.healthExams));
                    if (backupData.lootboxData) localStorage.setItem('treino_diario_lootbox', JSON.stringify(backupData.lootboxData));
                    if (backupData.userProfile) localStorage.setItem('initialUserProfile', JSON.stringify(backupData.userProfile));
                    if (backupData.workoutHistory) localStorage.setItem('workout_history', JSON.stringify(backupData.workoutHistory));

                    setImportStatus('success');
                    setTimeout(() => {
                        window.location.reload();
                    }, 1500);
                }
            } catch (error) {
                console.error('Import error:', error);
                setImportStatus('error');
            }
        };
        reader.readAsText(file);

        // Reset input
        event.target.value = '';
    };

    return (
        <div className="card" style={{ padding: '1.5rem' }}>
            <h3 style={{ margin: '0 0 1rem 0', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <FileJson size={24} color="var(--accent-color)" />
                Backup Manual (Arquivo)
            </h3>

            <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
                Salve seus dados em um arquivo seguro ou restaure de um backup anterior.
                Guarde este arquivo no seu Google Drive, iCloud ou Email manualmente.
            </p>

            <div style={{ display: 'grid', gap: '1rem' }}>
                <button
                    onClick={handleExport}
                    className="btn-primary"
                    style={{ justifyContent: 'center', gap: '0.5rem', width: '100%' }}
                >
                    <Download size={18} />
                    Baixar Backup (.json)
                </button>

                <div style={{ position: 'relative' }}>
                    <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleFileChange}
                        accept=".json"
                        style={{ display: 'none' }}
                    />
                    <button
                        onClick={handleImportClick}
                        className="btn-secondary"
                        style={{ justifyContent: 'center', gap: '0.5rem', width: '100%' }}
                    >
                        <Upload size={18} />
                        Restaurar Backup
                    </button>
                </div>
            </div>

            {importStatus === 'success' && (
                <div style={{
                    marginTop: '1rem',
                    padding: '0.75rem',
                    background: 'rgba(0, 255, 127, 0.1)',
                    borderRadius: '8px',
                    color: 'var(--success)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    fontSize: '0.9rem'
                }}>
                    <CheckCircle2 size={18} />
                    Dados restaurados! Recarregando...
                </div>
            )}

            {importStatus === 'error' && (
                <div style={{
                    marginTop: '1rem',
                    padding: '0.75rem',
                    background: 'rgba(255, 7, 58, 0.1)',
                    borderRadius: '8px',
                    color: 'var(--danger)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    fontSize: '0.9rem'
                }}>
                    <AlertCircle size={18} />
                    Erro ao ler arquivo. Verifique se é um backup válido.
                </div>
            )}
        </div>
    );
};

export default BackupSettings;
