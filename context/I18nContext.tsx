
import React, { createContext, useState, useEffect, ReactNode } from 'react';

// Define a generic type for translations as we are no longer importing the JSON file directly.
type Translations = { [key: string]: any }; 
type Language = 'en' | 'fr' | 'es' | 'ru';

// Store all loaded translations here, outside the component to act like a singleton cache.
const allTranslations: Record<Language, Translations | null> = { en: null, fr: null, es: null, ru: null };

const getLanguage = (): Language => {
    try {
        const langCode = window.Telegram?.WebApp?.initDataUnsafe?.user?.language_code;
        if (langCode === 'fr') {
            return 'fr';
        }
        if (langCode === 'es') {
            return 'es';
        }
        if (langCode === 'ru') {
            return 'ru';
        }
    } catch (e) {
        console.warn("Could not detect Telegram language, defaulting to English.", e);
    }
    return 'en';
};

const getNestedTranslation = (obj: any, key: string): string | undefined => {
    return key.split('.').reduce((o, i) => (o ? o[i] : undefined), obj);
};

interface I18nContextType {
    lang: Language;
    t: (key: string, options?: Record<string, string | number>) => string;
}

export const I18nContext = createContext<I18nContextType | undefined>(undefined);

interface I18nProviderProps {
    children: ReactNode;
}

export const I18nProvider: React.FC<I18nProviderProps> = ({ children }) => {
    const [lang] = useState<Language>(getLanguage);
    const [isLoaded, setIsLoaded] = useState(false);

    useEffect(() => {
        const loadTranslations = async () => {
            try {
                // Use absolute paths from the root.
                const [enResponse, frResponse, esResponse, ruResponse] = await Promise.all([
                    fetch('/locales/en.json'),
                    fetch('/locales/fr.json'),
                    fetch('/locales/es.json'),
                    fetch('/locales/ru.json'),
                ]);
                allTranslations.en = await enResponse.json();
                allTranslations.fr = await frResponse.json();
                allTranslations.es = await esResponse.json();
                allTranslations.ru = await ruResponse.json();
                setIsLoaded(true);
            } catch (error) {
                console.error("Failed to load translation files:", error);
            }
        };

        if (!isLoaded) {
            loadTranslations();
        }
    }, [isLoaded]);

    const t = (key: string, options?: Record<string, string | number>): string => {
        const messages = allTranslations[lang];
        let translation = getNestedTranslation(messages, key);

        if (translation === undefined) {
            // Fallback to English if translation is missing in the current language
            const fallbackMessages = allTranslations.en;
            translation = getNestedTranslation(fallbackMessages, key);
            if (translation === undefined) {
                console.warn(`Translation key not found in en.json: ${key}`);
                return key; // Return the key itself as a last resort
            }
        }

        if (options) {
            Object.keys(options).forEach(optionKey => {
                const regex = new RegExp(`{{${optionKey}}}`, 'g');
                translation = (translation as string).replace(regex, String(options[optionKey]));
            });
        }
        
        return translation;
    };

    if (!isLoaded) {
        // Render nothing while translations are loading to prevent UI flicker with untranslated text
        return null;
    }

    return (
        <I18nContext.Provider value={{ lang, t }}>
            {children}
        </I18nContext.Provider>
    );
};
