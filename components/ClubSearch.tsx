import React, { useState, useRef, useEffect } from 'react';
import { SearchIcon } from './icons/SearchIcon';
import { useI18n } from '../hooks/useI18n';

interface ClubSearchProps {
    initialCenter: { lat: number, lng: number };
    onSearch: (searchTerm: string, center: { lat: number; lng: number } | null, radius: number | null) => void;
}

const RADIUS_OPTIONS = [5, 10, 25, 50]; // in km

const ClubSearch: React.FC<ClubSearchProps> = ({ onSearch, initialCenter }) => {
    const { t } = useI18n();
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedPlace, setSelectedPlace] = useState<{ lat: number; lng: number } | null>(initialCenter);
    const [radius, setRadius] = useState<number>(10);
    const inputRef = useRef<HTMLInputElement>(null);
    const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null);

    useEffect(() => {
        if (inputRef.current && !autocompleteRef.current) {
            const autocomplete = new window.google.maps.places.Autocomplete(inputRef.current, {
                types: ['(cities)', 'address'],
            });
            autocomplete.addListener('place_changed', () => {
                const place = autocomplete.getPlace();
                if (place.geometry?.location) {
                    const newCenter = {
                        lat: place.geometry.location.lat(),
                        lng: place.geometry.location.lng(),
                    };
                    setSelectedPlace(newCenter);
                    if (place.formatted_address) {
                        setSearchTerm(place.formatted_address);
                    }
                }
            });
            autocompleteRef.current = autocomplete;
        }
    }, []);
    
    useEffect(() => {
        onSearch(searchTerm, selectedPlace, radius);
    }, [searchTerm, selectedPlace, radius, onSearch]);

    return (
        <div className="bg-[var(--tg-theme-secondary-bg-color)] p-4 rounded-xl border border-[var(--tg-theme-hint-color)]/20 shadow-lg space-y-3">
            <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <SearchIcon className="h-5 w-5 text-[var(--tg-theme-hint-color)]"/>
                </div>
                <input
                    ref={inputRef}
                    type="text"
                    placeholder={t('clubSearch.placeholder')}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full bg-[var(--tg-theme-bg-color)] border border-[var(--tg-theme-hint-color)]/50 rounded-md py-2 pl-10 pr-4 text-[var(--tg-theme-text-color)] placeholder:text-[var(--tg-theme-hint-color)] focus:ring-2 focus:ring-[var(--tg-theme-button-color)] focus:outline-none transition"
                />
            </div>
             <div className="flex items-center gap-3">
                 <span className="text-sm font-medium whitespace-nowrap">{t('clubSearch.radiusLabel')}</span>
                 <select 
                    value={radius} 
                    onChange={(e) => setRadius(Number(e.target.value))}
                    className="w-full bg-[var(--tg-theme-bg-color)] border border-[var(--tg-theme-hint-color)]/50 rounded-md px-3 py-1.5 text-sm text-[var(--tg-theme-text-color)] focus:ring-2 focus:ring-[var(--tg-theme-button-color)] focus:outline-none transition appearance-none"
                    style={{ backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%23${(window.Telegram?.WebApp?.themeParams?.hint_color || '#9ca3af').substring(1)}' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`, backgroundPosition: 'right 0.5rem center', backgroundRepeat: 'no-repeat', backgroundSize: '1.5em 1.5em' }}
                >
                    {RADIUS_OPTIONS.map(r => (
                        <option key={r} value={r}>{t('clubSearch.radiusValue', { value: r })}</option>
                    ))}
                </select>
             </div>
        </div>
    );
};

export default ClubSearch;