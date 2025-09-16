import { useCallback, useRef, useEffect, useState } from 'react';
import { voiceService } from '@/services/voiceService';

type Language = 'fr' | 'ar' | 'en';

interface VoiceConfig {
    rate: number;
    volume: number;
    pitch: number;
}

interface UseVoiceNotificationsProps {
    language: Language;
    enabled?: boolean;
    config?: Partial<VoiceConfig>;
}

export const useVoiceNotifications = ({
    language,
    enabled = true
}: UseVoiceNotificationsProps) => {
    const [isVoiceReady, setIsVoiceReady] = useState(true); // Toujours prêt maintenant
    const [isSpeaking, setIsSpeaking] = useState(false);

    const speak = useCallback(async (text: string) => {
        if (!enabled || !text) return;

        try {
            setIsSpeaking(true);

            if (language === 'ar') {
                // Utiliser notre service pour l'arabe
                await voiceService.speakArabic(text);
            } else {
                // Utiliser la synthèse native pour les autres langues
                const langCode = language === 'fr' ? 'fr-FR' : 'en-US';
                voiceService.speakNative(text, langCode);
            }

        } catch (error) {
            console.warn('Speech error:', error);
        } finally {
            setIsSpeaking(false);
        }
    }, [language, enabled]);

    const stopSpeaking = useCallback(() => {
        if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
            window.speechSynthesis.cancel();
        }
        setIsSpeaking(false);
    }, []);

    return {
        speak,
        stopSpeaking,
        isVoiceReady: true, // Toujours disponible maintenant
        isSpeaking
    };
};