import React, { useState, useEffect } from 'react';
import { Club, Tournament, TournamentFormat, TournamentCategory, BracketLink, PromotionCount, TournamentStatus, SetType, FinalSetType, MatchFormatConfiguration, PointSystem, PlayerProfile } from '../types';
import { useI18n } from '../hooks/useI18n';
import { TrashIcon } from './icons/TrashIcon';
import { PlusIcon } from './icons/PlusIcon';
import { SET_TYPES, FINAL_SET_TYPES, PRO_SET_TYPES, POINT_SYSTEMS } from '../constants';

interface CreateTournamentModalProps {
    userProfile: PlayerProfile;
    allClubs: Club[];
    onClose: () => void;
    // Fix: Updated `onCreate` prop to expect the full tournament object shape (excluding id and registrations) as the modal now handles all creation logic, including setting status and clubId.
    onCreate: (tournamentData: Omit<Tournament, 'id' | 'registrations'>) => void;
}

type CategoryState = {
    id: number;
    name: string;
    maxTeams: string;
    defaultMatchFormat: MatchFormatConfiguration;
    useFinalFormat: boolean;
    finalMatchFormat: MatchFormatConfiguration;
};

interface CategoryFormProps {
    category: CategoryState;
    index: number;
    categoriesCount: number;
    isProgressive: boolean;
    onCategoryChange: (id: number, field: keyof Pick<CategoryState, 'name' | 'maxTeams' | 'useFinalFormat'>, value: string | boolean) => void;
    onFormatChange: (catId: number, type: 'default' | 'final', field: keyof MatchFormatConfiguration, value: string | number) => void;
    onRemove: (id: number) => void;
    onMove: (index: number, direction: 'up' | 'down') => void;
}

const getTodayString = () => new Date().toISOString().split('T')[0];

