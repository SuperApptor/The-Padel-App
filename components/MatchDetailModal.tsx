
import React from 'react';
import { Match, PlayerProfile, Club } from '../types';
import MatchCard from './MatchCard';
import { useI18n } from '../hooks/useI18n';

interface MatchDetailModalProps {
    match: Match;
    userProfile: PlayerProfile;
    clubs: Club[];
    onClose: () => void;
    onAccept: (slotIndex: number) => void;
    onDecline: () => void;
}

const MatchDetailModal: React.FC<MatchDetailModalProps> = ({ match, userProfile, clubs, onClose, onAccept, onDecline }) => {
    const { t } = useI18n();

    // The user is invited if their ID is in the invitedPlayerIds array
    const isInvitation = !!match.invitedPlayerIds?.includes(userProfile.telegram);

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-[var(--tg-theme-secondary-bg-color)] rounded-xl w-full max-w-sm border border-[var(--tg-theme-hint-color)]/20 shadow-2xl flex flex-col">
                <div className="p-4 border-b border-[var(--tg-theme-hint-color)]/20 flex-shrink-0">
                    <div className="flex justify-between items-center">
                        <h2 className="text-xl font-bold truncate">{isInvitation ? t('matchCard.invitation') : t('matchesTabs.upcoming')}</h2>
                        <button onClick={onClose} className="text-2xl text-[var(--tg-theme-hint-color)]">&times;</button>
                    </div>
                </div>

                <div className="p-4 flex-grow overflow-y-auto">
                    <MatchCard 
                        match={match}
                        userProfile={userProfile}
                        clubs={clubs}
                        circles={userProfile.circles}
                        onInvite={() => {}} // Dummy prop, not used in this context
                        onAddFriend={() => {}} // Dummy prop, not used in this context
                        isInvitation={isInvitation}
                        onAccept={onAccept}
                        onDecline={onDecline}
                    />
                </div>
            </div>
        </div>
    );
};

export default MatchDetailModal;