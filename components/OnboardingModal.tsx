
import React, { useState, useMemo, useEffect, useRef } from 'react';
import { PlayerProfile, Gender, Handedness, Side } from '../types';
import { useI18n } from '../hooks/useI18n';
import { GENDERS, HANDEDNESS_OPTIONS, SIDE_OPTIONS } from '../constants';
import { PadelIcon } from './icons/PadelIcon';
import { CalendarIcon } from './icons/CalendarIcon';

interface OnboardingModalProps {
    onComplete: (profileData: Omit<PlayerProfile, 'telegram' | 'avatarUrl' | 'circles' | 'friends' | 'friendRequests' | 'sentFriendRequests' | 'favoriteClubIds' | 'isOnboardingComplete'>) => void;
}

const quizQuestions = [
    { key: 'experience', options: [1, 2, 3, 4] },
    { key: 'groundstrokes', options: [0.5, 1, 2, 3] },
    { key: 'volleys', options: [0.5, 1.5, 2.5, 3.5] },
    { key: 'bandeja', options: [0, 1, 2, 3] },
    { key: 'smash', options: [0.5, 1.5, 2.5, 3.5] },
    { key: 'walls', options: [0, 1.5, 2.5, 3.5] },
];

const physicalModifiers = [-0.4, 0.0, 0.4, 0.9];

const MAX_TECHNICAL_SCORE = 20.5; // 4 + 3 + 3.5 + 3 + 3.5 + 3.5

