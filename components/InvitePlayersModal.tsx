import React, { useState, useMemo } from 'react';
import { Match, PlayerAvailability, SuggestedPlayer, AvailabilityType, Club, PlayerProfile, MatchType, Gender } from '../types';
import { SpinnerIcon } from './icons/SpinnerIcon';
import SuggestedPlayerCard from './SuggestedPlayerCard';
import { useI18n } from '../hooks/useI18n';
import { DAYS_OF_WEEK } from '../constants';

interface InvitePlayersModalProps {
  match: Match;
  availabilities: PlayerAvailability[];
  onClose: () => void;
  onSendInvites: (matchId: number, invitedPlayers: SuggestedPlayer[]) => void;
  clubs: Club[];
  userProfile: PlayerProfile;
  allPlayers: PlayerProfile[];
}

type InviteTab = 'suggestions' | 'friends' | 'circles';

const InvitePlayersModal: React.FC<InvitePlayersModalProps> = ({ match, availabilities, onClose, onSendInvites, clubs, userProfile, allPlayers }) => {
  const { t } = useI18n();
  const [isLoading, setIsLoading] = useState(false);
  const [invitedPlayers, setInvitedPlayers] = useState<SuggestedPlayer[]>([]);
  const [activeTab, setActiveTab] = useState<InviteTab>('suggestions');

  const club = clubs.find(c => c.id === match.clubId);

  const suggestedPlayers = useMemo(() => {
    const matchDateTime = new Date(`${match.matchDate}T${match.matchTime}`);
    const matchDayIndex = (matchDateTime.getDay() + 6) % 7; // 0 = Monday
    const matchDay = DAYS_OF_WEEK[matchDayIndex];

    return availabilities.filter(av => {
        const player = av.player;
        if (match.participants.some(p => p && p.telegram === player.telegram)) return false; // Already in match
        if (player.level < match.levelMin || player.level > match.levelMax) return false;

        if (match.type === MatchType.MEN && player.gender !== Gender.MALE) return false;
        if (match.type === MatchType.WOMEN && player.gender !== Gender.FEMALE) return false;

        const avStartTime = parseInt(av.startTime.replace(':', ''));
        const avEndTime = parseInt(av.endTime.replace(':', ''));
        const matchTime = parseInt(match.matchTime.replace(':', ''));

        if (matchTime < avStartTime || matchTime >= avEndTime) return false;

        if (!av.clubIds.includes(match.clubId)) return false;

        switch (av.type) {
            case AvailabilityType.ONE_TIME:
                return av.date === match.matchDate;
            case AvailabilityType.DATE_RANGE:
                if (!av.startDate || !av.endDate) return false;
                const startDate = new Date(av.startDate);
                const endDate = new Date(av.endDate);
                endDate.setHours(23, 59, 59, 999); // Include the whole end day
                return matchDateTime >= startDate && matchDateTime <= endDate && av.days.includes(matchDay);
            case AvailabilityType.RECURRING:
                return av.days.includes(matchDay);
            default:
                return false;
        }
    }).map(av => ({ profile: av.player, availabilityId: av.id }));
  }, [match, availabilities]);

  const friendsAsSuggested = useMemo(() => {
    const friendProfiles = userProfile.friends
      .map(friendId => allPlayers.find(p => p.telegram === friendId))
      .filter((p): p is PlayerProfile => !!p)
      .filter(p => !match.participants.some(participant => participant && participant.telegram === p.telegram))
      .filter(p => {
        if (match.type === MatchType.MEN && p.gender !== Gender.MALE) return false;
        if (match.type === MatchType.WOMEN && p.gender !== Gender.FEMALE) return false;
        return true;
      });
    
    return friendProfiles.map(profile => ({ profile, availabilityId: 0 })); // availabilityId is not relevant here
  }, [userProfile.friends, allPlayers, match.participants, match.type]);


  const handleInviteToggle = (player: SuggestedPlayer) => {
    setInvitedPlayers(prev =>
      prev.some(p => p.profile.telegram === player.profile.telegram)
        ? prev.filter(p => p.profile.telegram !== player.profile.telegram)
        : [...prev, player]
    );
  };

  const handleInviteCircle = (circleMembers: string[]) => {
      const playersToInvite = circleMembers
          .map(memberId => allPlayers.find(p => p.telegram === memberId))
          .filter((p): p is PlayerProfile => !!p)
          .filter(p => !match.participants.some(participant => participant && participant.telegram === p.telegram))
          .filter(p => p.level >= match.levelMin && p.level <= match.levelMax)
          .filter(p => {
            if (match.type === MatchType.MEN && p.gender !== Gender.MALE) return false;
            if (match.type === MatchType.WOMEN && p.gender !== Gender.FEMALE) return false;
            return true;
          })
          .map(p => ({ profile: p, availabilityId: 0 }));
      
      setInvitedPlayers(prev => {
          const newInvites = new Map(prev.map(p => [p.profile.telegram, p]));
          playersToInvite.forEach(p => {
              if (!newInvites.has(p.profile.telegram)) {
                  newInvites.set(p.profile.telegram, p);
              }
          });
          return Array.from(newInvites.values());
      });
  };
  
  const handleSendInvitesClick = () => {
      setIsLoading(true);
      setTimeout(() => {
          onSendInvites(match.id, invitedPlayers);
          setIsLoading(false);
          onClose();
      }, 1000);
  };

  const tabButtonStyle = (tabName: InviteTab) => 
    `flex-1 py-2 px-3 text-xs sm:text-sm font-semibold transition-colors rounded-lg ${
        activeTab === tabName 
        ? 'bg-[var(--tg-theme-button-color)] text-[var(--tg-theme-button-text-color)]' 
        : 'bg-[var(--tg-theme-secondary-bg-color)] text-[var(--tg-theme-text-color)] hover:bg-[var(--tg-theme-hint-color)]/10'
    }`;
    
  const renderContent = () => {
    switch (activeTab) {
        case 'friends':
            return friendsAsSuggested.length > 0 ? (
                friendsAsSuggested.map(player => {
                    const isEligible = player.profile.level >= match.levelMin && player.profile.level <= match.levelMax;
                    const eligibilityReason = isEligible ? undefined : t('invitePlayersModal.levelMismatchTooltip', {
                        playerLevel: player.profile.level.toFixed(2),
                        minLevel: match.levelMin.toFixed(1),
                        maxLevel: match.levelMax.toFixed(1)
                    });
                    return (
                        <SuggestedPlayerCard
                            key={player.profile.telegram}
                            player={player}
                            onInviteToggle={handleInviteToggle}
                            isInvited={invitedPlayers.some(p => p.profile.telegram === player.profile.telegram)}
                            isEligible={isEligible}
                            eligibilityReason={eligibilityReason}
                        />
                    );
                })
            ) : (
                <p className="text-center text-[var(--tg-theme-hint-color)] py-10">{t('friendList.noFriendsTitle')}</p>
            );
        case 'circles':
            return userProfile.circles.length > 0 ? (
                userProfile.circles.map(circle => (
                    <div key={circle.id} className="flex items-center justify-between p-2 bg-[var(--tg-theme-bg-color)] rounded-lg">
                        <div className="flex items-center gap-3">
                            <div className={`w-10 h-10 rounded-full bg-${circle.color}-500/30 flex items-center justify-center`}>
                                <span className={`w-3 h-3 rounded-full bg-${circle.color}-500`}></span>
                            </div>
                            <div>
                                <p className="font-bold text-sm text-[var(--tg-theme-text-color)]">{circle.name}</p>
                                <p className="text-xs text-[var(--tg-theme-hint-color)]">{t('invitePlayersModal.members', { count: circle.members.length })}</p>
                            </div>
                        </div>
                        <button
                            onClick={() => handleInviteCircle(circle.members)}
                            className="px-3 py-1 text-sm font-semibold rounded-md transition bg-[var(--tg-theme-button-color)]/80 text-[var(--tg-theme-button-text-color)] hover:bg-[var(--tg-theme-button-color)]"
                        >
                            {t('invitePlayersModal.inviteAll')}
                        </button>
                    </div>
                ))
            ) : (
                <p className="text-center text-[var(--tg-theme-hint-color)] py-10">{t('circleManager.noCirclesTitle')}</p>
            );
        case 'suggestions':
        default:
             return suggestedPlayers.length > 0 ? (
                suggestedPlayers.map(player => (
                    <SuggestedPlayerCard
                        key={player.profile.telegram}
                        player={player}
                        onInviteToggle={handleInviteToggle}
                        isInvited={invitedPlayers.some(p => p.profile.telegram === player.profile.telegram)}
                    />
                ))
            ) : (
                <p className="text-center text-[var(--tg-theme-hint-color)] py-10">{t('invitePlayersModal.noSuggestions')}</p>
            );
    }
  }

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-[var(--tg-theme-secondary-bg-color)] rounded-xl p-6 w-full max-w-md border border-[var(--tg-theme-hint-color)]/20 shadow-2xl flex flex-col max-h-[90vh]">
        <div className="flex justify-between items-center mb-2 flex-shrink-0">
            <h2 className="text-xl font-bold">{t('invitePlayersModal.title')}</h2>
            <button onClick={onClose} className="text-2xl text-[var(--tg-theme-hint-color)]">&times;</button>
        </div>
        <p className="text-sm text-[var(--tg-theme-hint-color)] mb-4 flex-shrink-0">
            {t('invitePlayersModal.subtitle', { count: suggestedPlayers.length, clubName: club?.name || t('common.unknownClub') })}
        </p>

        <div className="grid grid-cols-3 gap-2 mb-4 p-1 bg-[var(--tg-theme-bg-color)] rounded-xl flex-shrink-0">
            <button onClick={() => setActiveTab('suggestions')} className={tabButtonStyle('suggestions')}>{t('invitePlayersModal.suggestionsTab')}</button>
            <button onClick={() => setActiveTab('friends')} className={tabButtonStyle('friends')}>{t('invitePlayersModal.friendsTab')}</button>
            <button onClick={() => setActiveTab('circles')} className={tabButtonStyle('circles')}>{t('invitePlayersModal.circlesTab')}</button>
        </div>
        
        <div className="space-y-2 flex-grow overflow-y-auto pr-2">
            {renderContent()}
        </div>
        
        <div className="flex gap-4 pt-4 mt-4 border-t border-[var(--tg-theme-hint-color)]/20 flex-shrink-0">
            <button type="button" onClick={onClose} className="w-full bg-transparent border border-[var(--tg-theme-hint-color)]/50 font-bold py-2.5 px-4 rounded-md">{t('common.cancel')}</button>
            <button type="button" onClick={handleSendInvitesClick} disabled={isLoading || invitedPlayers.length === 0} className="w-full bg-[var(--tg-theme-button-color)] text-[var(--tg-theme-button-text-color)] font-bold py-2.5 px-4 rounded-md flex justify-center items-center disabled:opacity-50">
                {isLoading ? <SpinnerIcon className="animate-spin h-5 w-5" /> : t('invitePlayersModal.sendInvitesButton', { count: invitedPlayers.length })}
            </button>
        </div>
      </div>
    </div>
  );
};

export default InvitePlayersModal;