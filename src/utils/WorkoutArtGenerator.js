/**
 * WorkoutArtGenerator.js
 * V6: Design "Gym Soul" - Identidade Visual Forte & Streak
 */

export class WorkoutArtGenerator {
    constructor(options = {}) {
        this.workoutName = options.workoutName || 'Treino';
        this.date = options.date || new Date().toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' });
        this.duration = options.duration || null;
        this.musicName = options.musicName || '';
        this.artistName = options.artistName || '';
        this.mode = options.mode || 'sticker';
        // Temas agora são mais "Hardcore"
        this.colorTheme = options.colorTheme || 'purple';
        this.streak = options.streak || 0;
    }

    getColorPalette() {
        // Se for um código Hex customizado
        if (this.colorTheme && this.colorTheme.startsWith('#')) {
            return {
                primary: '#ffffff', // Texto claro
                secondary: this.colorTheme, // Usar a cor customizada como secundária
                bg: '#0a0a0a', // Fundo neutro escuro para cores customizadas
                accent: this.colorTheme // Cor principal é a customizada
            };
        }

        const palettes = {
            purple: { primary: '#d8b4fe', secondary: '#7e22ce', bg: '#2e1065', accent: '#a855f7' },
            green: { primary: '#86efac', secondary: '#15803d', bg: '#052e16', accent: '#22c55e' },
            blue: { primary: '#93c5fd', secondary: '#1d4ed8', bg: '#172554', accent: '#3b82f6' },
            orange: { primary: '#fdba74', secondary: '#c2410c', bg: '#431407', accent: '#f97316' },
            pink: { primary: '#f9a8d4', secondary: '#be185d', bg: '#500724', accent: '#ec4899' },
            gold: { primary: '#fde047', secondary: '#a16207', bg: '#422006', accent: '#eab308' }
        };
        return palettes[this.colorTheme] || palettes.purple;
    }

    loadImage(src) {
        return new Promise((resolve, reject) => {
            const img = new Image();
            img.crossOrigin = 'Anonymous';
            img.onload = () => resolve(img);
            img.onerror = reject;
            img.src = src;
        });
    }

    // Textura de "Concreto/Metal"
    drawGrittyTexture(ctx, width, height, opacity = 0.15) {
        ctx.save();
        ctx.globalCompositeOperation = 'overlay';
        ctx.globalAlpha = opacity;
        
        // Noise pattern
        for (let i = 0; i < width * height * 0.02; i++) {
            const x = Math.random() * width;
            const y = Math.random() * height;
            const s = Math.random() * 2;
            ctx.fillStyle = Math.random() > 0.5 ? '#fff' : '#000';
            ctx.fillRect(x, y, s, s);
        }

        // Scratches
        ctx.lineWidth = 1;
        ctx.strokeStyle = 'rgba(255,255,255,0.1)';
        for (let i = 0; i < 20; i++) {
            ctx.beginPath();
            const x = Math.random() * width;
            const y = Math.random() * height;
            ctx.moveTo(x, y);
            ctx.lineTo(x + Math.random() * 100 - 50, y + Math.random() * 100 - 50);
            ctx.stroke();
        }
        ctx.restore();
    }

    drawGymSoulCard(ctx, x, y, width, height, palette) {
        ctx.save();

        // 1. Shape Angular (Recortes industriais nos cantos)
        const cut = 20;
        ctx.beginPath();
        ctx.moveTo(x + cut, y);
        ctx.lineTo(x + width, y);
        ctx.lineTo(x + width, y + height - cut);
        ctx.lineTo(x + width - cut, y + height);
        ctx.lineTo(x, y + height);
        ctx.lineTo(x, y + cut);
        ctx.closePath();

        // 2. Fundo Metálico Escuro
        const bgGrad = ctx.createLinearGradient(x, y, x + width, y + height);
        bgGrad.addColorStop(0, '#1a1a1a');
        bgGrad.addColorStop(0.5, '#0d0d0d');
        bgGrad.addColorStop(1, '#050505');
        ctx.fillStyle = bgGrad;
        
        // Sombra pesada
        ctx.shadowColor = 'rgba(0,0,0,0.8)';
        ctx.shadowBlur = 30;
        ctx.shadowOffsetY = 15;
        ctx.fill();
        ctx.shadowBlur = 0; // Reset sombra para não borrar texturas

        // 3. Textura
        ctx.save();
        ctx.clip();
        this.drawGrittyTexture(ctx, width + x, height + y, 0.1);
        
        // 4. Borda de Neon/Brilho
        ctx.lineWidth = 4;
        ctx.strokeStyle = palette.accent;
        ctx.stroke();
        
        // Detalhe lateral (marca de "Power Level")
        ctx.fillStyle = palette.accent;
        for(let i=0; i<6; i++) {
            ctx.fillRect(x + width - 12 - (i*6), y + height - 12, 4, 4);
        }
        ctx.restore();

        ctx.restore();
    }

