


import React from 'react';
import { PlayerProfile, PlayerCircle } from '../types';
import FriendList from './FriendList';
import CircleManager from './CircleManager';
import FriendRequestList from './FriendRequestList';
import { useI18n } from '../hooks/useI18n';
import AddFriendTab from './AddFriendTab';
import { AddUserIcon } from './icons/AddUserIcon';
import GuidanceBox from './GuidanceBox';

type SocialSubTab = 'friends' | 'circles' | 'requests' | 'add';

interface SocialTabProps {
    profile: PlayerProfile;
    allPlayers: PlayerProfile[];
    activeSocialTab: SocialSubTab;
    setActiveSocialTab: (tab: SocialSubTab) => void;
    onFriendRequest: (friendId: string, action: 'accept' | 'decline') => void;
    onUpdateCircles: (circles: PlayerCircle[]) => void;
    onOpenFriendProfile: (friend: PlayerProfile) => void;
    onAddFriend: (friendId: string) => void;
    onMarkSectionVisited: () => void;
}

const SocialTab: React.FC<SocialTabProps> = ({ 
    profile, 
    allPlayers, 
    activeSocialTab, 
    setActiveSocialTab, 
    onFriendRequest, 
    onUpdateCircles, 
    onOpenFriendProfile,
    onAddFriend,
    onMarkSectionVisited
}) => {
    const { t } = useI18n();
    
    const friendsProfiles = profile.friends.map(friendId => allPlayers.find(p => p.telegram === friendId)).filter(p => p) as PlayerProfile[];

    const renderSocialContent = () => {
        switch(activeSocialTab) {
            case 'friends':
                return <FriendList friends={friendsProfiles} onOpenProfile={onOpenFriendProfile} />;
            case 'circles':
                return <CircleManager initialCircles={profile.circles} friends={friendsProfiles} onUpdate={onUpdateCircles} />;
            case 'requests':
                return <FriendRequestList requests={profile.friendRequests} onFriendRequest={onFriendRequest} />;
            case 'add':
                return <AddFriendTab profile={profile} allPlayers={allPlayers} onAddFriend={onAddFriend} />;
        }
    }

    const tabButtonStyle = (tabName: SocialSubTab) => 
        `py-2 px-4 text-sm font-semibold transition-colors rounded-lg flex items-center justify-center gap-2 ${
            activeSocialTab === tabName 
            ? 'bg-[var(--tg-theme-button-color)] text-[var(--tg-theme-button-text-color)]' 
            : 'bg-[var(--tg-theme-secondary-bg-color)] text-[var(--tg-theme-text-color)]'
        }`;

    return (
        <div className="space-y-6">
            {!profile.visitedSections?.social && (
                <GuidanceBox
                    title={t('guidance.social.title')}
                    text={t('guidance.social.text')}
                    onDismiss={onMarkSectionVisited}
                />
            )}
            <div className="grid grid-cols-4 gap-2 p-1 bg-[var(--tg-theme-bg-color)] rounded-xl">
                <button onClick={() => setActiveSocialTab('friends')} className={tabButtonStyle('friends')}>
                    {t('socialTabs.myFriends')}
                </button>
                <button onClick={() => setActiveSocialTab('circles')} className={tabButtonStyle('circles')}>
                    {t('socialTabs.myCircles')}
                </button>
                <button onClick={() => setActiveSocialTab('requests')} className={`${tabButtonStyle('requests')} relative`}>
                    {t('socialTabs.requests')}
                    {profile.friendRequests.length > 0 && (
                        <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-xs font-bold text-white">
                           {profile.friendRequests.length}
                        </span>
                    )}
                </button>
                <button onClick={() => setActiveSocialTab('add')} className={tabButtonStyle('add')}>
                   <AddUserIcon className="w-4 h-4" /> {t('socialTabs.addFriends')}
                </button>
            </div>

            {renderSocialContent()}
        </div>
    );
};

export default SocialTab;