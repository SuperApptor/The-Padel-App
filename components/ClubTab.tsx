import React, { useState, useEffect, useCallback } from 'react';
import { Club, PlayerProfile } from '../types';
import ClubList from './ClubList';
import ClubMap from './ClubMap';
import ClubSearch from './ClubSearch';
import { MapIcon } from './icons/MapIcon';
import { ListBulletIcon } from './icons/ListBulletIcon';
import { useI18n } from '../hooks/useI18n';
import GuidanceBox from './GuidanceBox';

interface ClubTabProps {
  clubs: Club[];
  onSelectClub: (club: Club) => void;
  userProfile: PlayerProfile;
  onToggleFavorite: (clubId: number) => void;
  onMarkSectionVisited: () => void;
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

const ClubTab: React.FC<ClubTabProps> = ({ clubs, onSelectClub, userProfile, onToggleFavorite, onMarkSectionVisited }) => {
    const { t } = useI18n();
    const [view, setView] = useState<'list' | 'map'>('list');
    const [mapsApiStatus, setMapsApiStatus] = useState<'loading' | 'loaded' | 'failed'>('loading');
    const [filteredClubs, setFilteredClubs] = useState(clubs);
    const [searchCenter, setSearchCenter] = useState(() => {
        if (userProfile.lat && userProfile.lng) {
            return { lat: userProfile.lat, lng: userProfile.lng };
        }
        return { lat: 45.75, lng: 4.85 }; // Default to Lyon
    });
    const [searchRadius, setSearchRadius] = useState<number | null>(10); // Default 10km radius

    useEffect(() => {
        const handleMapsLoaded = () => {
            clearTimeout(timer);
            setMapsApiStatus('loaded');
        };

        if (window.google) {
            handleMapsLoaded();
            return;
        }

        window.addEventListener('google-maps-loaded', handleMapsLoaded);

        const timer = setTimeout(() => {
            if (!window.google) {
                setMapsApiStatus('failed');
            }
        }, 5000);

        return () => {
            window.removeEventListener('google-maps-loaded', handleMapsLoaded);
            clearTimeout(timer);
        };
    }, []);

    const handleSearch = useCallback((
        searchTerm: string, 
        center: { lat: number; lng: number } | null, 
        radius: number | null
    ) => {
        let results = clubs;
        const term = searchTerm.toLowerCase();
        
        if (term) {
            results = results.filter(club =>
                club.name.toLowerCase().includes(term) ||
                club.city.toLowerCase().includes(term) ||
                club.address.toLowerCase().includes(term)
            );
        }
        
        if (center && radius) {
            results = results.filter(club => haversineDistance(center, { lat: club.lat, lng: club.lng }) <= radius);
        }
        setFilteredClubs(results);
        if (center) {
            setSearchCenter(center);
        }
        setSearchRadius(radius);
    }, [clubs]);

    const tabButtonStyle = (tabName: 'list' | 'map', disabled: boolean = false) =>
        `py-2 px-4 text-sm font-semibold transition-colors rounded-lg w-full flex items-center justify-center gap-2 ${
            disabled 
                ? 'bg-[var(--tg-theme-secondary-bg-color)] text-[var(--tg-theme-hint-color)]/50 cursor-not-allowed'
                : view === tabName
                    ? 'bg-[var(--tg-theme-button-color)] text-[var(--tg-theme-button-text-color)]'
                    : 'bg-[var(--tg-theme-secondary-bg-color)] text-[var(--tg-theme-text-color)] hover:bg-[var(--tg-theme-secondary-bg-color)]/80'
        }`;
    
    const renderHeader = () => {
        switch (mapsApiStatus) {
            case 'loaded':
                return <ClubSearch onSearch={handleSearch} initialCenter={searchCenter} />;
            case 'loading':
                return (
                    <div className="text-center p-4 bg-[var(--tg-theme-secondary-bg-color)] rounded-lg animate-pulse">
                        {t('clubTab.loadingMaps')}
                    </div>
                );
            case 'failed':
                return (
                    <div className="text-center p-4 bg-yellow-900/50 text-yellow-200 rounded-lg border border-yellow-700/50">
                        <p className="font-bold text-base">{t('clubTab.mapsUnavailableTitle')}</p>
                        <p className="text-sm mt-1">{t('clubTab.mapsUnavailableSubtitle')}</p>
                    </div>
                );
        }
    };


    return (
        <div className="space-y-6">
            {!userProfile.visitedSections?.clubs && (
                <GuidanceBox
                    title={t('guidance.clubs.title')}
                    text={t('guidance.clubs.text')}
                    onDismiss={onMarkSectionVisited}
                />
            )}
            {renderHeader()}
           
            <div className="grid grid-cols-2 gap-2 p-1 bg-[var(--tg-theme-bg-color)] rounded-xl">
                <button onClick={() => setView('list')} className={tabButtonStyle('list')}>
                    <ListBulletIcon className="w-5 h-5" /> {t('clubTab.listView')}
                </button>
                <button 
                    onClick={() => { if (mapsApiStatus === 'loaded') setView('map'); }} 
                    className={tabButtonStyle('map', mapsApiStatus !== 'loaded')}
                    disabled={mapsApiStatus !== 'loaded'}
                >
                    <MapIcon className="w-5 h-5" /> {t('clubTab.mapView')}
                </button>
            </div>

            {view === 'list' && <ClubList 
                                    clubs={filteredClubs} 
                                    onSelectClub={onSelectClub} 
                                    searchCenter={mapsApiStatus === 'loaded' && searchRadius ? searchCenter : null} 
                                    userProfile={userProfile}
                                    onToggleFavorite={onToggleFavorite}
                                />}
            {view === 'map' && mapsApiStatus === 'loaded' && (
                <ClubMap 
                    clubs={filteredClubs} 
                    onSelectClub={onSelectClub} 
                    center={searchCenter}
                    radius={searchRadius}
                />
            )}
        </div>
    );
};

export default ClubTab;