    // Desenha o badge de Streak (Fogo)
    drawStreakBadge(ctx, x, y, streak, palette) {
        if (streak < 2) return; // Só mostra streak se for relevante

        ctx.save();
        
        // Fundo do Badge (Losango)
        ctx.translate(x, y);
        
        ctx.beginPath();
        const s = 25; // size
        ctx.moveTo(0, -s);
        ctx.lineTo(s*1.2, 0);
        ctx.lineTo(0, s);
        ctx.lineTo(-s*1.2, 0);
        ctx.closePath();
        
        ctx.fillStyle = '#ff4d00'; // Laranja fogo sempre, ou palette.secondary? Vamos de fogo.
        ctx.shadowColor = '#ff4d00';
        ctx.shadowBlur = 20;
        ctx.fill();
        
        // Texto
        ctx.shadowBlur = 0;
        ctx.textAlign = 'center';
        ctx.fillStyle = '#fff';
        ctx.font = '900 16px "Inter"';
        ctx.fillText(streak, 0, 0);
        
        ctx.font = '700 8px "Inter"';
        ctx.fillText('DIAS', 0, 10);
        
        ctx.restore();
    }

    async generateSticker() {
        const width = 600;
        const height = this.musicName ? 350 : 280;
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        const palette = this.getColorPalette();

        ctx.clearRect(0, 0, width, height);

        // Renderiza Card Base
        this.drawGymSoulCard(ctx, 20, 20, width - 40, height - 40, palette);

        // ===================================
        // CABEÇALHO: DATA & LABEL
        // ===================================
        ctx.font = '700 12px "Inter"';
        ctx.fillStyle = palette.primary;
        ctx.letterSpacing = '2px';
        ctx.textAlign = 'center';
        ctx.fillText('TREINO CONCLUÍDO', width/2, 60);
        
        ctx.fillStyle = 'rgba(255,255,255,0.4)';
        ctx.font = '500 10px "Inter"';
        ctx.letterSpacing = '0px';
        ctx.fillText(this.date.toUpperCase(), width/2, 78);

        // ===================================
        // NOME DO TREINO (HERO)
        // ===================================
        ctx.font = '900 italic 52px "Inter"';
        ctx.fillStyle = '#fff';
        ctx.textAlign = 'center';
        // Sombra sólida "Retro" offset
        ctx.shadowColor = palette.secondary;
        ctx.shadowOffsetX = 3;
        ctx.shadowOffsetY = 3;
        ctx.shadowBlur = 0;
        
        ctx.fillText(this.workoutName.toUpperCase(), width/2, 145);
        
        // Reset Shadow
        ctx.shadowColor = 'transparent';

        // Linha divisória
        ctx.fillStyle = 'rgba(255,255,255,0.1)';
        ctx.fillRect(80, 165, width - 160, 2);

        // ===================================
        // STATS & STREAK
        // ===================================
        let statsY = 200;
        
        if (this.streak > 1) {
            // Streak em Destaque (Uma linha)
            const daysText = this.streak === 1 ? 'DIA' : 'DIAS';
            const text = `🔥 ${this.streak} ${daysText} SEGUIDOS`;
            
            ctx.textAlign = 'center';
            // Fonte um pouco menor e emoji suportado
            ctx.font = '900 italic 24px "Inter", "Segoe UI Emoji", "Apple Color Emoji"';
            ctx.fillStyle = '#ff6432'; // Laranja Fire
            
            ctx.fillText(text, width/2, statsY + 15);
        } else {
            // Sem streak (primeiro dia ou quebrou)
            ctx.font = '700 18px "Inter"';
            ctx.fillStyle = '#fff';
            ctx.fillText(this.duration ? `DURAÇÃO: ${this.duration}` : 'FOCO TOTAL!', width/2, statsY + 10);
        }

        // ===================================
        // FOOTER: MÚSICA
        // ===================================
        const footerY = height - 50;
        
        if (this.musicName) {
            const iconSize = 24;
            ctx.font = '600 14px "Inter"';
            const musicText = this.artistName ? `${this.musicName} // ${this.artistName}` : this.musicName;
            const textW = ctx.measureText(musicText).width;
            
            const totalW = iconSize + 10 + textW;
            const startX = (width - totalW) / 2;

            // Fundo do pill de música
            ctx.fillStyle = 'rgba(0,0,0,0.3)';
            ctx.beginPath();
            ctx.roundRect(startX - 10, footerY - 18, totalW + 20, 36, 18);
            ctx.fill();

            // Ícone Spotify
            try {
                const spotifyIcon = await this.loadImage('/spotify-icon.png');
                ctx.drawImage(spotifyIcon, startX, footerY - 12, iconSize, iconSize);
            } catch (e) {
                ctx.beginPath();
                ctx.arc(startX + 12, footerY, 10, 0, Math.PI*2);
                ctx.fillStyle = '#1DB954';
                ctx.fill();
            }

            // Texto
            ctx.textAlign = 'left';
            ctx.fillStyle = 'rgba(255,255,255,0.9)';
            ctx.fillText(musicText, startX + iconSize + 10, footerY + 5);
        }

        return canvas;
    }

