import React, { useState, useEffect, useMemo } from 'react';
import { Match, PlayerProfile, PlayerCircle, Club, MatchType, Gender } from '../types';
import { CompetitiveIcon } from './icons/CompetitiveIcon';
import { PlusIcon } from './icons/PlusIcon';
import { MapPinIcon } from './icons/MapPinIcon';
import { LockIcon } from './icons/LockIcon';
import { AddUserIcon } from './icons/AddUserIcon';
import { StarIcon } from './icons/StarIcon';
import { WhatsAppIcon } from './icons/WhatsAppIcon';
import { useI18n } from '../hooks/useI18n';
import { TrashIcon } from './icons/TrashIcon';
import { ChatBubbleIcon } from './icons/ChatBubbleIcon';
import { MaleIcon } from './icons/MaleIcon';
import { FemaleIcon } from './icons/FemaleIcon';
import { UsersIcon } from './icons/UsersIcon';

interface MatchCardProps {
  match: Match;
  userProfile: PlayerProfile;
  circles: PlayerCircle[];
  clubs: Club[];
  onInvite?: (match: Match) => void;
  onAddFriend: (friendId: string) => void;
  onJoin?: (matchId: number, slotIndex: number) => void;
  onCancel?: (matchId: number) => void;
  onAddPlayer?: (matchId: number, slotIndex: number) => void;
  onOpenFriendProfile?: (player: PlayerProfile) => void;
  onOpenMyProfile?: () => void;
  isInvitation?: boolean;
  onAccept?: (slotIndex: number) => void;
  onDecline?: () => void;
}

