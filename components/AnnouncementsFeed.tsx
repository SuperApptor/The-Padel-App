import React from 'react';
import { PlayerProfile, Club, Tournament } from '../types';
import { useI18n } from '../hooks/useI18n';
import { TrophyIcon } from './icons/TrophyIcon';

interface AnnouncementsFeedProps {
    userProfile: PlayerProfile;
    allClubs: Club[];
    tournaments: Tournament[];
    onSelectClub: (club: Club) => void;
}

interface FeedItem {
    id: string | number;
    clubName: string;
    clubId: number;
    date: string;
    message: string;
    type: 'announcement' | 'tournament';
}


const AnnouncementsFeed: React.FC<AnnouncementsFeedProps> = ({ userProfile, allClubs, onSelectClub, tournaments }) => {
    const { t, lang } = useI18n();

    const feedItems: FeedItem[] = userProfile.favoriteClubIds
        .flatMap(clubId => {
            const club = allClubs.find(c => c.id === clubId);
            if (!club) return [];

            const announcements: FeedItem[] = (club.announcements || []).map(ann => ({
                id: ann.id,
                clubName: club.name,
                clubId: club.id,
                date: ann.date,
                message: ann.message,
                type: 'announcement',
            }));

            const today = new Date();
            today.setHours(0, 0, 0, 0);

            const tournamentAnnouncements: FeedItem[] = tournaments
                .filter(t => t.clubId === clubId && new Date(t.startDate) >= today)
                .map(tourney => ({
                    id: `tourney-${tourney.id}`,
                    clubName: club.name,
                    clubId: club.id,
                    date: tourney.startDate,
                    message: tourney.name, // The tournament name is the message
                    type: 'tournament',
                }));

            return [...announcements, ...tournamentAnnouncements];
        })
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    if (feedItems.length === 0) {
        return null;
    }

    const handleCardClick = (clubId: number) => {
        const club = allClubs.find(c => c.id === clubId);
        if (club) {
            onSelectClub(club);
        }
    }

    return (
        <div className="mb-6">
            <h2 className="text-xl font-bold mb-3 text-[var(--tg-theme-text-color)]">{t('announcementsFeed.title')}</h2>
            <div className="flex flex-col space-y-4">
                {feedItems.map(item => (
                    <div 
                        key={item.id} 
                        onClick={() => handleCardClick(item.clubId)}
                        className="w-full bg-[var(--tg-theme-secondary-bg-color)] p-4 rounded-xl border border-[var(--tg-theme-hint-color)]/20 shadow-lg cursor-pointer transition-transform hover:scale-[1.02]"
                    >
                        <div className="flex justify-between items-start">
                             <div>
                                <p className="font-bold text-sm text-[var(--tg-theme-text-color)]">{item.clubName}</p>
                                <p className="text-xs text-[var(--tg-theme-hint-color)]">
                                    {new Date(item.date).toLocaleDateString(lang, { day: 'numeric', month: 'long' })}
                                </p>
                            </div>
                            {item.type === 'tournament' && (
                                <div className="p-1.5 bg-[var(--tg-theme-button-color)]/20 rounded-full flex-shrink-0">
                                    <TrophyIcon className="w-4 h-4 text-[var(--tg-theme-button-color)]" />
                                </div>
                            )}
                        </div>
                        <p className="text-sm text-[var(--tg-theme-text-color)] line-clamp-3 mt-2">
                            {item.message}
                        </p>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default AnnouncementsFeed;