    async generateFullStory() {
        const width = 1080;
        const height = 1920;
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        const palette = this.getColorPalette();

        // 1. Fundo Texturizado
        const bgGrad = ctx.createLinearGradient(0,0,0,height);
        bgGrad.addColorStop(0, '#111');
        bgGrad.addColorStop(1, palette.bg);
        ctx.fillStyle = bgGrad;
        ctx.fillRect(0,0,width,height);
        
        this.drawGrittyTexture(ctx, width, height, 0.08);

        // 2. Elementos Gráficos de Fundo ("X" Gigante ou Linhas)
        ctx.save();
        ctx.strokeStyle = 'rgba(255,255,255,0.03)';
        ctx.lineWidth = 200;
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(width, height);
        ctx.stroke();
        ctx.restore();

        const centerY = height/2;

        // 3. STREAK HERO (Se houver)
        if (this.streak > 1) {
            ctx.font = '900 italic 180px "Inter"';
            ctx.fillStyle = 'rgba(255,255,255,0.05)'; // Marca d'água gigante
            ctx.textAlign = 'center';
            ctx.fillText(this.streak, width/2, centerY - 200);
            
            // Badge visível
            ctx.fillStyle = '#ff6432';
            ctx.font = '800 40px "Inter"';
            ctx.fillText(`🔥 ${this.streak} DAY STREAK`, width/2, centerY - 80);
        }

        // 4. NOME TREINO
        ctx.font = '900 italic 100px "Inter"';
        ctx.fillStyle = '#fff';
        ctx.textAlign = 'center';
        ctx.shadowColor = palette.accent;
        ctx.shadowBlur = 0;
        ctx.shadowOffsetX = 6;
        ctx.shadowOffsetY = 6;
        ctx.fillText(this.workoutName.toUpperCase(), width/2, centerY + 50);
        
        ctx.shadowColor = 'transparent'; // reset

        // 5. STATUS
        ctx.font = '700 30px "Inter"';
        ctx.letterSpacing = '5px';
        ctx.fillStyle = palette.primary;
        ctx.fillText('MISSION COMPLETE', width/2, centerY + 120);

        // 6. CARD INFO (Música)
        if (this.musicName) {
            const cardY = centerY + 250;
            // Banner estilo fita adesiva
            ctx.fillStyle = '#000';
            ctx.fillRect(0, cardY - 50, width, 100);
            ctx.fillStyle = palette.accent;
            ctx.fillRect(0, cardY + 45, width, 5); // Borda fina

            // Info
            const musicText = this.artistName ? `${this.musicName} — ${this.artistName}` : this.musicName;
            ctx.font = '600 30px "Inter"';
            ctx.letterSpacing = '1px';
            ctx.fillStyle = '#fff';

            // Calcular layout para centralizar (Ícone + Texto)
            const iconSize = 40;
            const textWidth = ctx.measureText(musicText).width;
            
            // Tentar carregar ícone
            try {
                const spotifyIcon = await this.loadImage('/spotify-icon.png');
                const gap = 15;
                const totalWidth = iconSize + gap + textWidth;
                const startX = (width - totalWidth) / 2;
                
                // Desenha Ícone
                ctx.drawImage(spotifyIcon, startX, cardY - iconSize/2, iconSize, iconSize);
                
                // Desenha Texto ao lado
                ctx.textAlign = 'left';
                ctx.fillText(musicText, startX + iconSize + gap, cardY + 10);
                
            } catch (e) {
                // Fallback: Apenas texto centralizado
                ctx.textAlign = 'center';
                ctx.fillText(musicText, width/2, cardY + 10);
            }
        }

        // Footer
        ctx.font = '600 24px "Inter"';
        ctx.fillStyle = 'rgba(255,255,255,0.3)';
        ctx.fillText('TREINO DIÁRIO APP', width/2, height - 80);

        return canvas;
    }

    async generate() {
        return this.mode === 'sticker' ? await this.generateSticker() : await this.generateFullStory();
    }

    async toBlob(canvas) {
        return new Promise((resolve) => {
            canvas.toBlob(resolve, 'image/png');
        });
    }

    async download(filename = 'treino.png') {
        const canvas = await this.generate();
        const blob = await this.toBlob(canvas);
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }
    
    async toDataURL() {
        const canvas = await this.generate();
        return canvas.toDataURL('image/png');
    }
}

export default WorkoutArtGenerator;
