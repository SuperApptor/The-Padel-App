
import React, { useState, useEffect } from 'react';
import { Club, Court, Tournament, OpeningHours } from '../types';
import { useI18n } from '../hooks/useI18n';
import { InformationCircleIcon } from './icons/InformationCircleIcon';
import { RectangleStackIcon } from './icons/RectangleStackIcon';
import { MegaphoneIcon } from './icons/MegaphoneIcon';
import { TrashIcon } from './icons/TrashIcon';
import { PlusIcon } from './icons/PlusIcon';
import { TrophyIcon } from './icons/TrophyIcon';
import { ClockIcon } from './icons/ClockIcon';
import { DAYS_OF_WEEK } from '../constants';

interface ClubAdminModalProps {
    club: Club;
    allTournaments: Tournament[];
    onClose: () => void;
    onSave: (updatedClub: Club) => void;
    onPublish: (clubId: number, message: string) => void;
    onOpenCreateTournament: () => void;
}

type AdminTab = 'info' | 'courts' | 'hours' | 'announcements' | 'tournaments';

const generateTimeSlots = () => {
    const slots = [];
    for (let h = 6; h < 24; h++) {
        for (let m = 0; m < 60; m += 30) {
            slots.push(`${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`);
        }
    }
    return slots;
};
const timeSlots = generateTimeSlots();

