import React, { useState, useMemo } from 'react';
import { PlayerProfile, Gender, Handedness, Side } from '../types';
import { useI18n } from '../hooks/useI18n';
import { GENDERS, HANDEDNESS_OPTIONS, SIDE_OPTIONS } from '../constants';
import { CalendarIcon } from './icons/CalendarIcon';

interface AdminEditProfileModalProps {
    profile: PlayerProfile;
    onClose: () => void;
    onSave: (updatedProfile: PlayerProfile) => void;
}

const calculateAge = (birthDateString: string): number => {
    if (!birthDateString) return 0;
    const birthDate = new Date(birthDateString);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
        age--;
    }
    return age;
};


const AdminEditProfileModal: React.FC<AdminEditProfileModalProps> = ({ profile, onClose, onSave }) => {
    const { t } = useI18n();
    const [formData, setFormData] = useState<PlayerProfile>(profile);

    const age = useMemo(() => calculateAge(formData.birthDate), [formData.birthDate]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };
    
    const handleLevelChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        // Allow empty string for easier editing, but handle NaN on save
        if(value === '' || (/^\d*\.?\d*$/.test(value) && parseFloat(value) <= 10)) {
            setFormData(prev => ({ ...prev, level: Number(value) }));
        }
    };

    const handleSave = () => {
        // Ensure level is a valid number before saving
        if (isNaN(formData.level) || formData.level <= 0) {
            onSave({ ...formData, level: 1.0 });
        } else {
            onSave(formData);
        }
    };
    
    const inputClass = "w-full bg-[var(--tg-theme-bg-color)] border border-[var(--tg-theme-hint-color)]/50 rounded-md px-3 py-2 text-[var(--tg-theme-text-color)] placeholder:text-[var(--tg-theme-hint-color)] focus:ring-2 focus:ring-[var(--tg-theme-button-color)] focus:outline-none transition";
    const selectStyle = { backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%23${(window.Telegram?.WebApp?.themeParams?.hint_color || '#9ca3af').substring(1)}' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`, backgroundPosition: 'right 0.5rem center', backgroundRepeat: 'no-repeat', backgroundSize: '1.5em 1.5em' };
    const selectClassName = `${inputClass} appearance-none`;

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-[var(--tg-theme-secondary-bg-color)] rounded-xl w-full max-w-md border border-[var(--tg-theme-hint-color)]/20 shadow-2xl flex flex-col max-h-[90vh]">
                <div className="p-6 pb-4 flex-shrink-0">
                    <div className="flex justify-between items-center">
                        <h2 className="text-xl font-bold">{t('adminEditProfileModal.title', { name: profile.name })}</h2>
                         <button onClick={onClose} className="text-2xl text-[var(--tg-theme-hint-color)]">&times;</button>
                    </div>
                </div>
                
                <div className="p-6 pt-0 flex-grow overflow-y-auto space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <input type="text" name="name" value={formData.name} onChange={handleChange} placeholder={t('profileModal.namePlaceholder')} className={inputClass} />
                        <div>
                             <label htmlFor="level" className="block text-sm font-medium text-[var(--tg-theme-text-color)] mb-1">{t('common.level')}</label>
                            <input type="number" step="0.01" name="level" value={formData.level} onChange={handleLevelChange} className={inputClass} />
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label htmlFor="birthDate" className="block text-sm font-medium text-[var(--tg-theme-text-color)] mb-1">{t('onboarding.birthDateLabel')}</label>
                            <div className="date-input-wrapper">
                                <input type="date" name="birthDate" id="birthDate" value={formData.birthDate} onChange={handleChange} className="date-input" />
                                <CalendarIcon className="date-input-icon w-5 h-5"/>
                            </div>
                        </div>
                        <div>
                             <label htmlFor="gender" className="block text-sm font-medium text-[var(--tg-theme-text-color)] mb-1">{t('profileModal.genderLabel')}</label>
                            <select name="gender" value={formData.gender} onChange={handleChange} className={selectClassName} style={selectStyle}>
                                {GENDERS.map(g => <option key={g} value={g}>{t(`gender.${g}`)}</option>)}
                            </select>
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <select name="handedness" value={formData.handedness} onChange={handleChange} className={selectClassName} style={selectStyle}>
                            {HANDEDNESS_OPTIONS.map(h => <option key={h} value={h}>{t(`handedness.${h}`)}</option>)}
                        </select>
                        <select name="side" value={formData.side} onChange={handleChange} className={selectClassName} style={selectStyle}>
                            {SIDE_OPTIONS.map(s => <option key={s} value={s}>{t(`side.${s}`)}</option>)}
                        </select>
                    </div>
                </div>
                
                <div className="p-4 border-t border-[var(--tg-theme-hint-color)]/20 flex-shrink-0">
                    <div className="flex gap-4">
                        <button type="button" onClick={onClose} className="w-full bg-transparent border border-[var(--tg-theme-hint-color)]/50 font-bold py-2.5 px-4 rounded-md">{t('common.cancel')}</button>
                        <button type="button" onClick={handleSave} className="w-full bg-[var(--tg-theme-button-color)] text-[var(--tg-theme-button-text-color)] font-bold py-2.5 px-4 rounded-md">{t('common.save')}</button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminEditProfileModal;