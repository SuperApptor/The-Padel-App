import React, { useState } from 'react';
import { Tournament, Club, TournamentCategory, PlayerProfile, RegistrationStatus, TournamentRegistration, TournamentTeam, BracketMatch, TournamentStatus } from '../types';
import { useI18n } from '../hooks/useI18n';
import { MapPinIcon } from './icons/MapPinIcon';
import { CalendarDaysIcon } from './icons/CalendarDaysIcon';
import { UsersIcon } from './icons/UsersIcon';
import TournamentBracket from './TournamentBracket';

interface TournamentDetailModalProps {
    tournament: Tournament;
    club: Club | undefined;
    userProfile: PlayerProfile;
    allPlayers: PlayerProfile[];
    onClose: () => void;
    onRegisterClick: (tournament: Tournament, category: TournamentCategory) => void;
    onOpenFindPartnerModal: (tournament: Tournament, category: TournamentCategory) => void;
    onGenerateBracket: (tournamentId: number, categoryId: number, numSeeds: number) => void;
    onRecordScore: (tournamentId: number, categoryId: number, match: any) => void;
    onCancelTournament: (tournamentId: number) => void;
    onForceStartBracket: (tournamentId: number, categoryId: number, numSeeds: number) => void;
    onApproveTournament?: (tournamentId: number) => void;
    onRejectTournament?: (tournamentId: number) => void;
}

