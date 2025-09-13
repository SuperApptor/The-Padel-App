
import React from 'react';
import { Notification, NotificationType } from '../types';
import { useI18n } from '../hooks/useI18n';
import { UsersIcon } from './icons/UsersIcon';
import { MegaphoneIcon } from './icons/MegaphoneIcon';
import { CompetitiveIcon } from './icons/CompetitiveIcon';

const getNotificationIcon = (type: NotificationType) => {
    switch(type) {
        case NotificationType.FRIEND_REQUEST:
        case NotificationType.FRIEND_ACCEPTED:
            return <UsersIcon className="w-6 h-6 text-blue-400" />;
        case NotificationType.CLUB_ANNOUNCEMENT:
            return <MegaphoneIcon className="w-6 h-6 text-yellow-400" />;
        case NotificationType.MATCH_INVITE:
            return <CompetitiveIcon className="w-6 h-6 text-green-400" />;
        default:
            return <UsersIcon className="w-6 h-6 text-gray-400" />;
    }
};

const formatTimeAgo = (dateString: string, t: (key: string, options?: any) => string, lang: string): string => {
    const date = new Date(dateString);
    const now = new Date();
    const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    
    let interval = seconds / 31536000;
    if (interval > 1) return t('time.yearsAgo', { count: Math.floor(interval) });
    interval = seconds / 2592000;
    if (interval > 1) return t('time.monthsAgo', { count: Math.floor(interval) });
    interval = seconds / 86400;
    if (interval > 1) return t('time.daysAgo', { count: Math.floor(interval) });
    interval = seconds / 3600;
    if (interval > 1) return t('time.hoursAgo', { count: Math.floor(interval) });
    interval = seconds / 60;
    if (interval > 1) return t('time.minutesAgo', { count: Math.floor(interval) });
    return t('time.justNow');
};


interface NotificationsPageProps {
    notifications: Notification[];
    onNotificationClick: (notification: Notification) => void;
}

const NotificationsPage: React.FC<NotificationsPageProps> = ({ notifications, onNotificationClick }) => {
    const { t, lang } = useI18n();
    
    const renderNotification = (notif: Notification) => (
         <div className={`p-4 rounded-lg flex items-start gap-4 transition-colors ${!notif.read ? 'bg-[var(--tg-theme-secondary-bg-color)]' : 'bg-[var(--tg-theme-bg-color)]'} ${notif.link ? 'hover:bg-[var(--tg-theme-hint-color)]/10' : ''}`}>
            {!notif.read && <div className="w-2 h-2 rounded-full bg-blue-500 mt-2 flex-shrink-0"></div>}
            <div className="flex-shrink-0">
                {notif.actor?.avatarUrl ? (
                    <img src={notif.actor.avatarUrl} alt={notif.actor.name} className="w-10 h-10 rounded-full object-cover" />
                ) : (
                    <div className="w-10 h-10 rounded-full bg-[var(--tg-theme-hint-color)]/20 flex items-center justify-center">
                        {getNotificationIcon(notif.type)}
                    </div>
                )}
            </div>
            <div className="flex-grow">
                <p className="text-sm text-[var(--tg-theme-text-color)]">{notif.message}</p>
                <p className="text-xs text-[var(--tg-theme-hint-color)] mt-1">{formatTimeAgo(notif.date, t, lang)}</p>
            </div>
        </div>
    );

    return (
        <div className="space-y-3">
            {notifications.length > 0 ? (
                notifications.map(notif => 
                    notif.link ? (
                        <button key={notif.id} onClick={() => onNotificationClick(notif)} className="w-full text-left">
                           {renderNotification(notif)}
                        </button>
                    ) : (
                       <div key={notif.id}>
                           {renderNotification(notif)}
                       </div>
                    )
                )
            ) : (
                 <div className="text-center py-16 bg-[var(--tg-theme-secondary-bg-color)] rounded-xl border border-[var(--tg-theme-hint-color)]/20">
                    <h3 className="text-xl font-semibold text-[var(--tg-theme-text-color)]">{t('notifications.noNotificationsTitle')}</h3>
                    <p className="text-[var(--tg-theme-hint-color)] mt-2">{t('notifications.noNotificationsSubtitle')}</p>
                </div>
            )}
        </div>
    );
};

export default NotificationsPage;