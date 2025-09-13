import React, { useMemo } from 'react';
import { Club, PlayerProfile } from '../types';
import ClubCard from './ClubCard';
import { useI18n } from '../hooks/useI18n';

interface ClubListProps {
  clubs: Club[];
  onSelectClub: (club: Club) => void;
  searchCenter: { lat: number, lng: number } | null;
  userProfile: PlayerProfile;
  onToggleFavorite: (clubId: number) => void;
}

const haversineDistance = (coords1: {lat: number, lng: number}, coords2: {lat: number, lng: number}) => {
    const toRad = (x: number) => x * Math.PI / 180;
    const R = 6371; // Earth radius in km

    const dLat = toRad(coords2.lat - coords1.lat);
    const dLon = toRad(coords2.lng - coords1.lng);
    const lat1 = toRad(coords1.lat);
    const lat2 = toRad(coords2.lat);

    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
              Math.sin(dLon / 2) * Math.sin(dLon / 2) * Math.cos(lat1) * Math.cos(lat2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
};


const ClubList: React.FC<ClubListProps> = ({ clubs, onSelectClub, searchCenter, userProfile, onToggleFavorite }) => {
    const { t } = useI18n();
    
    const sortedClubs = useMemo(() => {
        if (!searchCenter) return clubs;
        return [...clubs].sort((a, b) => {
            const distA = haversineDistance(searchCenter, { lat: a.lat, lng: a.lng });
            const distB = haversineDistance(searchCenter, { lat: b.lat, lng: b.lng });
            return distA - distB;
        });
    }, [clubs, searchCenter]);

    return (
        <div>
            {sortedClubs.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {sortedClubs.map(club => (
                        <ClubCard 
                            key={club.id} 
                            club={club} 
                            onSelectClub={onSelectClub} 
                            distance={searchCenter ? haversineDistance(searchCenter, {lat: club.lat, lng: club.lng}) : null}
                            userProfile={userProfile}
                            onToggleFavorite={onToggleFavorite}
                        />
                    ))}
                </div>
            ) : (
                <div className="text-center py-16 bg-[var(--tg-theme-secondary-bg-color)] rounded-xl border border-[var(--tg-theme-hint-color)]/20">
                    <h3 className="text-xl font-semibold text-[var(--tg-theme-text-color)]">{t('clubList.noClubsTitle')}</h3>
                    <p className="text-[var(--tg-theme-hint-color)] mt-2">{t('clubList.noClubsSubtitle')}</p>
                </div>
            )}
        </div>
    );
};

export default ClubList;