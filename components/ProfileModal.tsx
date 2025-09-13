

import React, { useState, useMemo } from 'react';
import { PlayerProfile, Gender, Handedness, Side, Club, OrganizerStatus } from '../types';
import { PencilIcon } from './icons/PencilIcon';
import { GENDERS, HANDEDNESS_OPTIONS, SIDE_OPTIONS } from '../constants';
import { useI18n } from '../hooks/useI18n';
import { UserGroupIcon } from './icons/UserGroupIcon';
import { CalendarIcon } from './icons/CalendarIcon';

interface ProfileModalProps {
    profile: PlayerProfile;
    allClubs: Club[];
    onClose: () => void;
    onSave: (updatedProfile: PlayerProfile) => void;
    onOpenContactAdminModal?: (type: 'organizer' | 'clubAdmin') => void;
    onOpenSuperAdminPanel?: () => void;
}

const calculateAge = (birthDateString: string): number => {
    const birthDate = new Date(birthDateString);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
        age--;
    }
    return age;
};

const ProfileModal: React.FC<ProfileModalProps> = ({ profile, allClubs, onClose, onSave, onOpenContactAdminModal, onOpenSuperAdminPanel }) => {
    const { t } = useI18n();
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState<PlayerProfile>(profile);

    const age = useMemo(() => calculateAge(profile.birthDate), [profile.birthDate]);
    const formAge = useMemo(() => calculateAge(formData.birthDate), [formData.birthDate]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSave = () => {
        onSave(formData);
        setIsEditing(false);
    };
    
    const handleAvatarChange = () => {
        const newSeed = Math.random().toString(36).substring(7);
        setFormData(prev => ({...prev, avatarUrl: `https://picsum.photos/seed/${newSeed}/200`}));
    };
    
    const inputClass = "w-full bg-[var(--tg-theme-bg-color)] border border-[var(--tg-theme-hint-color)]/50 rounded-md px-3 py-2 text-[var(--tg-theme-text-color)] placeholder:text-[var(--tg-theme-hint-color)] focus:ring-2 focus:ring-[var(--tg-theme-button-color)] focus:outline-none transition";
    const selectStyle = { backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%23${(window.Telegram?.WebApp?.themeParams?.hint_color || '#9ca3af').substring(1)}' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`, backgroundPosition: 'right 0.5rem center', backgroundRepeat: 'no-repeat', backgroundSize: '1.5em 1.5em' };
    const selectClassName = `${inputClass} appearance-none`;

    const favoriteClubNames = profile.favoriteClubIds.map(id => allClubs.find(c => c.id === id)?.name).filter(Boolean).join(', ');
    
    const renderOrganizerStatus = () => {
        if (profile.organizerStatus === 'NONE' || !profile.organizerStatus) {
            return null;
        }
        
        const statusKey = `profileModal.organizerStatus_${profile.organizerStatus}`;
        let statusColor = 'text-[var(--tg-theme-hint-color)]';
        if (profile.organizerStatus === 'APPROVED') statusColor = 'text-green-400';
        if (profile.organizerStatus === 'REJECTED') statusColor = 'text-red-400';
        if (profile.organizerStatus === 'PENDING') statusColor = 'text-yellow-400';

        return (
            <div className="text-center">
                <p className="text-sm font-semibold text-[var(--tg-theme-hint-color)]">{t('profileModal.organizerStatus')}</p>
                <p className={`font-bold ${statusColor}`}>{t(statusKey)}</p>
            </div>
        );
    };

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-[var(--tg-theme-secondary-bg-color)] rounded-xl w-full max-w-md border border-[var(--tg-theme-hint-color)]/20 shadow-2xl flex flex-col max-h-[90vh]">
                <div className="p-6 pb-4 flex-shrink-0">
                    <div className="flex justify-between items-start">
                        <div>
                            <h2 className="text-2xl font-bold">{isEditing ? t('profileModal.editTitle') : t('profileModal.viewTitle')}</h2>
                            <p className="text-sm font-semibold text-[var(--tg-theme-button-color)]">{t('common.level')} {profile.level.toFixed(2)} ({t('profileModal.nonEditable')})</p>
                        </div>
                        {!isEditing ? (
                            <button onClick={() => setIsEditing(true)} className="flex items-center gap-1 text-sm font-semibold bg-[var(--tg-theme-button-color)]/20 text-[var(--tg-theme-button-color)] px-3 py-1.5 rounded-md hover:bg-[var(--tg-theme-button-color)]/40 transition">
                                <PencilIcon className="w-4 h-4" /> {t('common.edit')}
                            </button>
                        ) : (
                            <button onClick={onClose} className="text-2xl text-[var(--tg-theme-hint-color)]">&times;</button>
                        )}
                    </div>
                </div>
                
                <div className="p-6 pt-0 flex-grow overflow-y-auto">
                    <div className="flex items-center flex-col gap-4 mb-4">
                        <div className="relative">
                            <img src={formData.avatarUrl} alt={formData.name} className="w-24 h-24 rounded-full object-cover border-4 border-[var(--tg-theme-button-color)]/50" />
                            {isEditing && (
                                <button onClick={handleAvatarChange} className="absolute bottom-0 right-0 bg-[var(--tg-theme-button-color)] text-[var(--tg-theme-button-text-color)] p-1.5 rounded-full hover:scale-110 transition shadow-md">
                                    <PencilIcon className="w-4 h-4" />
                                </button>
                            )}
                        </div>
                        {!isEditing && <h3 className="text-xl font-bold">{profile.name}</h3>}
                    </div>

                    <div className="space-y-4">
                        {isEditing ? (
                            <>
                                <input type="text" name="name" value={formData.name} onChange={handleChange} placeholder={t('profileModal.namePlaceholder')} className={inputClass} />
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label htmlFor="birthDate" className="block text-sm font-medium text-[var(--tg-theme-text-color)] mb-1">{t('onboarding.birthDateLabel')}</label>
                                        <div className="date-input-wrapper">
                                            <input type="date" name="birthDate" id="birthDate" value={formData.birthDate} onChange={handleChange} className="date-input" />
                                            <CalendarIcon className="date-input-icon w-5 h-5"/>
                                        </div>
                                    </div>
                                    <select name="gender" value={formData.gender} onChange={handleChange} className={selectClassName} style={selectStyle}>
                                        {GENDERS.map(g => <option key={g} value={g}>{t(`gender.${g}`)}</option>)}
                                    </select>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <select name="handedness" value={formData.handedness} onChange={handleChange} className={selectClassName} style={selectStyle}>
                                        {HANDEDNESS_OPTIONS.map(h => <option key={h} value={h}>{t(`handedness.${h}`)}</option>)}
                                    </select>
                                    <select name="side" value={formData.side} onChange={handleChange} className={selectClassName} style={selectStyle}>
                                        {SIDE_OPTIONS.map(s => <option key={s} value={s}>{t(`side.${s}`)}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-[var(--tg-theme-text-color)] mb-1">{t('profileModal.favoriteClubsLabel')}</label>
                                    <div className="bg-[var(--tg-theme-bg-color)] p-3 rounded-md">
                                        <p className="text-sm font-semibold truncate">{favoriteClubNames || t('profileModal.noFavoriteClubs')}</p>
                                        <p className="text-xs text-[var(--tg-theme-hint-color)] mt-1">{t('profileModal.manageFavoritesInfo')}</p>
                                    </div>
                                </div>
                            </>
                        ) : (
                            <>
                                <div className="grid grid-cols-2 gap-4 text-center bg-[var(--tg-theme-bg-color)] p-4 rounded-lg">
                                    <div><p className="text-xs text-[var(--tg-theme-hint-color)]">{t('profileModal.ageLabel')}</p><p className="font-semibold">{t('profileModal.ageValue', { age: age })}</p></div>
                                    <div><p className="text-xs text-[var(--tg-theme-hint-color)]">{t('profileModal.genderLabel')}</p><p className="font-semibold">{t(`gender.${profile.gender}`)}</p></div>
                                    <div><p className="text-xs text-[var(--tg-theme-hint-color)]">{t('profileModal.handLabel')}</p><p className="font-semibold">{t(`handedness.${profile.handedness}`)}</p></div>
                                    <div><p className="text-xs text-[var(--tg-theme-hint-color)]">{t('profileModal.sideLabel')}</p><p className="font-semibold">{t(`side.${profile.side}`)}</p></div>
                                    <div className="col-span-2">
                                        <p className="text-xs text-[var(--tg-theme-hint-color)]">{t('profileModal.favoriteClubsLabel')}</p>
                                        <p className="font-semibold truncate">{favoriteClubNames || t('profileModal.noFavoriteClubs')}</p>
                                        <p className="text-xs text-[var(--tg-theme-hint-color)]/80 mt-1">{t('profileModal.manageFavoritesInfo')}</p>
                                    </div>
                                </div>
                                
                                {profile.isSuperAdmin && onOpenSuperAdminPanel && (
                                    <button onClick={onOpenSuperAdminPanel} className="w-full bg-red-500/80 text-white font-bold py-2.5 px-4 rounded-md mt-6 flex items-center justify-center gap-2">
                                        <UserGroupIcon className="w-5 h-5" />
                                        {t('profileModal.superAdminPanel')}
                                    </button>
                                )}

                                {!profile.isSuperAdmin && !profile.adminOfClubId && (
                                    <div className="mt-6 space-y-3">
                                        {renderOrganizerStatus()}
                                        {(!profile.organizerStatus || profile.organizerStatus === 'NONE' || profile.organizerStatus === 'REJECTED') && onOpenContactAdminModal && (
                                            <button onClick={() => onOpenContactAdminModal('organizer')} className="w-full bg-blue-500/80 text-white font-bold py-2.5 px-4 rounded-md">{t('profileModal.becomeOrganizer')}</button>
                                        )}
                                        {onOpenContactAdminModal && (
                                            <button onClick={() => onOpenContactAdminModal('clubAdmin')} className="w-full bg-blue-500/80 text-white font-bold py-2.5 px-4 rounded-md">{t('profileModal.becomeClubAdmin')}</button>
                                        )}
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                </div>
                
                <div className="p-4 border-t border-[var(--tg-theme-hint-color)]/20 flex-shrink-0">
                    <div className="flex gap-4">
                        {isEditing ? (
                            <>
                                <button type="button" onClick={() => setIsEditing(false)} className="w-full bg-transparent border border-[var(--tg-theme-hint-color)]/50 font-bold py-2.5 px-4 rounded-md">{t('common.cancel')}</button>
                                <button type="button" onClick={handleSave} className="w-full bg-[var(--tg-theme-button-color)] text-[var(--tg-theme-button-text-color)] font-bold py-2.5 px-4 rounded-md">{t('common.save')}</button>
                            </>
                        ) : (
                            <button type="button" onClick={onClose} className="w-full bg-transparent border border-[var(--tg-theme-hint-color)]/50 font-bold py-2.5 px-4 rounded-md">
                                {t('common.close')}
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProfileModal;