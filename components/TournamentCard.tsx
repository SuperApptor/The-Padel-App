import React from 'react';
import { Tournament, Club, TournamentCategory, PlayerProfile, RegistrationStatus, TournamentStatus } from '../types';
import { MapPinIcon } from './icons/MapPinIcon';
import { UsersIcon } from './icons/UsersIcon';
import { useI18n } from '../hooks/useI18n';

interface TournamentCardProps {
    tournament: Tournament;
    clubs: Club[];
    userProfile: PlayerProfile;
    onSelectTournament: (tournament: Tournament) => void;
}

const TournamentCard: React.FC<TournamentCardProps> = ({ tournament, clubs, userProfile, onSelectTournament }) => {
    const { t, lang } = useI18n();
    const club = clubs.find(c => c.id === tournament.clubId);

    const totalTeamsRegistered = tournament.registrations.filter(r => r.status === RegistrationStatus.CONFIRMED).length;
    const maxTeams = tournament.categories.reduce((sum, cat) => sum + cat.maxTeams, 0);
    
    const userRegistration = tournament.registrations.find(r => r.player1Id === userProfile.telegram || r.player2Id === userProfile.telegram);
    
    const getRegistrationStatus = () => {
        if (tournament.status === TournamentStatus.CANCELED) {
            return { text: t('tournamentCard.statusCanceled'), color: 'bg-gray-600' };
        }
        if (!userRegistration) return null;

        switch (userRegistration.status) {
            case RegistrationStatus.CONFIRMED:
                return { text: t('tournamentCard.statusConfirmed'), color: 'bg-green-500/80' };
            case RegistrationStatus.LOOKING_FOR_PARTNER:
                return { text: t('tournamentCard.statusLooking'), color: 'bg-orange-500/80' };
            case RegistrationStatus.PENDING_PARTNER_APPROVAL:
            case RegistrationStatus.PENDING_ADMIN_APPROVAL:
                return { text: t('tournamentCard.statusPending'), color: 'bg-orange-500/80' };
            default:
                return null;
        }
    };
    
    const registrationStatus = getRegistrationStatus();
    
    const formatDate = (start: string, end: string) => {
        const startDate = new Date(start + 'T00:00:00');
        const endDate = new Date(end + 'T00:00:00');
        if (start === end) {
            return startDate.toLocaleDateString(lang, { day: 'numeric', month: 'long', year: 'numeric' });
        }
        return `${startDate.toLocaleDateString(lang, { day: 'numeric', month: 'short' })} - ${endDate.toLocaleDateString(lang, { day: 'numeric', month: 'short', year: 'numeric' })}`;
    };
    
    const isCanceled = tournament.status === TournamentStatus.CANCELED;

    return (
        <div className={`bg-[var(--tg-theme-secondary-bg-color)] rounded-xl border border-[var(--tg-theme-hint-color)]/20 shadow-lg overflow-hidden flex flex-col group transition-all duration-300 hover:border-[var(--tg-theme-button-color)]/50 hover:shadow-lg hover:shadow-[var(--tg-theme-button-color)]/10 ${isCanceled ? 'opacity-60' : ''}`}>
            <div className="relative">
                {registrationStatus && (
                    <div className={`absolute top-3 left-3 ${registrationStatus.color} text-white text-xs font-bold px-2 py-1 rounded-full shadow-lg z-10`}>
                        {registrationStatus.text}
                    </div>
                )}
                <img src={tournament.imageUrl} alt={tournament.name} className="w-full h-40 object-cover group-hover:scale-105 transition-transform duration-300" />
                <div className="absolute bottom-0 left-0 w-full h-16 bg-gradient-to-t from-black/80 to-transparent"></div>
                <div className="absolute bottom-2 left-4 text-white">
                     <p className="font-semibold text-sm drop-shadow-md">{formatDate(tournament.startDate, tournament.endDate)}</p>
                     <h3 className="font-bold text-lg drop-shadow-lg">{tournament.name}</h3>
                </div>
            </div>
            <div className="p-4 flex flex-col flex-grow">
                <div className="flex justify-between items-center text-sm text-[var(--tg-theme-hint-color)] mb-3">
                    <p className="flex items-center gap-1.5">
                        <MapPinIcon className="w-4 h-4" />
                        <span className="font-medium">{club?.name || t('common.unknownClub')}</span>
                    </p>
                    <div className="flex items-center gap-1.5">
                         <UsersIcon className="w-4 h-4" />
                         <p className="font-semibold text-sm">
                            <span className="font-bold text-[var(--tg-theme-text-color)]">{totalTeamsRegistered}</span> / {maxTeams} <span className="text-[var(--tg-theme-hint-color)]">{t('tournamentCard.registered')}</span>
                        </p>
                    </div>
                </div>
                
                <div className="flex-grow space-y-2">
                    <div className="flex flex-wrap gap-2">
                        {tournament.categories.map((cat: TournamentCategory) => (
                            <span key={cat.id} className="text-xs font-bold text-[var(--tg-theme-text-color)] bg-[var(--tg-theme-hint-color)]/20 px-2 py-1 rounded-full">
                                {cat.name}
                            </span>
                        ))}
                    </div>
                     <p className="text-sm"><span className="font-semibold text-[var(--tg-theme-hint-color)]">{t('tournamentCard.format')}:</span> {t(`tournamentFormat.${tournament.format}`)}</p>
                     {tournament.prize && <p className="text-sm"><span className="font-semibold text-[var(--tg-theme-hint-color)]">{t('tournamentCard.prize')}:</span> {tournament.prize}</p>}
                </div>

                <button
                    onClick={() => onSelectTournament(tournament)}
                    className="mt-4 w-full bg-[var(--tg-theme-button-color)] text-[var(--tg-theme-button-text-color)] font-bold py-2.5 px-4 rounded-lg flex items-center justify-center transition-opacity duration-300 hover:opacity-80"
                >
                    {t('tournamentCard.details')}
                </button>
            </div>
        </div>
    );
};

export default TournamentCard;