import React from 'react';
import { InformationCircleIcon } from './icons/InformationCircleIcon';
import { useI18n } from '../hooks/useI18n';

interface GuidanceBoxProps {
    title: string;
    text: string;
    onDismiss: () => void;
}

const GuidanceBox: React.FC<GuidanceBoxProps> = ({ title, text, onDismiss }) => {
    const { t } = useI18n();

    return (
        <div className="bg-blue-500/10 border-l-4 border-blue-400 p-4 rounded-r-lg mb-6 animate-fade-in">
            <div className="flex">
                <div className="flex-shrink-0">
                    <InformationCircleIcon className="h-5 w-5 text-blue-400" aria-hidden="true" />
                </div>
                <div className="ml-3 flex-1 md:flex md:justify-between">
                    <div>
                        <h3 className="text-sm font-bold text-blue-300">{title}</h3>
                        <p className="mt-2 text-sm text-blue-200">{text}</p>
                    </div>
                    <div className="mt-3 md:mt-0 md:ml-6">
                        <button
                            onClick={onDismiss}
                            className="whitespace-nowrap rounded-md bg-blue-500/20 px-3 py-2 text-sm font-semibold text-white hover:bg-blue-500/30 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 focus:ring-offset-blue-900/50"
                        >
                            {t('guidance.dismiss')}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default GuidanceBox;
