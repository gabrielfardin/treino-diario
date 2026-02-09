import BackupSettings from '../components/BackupSettings';
import DebugSettings from '../components/DebugSettings';
import { Settings as SettingsIcon } from 'lucide-react';

const Settings = () => {
    return (
        <div className="container fade-in" style={{ paddingBottom: '120px' }}>
            <header style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
                    <SettingsIcon size={24} color="var(--text-primary)" />
                    <h1 style={{ margin: 0, fontSize: '1.5rem' }}>Configurações</h1>
                </div>
            </header>

            <BackupSettings />

            <DebugSettings />

            {/* Future settings can go here */}
        </div>
    );
};

export default Settings;