const ClubAdminModal: React.FC<ClubAdminModalProps> = ({ club, allTournaments, onClose, onSave, onPublish, onOpenCreateTournament }) => {
    const { t, lang } = useI18n();
    const [activeTab, setActiveTab] = useState<AdminTab>('info');
    const [formData, setFormData] = useState<Club>(club);
    const [newCourtName, setNewCourtName] = useState('');
    const [newCourtType, setNewCourtType] = useState<'indoor' | 'outdoor'>('indoor');
    const [announcement, setAnnouncement] = useState('');

    const clubTournaments = allTournaments.filter(t => t.clubId === club.id);

    useEffect(() => {
        setFormData(club);
    }, [club]);

    const handleInfoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleAddCourt = (e: React.FormEvent) => {
        e.preventDefault();
        if (newCourtName.trim() === '') return;
        const newCourt: Court = {
            id: Date.now(),
            name: newCourtName.trim(),
            type: newCourtType,
        };
        setFormData(prev => ({ ...prev, courts: [...prev.courts, newCourt] }));
        setNewCourtName('');
    };

    const handleDeleteCourt = (courtId: number) => {
        setFormData(prev => ({ ...prev, courts: prev.courts.filter(c => c.id !== courtId) }));
    };

    const handleOpeningHoursChange = (day: string, type: 'open' | 'close', value: string) => {
        setFormData(prev => {
            const newHours = { ...prev.openingHours };
            const dayHours = newHours[day];
            if (dayHours) {
                newHours[day] = { ...dayHours, [type]: value };
            }
            return { ...prev, openingHours: newHours };
        });
    };

    const handleToggleDayOpen = (day: string) => {
        setFormData(prev => {
            const newHours = { ...prev.openingHours };
            newHours[day] = newHours[day] ? null : { open: '09:00', close: '22:00' };
            return { ...prev, openingHours: newHours };
        });
    };

    const handlePublishAnnouncement = () => {
        if (announcement.trim() === '') return;
        onPublish(club.id, announcement.trim());
        setAnnouncement('');
    };

    const handleSave = () => {
        onSave(formData);
        onClose();
    };

    const inputClass = "w-full bg-[var(--tg-theme-bg-color)] border border-[var(--tg-theme-hint-color)]/50 rounded-md px-3 py-2 text-sm text-[var(--tg-theme-text-color)] placeholder:text-[var(--tg-theme-hint-color)] focus:ring-2 focus:ring-[var(--tg-theme-button-color)] focus:outline-none transition";
    
    const tabButtonStyle = (tabName: AdminTab, icon: React.FC<React.SVGProps<SVGSVGElement>>) => {
        const Icon = icon;
        return (
            <button
                onClick={() => setActiveTab(tabName)}
                className={`flex-1 py-2 px-3 text-xs sm:text-sm font-semibold transition-colors rounded-lg flex items-center justify-center gap-2 ${
                    activeTab === tabName 
                    ? 'bg-[var(--tg-theme-button-color)] text-[var(--tg-theme-button-text-color)]' 
                    : 'bg-[var(--tg-theme-secondary-bg-color)] text-[var(--tg-theme-text-color)] hover:bg-[var(--tg-theme-hint-color)]/10'
                }`}
            >
                <Icon className="w-4 h-4" />
                {/* Fix: Explicitly convert dynamic key parts to strings to resolve potential TypeScript errors. */}
                <span className="hidden sm:inline">{t(`clubAdminModal.tab${String(tabName).charAt(0).toUpperCase() + tabName.slice(1)}`)}</span>
            </button>
        );
    }
    const renderContent = () => {
        switch (activeTab) {
            case 'info':
                return (
                    <div className="space-y-4">
                        <input type="text" name="name" value={formData.name} onChange={handleInfoChange} placeholder={t('clubAdminModal.clubName')} className={inputClass} />
                        <input type="text" name="address" value={formData.address} onChange={handleInfoChange} placeholder={t('clubAdminModal.address')} className={inputClass} />
                        <div className="grid grid-cols-2 gap-4">
                            <input type="tel" name="phone" value={formData.phone} onChange={handleInfoChange} placeholder={t('clubAdminModal.phone')} className={inputClass} />
                            <input type="email" name="email" value={formData.email} onChange={handleInfoChange} placeholder={t('clubAdminModal.email')} className={inputClass} />
                        </div>
                        <input type="url" name="imageUrl" value={formData.imageUrl} onChange={handleInfoChange} placeholder={t('clubAdminModal.imageUrl')} className={inputClass} />
                    </div>
                );
            case 'courts':
                return (
                    <div>
                        <form onSubmit={handleAddCourt} className="flex gap-2 mb-4">
                            <input type="text" value={newCourtName} onChange={e => setNewCourtName(e.target.value)} placeholder={t('clubAdminModal.courtName')} className={inputClass} />
                            <select value={newCourtType} onChange={e => setNewCourtType(e.target.value as 'indoor' | 'outdoor')} className={`${inputClass} w-auto`}>
                                <option value="indoor">{t('clubDetailModal.indoor')}</option>
                                <option value="outdoor">{t('clubDetailModal.outdoor')}</option>
                            </select>
                            <button type="submit" className="bg-[var(--tg-theme-button-color)] text-[var(--tg-theme-button-text-color)] p-2 rounded-md"><PlusIcon className="w-5 h-5" /></button>
                        </form>
                        <div className="space-y-2">
                            {formData.courts.map(court => (
                                <div key={court.id} className="flex justify-between items-center p-2 bg-[var(--tg-theme-bg-color)] rounded-lg">
                                    {/* Fix: Explicitly convert dynamic key parts to strings to resolve potential TypeScript errors. */}
                                    <p className="font-semibold">{court.name} <span className="text-xs text-[var(--tg-theme-hint-color)]">({t(`clubDetailModal.${String(court.type)}`)})</span></p>
                                    <button onClick={() => handleDeleteCourt(court.id)} className="p-1 text-red-400 hover:bg-red-500/20 rounded-full"><TrashIcon className="w-4 h-4" /></button>
                                </div>
                            ))}
                        </div>
                    </div>
                );
            case 'hours':
                 return (
                    <div className="space-y-3">
                        {DAYS_OF_WEEK.map(day => {
                            // Fix: Removed incorrect cast to `keyof OpeningHours` which was widening the type to `string | number`.
                            // `day` is already a string and can be used to index `OpeningHours`.
                            const dayKey = day;
                            const hours = formData.openingHours[dayKey];
                            const isChecked = hours !== null;
                            return (
                                <div key={day} className="flex items-center gap-3 p-2 bg-[var(--tg-theme-bg-color)] rounded-lg">
                                    <label className="flex items-center gap-2 w-32 cursor-pointer">
                                        <input type="checkbox" checked={isChecked} onChange={() => handleToggleDayOpen(dayKey)} className="h-4 w-4 rounded bg-transparent border-[var(--tg-theme-hint-color)]/50 text-[var(--tg-theme-button-color)] focus:ring-[var(--tg-theme-button-color)]" />
                                        {/* Fix: Explicitly convert dynamic key parts to strings to resolve potential TypeScript errors. */}
                                        <span className={`font-semibold ${isChecked ? 'text-[var(--tg-theme-text-color)]' : 'text-[var(--tg-theme-hint-color)]'}`}>{t(`days.${String(day).toLowerCase()}`)}</span>
                                    </label>
                                    {isChecked ? (
                                        <div className="flex-1 grid grid-cols-2 gap-2">
                                            <select value={hours.open} onChange={e => handleOpeningHoursChange(dayKey, 'open', e.target.value)} className={inputClass}>
                                                {timeSlots.map(t => <option key={`open-${t}`} value={t}>{t}</option>)}
                                            </select>
                                            <select value={hours.close} onChange={e => handleOpeningHoursChange(dayKey, 'close', e.target.value)} className={inputClass}>
                                                {timeSlots.map(t => <option key={`close-${t}`} value={t}>{t}</option>)}
                                            </select>
                                        </div>
                                    ) : (
                                        <p className="text-sm text-red-400 font-semibold flex-1 text-center">{t('clubAdminModal.closed')}</p>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                 );
            case 'announcements':
                return (
                     <div className="space-y-4">
                        <textarea
                            value={announcement}
                            onChange={e => setAnnouncement(e.target.value)}
                            rows={5}
                            className={inputClass}
                            placeholder={t('clubAdminModal.announcementPlaceholder')}
                        />
                        <button onClick={handlePublishAnnouncement} className="w-full bg-[var(--tg-theme-button-color)] text-[var(--tg-theme-button-text-color)] font-bold py-2.5 px-4 rounded-md">
                            {t('clubAdminModal.publishAnnouncement')}
                        </button>
                    </div>
                );
            case 'tournaments':
                return (
                    <div className="space-y-4">
                        <button onClick={onOpenCreateTournament} className="w-full bg-[var(--tg-theme-button-color)]/80 text-[var(--tg-theme-button-text-color)] font-bold py-2.5 px-4 rounded-md flex items-center justify-center gap-2 hover:bg-[var(--tg-theme-button-color)]">
                            <PlusIcon className="w-5 h-5" />
                            {t('clubAdminModal.createTournament')}
                        </button>
                        <div className="space-y-2">
                           {clubTournaments.length > 0 ? clubTournaments.map(tourney => (
                               <div key={tourney.id} className="p-3 bg-[var(--tg-theme-bg-color)] rounded-lg">
                                   <p className="font-semibold text-sm">{tourney.name}</p>
                                   <p className="text-xs text-[var(--tg-theme-hint-color)]">
                                     {new Date(tourney.startDate).toLocaleDateString(lang, { day: 'numeric', month: 'long' })} - {new Date(tourney.endDate).toLocaleDateString(lang, { day: 'numeric', month: 'long', year: 'numeric' })}
                                   </p>
                               </div>
                           )) : (
                               <p className="text-center text-sm text-[var(--tg-theme-hint-color)] py-4">{t('clubAdminModal.noTournaments')}</p>
                           )}
                        </div>
                    </div>
                );
        }
    };

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-[var(--tg-theme-secondary-bg-color)] rounded-xl w-full max-w-lg border border-[var(--tg-theme-hint-color)]/20 shadow-2xl flex flex-col max-h-[90vh]">
                <div className="p-6 pb-4 flex-shrink-0">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-xl font-bold">{t('clubAdminModal.title', { clubName: club.name })}</h2>
                        <button onClick={onClose} className="text-2xl text-[var(--tg-theme-hint-color)]">&times;</button>
                    </div>
                    <div className="grid grid-cols-5 gap-1 p-1 bg-[var(--tg-theme-bg-color)] rounded-xl">
                        {tabButtonStyle('info', InformationCircleIcon)}
                        {tabButtonStyle('courts', RectangleStackIcon)}
                        {tabButtonStyle('hours', ClockIcon)}
                        {tabButtonStyle('announcements', MegaphoneIcon)}
                        {tabButtonStyle('tournaments', TrophyIcon)}
                    </div>
                </div>

                <div className="p-6 pt-2 flex-grow overflow-y-auto">
                    {renderContent()}
                </div>

                <div className="p-4 border-t border-[var(--tg-theme-hint-color)]/20 flex-shrink-0 flex gap-4">
                    <button type="button" onClick={onClose} className="w-full bg-transparent border border-[var(--tg-theme-hint-color)]/50 font-bold py-2.5 px-4 rounded-md">{t('common.cancel')}</button>
                    <button type="button" onClick={handleSave} className="w-full bg-[var(--tg-theme-button-color)] text-[var(--tg-theme-button-text-color)] font-bold py-2.5 px-4 rounded-md">{t('common.save')}</button>
                </div>
            </div>
        </div>
    );
};

export default ClubAdminModal;
