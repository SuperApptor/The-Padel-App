import React from 'react';
import { PlayerProfile, Match, Club, Tournament } from '../types';
import { useI18n } from '../hooks/useI18n';
import MatchCard from './MatchCard';
import AnnouncementsFeed from './AnnouncementsFeed';
import GuidanceBox from './GuidanceBox';

interface HomeTabProps {
    userProfile: PlayerProfile;
    myUpcomingMatches: Match[];
    openMatches: Match[];
    clubs: Club[];
    tournaments: Tournament[];
    onInvite: (match: Match) => void;
    onAddFriend: (friendId: string) => void;
    onCancelMatch: (matchId: number) => void;
    onSelectClub: (club: Club) => void;
    onShowAllUpcoming: () => void;
    onShowOpenMatches: () => void;
    onShowAvailablePlayers: () => void;
    onShowMatchHistory: () => void;
    onAddPlayer: (matchId: number, slotIndex: number) => void;
    onOpenFriendProfile: (player: PlayerProfile) => void;
    onOpenMyProfile: () => void;
    onMarkSectionVisited: () => void;
}

const HomeTab: React.FC<HomeTabProps> = ({
    userProfile,
    myUpcomingMatches,
    openMatches,
    clubs,
    tournaments,
    onInvite,
    onAddFriend,
    onCancelMatch,
    onSelectClub,
    onShowAllUpcoming,
    onShowOpenMatches,
    onShowAvailablePlayers,
    onShowMatchHistory,
    onAddPlayer,
    onOpenFriendProfile,
    onOpenMyProfile,
    onMarkSectionVisited
}) => {
    const { t } = useI18n();

    const nextThreeMatches = myUpcomingMatches.slice(0, 3);

    const suggestedMatches = openMatches
        .filter(m => 
            userProfile.favoriteClubIds.includes(m.clubId) &&
            (userProfile.level >= m.levelMin && userProfile.level <= m.levelMax)
        )
        .slice(0, 5);

    return (
        <div className="space-y-8">
            {!userProfile.visitedSections?.home && (
                <div>
                    <GuidanceBox
                        title={t('guidance.home.title')}
                        text={t('guidance.home.text')}
                        onDismiss={onMarkSectionVisited}
                    />
                </div>
            )}
            <section>
                <h1 className="text-3xl font-bold">{t('home.welcome', { name: userProfile.name.split(' ')[0] })}</h1>
                <p className="text-md text-[var(--tg-theme-hint-color)]">{t('home.welcomeSubtitle')}</p>
            </section>
            
            <section>
                <h2 className="text-xl font-bold mb-3">{t('matchesTabs.upcoming')}</h2>
                {nextThreeMatches.length > 0 ? (
                    <div className="space-y-4">
                        {nextThreeMatches.map(match => (
                             <MatchCard 
                                key={match.id}
                                match={match}
                                userProfile={userProfile}
                                circles={userProfile.circles}
                                clubs={clubs}
                                onInvite={onInvite}
                                onAddFriend={onAddFriend}
                                onCancel={onCancelMatch}
                                onAddPlayer={onAddPlayer}
                                onOpenFriendProfile={onOpenFriendProfile}
                                onOpenMyProfile={onOpenMyProfile}
                            />
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-8 bg-[var(--tg-theme-secondary-bg-color)] rounded-xl border border-[var(--tg-theme-hint-color)]/20">
                        <h3 className="text-lg font-semibold">{t('home.noUpcomingMatchTitle')}</h3>
                        <p className="text-sm text-[var(--tg-theme-hint-color)] mt-1">{t('home.noUpcomingMatchSubtitle')}</p>
                    </div>
                )}
            </section>

            <section className="grid grid-cols-2 md:grid-cols-4 gap-3">
                 <button onClick={onShowOpenMatches} className="p-3 bg-[var(--tg-theme-secondary-bg-color)] rounded-lg font-semibold text-center hover:bg-[var(--tg-theme-hint-color)]/10 transition">
                    {t('home.openMatches')}
                </button>
                 <button onClick={onShowAllUpcoming} className="p-3 bg-[var(--tg-theme-secondary-bg-color)] rounded-lg font-semibold text-center hover:bg-[var(--tg-theme-hint-color)]/10 transition">
                    {t('home.myMatches')}
                </button>
                 <button onClick={onShowAvailablePlayers} className="p-3 bg-[var(--tg-theme-secondary-bg-color)] rounded-lg font-semibold text-center hover:bg-[var(--tg-theme-hint-color)]/10 transition">
                    {t('home.findPlayers')}
                </button>
                 <button onClick={onShowMatchHistory} className="p-3 bg-[var(--tg-theme-secondary-bg-color)] rounded-lg font-semibold text-center hover:bg-[var(--tg-theme-hint-color)]/10 transition">
                    {t('home.myHistory')}
                </button>
            </section>

            {suggestedMatches.length > 0 && (
                <section>
                    <h2 className="text-xl font-bold mb-3">{t('home.forYou')}</h2>
                     <div className="flex overflow-x-auto space-x-4 pb-3 -mx-4 sm:mx-0 px-4 sm:px-0">
                        {suggestedMatches.map(match => (
                            <div key={match.id} className="w-80 flex-shrink-0">
                                <MatchCard 
                                    match={match}
                                    userProfile={userProfile}
                                    circles={userProfile.circles}
                                    clubs={clubs}
                                    onAddFriend={onAddFriend}
                                    onJoin={(matchId, slotIndex) => { /* Implement join logic if needed here */}}
                                    onOpenFriendProfile={onOpenFriendProfile}
                                />
                            </div>
                        ))}
                    </div>
                </section>
            )}

            <section>
                 <AnnouncementsFeed 
                    userProfile={userProfile}
                    allClubs={clubs}
                    tournaments={tournaments}
                    onSelectClub={onSelectClub}
                 />
            </section>
        </div>
    );
};

export default HomeTab;