interface VoiceResponse {
    audioUrl: string;
    success: boolean;
}

class VoiceService {
    private static instance: VoiceService;
    private audioContext: AudioContext | null = null;

    private constructor() {
        if (typeof window !== 'undefined') {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
        }
    }

    static getInstance(): VoiceService {
        if (!VoiceService.instance) {
            VoiceService.instance = new VoiceService();
        }
        return VoiceService.instance;
    }

    async speakArabic(text: string): Promise<void> {
        try {
            // Méthode 1: Utiliser l'API browser native si disponible
            if (this.hasArabicSupport()) {
                return this.speakNative(text, 'ar-SA');
            }

            // Méthode 2: Utiliser un service TTS en ligne (Google TTS)
            await this.speakWithGoogleTTS(text, 'ar');

        } catch (error) {
            console.error('Erreur synthèse vocale:', error);
            // Fallback: utiliser la voix anglaise
            this.speakNative(text, 'en-US');
        }
    }

    private hasArabicSupport(): boolean {
        if (typeof window === 'undefined' || !('speechSynthesis' in window)) return false;

        const voices = window.speechSynthesis.getVoices();
        return voices.some(voice =>
            voice.lang.includes('ar') || voice.lang.toLowerCase().includes('arabic')
        );
    }

    private speakNative(text: string, lang: string): void {
        if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;

        window.speechSynthesis.cancel();

        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = lang;
        utterance.rate = 0.7;
        utterance.pitch = 1.1;

        window.speechSynthesis.speak(utterance);
    }

    private async speakWithGoogleTTS(text: string, lang: string): Promise<void> {
        try {
            // Encoder le texte pour l'URL
            const encodedText = encodeURIComponent(text);
            const audioUrl = `https://translate.google.com/translate_tts?ie=UTF-8&tl=${lang}&client=tw-ob&q=${encodedText}`;

            await this.playAudioFromUrl(audioUrl);
        } catch (error) {
            console.error('Erreur Google TTS:', error);
            throw error;
        }
    }

    private async playAudioFromUrl(url: string): Promise<void> {
        return new Promise((resolve, reject) => {
            const audio = new Audio();
            audio.src = url;
            audio.onended = () => resolve();
            audio.onerror = (error) => reject(error);
            audio.play().catch(reject);
        });
    }

    // Méthode alternative avec un service TTS dédié
    async speakWithAPITTS(text: string, lang: string, apiKey?: string): Promise<void> {
        try {
            // Exemple avec un service TTS (remplacez par votre service préféré)
            const response = await fetch('/api/tts', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ text, lang, apiKey })
            });

            if (!response.ok) throw new Error('TTS API error');

            const audioBlob = await response.blob();
            const audioUrl = URL.createObjectURL(audioBlob);

            await this.playAudioFromUrl(audioUrl);
            URL.revokeObjectURL(audioUrl); // Nettoyer

        } catch (error) {
            console.error('Erreur API TTS:', error);
            throw error;
        }
    }
}

export const voiceService = VoiceService.getInstance();