const OnboardingModal: React.FC<OnboardingModalProps> = ({ onComplete }) => {
    const { t } = useI18n();
    const [step, setStep] = useState(0);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        birthDate: '1995-01-01',
        gender: Gender.MALE,
        handedness: Handedness.RIGHT,
        side: Side.BOTH,
    });
    const [answers, setAnswers] = useState<number[]>(Array(quizQuestions.length).fill(-1));
    const [physModifier, setPhysModifier] = useState<number | null>(null);
    const [error, setError] = useState<string | null>(null);
    
    // State for city input
    const [cityInput, setCityInput] = useState('');
    const [selectedPlace, setSelectedPlace] = useState<{ name: string; lat: number; lng: number } | null>(null);
    const [mapsApiLoaded, setMapsApiLoaded] = useState(false);
    const cityInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        const tgUser = window.Telegram?.WebApp?.initDataUnsafe?.user;
        if (tgUser) {
          const fullName = [tgUser.first_name, tgUser.last_name].filter(Boolean).join(' ');
          if (fullName) {
            setFormData(prev => ({ ...prev, name: fullName }));
          }
        }
    }, []);

    useEffect(() => {
        const handleMapsLoaded = () => setMapsApiLoaded(true);

        if (window.google?.maps?.places) {
            handleMapsLoaded();
        } else {
            window.addEventListener('google-maps-loaded', handleMapsLoaded);
        }

        return () => {
            window.removeEventListener('google-maps-loaded', handleMapsLoaded);
        };
    }, []);

    useEffect(() => {
        if (step === 0 && cityInputRef.current && mapsApiLoaded) {
            const autocomplete = new window.google.maps.places.Autocomplete(cityInputRef.current, {
                types: ['(cities)'],
                fields: ['formatted_address', 'geometry.location']
            });
            autocomplete.addListener('place_changed', () => {
                const place = autocomplete.getPlace();
                if (place.geometry?.location && place.formatted_address) {
                    setCityInput(place.formatted_address);
                    setSelectedPlace({
                        name: place.formatted_address,
                        lat: place.geometry.location.lat(),
                        lng: place.geometry.location.lng(),
                    });
                    setError(null);
                }
            });
        }
    }, [step, mapsApiLoaded]);


    const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleAnswer = (questionIndex: number, answerValue: number) => {
        setAnswers(prev => {
            const newAnswers = [...prev];
            newAnswers[questionIndex] = answerValue;
            return newAnswers;
        });
        setTimeout(() => setStep(prev => prev + 1), 300);
    };

    const handlePhysAnswer = (modifierValue: number) => {
        setPhysModifier(modifierValue);
        setTimeout(() => setStep(prev => prev + 1), 300);
    };

    const handleFormSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        if (!formData.name.trim() || !formData.email.trim() || !formData.birthDate) {
            setError(t('onboarding.errors.fillAllFields'));
            return;
        }
        if (!/^\S+@\S+\.\S+$/.test(formData.email)) {
             setError(t('onboarding.errors.invalidEmail'));
            return;
        }
        // Conditional validation based on Maps API status
        if (mapsApiLoaded && !selectedPlace) {
            setError(t('onboarding.errors.cityRequired'));
            return;
        }
        if (!mapsApiLoaded && !cityInput.trim()) {
            setError(t('onboarding.errors.cityInputRequired'));
            return;
        }
        setStep(1);
    };

    const calculatedLevel = useMemo(() => {
        if (answers.includes(-1) || physModifier === null) return 0;

        // 1. Calculate technical score
        const technicalScore = answers.reduce((sum, val) => sum + val, 0);
        const technicalLevel = 1 + (technicalScore / MAX_TECHNICAL_SCORE) * 8.5;

        // 2. Calculate age precisely from birthdate
        const birthDate = new Date(formData.birthDate);
        const today = new Date();
        let age = today.getFullYear() - birthDate.getFullYear();
        const m = today.getMonth() - birthDate.getMonth();
        if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
            age--;
        }
        
        // 3. Gender-specific adjustments
        const isMale = formData.gender === Gender.MALE;
        const declineStartAge = isMale ? 35 : 38;
        const declineRate = isMale ? 0.045 : 0.04;
        
        let genderedPhysModifier = physModifier;
        if (!isMale) {
            // Adjust physical modifier for females slightly
            if (physModifier === -0.4) genderedPhysModifier = -0.3;
            if (physModifier === 0.4) genderedPhysModifier = 0.5;
            if (physModifier === 0.9) genderedPhysModifier = 1.0;
        }

        // 4. Calculate age-based malus
        let ageMalus = 0;
        if (age > declineStartAge) {
            ageMalus = (age - declineStartAge) * -declineRate;
        }

        // 5. Combine technical level, age malus, and the direct physical bonus
        const finalLevel = technicalLevel + ageMalus + genderedPhysModifier;

        // 6. Clamp the final level between 1.0 and 9.9
        return parseFloat(Math.max(1, Math.min(finalLevel, 9.9)).toFixed(2));
    }, [answers, physModifier, formData.birthDate, formData.gender]);


    const handleFinalSubmit = () => {
        const profileData = {
            ...formData,
            level: calculatedLevel,
            city: mapsApiLoaded && selectedPlace ? selectedPlace.name : cityInput.trim(),
            lat: mapsApiLoaded && selectedPlace ? selectedPlace.lat : undefined,
            lng: mapsApiLoaded && selectedPlace ? selectedPlace.lng : undefined,
            visitedSections: {},
        };
        onComplete(profileData);
    };

    const progress = (step / (quizQuestions.length + 2)) * 100;
    
    const inputClass = "w-full bg-[var(--tg-theme-bg-color)] border border-[var(--tg-theme-hint-color)]/50 rounded-md px-3 py-2 text-[var(--tg-theme-text-color)] placeholder:text-[var(--tg-theme-hint-color)] focus:ring-2 focus:ring-[var(--tg-theme-button-color)] focus:outline-none transition";
    const selectStyle = { backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%23${(window.Telegram?.WebApp?.themeParams?.hint_color || '#9ca3af').substring(1)}' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`, backgroundPosition: 'right 0.5rem center', backgroundRepeat: 'no-repeat', backgroundSize: '1.5em 1.5em' };
    const selectClassName = `${inputClass} appearance-none`;
    const quizButtonClass = "w-full text-left p-4 bg-[var(--tg-theme-secondary-bg-color)] rounded-lg border-2 border-transparent transition-colors hover:border-[var(--tg-theme-button-color)] font-semibold";


    const renderStep = () => {
        if (step === 0) {
            return (
                <div className="animate-fade-in">
                    <h2 className="text-2xl font-bold mb-2">{t('onboarding.step0.title')}</h2>
                    <p className="text-[var(--tg-theme-hint-color)] mb-6">{t('onboarding.step0.subtitle')}</p>
                    <form onSubmit={handleFormSubmit} className="space-y-4">
                        <input type="text" name="name" value={formData.name} onChange={handleFormChange} placeholder={t('profileModal.namePlaceholder')} className={inputClass} />
                        <input type="email" name="email" value={formData.email} onChange={handleFormChange} placeholder={t('onboarding.emailPlaceholder')} className={inputClass} />
                        <div>
                             <label htmlFor="city" className="block text-sm font-medium mb-1">{t('onboarding.cityLabel')}</label>
                             <input 
                                ref={cityInputRef} 
                                type="text" 
                                id="city" 
                                name="city" 
                                value={cityInput}
                                onChange={(e) => {
                                    setCityInput(e.target.value);
                                    if(selectedPlace) setSelectedPlace(null); // Invalidate selected place if user types manually
                                }}
                                placeholder={t('onboarding.cityPlaceholder')} 
                                className={inputClass} 
                             />
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <label htmlFor="birthDate" className="block text-sm font-medium text-[var(--tg-theme-text-color)] mb-1">{t('onboarding.birthDateLabel')}</label>
                                <div className="date-input-wrapper">
                                    <input type="date" name="birthDate" id="birthDate" value={formData.birthDate} onChange={handleFormChange} className="date-input" />
                                    <CalendarIcon className="date-input-icon w-5 h-5"/>
                                </div>
                            </div>
                            <div>
                                <label htmlFor="gender" className="block text-sm font-medium text-[var(--tg-theme-text-color)] mb-1">{t('profileModal.genderLabel')}</label>
                                <select name="gender" id="gender" value={formData.gender} onChange={handleFormChange} className={selectClassName} style={selectStyle}>
                                    {GENDERS.map(g => <option key={g} value={g}>{t(`gender.${g}`)}</option>)}
                                </select>
                            </div>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                             <select name="handedness" value={formData.handedness} onChange={handleFormChange} className={selectClassName} style={selectStyle}>
                                {HANDEDNESS_OPTIONS.map(h => <option key={h} value={h}>{t(`handedness.${h}`)}</option>)}
                            </select>
                            <select name="side" value={formData.side} onChange={handleFormChange} className={selectClassName} style={selectStyle}>
                                {SIDE_OPTIONS.map(s => <option key={s} value={s}>{t(`side.${s}`)}</option>)}
                            </select>
                        </div>
                        {error && <p className="text-red-500 text-sm text-center">{error}</p>}
                        <button type="submit" className="w-full bg-[var(--tg-theme-button-color)] text-[var(--tg-theme-button-text-color)] font-bold py-3 px-4 rounded-md">{t('common.next')}</button>
                    </form>
                </div>
            );
        }
        
        if(step > 0 && step <= quizQuestions.length) {
            const questionIndex = step - 1;
            const question = quizQuestions[questionIndex];
            return (
                <div className="animate-fade-in">
                    <h2 className="text-2xl font-bold mb-4">{t(`onboarding.step1.q${questionIndex + 1}.title`)}</h2>
                    <div className="space-y-3">
                        {question.options.map((optionValue, optionIndex) => (
                             <button key={optionIndex} onClick={() => handleAnswer(questionIndex, optionValue)} className={quizButtonClass}>
                                {t(`onboarding.step1.q${questionIndex + 1}.options.${optionIndex}`)}
                            </button>
                        ))}
                    </div>
                </div>
            );
        }

        if (step === quizQuestions.length + 1) {
             return (
                <div className="animate-fade-in">
                    <h2 className="text-2xl font-bold mb-4">{t(`onboarding.step2.title`)}</h2>
                    <div className="space-y-3">
                        {physicalModifiers.map((mod, index) => (
                             <button key={index} onClick={() => handlePhysAnswer(mod)} className={quizButtonClass}>
                                {t(`onboarding.step2.options.${index}`)}
                            </button>
                        ))}
                    </div>
                </div>
            );
        }
        
        if (step === quizQuestions.length + 2) {
             return (
                 <div className="animate-fade-in text-center">
                    <h2 className="text-2xl font-bold mb-2">{t('onboarding.step3.title')}</h2>
                    <p className="text-[var(--tg-theme-hint-color)] mb-6">{t('onboarding.step3.subtitle')}</p>
                    <div className="my-8">
                        <p className="text-6xl font-black text-[var(--tg-theme-button-color)]">{calculatedLevel.toFixed(2)}</p>
                        <p className="font-semibold text-[var(--tg-theme-hint-color)]">{t('onboarding.step3.levelDescription')}</p>
                    </div>
                    <button onClick={handleFinalSubmit} className="w-full bg-[var(--tg-theme-button-color)] text-[var(--tg-theme-button-text-color)] font-bold py-3 px-4 rounded-md">{t('onboarding.step3.cta')}</button>
                </div>
             );
        }

        return null;
    };


    return (
        <div className="fixed inset-0 bg-[var(--tg-theme-bg-color)] z-50 flex flex-col items-center justify-start overflow-y-auto p-4">
            <div className="w-full max-w-md py-8">
                <div className="text-center mb-8">
                    <PadelIcon className="h-12 w-12 text-[var(--tg-theme-button-color)] mx-auto"/>
                    <h1 className="text-3xl font-bold tracking-tight text-[var(--tg-theme-text-color)] mt-2">
                        {t('onboarding.mainTitle')}
                    </h1>
                </div>
                
                {step > 0 && step <= quizQuestions.length + 2 && (
                    <div className="mb-6">
                        <div className="w-full bg-[var(--tg-theme-secondary-bg-color)] rounded-full h-2">
                            <div className="bg-[var(--tg-theme-button-color)] h-2 rounded-full" style={{ width: `${progress}%`, transition: 'width 0.5s ease-in-out' }}></div>
                        </div>
                    </div>
                )}
                
                {renderStep()}
            </div>
        </div>
    );
};

export default OnboardingModal;
