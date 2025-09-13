import React from 'react';
import { SuggestedPlayer } from '../types';
import { useI18n } from '../hooks/useI18n';

interface SuggestedPlayerCardProps {
    player: SuggestedPlayer;
    onInviteToggle: (player: SuggestedPlayer) => void;
    isInvited: boolean;
    isEligible?: boolean;
    eligibilityReason?: string;
}

const SuggestedPlayerCard: React.FC<SuggestedPlayerCardProps> = ({ player, onInviteToggle, isInvited, isEligible = true, eligibilityReason }) => {
    const { t } = useI18n();
    const { profile } = player;

    const buttonDisabled = !isEligible || isInvited;

    const getButtonContent = () => {
        if (isInvited) {
            return { text: t('common.invited'), className: 'bg-green-500/20 text-green-300' };
        }
        if (!isEligible) {
            return { text: t('common.ineligible'), className: 'bg-gray-500/20 text-gray-400 cursor-not-allowed' };
        }
        return { text: t('common.invite'), className: 'bg-[var(--tg-theme-button-color)]/80 text-[var(--tg-theme-button-text-color)] hover:bg-[var(--tg-theme-button-color)]' };
    };

    const { text, className } = getButtonContent();

    return (
        <div className="flex items-center justify-between p-2 bg-[var(--tg-theme-bg-color)] rounded-lg">
            <div className="flex items-center gap-3">
                <img src={profile.avatarUrl} alt={profile.name} className="w-10 h-10 rounded-full object-cover" />
                <div>
                    <p className="font-bold text-sm text-[var(--tg-theme-text-color)]">{profile.name}</p>
                    <p className="text-xs text-[var(--tg-theme-hint-color)]">{t('common.level')} {profile.level.toFixed(2)}</p>
                </div>
            </div>
            <button
                onClick={() => onInviteToggle(player)}
                disabled={buttonDisabled}
                title={!isEligible ? eligibilityReason : ''}
                className={`px-3 py-1 text-sm font-semibold rounded-md transition ${className}`}
            >
                {text}
            </button>
        </div>
    );
};

export default SuggestedPlayerCard;