const CategoryForm = React.memo<CategoryFormProps>(({
    category,
    index,
    categoriesCount,
    isProgressive,
    onCategoryChange,
    onFormatChange,
    onRemove,
    onMove,
}) => {
    const { t } = useI18n();

    const inputClass = "w-full bg-[var(--tg-theme-bg-color)] border border-[var(--tg-theme-hint-color)]/50 rounded-md px-3 py-2 text-sm text-[var(--tg-theme-text-color)] placeholder:text-[var(--tg-theme-hint-color)] focus:ring-2 focus:ring-[var(--tg-theme-button-color)] focus:outline-none transition";
    const selectStyle = { backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%23${(window.Telegram?.WebApp?.themeParams?.hint_color || '#9ca3af').substring(1)}' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`, backgroundPosition: 'right 0.5rem center', backgroundRepeat: 'no-repeat', backgroundSize: '1.5em 1.5em' };

    const FormatConfigurator: React.FC<{
        category: CategoryState;
        type: 'default' | 'final';
        onFormatChange: (catId: number, type: 'default' | 'final', field: keyof MatchFormatConfiguration, value: string | number) => void;
    }> = ({ category, type, onFormatChange }) => {
        const formatConfig = type === 'default' ? category.defaultMatchFormat : category.finalMatchFormat;
        return (
            <div className="p-2 border border-[var(--tg-theme-hint-color)]/20 rounded-md space-y-2">
                <h4 className="text-xs font-bold text-center text-[var(--tg-theme-hint-color)]">
                    {type === 'default' ? t('createTournamentModal.matchFormatConfig') : t('createTournamentModal.finalMatchFormatConfig')}
                </h4>
                <div className="grid grid-cols-2 gap-2">
                    <div>
                        <label className="block text-xs font-medium text-[var(--tg-theme-hint-color)] mb-1">{t('createTournamentModal.setsToWin')}</label>
                        <select value={formatConfig.setsToWin} onChange={e => onFormatChange(category.id, type, 'setsToWin', Number(e.target.value))} className={`${inputClass} appearance-none text-xs`} style={selectStyle}>
                            {[1, 2, 3].map(s => <option key={s} value={s}>{s}</option>)}
                        </select>
                    </div>
                    <div>
                        <label className="block text-xs font-medium text-[var(--tg-theme-hint-color)] mb-1">{t('createTournamentModal.pointSystemLabel')}</label>
                        <select value={formatConfig.pointSystem} onChange={e => onFormatChange(category.id, type, 'pointSystem', e.target.value)} className={`${inputClass} appearance-none text-xs`} style={selectStyle}>
                            {POINT_SYSTEMS.map(ps => <option key={ps} value={ps}>{ps}</option>)}
                        </select>
                    </div>
                </div>
                <div>
                    <label className="block text-xs font-medium text-[var(--tg-theme-hint-color)] mb-1">{t('createTournamentModal.regularSetFormat')}</label>
                    <select value={formatConfig.regularSetType} onChange={e => onFormatChange(category.id, type, 'regularSetType', e.target.value)} className={`${inputClass} appearance-none text-xs`} style={selectStyle} disabled={formatConfig.setsToWin === 1}>
                        {(formatConfig.setsToWin === 1 ? PRO_SET_TYPES : SET_TYPES).map(f => <option key={f} value={f}>{f}</option>)}
                    </select>
                </div>
                {formatConfig.setsToWin > 1 && (
                    <div>
                        <label className="block text-xs font-medium text-[var(--tg-theme-hint-color)] mb-1">{t('createTournamentModal.finalSetFormat')}</label>
                        <select value={formatConfig.finalSetType} onChange={e => onFormatChange(category.id, type, 'finalSetType', e.target.value)} className={`${inputClass} appearance-none text-xs`} style={selectStyle}>
                            {FINAL_SET_TYPES.map(f => <option key={f} value={f}>{f}</option>)}
                        </select>
                    </div>
                )}
            </div>
        );
    };

    return (
        <div className="p-3 bg-[var(--tg-theme-bg-color)] rounded-lg space-y-2">
            <div className="flex gap-2 items-start">
                {isProgressive && (
                    <div className="flex flex-col items-center justify-center self-stretch pt-1">
                        <button type="button" onClick={() => onMove(index, 'up')} disabled={index === 0} className="disabled:opacity-20 text-lg p-1 leading-none transition-opacity hover:bg-[var(--tg-theme-hint-color)]/10 rounded-md">▲</button>
                        <button type="button" onClick={() => onMove(index, 'down')} disabled={index === categoriesCount - 1} className="disabled:opacity-20 text-lg p-1 leading-none transition-opacity hover:bg-[var(--tg-theme-hint-color)]/10 rounded-md">▼</button>
                    </div>
                )}
                <div className="flex-grow space-y-2">
                    <input type="text" value={category.name} onChange={e => onCategoryChange(category.id, 'name', e.target.value)} placeholder={t('createTournamentModal.categoryNamePlaceholder')} className={inputClass} />
                    <input type="number" value={category.maxTeams} onChange={e => onCategoryChange(category.id, 'maxTeams', e.target.value)} placeholder={t('createTournamentModal.maxTeamsPlaceholder')} className={inputClass} />
                    
                    <FormatConfigurator category={category} type="default" onFormatChange={onFormatChange} />

                    <label className="flex items-center gap-2 text-sm">
                        <input 
                            type="checkbox" 
                            checked={category.useFinalFormat}
                            onChange={(e) => onCategoryChange(category.id, 'useFinalFormat', e.target.checked)}
                            className="h-4 w-4 rounded bg-transparent border-[var(--tg-theme-hint-color)]/50 text-[var(--tg-theme-button-color)] focus:ring-[var(--tg-theme-button-color)]"
                        />
                        {t('createTournamentModal.useFinalFormat')}
                    </label>

                    {category.useFinalFormat && (
                        <FormatConfigurator category={category} type="final" onFormatChange={onFormatChange}/>
                    )}
                </div>
                <button type="button" onClick={() => onRemove(category.id)} disabled={categoriesCount === 1} className="p-2 text-red-400 hover:bg-red-500/20 rounded-full disabled:opacity-50 disabled:cursor-not-allowed self-center">
                    <TrashIcon className="w-4 h-4" />
                </button>
            </div>
        </div>
    );
});


const CreateTournamentModal: React.FC<CreateTournamentModalProps> = ({ userProfile, allClubs, onClose, onCreate }) => {
    const { t } = useI18n();
    const [name, setName] = useState('');
    const [clubId, setClubId] = useState<string>(userProfile.adminOfClubId?.toString() || (allClubs.length > 0 ? allClubs[0].id.toString() : ''));
    const [startDate, setStartDate] = useState(getTodayString());
    const [endDate, setEndDate] = useState(getTodayString());
    const [format, setFormat] = useState<TournamentFormat>(TournamentFormat.DIRECT_ELIMINATION);
    const [description, setDescription] = useState('');
    const [prize, setPrize] = useState('');
    const [imageUrl, setImageUrl] = useState(`https://picsum.photos/seed/${allClubs[0]?.name.replace(/\s/g, '') || 'padel'}/800/600`);
    const [categories, setCategories] = useState<CategoryState[]>([{ 
        id: Date.now(), 
        name: '', 
        maxTeams: '', 
        defaultMatchFormat: { setsToWin: 2, regularSetType: SetType.CLASSIC_6_GAMES_TB, finalSetType: FinalSetType.CLASSIC_6_GAMES_TB, pointSystem: PointSystem.GOLDEN_POINT },
        useFinalFormat: false,
        finalMatchFormat: { setsToWin: 2, regularSetType: SetType.CLASSIC_6_GAMES_TB, finalSetType: FinalSetType.CLASSIC_6_GAMES_TB, pointSystem: PointSystem.GOLDEN_POINT }
    }]);
    const [bracketLinks, setBracketLinks] = useState<BracketLink[]>([]);
    const [error, setError] = useState<string | null>(null);

    const isOrganizer = userProfile.organizerStatus === 'APPROVED' && !userProfile.adminOfClubId;
    const club = allClubs.find(c => c.id === Number(clubId));
    const title = isOrganizer ? t('createTournamentModal.title') : t('createTournamentModal.titleWithClub', { clubName: club?.name || ''});
    const submitText = isOrganizer ? t('createTournamentModal.submitForApproval') : t('common.create');

    useEffect(() => {
        if (format === TournamentFormat.PROGRESSIVE_MULTI_BRACKET) {
            setBracketLinks(prevLinks => {
                const newLinks: BracketLink[] = [];
                for (let i = 0; i < categories.length - 1; i++) {
                    const toBracketId = categories[i].id;
                    const fromBracketId = categories[i + 1].id;
                    const existingLink = prevLinks.find(l => l.fromBracketId === fromBracketId && l.toBracketId === toBracketId);
                    newLinks.push({
                        fromBracketId,
                        toBracketId,
                        promotionCount: existingLink?.promotionCount || 0,
                    });
                }
                return newLinks;
            });
        } else {
            setBracketLinks([]);
        }
    }, [format, categories.map(c => c.id).join(',')]); // Fix: Better dependency tracking for categories

    const handleAddCategory = () => {
        setCategories(prev => [...prev, { 
            id: Date.now(), 
            name: '', 
            maxTeams: '', 
            defaultMatchFormat: { setsToWin: 2, regularSetType: SetType.CLASSIC_6_GAMES_TB, finalSetType: FinalSetType.CLASSIC_6_GAMES_TB, pointSystem: PointSystem.GOLDEN_POINT },
            useFinalFormat: false,
            finalMatchFormat: { setsToWin: 2, regularSetType: SetType.CLASSIC_6_GAMES_TB, finalSetType: FinalSetType.CLASSIC_6_GAMES_TB, pointSystem: PointSystem.GOLDEN_POINT }
        }]);
    };
    
    const handleRemoveCategory = (id: number) => {
        setCategories(prev => prev.filter(cat => cat.id !== id));
    };

    const handleCategoryChange = (id: number, field: keyof Pick<CategoryState, 'name' | 'maxTeams' | 'useFinalFormat'>, value: string | boolean) => {
        setCategories(prev => prev.map(cat => cat.id === id ? { ...cat, [field]: value } : cat));
    };

    const handleFormatChange = (catId: number, type: 'default' | 'final', field: keyof MatchFormatConfiguration, value: string | number) => {
        setCategories(prev => prev.map(cat => {
            if (cat.id !== catId) return cat;

            const formatToUpdate = type === 'default' ? cat.defaultMatchFormat : cat.finalMatchFormat;
            const newFormat = { ...formatToUpdate, [field]: value };
            
            if (field === 'setsToWin' && value === 1) {
                newFormat.regularSetType = SetType.PRO_SET_9_GAMES;
            } else if (field === 'setsToWin' && Number(value) > 1 && newFormat.regularSetType === SetType.PRO_SET_9_GAMES) {
                newFormat.regularSetType = SetType.CLASSIC_6_GAMES_TB;
            }

            if(type === 'default') {
                return { ...cat, defaultMatchFormat: newFormat };
            } else {
                return { ...cat, finalMatchFormat: newFormat };
            }
        }));
    };
    
    const handleMoveCategory = (index: number, direction: 'up' | 'down') => {
        const newCategories = [...categories];
        const targetIndex = direction === 'up' ? index - 1 : index + 1;
        if (targetIndex < 0 || targetIndex >= categories.length) return;
        [newCategories[index], newCategories[targetIndex]] = [newCategories[targetIndex], newCategories[index]];
        setCategories(newCategories);
    };

    const handlePromotionChange = (fromBracketId: number, toBracketId: number, count: PromotionCount) => {
        setBracketLinks(prev => prev.map(link => 
            link.fromBracketId === fromBracketId && link.toBracketId === toBracketId
            ? { ...link, promotionCount: count }
            : link
        ));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        
        if (new Date(startDate) > new Date(endDate)) {
            setError(t('createTournamentModal.errors.datesInvalid'));
            return;
        }

        if (categories.length === 0) {
            setError(t('createTournamentModal.errors.noCategories'));
            return;
        }

        const finalCategories: TournamentCategory[] = [];
        for (const cat of categories) {
            const maxTeamsNumber = parseInt(cat.maxTeams, 10);
            if (!cat.name.trim() || isNaN(maxTeamsNumber) || maxTeamsNumber <= 0) {
                setError(t('createTournamentModal.errors.incompleteCategory'));
                return;
            }

            finalCategories.push({
                id: cat.id,
                name: cat.name.trim(),
                maxTeams: maxTeamsNumber,
                defaultMatchFormat: cat.defaultMatchFormat,
                finalMatchFormat: cat.useFinalFormat ? cat.finalMatchFormat : undefined,
            });
        }
        
        // Fix: Correctly shape the tournamentData object to match the expected type
        const tournamentData: Omit<Tournament, 'id' | 'registrations'> = {
            name,
            clubId: Number(clubId),
            organizerId: isOrganizer ? userProfile.telegram : undefined,
            startDate,
            endDate,
            categories: finalCategories,
            format,
            imageUrl,
            description,
            prize,
            status: isOrganizer ? TournamentStatus.PENDING_APPROVAL : TournamentStatus.PLANNED,
            bracketLinks: format === TournamentFormat.PROGRESSIVE_MULTI_BRACKET ? bracketLinks.filter(l => l.promotionCount > 0) : undefined
        };

        onCreate(tournamentData);
    };
    
    const inputClass = "w-full bg-[var(--tg-theme-bg-color)] border border-[var(--tg-theme-hint-color)]/50 rounded-md px-3 py-2 text-sm text-[var(--tg-theme-text-color)] placeholder:text-[var(--tg-theme-hint-color)] focus:ring-2 focus:ring-[var(--tg-theme-button-color)] focus:outline-none transition";
    const selectStyle = { backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%23${(window.Telegram?.WebApp?.themeParams?.hint_color || '#9ca3af').substring(1)}' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`, backgroundPosition: 'right 0.5rem center', backgroundRepeat: 'no-repeat', backgroundSize: '1.5em 1.5em' };

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-[var(--tg-theme-secondary-bg-color)] rounded-xl w-full max-w-lg border border-[var(--tg-theme-hint-color)]/20 shadow-2xl flex flex-col max-h-[90vh]">
                <div className="p-6 flex-shrink-0">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-xl font-bold">{title}</h2>
                        <button onClick={onClose} className="text-2xl text-[var(--tg-theme-hint-color)]">&times;</button>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="p-6 pt-0 flex-grow overflow-y-auto space-y-4">
                    {isOrganizer && (
                        <select value={clubId} onChange={e => setClubId(e.target.value)} className={`${inputClass} appearance-none`} style={selectStyle}>
                            {allClubs.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                        </select>
                    )}
                    <input type="text" value={name} onChange={e => setName(e.target.value)} placeholder={t('createTournamentModal.namePlaceholder')} className={inputClass} required />
                    <div className="grid grid-cols-2 gap-4">
                         <input type="date" name="startDate" value={startDate} min={getTodayString()} onChange={e => setStartDate(e.target.value)} className={inputClass} />
                         <input type="date" name="endDate" value={endDate} min={startDate} onChange={e => setEndDate(e.target.value)} className={inputClass} />
                    </div>
                    <select value={format} onChange={e => setFormat(e.target.value as TournamentFormat)} className={`${inputClass} appearance-none`} style={selectStyle}>
                        {Object.values(TournamentFormat).map(f => <option key={f} value={f}>{t(`tournamentFormat.${f}`)}</option>)}
                    </select>
                    <textarea value={description} onChange={e => setDescription(e.target.value)} placeholder={t('createTournamentModal.descriptionPlaceholder')} rows={3} className={inputClass} />
                    <input type="text" value={prize} onChange={e => setPrize(e.target.value)} placeholder={t('createTournamentModal.prizePlaceholder')} className={inputClass} />
                    <input type="url" value={imageUrl} onChange={e => setImageUrl(e.target.value)} placeholder={t('createTournamentModal.imageUrlPlaceholder')} className={inputClass} />

                    <div>
                        <h3 className="text-md font-semibold mb-2">{format === TournamentFormat.PROGRESSIVE_MULTI_BRACKET ? t('createTournamentModal.progressiveBracketsLabel') : t('createTournamentModal.categoriesLabel')}</h3>
                        <div className="space-y-3">
                        {categories.map((cat, index) => (
                           <CategoryForm
                                key={cat.id}
                                category={cat}
                                index={index}
                                categoriesCount={categories.length}
                                isProgressive={format === TournamentFormat.PROGRESSIVE_MULTI_BRACKET}
                                onCategoryChange={handleCategoryChange}
                                onFormatChange={handleFormatChange}
                                onRemove={handleRemoveCategory}
                                onMove={handleMoveCategory}
                           />
                        ))}
                        </div>
                        <button type="button" onClick={handleAddCategory} className="mt-2 text-sm font-semibold text-[var(--tg-theme-link-color)] flex items-center gap-1">
                            <PlusIcon className="w-4 h-4" /> {t('createTournamentModal.addCategory')}
                        </button>
                    </div>

                    {format === TournamentFormat.PROGRESSIVE_MULTI_BRACKET && categories.length > 1 && (
                        <div>
                            <h3 className="text-md font-semibold mb-2">{t('createTournamentModal.promotionsLabel')}</h3>
                            <div className="space-y-2">
                                {Array.from({ length: categories.length - 1 }).map((_, index) => {
                                    const toBracket = categories[index];
                                    const fromBracket = categories[index + 1];
                                    const link = bracketLinks.find(l => l.fromBracketId === fromBracket.id && l.toBracketId === toBracket.id);

                                    if (!link) return null;

                                    const fromName = fromBracket.name.trim() || `[${t('createTournamentModal.categoryNamePlaceholder')}]`;
                                    const toName = toBracket.name.trim() || `[${t('createTournamentModal.categoryNamePlaceholder')}]`;

                                    return (
                                        <div key={`link-${fromBracket.id}`} className="flex items-center gap-2 bg-[var(--tg-theme-bg-color)] p-2 rounded-lg">
                                            <label className="flex-1 text-sm font-medium">
                                                {t('createTournamentModal.promotionFromTo', { from: fromName, to: toName})}
                                            </label>
                                            <select
                                                value={link.promotionCount}
                                                onChange={(e) => handlePromotionChange(fromBracket.id, toBracket.id, Number(e.target.value) as PromotionCount)}
                                                className={`${inputClass.replace('w-full', 'w-auto')} appearance-none`} style={{...selectStyle, paddingRight: '2rem'}}
                                            >
                                                <option value={0}>{t('createTournamentModal.noPromotion')}</option>
                                                <option value={2}>{t('createTournamentModal.promote2Finalists')}</option>
                                                <option value={4}>{t('createTournamentModal.promote4Semifinalists')}</option>
                                            </select>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}


                    {error && <p className="text-red-500 text-sm text-center">{error}</p>}
                    
                    <div className="flex gap-4 pt-4 sticky bottom-0 bg-[var(--tg-theme-secondary-bg-color)]">
                        <button type="button" onClick={onClose} className="w-full bg-transparent border border-[var(--tg-theme-hint-color)]/50 font-bold py-2.5 px-4 rounded-md">{t('common.cancel')}</button>
                        <button type="submit" className="w-full bg-[var(--tg-theme-button-color)] text-[var(--tg-theme-button-text-color)] font-bold py-2.5 px-4 rounded-md">{submitText}</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CreateTournamentModal;