const PlayerInfo: React.FC<{ player: PlayerProfile, userProfile: PlayerProfile, onAddFriend: (friendId: string) => void, onOpenProfile?: () => void, isSelectionPreview?: boolean }> = ({ player, userProfile, onAddFriend, onOpenProfile, isSelectionPreview }) => {
    const { t } = useI18n();
    const levelColor = "bg-yellow-300 text-black";
    const isSelf = player.telegram === userProfile.telegram;
    const isGuest = player.telegram?.startsWith('guest_');
    const isFriend = userProfile.friends.includes(player.telegram);
    const requestSent = userProfile.sentFriendRequests.includes(player.telegram);
    const requestReceived = userProfile.friendRequests.some(req => req.from.telegram === player.telegram);

    const isPending = requestSent || requestReceived;
    const showButton = !isSelf && !isFriend && !isGuest && !isSelectionPreview;
    
    const imageBorderClass = isSelectionPreview
        ? 'border-[var(--tg-theme-button-color)] ring-2 ring-[var(--tg-theme-button-color)] ring-offset-2 ring-offset-[var(--tg-theme-secondary-bg-color)]'
        : 'border-white/20';
        
    const canOpenProfile = !!onOpenProfile;

    return (
        <div className="flex flex-col items-center text-center space-y-1 w-16 flex-shrink-0">
            <div className="relative">
                 <button 
                    onClick={() => canOpenProfile && onOpenProfile()}
                    disabled={!canOpenProfile}
                    className="disabled:cursor-default"
                >
                    <img src={player.avatarUrl} alt={player.name} className={`w-12 h-12 rounded-full object-cover border-2 transition-all ${imageBorderClass} ${canOpenProfile ? 'hover:ring-2 hover:ring-[var(--tg-theme-button-color)]' : ''}`} />
                </button>
                {showButton && (
                    <button 
                      onClick={isPending ? undefined : () => onAddFriend(player.telegram)} 
                      disabled={isPending}
                      className="absolute -bottom-1 -right-1 bg-[var(--tg-theme-button-color)] text-[var(--tg-theme-button-text-color)] p-1 rounded-full hover:scale-110 transition shadow-md disabled:bg-[var(--tg-theme-hint-color)] disabled:cursor-not-allowed"
                      aria-label={isPending ? (requestSent ? t('addFriend.requestSent') : t('socialTabs.requests')) : t('matchCard.addFriendAria', { name: player.name })}
                    >
                        <AddUserIcon className="w-4 h-4" />
                    </button>
                )}
            </div>
            <p className="text-xs font-medium text-[var(--tg-theme-text-color)] truncate w-full">{player.name.split(' ')[0]}</p>
            <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${levelColor}`}>
                {player.level.toFixed(2)}
            </span>
        </div>
    );
};

const EmptySlot: React.FC<{ isClickable?: boolean; onSelect?: () => void; }> = ({ isClickable, onSelect }) => {
    const { t } = useI18n();
    const baseClasses = "flex flex-col items-center text-center space-y-1 w-16 flex-shrink-0";
    const boxBaseClasses = "w-12 h-12 rounded-full border-2 flex items-center justify-center transition-colors";

    if (isClickable) {
        return (
            <button onClick={onSelect} className={baseClasses}>
                 <div className={`${boxBaseClasses} bg-transparent border-dashed border-[var(--tg-theme-hint-color)] hover:border-[var(--tg-theme-button-color)]`}>
                    <PlusIcon className={`w-6 h-6 text-[var(--tg-theme-hint-color)]`} />
                </div>
                <p className="text-xs font-medium text-[var(--tg-theme-hint-color)]">{t('matchCard.openSlot')}</p>
                <span className="text-xs font-bold px-2 py-0.5 rounded-full opacity-0">0.00</span>
            </button>
        )
    }

    return (
        <div className={baseClasses}>
            <div className={`${boxBaseClasses} bg-transparent border-dashed border-[var(--tg-theme-hint-color)]`}>
                <PlusIcon className="w-6 h-6 text-[var(--tg-theme-hint-color)]" />
            </div>
            <p className="text-xs font-medium text-[var(--tg-theme-hint-color)]">{t('matchCard.openSlot')}</p>
            <span className="text-xs font-bold px-2 py-0.5 rounded-full opacity-0">0.00</span>
        </div>
    );
};

const MatchCard: React.FC<MatchCardProps> = ({ match, userProfile, onInvite, circles, clubs, onAddFriend, onJoin, onCancel, onAddPlayer, onOpenFriendProfile, onOpenMyProfile, isInvitation, onAccept, onDecline }) => {
  const { t, lang } = useI18n();
  const [selectedSlot, setSelectedSlot] = useState<number | null>(null);
  
  const { participants } = match;
  const filledSlots = participants.filter(p => p !== null).length;
  const openSlots = 4 - filledSlots;
  const isFull = filledSlots === 4;

  const isUserParticipant = participants.some(p => p && p.telegram === userProfile.telegram);
  const isOrganizer = participants[0]?.telegram === userProfile.telegram;
  const circle = match.circleId ? circles.find(c => c.id === match.circleId) : null;
  const club = clubs.find(c => c.id === match.clubId);
  const isFavoriteClub = userProfile.favoriteClubIds.includes(match.clubId);
  
  const isLevelInRange = isInvitation || onJoin ? (userProfile.level >= match.levelMin && userProfile.level <= match.levelMax) : true;
  const isCanceled = match.status === 'CANCELED';

  const { timeString, clubString } = useMemo(() => {
    const startDate = new Date(`${match.matchDate}T${match.matchTime}`);
    const endDate = new Date(startDate.getTime() + (match.duration || 90) * 60000);
    
    const dateFormatOptions: Intl.DateTimeFormatOptions = { weekday: 'short', day: 'numeric', month: 'short' };
    const timeFormatOptions: Intl.DateTimeFormatOptions = { hour: '2-digit', minute: '2-digit', hour12: false };

    const datePart = startDate.toLocaleDateString(lang, dateFormatOptions);
    const startTimePart = startDate.toLocaleTimeString(lang, timeFormatOptions);
    const endTimePart = endDate.toLocaleTimeString(lang, timeFormatOptions);

    return {
        timeString: `${datePart} • ${startTimePart} - ${endTimePart}`,
        clubString: club?.name || t('common.unknownClub')
    };
  }, [match.matchDate, match.matchTime, match.duration, lang, club, t]);


  const isGenderCompatible = useMemo(() => {
    if (!onJoin && !isInvitation) return true; // Not applicable if not joining/accepting
    if (match.type === MatchType.OPEN || match.type === MatchType.MIXED) return true;
    if (match.type === MatchType.MEN && userProfile.gender === Gender.MALE) return true;
    if (match.type === MatchType.WOMEN && userProfile.gender === Gender.FEMALE) return true;
    return false;
  }, [match.type, userProfile.gender, onJoin, isInvitation]);

  useEffect(() => {
    if (isInvitation || onJoin) {
        const openSlotsIndexes = participants.map((p, i) => p === null ? i : -1).filter(i => i !== -1);
        if (openSlotsIndexes.length === 1) {
            setSelectedSlot(openSlotsIndexes[0]);
        }
    }
  }, [isInvitation, onJoin, participants]);


  const handleShare = () => {
    const formattedDate = new Date(match.matchDate + 'T00:00:00').toLocaleDateString(lang, { day: '2-digit', month: '2-digit', year: 'numeric' });
    const directMatchLink = `https://t.me/PadelPartner_bot?start=match${match.id}`;
    
    const message = t('whatsapp.shareMessage', {
      clubName: club?.name || 'un super club',
      date: formattedDate,
      time: match.matchTime,
      levelMin: match.levelMin.toFixed(1),
      levelMax: match.levelMax.toFixed(1),
      openSlots: openSlots,
      link: directMatchLink
    });

    const whatsappUrl = `whatsapp://send?text=${encodeURIComponent(message)}`;
    window.location.href = whatsappUrl;
  };

  const handleCancelClick = () => {
    if (onCancel && window.confirm(t('matchCard.cancelConfirmation'))) {
        onCancel(match.id);
    }
  };

  const renderPlayerSlot = (index: number) => {
    const player = participants[index];
    if (player) {
        const isSelf = player.telegram === userProfile.telegram;
        const openProfileHandler = isSelf 
            ? onOpenMyProfile 
            : (onOpenFriendProfile ? () => onOpenFriendProfile(player) : undefined);
        
        return <PlayerInfo 
                    key={player.telegram} 
                    player={player} 
                    userProfile={userProfile} 
                    onAddFriend={onAddFriend} 
                    onOpenProfile={openProfileHandler} 
                />;
    } else if ((isInvitation || onJoin) && selectedSlot === index) {
        return <PlayerInfo 
                    key={`selected-${index}`} 
                    player={userProfile} 
                    userProfile={userProfile} 
                    onAddFriend={() => {}} 
                    onOpenProfile={onOpenMyProfile} 
                    isSelectionPreview 
                />;
    } else {
        const canJoin = isInvitation || !!onJoin;
        const canAdd = isOrganizer && !!onAddPlayer && !isCanceled;
        return (
            <EmptySlot 
                key={`empty-${index}`} 
                isClickable={canJoin || canAdd} 
                onSelect={() => {
                    if (canJoin) setSelectedSlot(index);
                    else if (canAdd) onAddPlayer(match.id, index);
                }} 
            />
        );
    }
  };
  
  const renderMatchTypeIcon = () => {
    const iconClass = "w-4 h-4";
    switch (match.type) {
        case MatchType.MEN: return <MaleIcon className={iconClass} />;
        case MatchType.WOMEN: return <FemaleIcon className={iconClass} />;
        case MatchType.MIXED: return <UsersIcon className={iconClass} />;
        default: return null;
    }
  };

  const renderActionIcons = () => {
      const showChat = isUserParticipant;
      const showShare = !isCanceled;
      const showCancel = isOrganizer && onCancel;
      const showAnyIcon = !isCanceled && (showChat || showShare || showCancel);

      if (!showAnyIcon) {
          return null;
      }
      
      return (
         <div className="flex justify-center items-center gap-4">
              {showChat && (
              <a
                  href={`https://t.me/padel_match_group_${match.id}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 bg-blue-500/20 rounded-full text-blue-400 hover:bg-blue-500/40 transition-colors"
                  title={t('matchCard.groupChatTooltip')}
              >
                  <ChatBubbleIcon className="w-5 h-5" />
              </a>
              )}
              {showShare && (
              <button
                  onClick={handleShare}
                  className="p-2 bg-green-500/20 rounded-full text-green-400 hover:bg-green-500/40 transition-colors"
                  aria-label={t('whatsapp.shareAriaLabel')}
                  title={t('whatsapp.shareAriaLabel')}
              >
                  <WhatsAppIcon className="w-5 h-5" />
              </button>
              )}
              {showCancel && (
              <button
                  onClick={handleCancelClick}
                  className="p-2 bg-red-500/20 rounded-full text-red-400 hover:bg-red-500/40 transition-colors"
                  aria-label={t('matchCard.cancelMatch')}
                  title={t('matchCard.cancelMatch')}
              >
                  <TrashIcon className="w-5 h-5" />
              </button>
              )}
        </div>
      );
  }

  const renderActionButton = () => {
    if (isCanceled) return null;

    if (isInvitation && onAccept && onDecline) {
        return (
            <div className="mt-4 flex gap-4">
                <button
                    onClick={onDecline}
                    className="w-full bg-red-500/80 text-white font-bold py-2.5 px-4 rounded-lg flex items-center justify-center transition-opacity duration-300 hover:opacity-80"
                >
                    {t('common.decline')}
                </button>
                <button
                    onClick={() => selectedSlot !== null && onAccept(selectedSlot)}
                    disabled={selectedSlot === null || !isLevelInRange || !isGenderCompatible}
                    className="w-full bg-green-500/80 text-white font-bold py-2.5 px-4 rounded-lg flex items-center justify-center transition-opacity duration-300 hover:opacity-80 disabled:opacity-50"
                >
                    {t('common.accept')}
                </button>
            </div>
        );
    }
    
    if (onJoin) { // This is an "Open Match"
        return (
            <button
                onClick={() => selectedSlot !== null && onJoin(match.id, selectedSlot)}
                disabled={selectedSlot === null || !isLevelInRange || !isGenderCompatible}
                title={!isGenderCompatible ? t('matchCard.genderMismatchError', { matchType: t(`matchType.${match.type}`)}) : ""}
                className="mt-4 w-full bg-[var(--tg-theme-button-color)] text-[var(--tg-theme-button-text-color)] font-bold py-2.5 px-4 rounded-lg flex items-center justify-center transition-opacity duration-300 hover:opacity-80 disabled:opacity-50"
            >
                {t('matchCard.joinMatch')}
            </button>
        );
    }

    if (isOrganizer && !isFull && onInvite) {
        return (
             <button
                onClick={() => onInvite(match)}
                className="mt-4 w-full bg-transparent border-2 border-[var(--tg-theme-button-color)] text-[var(--tg-theme-button-color)] font-bold py-2.5 px-4 rounded-lg flex items-center justify-center transition-colors duration-300 hover:bg-[var(--tg-theme-button-color)] hover:text-[var(--tg-theme-button-text-color)]"
            >
                {t('matchCard.invitePlayers')}
            </button>
        )
    }

    return null;
  };

  return (
    <div className={`bg-[var(--tg-theme-secondary-bg-color)] p-4 rounded-xl border border-[var(--tg-theme-hint-color)]/20 shadow-lg flex flex-col justify-between transition-all duration-300 hover:border-[var(--tg-theme-button-color)]/50 hover:shadow-lg hover:shadow-[var(--tg-theme-button-color)]/10 ${isCanceled ? 'opacity-60' : ''}`}>
      <div>
        <div className="text-center mb-3">
          {isCanceled ? (
              <div className="mb-2">
                  <div className="bg-gray-500 text-white text-xs font-bold px-2 py-1 rounded-full shadow-lg inline-block">
                      {t('matchCard.canceled')}
                  </div>
              </div>
          ) : isFull && (
              <div className="mb-2">
                  <div className="bg-green-500 text-white text-xs font-bold px-2 py-1 rounded-full shadow-lg inline-block">
                      {t('matchCard.confirmed')}
                  </div>
              </div>
          )}
          <p className="font-semibold text-sm text-[var(--tg-theme-text-color)] truncate">
            {timeString}
          </p>
          <p className="flex items-center justify-center gap-1.5 text-sm text-[var(--tg-theme-hint-color)] mt-1 truncate">
            {isFavoriteClub && <StarIcon className="w-4 h-4 text-yellow-400 flex-shrink-0" />}
            <MapPinIcon className="w-4 h-4 flex-shrink-0" />
            <span className="font-medium truncate">{clubString}</span>
          </p>
          {circle && (
              <p className="flex items-center justify-center gap-1.5 text-xs text-[var(--tg-theme-hint-color)] mt-1 bg-[var(--tg-theme-hint-color)]/10 px-2 py-1 rounded-full w-fit mx-auto">
                  <LockIcon className="w-3 h-3" />
                  <span className="font-medium">{t('matchCard.circleLabel')} {circle.name}</span>
              </p>
          )}
        </div>
        
        <div className="flex items-center justify-center flex-wrap gap-x-4 gap-y-1 text-sm text-[var(--tg-theme-hint-color)] mb-4 pt-3">
            <div className="flex items-center gap-1.5">
                {renderMatchTypeIcon()}
                <span className="font-medium">{t(`matchType.${match.type}`)}</span>
            </div>
            <div className="flex items-center gap-1">
                <CompetitiveIcon className="w-4 h-4" />
                <span className="font-medium">{t('matchCard.competitive')}</span>
                <span className="font-bold text-[var(--tg-theme-text-color)] bg-[var(--tg-theme-hint-color)]/20 px-2 py-0.5 rounded">
                    {match.levelMin.toFixed(1)} - {match.levelMax.toFixed(1)}
                </span>
            </div>
        </div>
        
        {(isInvitation || onJoin) && (
            <div className="text-center mb-3">
                <p className="text-sm font-semibold">{t('matchCard.chooseYourSpot')}</p>
                {!isLevelInRange && (
                    <p className="text-xs text-red-400 font-semibold mt-1">
                        {t('matchCard.levelMismatchError', { 
                            userLevel: userProfile.level.toFixed(2), 
                            minLevel: match.levelMin.toFixed(1), 
                            maxLevel: match.levelMax.toFixed(1) 
                        })}
                    </p>
                )}
                {!isGenderCompatible && (
                    <p className="text-xs text-red-400 font-semibold mt-1">
                    {t('matchCard.genderMismatchError', { matchType: t(`matchType.${match.type}`)})}
                    </p>
                )}
            </div>
        )}
        <div className="flex justify-center items-center gap-4 my-4">
            <div className="flex items-start gap-3">
                {renderPlayerSlot(0)}
                {renderPlayerSlot(1)}
            </div>
            <span className="text-sm font-bold text-[var(--tg-theme-hint-color)]">VS</span>
            <div className="flex items-start gap-3">
                {renderPlayerSlot(2)}
                {renderPlayerSlot(3)}
            </div>
        </div>
        
        {renderActionIcons()}
      </div>
      
      {renderActionButton()}
    </div>
  );
};

export default MatchCard;