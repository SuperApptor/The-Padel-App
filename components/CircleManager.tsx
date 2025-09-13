
import React, { useState } from 'react';
import { PlayerProfile, PlayerCircle } from '../types';
import { PlusIcon } from './icons/PlusIcon';
import CreateCircleModal from './CreateCircleModal';
import EditCircleModal from './EditCircleModal';
import { TrashIcon } from './icons/TrashIcon';
import { useI18n } from '../hooks/useI18n';

interface CircleManagerProps {
    initialCircles: PlayerCircle[];
    friends: PlayerProfile[];
    onUpdate: (circles: PlayerCircle[]) => void;
}

const CircleManager: React.FC<CircleManagerProps> = ({ initialCircles, friends, onUpdate }) => {
    const { t } = useI18n();
    const [circles, setCircles] = useState(initialCircles);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [editingCircle, setEditingCircle] = useState<PlayerCircle | null>(null);

    const handleCreateCircle = (name: string, color: string) => {
        const newCircle: PlayerCircle = {
            id: Date.now(),
            name,
            color,
            members: [],
        };
        const updatedCircles = [...circles, newCircle];
        setCircles(updatedCircles);
        onUpdate(updatedCircles);
        setIsCreateModalOpen(false);
    };

    const handleEditCircle = (updatedCircle: PlayerCircle) => {
        const updatedCircles = circles.map(c => c.id === updatedCircle.id ? updatedCircle : c);
        setCircles(updatedCircles);
        onUpdate(updatedCircles);
        setEditingCircle(null);
    };

    const handleDeleteCircle = (circleId: number) => {
        if (window.confirm(t('circleManager.deleteConfirm'))) {
            const updatedCircles = circles.filter(c => c.id !== circleId);
            setCircles(updatedCircles);
            onUpdate(updatedCircles);
        }
    };

    return (
        <div>
            <div className="flex justify-end mb-4">
                 <button onClick={() => setIsCreateModalOpen(true)} className="bg-[var(--tg-theme-button-color)] text-[var(--tg-theme-button-text-color)] font-bold py-2 px-4 rounded-md flex items-center justify-center gap-2">
                    <PlusIcon className="w-5 h-5" />
                    {t('circleManager.createCircle')}
                </button>
            </div>

            {circles.length === 0 ? (
                 <div className="text-center py-16 bg-[var(--tg-theme-secondary-bg-color)] rounded-xl border border-[var(--tg-theme-hint-color)]/20">
                    <h3 className="text-xl font-semibold text-[var(--tg-theme-text-color)]">{t('circleManager.noCirclesTitle')}</h3>
                    <p className="text-[var(--tg-theme-hint-color)] mt-2">{t('circleManager.noCirclesSubtitle')}</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {circles.map(circle => (
                        <div key={circle.id} className="p-4 bg-[var(--tg-theme-secondary-bg-color)] rounded-lg border border-[var(--tg-theme-hint-color)]/10">
                            <div className="flex justify-between items-center">
                                <div>
                                    <h4 className="font-bold text-lg flex items-center gap-2">
                                        <span className={`w-3 h-3 rounded-full bg-${circle.color}-500`}></span>
                                        {circle.name}
                                    </h4>
                                    <p className="text-sm text-[var(--tg-theme-hint-color)]">{t('circleManager.memberCount', { count: circle.members.length })}</p>
                                </div>
                                <div className="flex gap-2">
                                    <button onClick={() => setEditingCircle(circle)} className="text-sm font-semibold bg-[var(--tg-theme-button-color)]/20 text-[var(--tg-theme-button-color)] px-3 py-1 rounded-md hover:bg-[var(--tg-theme-button-color)]/40 transition">
                                        {t('common.manage')}
                                    </button>
                                    <button onClick={() => handleDeleteCircle(circle.id)} className="p-2 bg-red-500/20 text-red-400 rounded-md hover:bg-red-500/40 transition">
                                        <TrashIcon className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {isCreateModalOpen && (
                <CreateCircleModal 
                    onClose={() => setIsCreateModalOpen(false)}
                    onCreate={handleCreateCircle}
                />
            )}
            {editingCircle && (
                <EditCircleModal 
                    circle={editingCircle}
                    friends={friends}
                    onClose={() => setEditingCircle(null)}
                    onSave={handleEditCircle}
                />
            )}
        </div>
    );
};

export default CircleManager;