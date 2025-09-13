import React from 'react';
import { Club } from '../types';
import { MapPinIcon } from './icons/MapPinIcon';
import { PencilIcon } from './icons/PencilIcon';
import { useI18n } from '../hooks/useI18n';
import { DAYS_OF_WEEK } from '../constants';

interface ClubDetailModalProps {
    club: Club;
    onClose: () => void;
    isAdmin: boolean;
    onEdit: (club: Club) => void;
}

const ClubDetailModal: React.FC<ClubDetailModalProps> = ({ club, onClose, isAdmin, onEdit }) => {
    const { t, lang } = useI18n();
    return (
         <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-[var(--tg-theme-secondary-bg-color)] rounded-xl w-full max-w-lg border border-[var(--tg-theme-hint-color)]/20 shadow-2xl flex flex-col max-h-[90vh]">
                <div className="relative flex-shrink-0">
                    <img src={club.imageUrl} alt={club.name} className="w-full h-48 object-cover rounded-t-xl" />
                    <button onClick={onClose} className="absolute top-3 right-3 text-2xl text-white bg-black/50 rounded-full w-8 h-8 flex items-center justify-center">&times;</button>
                </div>
                <div className="p-6 flex-grow overflow-y-auto">
                    <div className="flex justify-between items-start">
                        <div>
                            <h2 className="text-2xl font-bold">{club.name}</h2>
                            <p className="flex items-center gap-1.5 text-md text-[var(--tg-theme-hint-color)] mt-1">
                                <MapPinIcon className="w-4 h-4" />
                                {club.address}
                            </p>
                        </div>
                        {isAdmin && (
                            <button onClick={() => onEdit(club)} className="flex items-center gap-1 text-sm font-semibold bg-[var(--tg-theme-button-color)]/20 text-[var(--tg-theme-button-color)] px-3 py-1.5 rounded-md hover:bg-[var(--tg-theme-button-color)]/40 transition">
                                <PencilIcon className="w-4 h-4" /> {t('common.edit')}
                            </button>
                        )}
                    </div>

                    <div className="grid grid-cols-2 gap-4 mt-6 text-sm">
                        <div className="bg-[var(--tg-theme-bg-color)] p-3 rounded-lg">
                            <p className="font-semibold text-[var(--tg-theme-hint-color)]">{t('clubDetailModal.phone')}</p>
                            <a href={`tel:${club.phone}`} className="text-[var(--tg-theme-link-color)] font-medium">{club.phone}</a>
                        </div>
                         <div className="bg-[var(--tg-theme-bg-color)] p-3 rounded-lg">
                            <p className="font-semibold text-[var(--tg-theme-hint-color)]">{t('clubDetailModal.email')}</p>
                            <a href={`mailto:${club.email}`} className="text-[var(--tg-theme-link-color)] font-medium truncate">{club.email}</a>
                        </div>
                    </div>

                    <div className="mt-6">
                        <h3 className="font-bold text-lg mb-2">{t('clubDetailModal.openingHours')}</h3>
                        <div className="space-y-1 text-sm bg-[var(--tg-theme-bg-color)] p-3 rounded-lg">
                            {DAYS_OF_WEEK.map(day => {
                                const hours = club.openingHours?.[day];
                                return (
                                    <div key={day} className="flex justify-between">
                                        <span className="font-semibold">{t(`days.${day.toLowerCase()}`)}</span>
                                        {hours ? (
                                            <span>{hours.open} - {hours.close}</span>
                                        ) : (
                                            <span className="text-red-400 font-semibold">{t('clubAdminModal.closed')}</span>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {club.announcements && club.announcements.length > 0 && (
                        <div className="mt-6">
                            <h3 className="font-bold text-lg mb-2">{t('clubDetailModal.announcementsTitle')}</h3>
                            <div className="space-y-3 max-h-40 overflow-y-auto pr-2">
                            {club.announcements.map(announcement => (
                                <div key={announcement.id} className="p-3 bg-[var(--tg-theme-bg-color)] rounded-lg border-l-4 border-[var(--tg-theme-button-color)]/50">
                                <p className="text-sm">{announcement.message}</p>
                                <p className="text-xs text-right text-[var(--tg-theme-hint-color)] mt-2">
                                    {t('clubDetailModal.publishedOn', { date: new Date(announcement.date).toLocaleDateString(lang, { day: 'numeric', month: 'long' }) })}
                                </p>
                                </div>
                            ))}
                            </div>
                        </div>
                    )}

                    <div className="mt-6">
                        <h3 className="font-bold text-lg mb-2">{t('clubDetailModal.courtsTitle', { count: club.courts.length })}</h3>
                        <div className="space-y-2">
                            {club.courts.map(court => (
                                <div key={court.id} className="flex justify-between items-center p-3 bg-[var(--tg-theme-bg-color)] rounded-lg">
                                    <p className="font-semibold">{court.name}</p>
                                    <span className={`px-2 py-1 text-xs font-bold rounded-full ${court.type === 'indoor' ? 'bg-blue-500/20 text-blue-300' : 'bg-yellow-500/20 text-yellow-300'}`}>
                                        {t(`clubDetailModal.${court.type}`)}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
                 <div className="p-4 border-t border-[var(--tg-theme-hint-color)]/20 flex-shrink-0">
                     <button type="button" onClick={onClose} className="w-full bg-transparent border border-[var(--tg-theme-hint-color)]/50 font-bold py-2.5 px-4 rounded-md">
                        {t('common.close')}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ClubDetailModal;
