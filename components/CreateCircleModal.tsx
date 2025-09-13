
import React, { useState } from 'react';
import { useI18n } from '../hooks/useI18n';

interface CreateCircleModalProps {
    onClose: () => void;
    onCreate: (name: string, color: string) => void;
}

const COLORS = ['red', 'blue', 'green', 'yellow', 'purple', 'pink'];

const CreateCircleModal: React.FC<CreateCircleModalProps> = ({ onClose, onCreate }) => {
    const { t } = useI18n();
    const [name, setName] = useState('');
    const [color, setColor] = useState(COLORS[0]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (name.trim()) {
            onCreate(name.trim(), color);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-[var(--tg-theme-secondary-bg-color)] rounded-xl p-6 w-full max-w-sm border border-[var(--tg-theme-hint-color)]/20 shadow-2xl">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-bold">{t('createCircleModal.title')}</h2>
                    <button onClick={onClose} className="text-2xl text-[var(--tg-theme-hint-color)]">&times;</button>
                </div>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label htmlFor="circleName" className="block text-sm font-medium mb-1">{t('createCircleModal.nameLabel')}</label>
                        <input
                            type="text"
                            id="circleName"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="w-full bg-[var(--tg-theme-bg-color)] border border-[var(--tg-theme-hint-color)]/50 rounded-md px-3 py-2 text-[var(--tg-theme-text-color)] focus:ring-2 focus:ring-[var(--tg-theme-button-color)] focus:outline-none transition"
                            placeholder={t('createCircleModal.namePlaceholder')}
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-2">{t('createCircleModal.colorLabel')}</label>
                        <div className="flex gap-3">
                            {COLORS.map(c => (
                                <button
                                    type="button"
                                    key={c}
                                    onClick={() => setColor(c)}
                                    className={`w-8 h-8 rounded-full bg-${c}-500 transition-transform hover:scale-110 ${color === c ? 'ring-2 ring-offset-2 ring-offset-[var(--tg-theme-secondary-bg-color)] ring-[var(--tg-theme-button-color)]' : ''}`}
                                    aria-label={t('createCircleModal.colorAriaLabel', { color: c })}
                                />
                            ))}
                        </div>
                    </div>
                    <div className="flex gap-4 pt-4">
                        <button type="button" onClick={onClose} className="w-full bg-transparent border border-[var(--tg-theme-hint-color)]/50 font-bold py-2.5 px-4 rounded-md">{t('common.cancel')}</button>
                        <button type="submit" className="w-full bg-[var(--tg-theme-button-color)] text-[var(--tg-theme-button-text-color)] font-bold py-2.5 px-4 rounded-md">{t('common.create')}</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CreateCircleModal;