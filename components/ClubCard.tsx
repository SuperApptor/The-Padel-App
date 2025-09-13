import React from 'react';
import { Club, PlayerProfile } from '../types';
import { MapPinIcon } from './icons/MapPinIcon';
import { StarIcon } from './icons/StarIcon';
import { useI18n } from '../hooks/useI18n';

interface ClubCardProps {
    club: Club;
    onSelectClub: (club: Club) => void;
    distance?: number | null;
    userProfile: PlayerProfile;
    onToggleFavorite: (clubId: number) => void;
}

const ClubCard: React.FC<ClubCardProps> = ({ club, onSelectClub, distance, userProfile, onToggleFavorite }) => {
    const { t } = useI18n();
    const isFavorite = userProfile.favoriteClubIds.includes(club.id);

    const handleFavoriteClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        onToggleFavorite(club.id);
    };

    return (
        <div 
            onClick={() => onSelectClub(club)} 
            className="relative bg-[var(--tg-theme-secondary-bg-color)] rounded-xl border border-[var(--tg-theme-hint-color)]/20 shadow-lg overflow-hidden cursor-pointer group transition-all duration-300 hover:border-[var(--tg-theme-button-color)]/50 hover:shadow-lg hover:shadow-[var(--tg-theme-button-color)]/10"
        >
            <button 
                onClick={handleFavoriteClick}
                className={`absolute top-3 right-3 p-1.5 rounded-full transition-colors z-10 ${isFavorite ? 'bg-yellow-400/20 text-yellow-400' : 'bg-black/30 text-white/70 hover:bg-black/50 hover:text-white'}`}
                title={isFavorite ? t('clubCard.removeFromFavorites') : t('clubCard.addToFavorites')}
            >
                <StarIcon 
                    className="w-5 h-5" 
                    fill={isFavorite ? 'currentColor' : 'none'} 
                    stroke="currentColor" 
                    strokeWidth={1.5} 
                />
            </button>
            <img src={club.imageUrl} alt={club.name} className="w-full h-40 object-cover group-hover:scale-105 transition-transform duration-300" />
            <div className="p-4">
                <h3 className="font-bold text-lg text-[var(--tg-theme-text-color)] truncate">{club.name}</h3>
                <div className="flex justify-between items-center mt-1">
                    <p className="flex items-center gap-1.5 text-sm text-[var(--tg-theme-hint-color)]">
                        <MapPinIcon className="w-4 h-4 flex-shrink-0" />
                        <span className="truncate">{club.city}</span>
                    </p>
                    {distance !== null && distance !== undefined && (
                        <p className="text-sm font-semibold text-[var(--tg-theme-button-color)] flex-shrink-0">
                            {distance.toFixed(1)} km
                        </p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ClubCard;