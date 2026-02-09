import { useState, useEffect } from 'react';
import { X, Download, Calendar, Clock } from 'lucide-react';

const BackupReminderModal = ({ onBackupNow, onDismiss }) => {
    const [isOpen, setIsOpen] = useState(false);

    useEffect(() => {
        // Verifica a cada minuto se é meia-noite
        const checkMidnight = () => {
            const now = new Date();
            const hours = now.getHours();
            const minutes = now.getMinutes();
            const today = now.toLocaleDateString('en-CA'); // YYYY-MM-DD

            // Verifica se é meia-noite (00:00)
            if (hours === 0 && minutes === 0) {
                const reminderData = JSON.parse(localStorage.getItem('backupReminderData') || '{}');

                // Verifica se já mostrou ou foi recusado hoje
                const lastShown = reminderData.lastShownDate;
                const dismissed = reminderData.dismissedDate;

                if (lastShown !== today && dismissed !== today) {
                    // Mostra o modal
                    setIsOpen(true);

                    // Marca como mostrado hoje
                    localStorage.setItem('backupReminderData', JSON.stringify({
                        ...reminderData,
                        lastShownDate: today
                    }));
                }
            }
        };

        // Checa imediatamente
        checkMidnight();

        // Checa a cada minuto
        const interval = setInterval(checkMidnight, 60000);

        return () => clearInterval(interval);
    }, []);

    const handleBackupNow = () => {
        setIsOpen(false);
        if (onBackupNow) onBackupNow();
    };

    const handleDismiss = () => {
        const today = new Date().toLocaleDateString('en-CA');
        const reminderData = JSON.parse(localStorage.getItem('backupReminderData') || '{}');

        // Marca como recusado hoje
        localStorage.setItem('backupReminderData', JSON.stringify({
            ...reminderData,
            dismissedDate: today
        }));

        setIsOpen(false);
        if (onDismiss) onDismiss();
    };

    if (!isOpen) return null;

    return (
        <div style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
            background: 'rgba(0, 0, 0, 0.85)',
            zIndex: 10000,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            padding: '1rem',
            backdropFilter: 'blur(8px)'
        }}>
            <div
                className="card fade-in-scale"
                style={{
                    maxWidth: '420px',
                    width: '100%',
                    padding: '2rem',
                    textAlign: 'center',
                    background: '#121212',
                    border: '1px solid var(--accent-color)'
                }}
            >
                {/* Ícone de relógio */}
                <div style={{
                    width: '80px',
                    height: '80px',
                    borderRadius: '50%',
                    background: 'linear-gradient(135deg, var(--accent-color), #FF4D6D)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto 1.5rem',
                    boxShadow: '0 0 30px var(--accent-glow)'
                }}>
                    <Clock size={40} color="#fff" />
                </div>

                <h2 style={{
                    fontSize: '1.5rem',
                    marginBottom: '0.5rem',
                    color: 'var(--text-primary)'
                }}>
                    🕛 Hora do Backup!
                </h2>

                <p style={{
                    color: 'var(--text-secondary)',
                    marginBottom: '1.5rem',
                    fontSize: '0.95rem',
                    lineHeight: '1.5'
                }}>
                    Proteja seus dados fazendo um backup agora. Leva apenas alguns segundos e garante que você não perca seu progresso!
                </p>

                {/* Botões */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    <button
                        onClick={handleBackupNow}
                        className="btn-primary"
                        style={{
                            width: '100%',
                            background: 'var(--accent-color)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '0.5rem'
                        }}
                    >
                        <Download size={20} />
                        Fazer Backup Agora
                    </button>

                    <button
                        onClick={handleDismiss}
                        className="btn-ghost"
                        style={{
                            width: '100%',
                            fontSize: '0.9rem',
                            color: 'var(--text-muted)'
                        }}
                    >
                        <Calendar size={18} style={{ marginRight: '0.5rem' }} />
                        Lembrar Amanhã
                    </button>
                </div>
            </div>
        </div>
    );
};

export default BackupReminderModal;
