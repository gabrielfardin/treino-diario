import { useState, useEffect, useRef, useCallback } from 'react';
import { X, Download, Image, Sparkles, Music, Share2, Plus, Copy } from 'lucide-react';
import { WorkoutArtGenerator } from '../utils/WorkoutArtGenerator';

const COLOR_THEMES = [
    { id: 'purple', color: '#a855f7', name: 'Roxo' },
    { id: 'green', color: '#00ff88', name: 'Verde' },
    { id: 'blue', color: '#3b82f6', name: 'Azul' },
    { id: 'orange', color: '#f97316', name: 'Laranja' },
    { id: 'pink', color: '#ec4899', name: 'Rosa' },
    { id: 'red', color: '#ef4444', name: 'Vermelho' }
];

const WorkoutShareModal = ({ isOpen, onClose, workoutName: defaultName, date, duration, streak = 0 }) => {
    const [mode, setMode] = useState('sticker');
    const [workoutName, setWorkoutName] = useState(defaultName || 'Meu Treino');
    const [musicName, setMusicName] = useState('');
    const [artistName, setArtistName] = useState('');

    // Agora pode ser um ID ou um Hex
    const [colorTheme, setColorTheme] = useState('purple');
    const [customColor, setCustomColor] = useState('#ffffff');

    const [previewUrl, setPreviewUrl] = useState('');
    const [isGenerating, setIsGenerating] = useState(false);
    const [copyFeedback, setCopyFeedback] = useState(false);

    // Ref para o input de cor invisível
    const colorInputRef = useRef(null);

    // OTIMIZAÇÃO: Debounce timer
    const debounceTimerRef = useRef(null);

    useEffect(() => {
        if (isOpen) {
            setWorkoutName(defaultName || 'Meu Treino');
            generatePreview();
        }
    }, [isOpen, defaultName]);

    // OTIMIZAÇÃO: Debounce para inputs de texto
    useEffect(() => {
        if (!isOpen) return;

        // Limpa timer anterior
        if (debounceTimerRef.current) {
            clearTimeout(debounceTimerRef.current);
        }

        // Aguarda 300ms após última mudança para regenerar
        debounceTimerRef.current = setTimeout(() => {
            generatePreview();
        }, 300);

        return () => {
            if (debounceTimerRef.current) {
                clearTimeout(debounceTimerRef.current);
            }
        };
    }, [workoutName, musicName, artistName]);

    // Mudança de cor/modo é instantânea (sem debounce)
    useEffect(() => {
        if (isOpen) {
            generatePreview();
        }
    }, [mode, colorTheme]);

    const generatePreview = async () => {
        try {
            const generator = new WorkoutArtGenerator({
                workoutName: workoutName || 'Meu Treino',
                date: date || new Date().toLocaleDateString('pt-BR'),
                duration: duration,
                musicName: musicName.trim(),
                artistName: artistName.trim(),
                mode: mode,
                colorTheme: colorTheme,
                streak: streak,
                isPreview: true // OTIMIZAÇÃO: Preview em baixa resolução
            });
            const url = await generator.toDataURL();
            setPreviewUrl(url);
        } catch (error) {
            console.error('Erro ao gerar preview:', error);
        }
    };

    const handleDownload = async () => {
        setIsGenerating(true);
        try {
            const generator = new WorkoutArtGenerator({
                workoutName: workoutName || 'Meu Treino',
                date: date || new Date().toLocaleDateString('pt-BR'),
                duration: duration,
                musicName: musicName.trim(),
                artistName: artistName.trim(),
                mode: mode,
                colorTheme: colorTheme,
                streak: streak,
                isPreview: false // OTIMIZAÇÃO: Download em alta resolução
            });
            const filename = mode === 'sticker' ? 'treino-sticker.png' : 'treino-story.png';
            await generator.download(filename);
        } catch (error) {
            console.error('Erro ao baixar:', error);
        } finally {
            setIsGenerating(false);
        }
    };

    const handleCopyImage = async () => {
        setIsGenerating(true);
        try {
            const generator = new WorkoutArtGenerator({
                workoutName: workoutName || 'Meu Treino',
                date: date || new Date().toLocaleDateString('pt-BR'),
                duration: duration,
                musicName: musicName.trim(),
                artistName: artistName.trim(),
                mode: mode,
                colorTheme: colorTheme,
                streak: streak,
                isPreview: false // Alta resolução para copiar
            });

            const canvas = await generator.generate();
            const blob = await generator.toBlob(canvas);

            await navigator.clipboard.write([
                new ClipboardItem({ 'image/png': blob })
            ]);

            // Feedback visual
            setCopyFeedback(true);
            setTimeout(() => setCopyFeedback(false), 2000);
        } catch (error) {
            console.error('Erro ao copiar:', error);
            alert('Erro ao copiar imagem. Seu navegador pode não suportar essa funcionalidade.');
        } finally {
            setIsGenerating(false);
        }
    };

    const handleCustomColorChange = (e) => {
        const color = e.target.value;
        setCustomColor(color);
        setColorTheme(color);
    };

    if (!isOpen) return null;

    // Determinar cor ativa para UI
    const activeColorObj = COLOR_THEMES.find(t => t.id === colorTheme);
    const activeColorHex = activeColorObj ? activeColorObj.color : colorTheme;

    return (
        <div style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
            background: 'rgba(0, 0, 0, 0.90)',
            zIndex: 9999,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            padding: '1rem',
            backdropFilter: 'blur(5px)'
        }} onClick={onClose}>

            <div
                className="share-modal-content" // USANDO A CLASSE RESPONSIVA NOVA
                onClick={e => e.stopPropagation()}
                style={{ background: '#121212' }} // Override se necessário, mas está no CSS
            >
                {/* Header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <div style={{
                            width: '40px', height: '40px', borderRadius: '12px',
                            background: `${activeColorHex}20`,
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            border: `1px solid ${activeColorHex}40`
                        }}>
                            <Share2 size={20} color={activeColorHex} />
                        </div>
                        <div>
                            <h2 style={{ margin: 0, fontSize: '1.25rem', fontFamily: 'var(--font-heading)' }}>Compartilhar</h2>
                            <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Mostre sua conquista! 🔥</p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        style={{
                            background: 'transparent', padding: '0.5rem',
                            color: 'var(--text-secondary)'
                        }}
                    >
                        <X size={24} />
                    </button>
                </div>

                {/* Main Content Grid Resonsiva */}
                <div className="share-modal-grid">

                    {/* Left: Preview */}
                    <div className="share-modal-preview">
                        {previewUrl ? (
                            <img
                                src={previewUrl}
                                alt="Preview"
                                style={{
                                    maxWidth: '100%',
                                    maxHeight: mode === 'story' ? '300px' : '200px',
                                    borderRadius: '8px',
                                    boxShadow: `0 10px 30px -10px ${activeColorHex}40`
                                }}
                            />
                        ) : (
                            <div className="pulse-glow" style={{ color: '#444' }}>Gerando...</div>
                        )}
                    </div>

                    {/* Right: Controls */}
                    <div className="share-modal-controls">
                        {/* Format Toggle */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                            <label style={{ fontSize: '0.85rem', color: '#888', fontWeight: 600 }}>Formato</label>
                            <div style={{
                                display: 'flex', background: '#1a1a1a',
                                padding: '4px', borderRadius: '12px',
                                border: '1px solid #333'
                            }}>
                                {['sticker', 'story'].map(m => (
                                    <button
                                        key={m}
                                        className="touch-target" // Classe Touch Friendly
                                        onClick={() => setMode(m)}
                                        style={{
                                            flex: 1, padding: '0.6rem',
                                            background: mode === m ? '#2a2a2a' : 'transparent',
                                            color: mode === m ? '#fff' : '#666',
                                            borderRadius: '8px',
                                            fontWeight: 600,
                                            fontSize: '0.8rem',
                                            border: mode === m ? '1px solid #444' : 'none',
                                            boxShadow: mode === m ? '0 2px 10px rgba(0,0,0,0.2)' : 'none'
                                        }}
                                    >
                                        {m.charAt(0).toUpperCase() + m.slice(1)}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Color Picker */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                            <label style={{ fontSize: '0.85rem', color: '#888', fontWeight: 600 }}>Cores</label>
                            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                                {COLOR_THEMES.map(theme => (
                                    <button
                                        key={theme.id}
                                        className="touch-target"
                                        onClick={() => setColorTheme(theme.id)}
                                        style={{
                                            width: '36px', height: '36px',
                                            borderRadius: '50%',
                                            background: theme.color,
                                            border: colorTheme === theme.id ? '2px solid #fff' : '2px solid transparent',
                                            padding: 0,
                                            flexShrink: 0,
                                            cursor: 'pointer',
                                            transform: colorTheme === theme.id ? 'scale(1.1)' : 'scale(1)',
                                            transition: 'all 0.2s',
                                            boxShadow: colorTheme === theme.id ? `0 0 10px ${theme.color}` : 'none'
                                        }}
                                        title={theme.name}
                                    />
                                ))}

                                {/* Custom Color Button */}
                                <div style={{ position: 'relative' }}>
                                    <input
                                        ref={colorInputRef}
                                        type="color"
                                        value={customColor}
                                        onChange={handleCustomColorChange}
                                        style={{
                                            position: 'absolute', opacity: 0,
                                            width: '100%', height: '100%',
                                            cursor: 'pointer', zIndex: 10
                                        }}
                                    />
                                    <button
                                        className="touch-target"
                                        style={{
                                            width: '36px', height: '36px',
                                            borderRadius: '50%',
                                            background: 'conic-gradient(from 0deg, red, yellow, lime, aqua, blue, magenta, red)',
                                            border: colorTheme.startsWith('#') ? '2px solid #fff' : '2px solid rgba(255,255,255,0.2)',
                                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                                            padding: 0,
                                            flexShrink: 0,
                                            cursor: 'pointer',
                                            transform: colorTheme.startsWith('#') ? 'scale(1.1)' : 'scale(1)'
                                        }}
                                        title="Outra Cor"
                                    >
                                        {colorTheme.startsWith('#') ? null : <Plus size={16} color="#fff" strokeWidth={3} />}
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Info Inputs */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                            <input
                                type="text"
                                className="touch-target"
                                value={workoutName}
                                onChange={(e) => setWorkoutName(e.target.value)}
                                placeholder="Nome do Treino"
                                style={{
                                    width: '100%', padding: '0.8rem 1rem',
                                    background: '#0a0a0a',
                                    border: '1px solid #333',
                                    borderRadius: '12px',
                                    color: '#fff', fontSize: '0.95rem',
                                    outline: 'none'
                                }}
                            />

                            <div style={{
                                display: 'flex', gap: '0.75rem',
                                background: '#0a0a0a', padding: '0.5rem',
                                borderRadius: '12px', border: '1px solid #333'
                            }}>
                                <div style={{ display: 'flex', alignItems: 'center', paddingLeft: '0.5rem', color: '#1DB954' }}>
                                    <Music size={18} />
                                </div>
                                <input
                                    className="touch-target"
                                    placeholder="Música"
                                    value={musicName}
                                    onChange={(e) => setMusicName(e.target.value)}
                                    style={{
                                        flex: 1, background: 'transparent', border: 'none',
                                        color: '#fff', fontSize: '0.9rem', outline: 'none',
                                        minWidth: 0, padding: '0.5rem'
                                    }}
                                />
                                <div style={{ width: '1px', background: '#333', margin: '4px 0' }} />
                                <input
                                    className="touch-target"
                                    placeholder="Artista"
                                    value={artistName}
                                    onChange={(e) => setArtistName(e.target.value)}
                                    style={{
                                        flex: 1, background: 'transparent', border: 'none',
                                        color: '#fff', fontSize: '0.9rem', outline: 'none',
                                        minWidth: 0, padding: '0.5rem'
                                    }}
                                />
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.5rem' }}>
                            <button
                                className="touch-target"
                                onClick={handleCopyImage}
                                disabled={isGenerating}
                                style={{
                                    flex: 1, padding: '1rem',
                                    background: copyFeedback ? '#22c55e' : '#2a2a2a',
                                    color: '#fff',
                                    border: `2px solid ${copyFeedback ? '#22c55e' : activeColorHex}`,
                                    borderRadius: '16px',
                                    fontSize: '1rem', fontWeight: 700,
                                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.75rem',
                                    opacity: isGenerating ? 0.7 : 1,
                                    transition: 'all 0.3s'
                                }}
                            >
                                <Copy size={22} />
                                {copyFeedback ? 'Copiado!' : 'Copiar'}
                            </button>

                            <button
                                className="touch-target"
                                onClick={handleDownload}
                                disabled={isGenerating}
                                style={{
                                    flex: 1, padding: '1rem',
                                    background: activeColorHex,
                                    color: '#fff',
                                    borderRadius: '16px',
                                    fontSize: '1rem', fontWeight: 700,
                                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.75rem',
                                    boxShadow: `0 8px 30px ${activeColorHex}50`,
                                    opacity: isGenerating ? 0.7 : 1
                                }}
                            >
                                <Download size={22} />
                                {isGenerating ? 'Gerando...' : 'Baixar'}
                            </button>
                        </div>
                    </div>

                </div>

            </div>
        </div>
    );
};

export default WorkoutShareModal;
