
import React, { useState } from 'react';
import { PlayerCircle, PlayerProfile } from '../types';
import { useI18n } from '../hooks/useI18n';

interface EditCircleModalProps {
    circle: PlayerCircle;
    friends: PlayerProfile[];
    onClose: () => void;
    onSave: (circle: PlayerCircle) => void;
}

const EditCircleModal: React.FC<EditCircleModalProps> = ({ circle, friends, onClose, onSave }) => {
    const { t } = useI18n();
    const [selectedMembers, setSelectedMembers] = useState<string[]>(circle.members);

    const handleToggleMember = (friendId: string) => {
        setSelectedMembers(prev => 
            prev.includes(friendId)
            ? prev.filter(id => id !== friendId)
            : [...prev, friendId]
        );
    };

    const handleSave = () => {
        onSave({ ...circle, members: selectedMembers });
    };

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-[var(--tg-theme-secondary-bg-color)] rounded-xl p-6 w-full max-w-sm border border-[var(--tg-theme-hint-color)]/20 shadow-2xl flex flex-col">
                <div className="flex justify-between items-center mb-4 flex-shrink-0">
                    <h2 className="text-xl font-bold">{t('editCircleModal.title', { name: circle.name })}</h2>
                    <button onClick={onClose} className="text-2xl text-[var(--tg-theme-hint-color)]">&times;</button>
                </div>
                <div className="space-y-3 max-h-80 overflow-y-auto pr-2 flex-grow">
                    {friends.length > 0 ? friends.map(friend => (
                        <label key={friend.telegram} className="flex items-center justify-between p-2 bg-[var(--tg-theme-bg-color)] rounded-lg cursor-pointer">
                             <div className="flex items-center gap-3">
                                <img src={friend.avatarUrl} alt={friend.name} className="w-10 h-10 rounded-full object-cover"/>
                                <div>
                                    <p className="font-bold text-sm text-[var(--tg-theme-text-color)]">{friend.name}</p>
                                    <p className="text-xs text-[var(--tg-theme-hint-color)]">{t('common.level')} {friend.level.toFixed(2)}</p>
                                </div>
                            </div>
                            <input
                                type="checkbox"
                                checked={selectedMembers.includes(friend.telegram)}
                                onChange={() => handleToggleMember(friend.telegram)}
                                className="h-5 w-5 rounded bg-transparent border-[var(--tg-theme-hint-color)]/50 text-[var(--tg-theme-button-color)] focus:ring-[var(--tg-theme-button-color)]"
                            />
                        </label>
                    )) : (
                        <p className="text-center text-[var(--tg-theme-hint-color)] py-10">{t('editCircleModal.noFriends')}</p>
                    )}
                </div>
                <div className="flex gap-4 pt-4 mt-4 border-t border-[var(--tg-theme-hint-color)]/20 flex-shrink-0">
                    <button type="button" onClick={onClose} className="w-full bg-transparent border border-[var(--tg-theme-hint-color)]/50 font-bold py-2.5 px-4 rounded-md">{t('common.cancel')}</button>
                    <button type="button" onClick={handleSave} className="w-full bg-[var(--tg-theme-button-color)] text-[var(--tg-theme-button-text-color)] font-bold py-2.5 px-4 rounded-md">{t('common.save')}</button>
                </div>
            </div>
        </div>
    );
};

export default EditCircleModal;