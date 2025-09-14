import { useCallback, useRef, useEffect, useState } from 'react';

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

const defaultConfig: VoiceConfig = {
    rate: 0.8,
    volume: 0.9,
    pitch: 1.0
};

// Enhanced language mapping with fallbacks for Arabic
const languageMap: Record<Language, string[]> = {
    fr: ['fr-FR', 'fr-CA', 'fr'],
    ar: ['ar-SA', 'ar-EG', 'ar-AE', 'ar-MA', 'ar-DZ', 'ar'],
    en: ['en-US', 'en-GB', 'en-AU', 'en']
};

// Check if Arabic voices are available
const hasArabicSupport = (voices: SpeechSynthesisVoice[]): boolean => {
    return voices.some(voice => voice.lang.toLowerCase().startsWith('ar'));
};

// Get available voices
const getAvailableVoices = (): SpeechSynthesisVoice[] => {
    return speechSynthesis.getVoices();
};

const findBestVoice = (language: Language, voices: SpeechSynthesisVoice[]): string => {
    const langCodes = languageMap[language];

    // Try to find a voice that matches our language preferences
    for (const langCode of langCodes) {
        const matchingVoice = voices.find(voice =>
            voice.lang.toLowerCase().startsWith(langCode.toLowerCase())
        );
        if (matchingVoice) {
            return matchingVoice.lang;
        }
    }

    // Fallback to first preference if no voice found
    return langCodes[0];
};

export const useVoiceNotifications = ({
    language,
    enabled = true,
    config = {}
}: UseVoiceNotificationsProps) => {
    const currentUtterance = useRef<SpeechSynthesisUtterance | null>(null);
    const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
    const [hasArabicVoices, setHasArabicVoices] = useState(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
    const speechConfig = { ...defaultConfig, ...config };

    // Load voices on component mount
    useEffect(() => {
        if (!('speechSynthesis' in window)) return;

        const loadVoices = () => {
            const availableVoices = getAvailableVoices();
            setVoices(availableVoices);
            setHasArabicVoices(hasArabicSupport(availableVoices));

            console.log('Available voices:', availableVoices.map(v => ({
                name: v.name,
                lang: v.lang,
                localService: v.localService
            })));

            console.log('Arabic voices available:', hasArabicSupport(availableVoices));
        };

        // Load voices immediately if available
        loadVoices();

        // Some browsers fire this event when voices are loaded
        const handleVoicesChanged = () => {
            loadVoices();
        };

        speechSynthesis.addEventListener('voiceschanged', handleVoicesChanged);

        return () => {
            speechSynthesis.removeEventListener('voiceschanged', handleVoicesChanged);
        };
    }, []);

    const speak = useCallback((text: string, priority: 'low' | 'normal' | 'high' = 'normal') => {
        if (!enabled || !text || !('speechSynthesis' in window)) return;

        // Stop current speech if high priority or if requested
        if (priority === 'high' && currentUtterance.current) {
            speechSynthesis.cancel();
        }

        // Wait for any current speech to finish for normal/low priority
        if (priority !== 'high' && speechSynthesis.speaking) {
            setTimeout(() => speak(text, priority), 500);
            return;
        }

        const utterance = new SpeechSynthesisUtterance(text);

        // Enhanced language detection with fallbacks
        // If Arabic is requested but no Arabic voices are available, fallback to English
        let actualLanguage = language;
        if (language === 'ar' && !hasArabicVoices) {
            console.warn('No Arabic voices available, falling back to English');
            actualLanguage = 'en';
        }

        const bestLang = findBestVoice(actualLanguage, voices);
        utterance.lang = bestLang;

        // Optimized settings for Arabic
        if (actualLanguage === 'ar') {
            utterance.rate = speechConfig.rate * 0.9; // Slower for Arabic
            utterance.pitch = speechConfig.pitch * 1.1; // Higher pitch for clarity
        } else {
            utterance.rate = speechConfig.rate;
            utterance.pitch = speechConfig.pitch;
        }

        utterance.volume = speechConfig.volume;

        // Enhanced error handling with retries
        utterance.onerror = (event) => {
            console.warn('Speech synthesis error for language:', actualLanguage, 'Event:', event);

            // Try fallback with different language if Arabic fails
            if (actualLanguage === 'ar' && priority === 'high') {
                console.log('Retrying with English fallback for critical message');
                setTimeout(() => {
                    const fallbackUtterance = new SpeechSynthesisUtterance(text);
                    fallbackUtterance.lang = 'en-US';
                    fallbackUtterance.rate = speechConfig.rate;
                    fallbackUtterance.volume = speechConfig.volume;
                    fallbackUtterance.pitch = speechConfig.pitch;

                    try {
                        speechSynthesis.speak(fallbackUtterance);
                    } catch (fallbackError) {
                        console.warn('Fallback speech also failed:', fallbackError);
                    }
                }, 100);
            }
        };

        utterance.onstart = () => {
            currentUtterance.current = utterance;
        };

        utterance.onend = () => {
            currentUtterance.current = null;
        };

        // Wait for voices to load before speaking
        const attemptSpeak = () => {
            try {
                if (speechSynthesis.getVoices().length === 0) {
                    // Voices not loaded yet, wait a bit
                    setTimeout(attemptSpeak, 100);
                    return;
                }
                speechSynthesis.speak(utterance);
            } catch (error) {
                console.warn('Failed to speak:', error);
            }
        };

        attemptSpeak();
    }, [language, enabled, speechConfig, voices, hasArabicVoices]);

    const speakImmediate = useCallback((text: string) => {
        speak(text, 'high');
    }, [speak]);

    const speakQueued = useCallback((text: string) => {
        speak(text, 'normal');
    }, [speak]);

    const stopSpeaking = useCallback(() => {
        if ('speechSynthesis' in window) {
            speechSynthesis.cancel();
            currentUtterance.current = null;
        }
    }, []);

    const isSupported = 'speechSynthesis' in window;
    const isSpeaking = 'speechSynthesis' in window ? speechSynthesis.speaking : false;

    return {
        speak: speakQueued,
        speakImmediate,
        stopSpeaking,
        isSupported,
        isSpeaking,
        hasArabicSupport: hasArabicVoices,
        availableVoices: voices
    };
};