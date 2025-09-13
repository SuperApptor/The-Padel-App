import React from 'react';
import { Tournament, TournamentCategory, PlayerProfile, RegistrationStatus } from '../types';
import { useI18n } from '../hooks/useI18n';

interface FindPartnerModalProps {
    tournament: Tournament;
    category: TournamentCategory;
    userProfile: PlayerProfile;
    allPlayers: PlayerProfile[];
    onClose: () => void;
    onInvite: (tournamentId: number, categoryId: number, targetPlayerId: string) => void;
}

const FindPartnerModal: React.FC<FindPartnerModalProps> = ({ tournament, category, userProfile, allPlayers, onClose, onInvite }) => {
    const { t } = useI18n();

    const soloPlayers = tournament.registrations
        .filter(r => r.categoryId === category.id && r.status === RegistrationStatus.LOOKING_FOR_PARTNER && r.player1Id !== userProfile.telegram)
        .map(r => allPlayers.find(p => p.telegram === r.player1Id))
        .filter((p): p is PlayerProfile => p !== undefined);

    const currentUserRegistration = tournament.registrations.find(
        r => r.player1Id === userProfile.telegram && r.categoryId === category.id
    );
    const invitationAlreadySent = currentUserRegistration?.status === RegistrationStatus.PENDING_PARTNER_APPROVAL;

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-[var(--tg-theme-secondary-bg-color)] rounded-xl w-full max-w-md border border-[var(--tg-theme-hint-color)]/20 shadow-2xl flex flex-col max-h-[90vh]">
                <div className="p-6 pb-4 flex-shrink-0">
                    <div className="flex justify-between items-center mb-2">
                        <h2 className="text-xl font-bold truncate">{t('findPartnerModal.title', { categoryName: category.name })}</h2>
                        <button onClick={onClose} className="text-2xl text-[var(--tg-theme-hint-color)]">&times;</button>
                    </div>
                     <p className="text-sm text-[var(--tg-theme-hint-color)]">
                        {t('findPartnerModal.subtitle', { count: soloPlayers.length })}
                    </p>
                </div>

                <div className="p-6 pt-2 flex-grow overflow-y-auto min-h-0">
                     <div className="space-y-2">
                        {soloPlayers.length > 0 ? soloPlayers.map(player => (
                            <div key={player.telegram} className="flex items-center justify-between p-2 bg-[var(--tg-theme-bg-color)] rounded-lg">
                                <div className="flex items-center gap-3">
                                    <img src={player.avatarUrl} alt={player.name} className="w-10 h-10 rounded-full object-cover"/>
                                    <div>
                                        <p className="font-bold text-sm">{player.name}</p>
                                        <p className="text-xs text-[var(--tg-theme-hint-color)]">{t('common.level')} {player.level.toFixed(2)}</p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => onInvite(tournament.id, category.id, player.telegram)}
                                    disabled={invitationAlreadySent}
                                    className="px-3 py-1 text-sm font-semibold rounded-md transition bg-[var(--tg-theme-button-color)] text-[var(--tg-theme-button-text-color)] hover:bg-[var(--tg-theme-button-color)]/80 disabled:opacity-50 disabled:bg-[var(--tg-theme-hint-color)]"
                                >
                                    {invitationAlreadySent ? t('findPartnerModal.invitationSent') : t('common.invite')}
                                </button>
                            </div>
                        )) : (
                            <p className="text-center text-sm text-[var(--tg-theme-hint-color)] py-12">{t('findPartnerModal.noPlayers')}</p>
                        )}
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

export default FindPartnerModal;