const TournamentDetailModal: React.FC<TournamentDetailModalProps> = ({ tournament, club, userProfile, allPlayers, onClose, onRegisterClick, onOpenFindPartnerModal, onGenerateBracket, onRecordScore, onCancelTournament, onForceStartBracket, onApproveTournament, onRejectTournament }) => {
    const { t, lang } = useI18n();
    const [activeTab, setActiveTab] = useState<'info' | 'draw'>('info');
    const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(tournament.categories[0]?.id || null);
    const [numSeeds, setNumSeeds] = useState(4);
    
    const selectedCategory = tournament.categories.find(c => c.id === selectedCategoryId);
    const isAdmin = userProfile.adminOfClubId === tournament.clubId;
    const isPastStartDate = new Date(tournament.startDate) <= new Date();
    const isCanceled = tournament.status === TournamentStatus.CANCELED;
    const isPendingApproval = tournament.status === TournamentStatus.PENDING_APPROVAL;
    const organizer = tournament.organizerId ? allPlayers.find(p => p.telegram === tournament.organizerId) : null;

    const formatDate = (start: string, end: string) => {
        const startDate = new Date(start + 'T00:00:00');
        const endDate = new Date(end + 'T00:00:00');
        const options: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'long', year: 'numeric' };
        if (start === end) {
            return startDate.toLocaleDateString(lang, options);
        }
        return `${startDate.toLocaleDateString(lang, { day: 'numeric', month: 'short' })} - ${endDate.toLocaleDateString(lang, { day: 'numeric', month: 'short', year: 'numeric' })}`;
    };
    
    const tabButtonStyle = (tabName: 'info' | 'draw') =>
        `pb-2 px-4 text-sm font-semibold transition-colors flex items-center gap-2 ${
        activeTab === tabName
            ? 'text-[var(--tg-theme-button-color)] border-b-2 border-[var(--tg-theme-button-color)]'
            : 'text-[var(--tg-theme-hint-color)]'
        }`;
        
    const InfoTabContent = () => (
        <>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm mb-4">
                <div className="flex items-start gap-2">
                    <MapPinIcon className="w-5 h-5 mt-0.5 text-[var(--tg-theme-hint-color)]" />
                    <div>
                        <p className="font-semibold text-[var(--tg-theme-hint-color)]">{t('common.club')}</p>
                        <p className="font-bold">{club?.name || t('common.unknownClub')}</p>
                    </div>
                </div>
                <div className="flex items-start gap-2">
                    <CalendarDaysIcon className="w-5 h-5 mt-0.5 text-[var(--tg-theme-hint-color)]" />
                    <div>
                        <p className="font-semibold text-[var(--tg-theme-hint-color)]">{t('common.date')}</p>
                        <p className="font-bold">{formatDate(tournament.startDate, tournament.endDate)}</p>
                    </div>
                </div>
                {organizer && (
                     <div className="flex items-start gap-2 col-span-1 sm:col-span-2">
                        <UsersIcon className="w-5 h-5 mt-0.5 text-[var(--tg-theme-hint-color)]" />
                        <div>
                            <p className="font-semibold text-[var(--tg-theme-hint-color)]">{t('tournamentDetailModal.organizer')}</p>
                            <p className="font-bold">{organizer.name}</p>
                        </div>
                    </div>
                )}
            </div>
            
            {isPendingApproval && (
                <div className="p-3 bg-yellow-500/10 border border-yellow-500/30 text-yellow-300 text-sm rounded-lg text-center mb-4">
                    <p className="font-semibold">{t('tournamentDetailModal.approvalPending')}</p>
                </div>
            )}

            {tournament.description && (
                <div className="mb-4">
                    <h3 className="font-bold text-lg mb-2">{t('tournamentDetailModal.description')}</h3>
                    <p className="text-sm text-[var(--tg-theme-text-color)]/90 whitespace-pre-wrap">{tournament.description}</p>
                </div>
            )}

            <div className="mb-4">
                <h3 className="font-bold text-lg mb-2">{t('tournamentDetailModal.categories')}</h3>
                <div className="space-y-2">
                    {tournament.categories.map((cat: TournamentCategory) => {
                        const registrationsForCat = tournament.registrations.filter(r => r.categoryId === cat.id);
                        const confirmedTeams = registrationsForCat.filter(r => r.status === RegistrationStatus.CONFIRMED);
                        const soloPlayers = registrationsForCat.filter(r => r.status === RegistrationStatus.LOOKING_FOR_PARTNER);
                        
                        const registeredCount = confirmedTeams.length;
                        const isCategoryFull = registeredCount >= cat.maxTeams;
                        const userRegistration = registrationsForCat.find(r => r.player1Id === userProfile.telegram || r.player2Id === userProfile.telegram);
                        
                        let buttonText = t('tournamentDetailModal.registerButton');
                        let buttonAction = () => onRegisterClick(tournament, cat);
                        let isButtonDisabled = isCategoryFull || isCanceled || isPendingApproval || tournament.status !== TournamentStatus.PLANNED;

                        if (userRegistration) {
                            switch (userRegistration.status) {
                                case RegistrationStatus.CONFIRMED:
                                    buttonText = t('tournamentDetailModal.registeredButton');
                                    isButtonDisabled = true;
                                    break;
                                case RegistrationStatus.PENDING_PARTNER_APPROVAL:
                                    buttonText = t('tournamentDetailModal.invitationSentButton');
                                    isButtonDisabled = true;
                                    break;
                                case RegistrationStatus.LOOKING_FOR_PARTNER:
                                    buttonText = t('tournamentDetailModal.findPartnerButton');
                                    buttonAction = () => onOpenFindPartnerModal(tournament, cat);
                                    isButtonDisabled = isCanceled || isPendingApproval || tournament.status !== TournamentStatus.PLANNED;
                                    break;
                                default:
                                    buttonText = t('tournamentDetailModal.registeredButton');
                                    isButtonDisabled = true;
                            }
                        }

                        return (
                            <details key={cat.id} className="p-3 bg-[var(--tg-theme-bg-color)] rounded-lg group">
                                <summary className="flex justify-between items-center cursor-pointer">
                                    <div>
                                        <p className="font-semibold">{cat.name}</p>
                                        <p className="text-xs text-[var(--tg-theme-hint-color)] flex items-center gap-1"><UsersIcon className="w-3 h-3"/> {registeredCount} / {cat.maxTeams} {t('tournamentDetailModal.teams')}</p>
                                    </div>
                                    <button 
                                        onClick={(e) => { e.preventDefault(); buttonAction(); }}
                                        className="bg-[var(--tg-theme-button-color)] text-[var(--tg-theme-button-text-color)] font-bold py-1.5 px-4 text-sm rounded-md transition-opacity hover:opacity-80 disabled:opacity-50 disabled:bg-[var(--tg-theme-hint-color)] whitespace-nowrap"
                                        disabled={isButtonDisabled}
                                    >
                                        {buttonText}
                                    </button>
                                </summary>

                                <div className="mt-3 pt-2 border-t border-[var(--tg-theme-hint-color)]/20 space-y-2">
                                    <div>
                                        <h4 className="text-xs font-bold uppercase text-[var(--tg-theme-hint-color)] mb-1">{t('tournamentDetailModal.confirmedTeams')} ({confirmedTeams.length})</h4>
                                        {confirmedTeams.length > 0 ? (
                                            confirmedTeams.map(reg => {
                                                const p1 = allPlayers.find(p => p.telegram === reg.player1Id);
                                                const p2 = allPlayers.find(p => p.telegram === reg.player2Id);
                                                if (!p1 || !p2) return null;
                                                return <p key={reg.id} className="text-xs text-[var(--tg-theme-text-color)]/90">- {p1.name} & {p2.name}</p>
                                            })
                                        ) : <p className="text-xs text-[var(--tg-theme-hint-color)] italic">{t('tournamentDetailModal.noConfirmedTeams')}</p>}
                                    </div>
                                     <div>
                                        <h4 className="text-xs font-bold uppercase text-[var(--tg-theme-hint-color)] mb-1">{t('tournamentDetailModal.soloPlayers')} ({soloPlayers.length})</h4>
                                        {soloPlayers.length > 0 ? (
                                            soloPlayers.map(reg => {
                                                const p1 = allPlayers.find(p => p.telegram === reg.player1Id);
                                                if (!p1) return null;
                                                return <p key={reg.id} className="text-xs text-[var(--tg-theme-text-color)]/90">- {p1.name}</p>
                                            })
                                        ) : <p className="text-xs text-[var(--tg-theme-hint-color)] italic">{t('tournamentDetailModal.noSoloPlayers')}</p>}
                                    </div>
                                </div>
                            </details>
                        );
                    })}
                </div>
            </div>
        </>
    );
    
    const DrawTabContent = () => {
        if (!selectedCategory) return null;
        
        const confirmedTeamsCount = tournament.registrations.filter(r => r.categoryId === selectedCategory.id && r.status === RegistrationStatus.CONFIRMED).length;
        const isCategoryFull = confirmedTeamsCount === selectedCategory.maxTeams;

        const showAdminActions = isAdmin && isPastStartDate && tournament.status === TournamentStatus.PLANNED && !isCategoryFull;

        if (showAdminActions) {
            return (
                <div className="text-center p-4 bg-yellow-900/50 text-yellow-200 rounded-lg border border-yellow-700/50 my-4">
                    <h4 className="font-bold">{t('tournamentDetailModal.adminActions')}</h4>
                    <p className="text-sm mt-1 mb-3">{t('tournamentDetailModal.incompleteTournamentWarning')}</p>
                    <div className="flex flex-col sm:flex-row gap-2">
                        <button onClick={() => onForceStartBracket(tournament.id, selectedCategory.id, numSeeds)} className="flex-1 bg-yellow-600/80 hover:bg-yellow-600 text-white font-bold py-2 px-4 rounded-md text-sm">{t('tournamentDetailModal.forceStartButton')}</button>
                        <button onClick={() => onCancelTournament(tournament.id)} className="flex-1 bg-red-600/80 hover:bg-red-600 text-white font-bold py-2 px-4 rounded-md text-sm">{t('tournamentDetailModal.cancelTournamentButton')}</button>
                    </div>
                </div>
            )
        }

        if (!selectedCategory.bracket) {
             return (
                <div className="text-center p-8">
                     <p className="mb-4">{t('tournamentDetailModal.drawNotGenerated')}</p>
                     {isAdmin && !isCanceled && tournament.status === TournamentStatus.PLANNED && (
                        <div className="bg-[var(--tg-theme-bg-color)] p-4 rounded-lg">
                            <div className="flex items-center justify-center gap-2 mb-3">
                                <label htmlFor="numSeeds" className="text-sm font-medium">{t('tournamentDetailModal.numSeeds')}:</label>
                                <select 
                                    id="numSeeds" 
                                    value={numSeeds} 
                                    onChange={(e) => setNumSeeds(Number(e.target.value))}
                                    className="bg-[var(--tg-theme-secondary-bg-color)] border border-[var(--tg-theme-hint-color)]/50 rounded-md px-2 py-1 text-sm disabled:opacity-50"
                                    disabled={!isCategoryFull}
                                >
                                    {[2, 4, 8, 16].filter(n => n * 2 <= confirmedTeamsCount).map(n => <option key={n} value={n}>{n}</option>)}
                                </select>
                            </div>
                            <button 
                                onClick={() => onGenerateBracket(tournament.id, selectedCategory.id, numSeeds)}
                                className="bg-[var(--tg-theme-button-color)] text-[var(--tg-theme-button-text-color)] font-bold py-2 px-4 rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
                                disabled={!isCategoryFull}
                            >
                                {t('tournamentDetailModal.generateDraw')}
                            </button>
                            {!isCategoryFull && (
                                <p className="text-sm text-yellow-400 mt-3">
                                    {t('tournamentDetailModal.drawGenerationNotFull', {
                                        registeredCount: confirmedTeamsCount,
                                        maxTeams: selectedCategory.maxTeams
                                    })}
                                </p>
                            )}
                        </div>
                     )}
                </div>
            );
        }
        
        return <TournamentBracket 
                    teams={selectedCategory.teams || []} 
                    bracket={selectedCategory.bracket} 
                    isAdmin={isAdmin}
                    isReadOnly={isCanceled || isPendingApproval || tournament.status === TournamentStatus.COMPLETED}
                    onRecordScore={(match) => onRecordScore(tournament.id, selectedCategory.id, match)}
                />;
    };


    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className={`bg-[var(--tg-theme-secondary-bg-color)] rounded-xl w-full max-w-4xl border border-[var(--tg-theme-hint-color)]/20 shadow-2xl flex flex-col max-h-[90vh] ${isCanceled ? 'opacity-80' : ''}`}>
                <div className="relative flex-shrink-0">
                    <img src={tournament.imageUrl} alt={tournament.name} className="w-full h-16 object-cover rounded-t-xl" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent"></div>
                    <div className="absolute bottom-4 left-4 text-white">
                        <h2 className="text-2xl font-bold drop-shadow-lg">{tournament.name}</h2>
                    </div>
                    {isPendingApproval && (
                        <div className="absolute top-3 left-3 bg-yellow-500 text-black text-xs font-bold px-2 py-1 rounded-full shadow-lg z-10">
                            {t('tournamentCard.statusPendingApproval')}
                        </div>
                    )}
                    <button onClick={onClose} className="absolute top-3 right-3 text-2xl text-white bg-black/50 rounded-full w-8 h-8 flex items-center justify-center">&times;</button>
                </div>
                
                <div className="p-6 pb-0 border-b border-[var(--tg-theme-hint-color)]/20 flex-shrink-0">
                     <div className="flex items-center justify-between">
                         <div className="flex">
                            <button onClick={() => setActiveTab('info')} className={tabButtonStyle('info')}>{t('tournamentDetailModal.tabInfo')}</button>
                            <button onClick={() => setActiveTab('draw')} className={tabButtonStyle('draw')}>{t('tournamentDetailModal.tabDraw')}</button>
                         </div>
                         {activeTab === 'draw' && tournament.categories.length > 1 && (
                            <select 
                                value={selectedCategoryId || ''}
                                onChange={e => setSelectedCategoryId(Number(e.target.value))}
                                className="bg-[var(--tg-theme-bg-color)] border border-[var(--tg-theme-hint-color)]/50 rounded-md px-3 py-1 text-sm text-[var(--tg-theme-text-color)]"
                            >
                                {tournament.categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                            </select>
                         )}
                     </div>
                </div>

                <div className="flex-grow overflow-y-auto">
                   <div className="p-6">
                     {activeTab === 'info' ? <InfoTabContent /> : <DrawTabContent />}
                   </div>
                </div>

                <div className="p-4 border-t border-[var(--tg-theme-hint-color)]/20 flex-shrink-0">
                    {isAdmin && isPendingApproval && onApproveTournament && onRejectTournament ? (
                        <div className="flex gap-4">
                            <button onClick={() => onRejectTournament(tournament.id)} className="w-full bg-red-500/80 text-white font-bold py-2.5 px-4 rounded-md">{t('common.reject')}</button>
                            <button onClick={() => onApproveTournament(tournament.id)} className="w-full bg-green-500/80 text-white font-bold py-2.5 px-4 rounded-md">{t('common.approve')}</button>
                        </div>
                    ) : (
                        <button type="button" onClick={onClose} className="w-full bg-transparent border border-[var(--tg-theme-hint-color)]/50 font-bold py-2.5 px-4 rounded-md">
                            {t('common.close')}
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default TournamentDetailModal;