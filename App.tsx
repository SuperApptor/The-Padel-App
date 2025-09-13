

import React, { useState, useCallback, useEffect, useMemo } from 'react';
import { Match, PlayerProfile, CompletedMatch, Opponent, PlayerAvailability, SuggestedPlayer, Toast, PlayerCircle, Club, ClubAnnouncement, Tournament, TournamentCategory, RegistrationStatus, TournamentRegistration, BracketMatch, TournamentTeam, TournamentStatus, MatchFormatConfiguration, Notification, NotificationType, Gender, Handedness, Side, OrganizerStatus, MainTab, MatchType } from './types';
import Header from './components/Header';
import MatchList from './components/MatchList';
import MatchHistory from './components/MatchHistory';
import RecordScoreModal from './components/RecordScoreModal';
import { INITIAL_MATCHES, USER_PROFILE, INITIAL_HISTORY, INITIAL_AVAILABILITIES, ALL_PLAYERS, INITIAL_CLUBS, INITIAL_TOURNAMENTS, DEFAULT_MATCH_FORMAT, INITIAL_NOTIFICATIONS } from './constants';
import CreateMatchModal from './components/CreateMatchModal';
import InvitePlayersModal from './components/InvitePlayersModal';
import ToastComponent from './components/Toast';
import SocialTab from './components/SocialTab';
import ProfileModal from './components/ProfileModal';
import ClubDetailModal from './components/ClubDetailModal';
import ClubTab from './components/ClubTab';
import { I18nProvider } from './context/I18nContext';
import { useI18n } from './hooks/useI18n';
import FriendProfileModal from './components/FriendProfileModal';
import ClubAdminModal from './components/ClubAdminModal';
import TournamentTab from './components/TournamentTab';
import CreateTournamentModal from './components/CreateTournamentModal';
import TournamentDetailModal from './components/TournamentDetailModal';
import RegisterTournamentModal from './components/RegisterTournamentModal';
import FindPartnerModal from './components/FindPartnerModal';
import { generateBracket } from './utils/tournamentUtils';
import TournamentScoreModal from './components/TournamentScoreModal';
import HomeTab from './components/HomeTab';
import BottomNavBar from './components/BottomNavBar';
import { ArrowLeftIcon } from './components/icons/ArrowLeftIcon';
import NotificationsPage from './components/NotificationsPage';
import MatchDetailModal from './components/MatchDetailModal';
import AddPlayerModal from './components/AddPlayerModal';
import SuperAdminModal from './components/SuperAdminModal';
import OnboardingModal from './components/OnboardingModal';
import { TelegramIcon } from './components/icons/TelegramIcon';
import AdminEditProfileModal from './components/AdminEditProfileModal';

const ContactAdminModal: React.FC<{
    onClose: () => void;
    contactType: 'organizer' | 'clubAdmin';
}> = ({ onClose, contactType }) => {
    const { t } = useI18n();

    const title = t(`contactAdminModal.${contactType}.title`);
    const description = t(`contactAdminModal.${contactType}.description`);

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-[var(--tg-theme-secondary-bg-color)] rounded-xl p-6 w-full max-w-sm border border-[var(--tg-theme-hint-color)]/20 shadow-2xl text-center">
                <div className="flex justify-end">
                     <button onClick={onClose} className="text-2xl text-[var(--tg-theme-hint-color)] -mt-2 -mr-2">&times;</button>
                </div>
                <h2 className="text-xl font-bold mb-3">{title}</h2>
                <p className="text-sm text-[var(--tg-theme-hint-color)] mb-6">
                    {description}
                </p>
                <a
                    href="https://t.me/PadelPartner"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full bg-[var(--tg-theme-button-color)] text-[var(--tg-theme-button-text-color)] font-bold py-3 px-4 rounded-lg flex items-center justify-center gap-2 transition-opacity duration-300 hover:opacity-80"
                >
                    <TelegramIcon className="w-5 h-5" />
                    {t('contactAdminModal.cta')}
                </a>
            </div>
        </div>
    );
};

type View = 'main' | 'upcoming_matches' | 'open_matches' | 'available_players' | 'match_history' | 'notifications';
type SocialSubTab = 'friends' | 'circles' | 'requests' | 'add';

const usePersistentState = <T,>(key: string, initialValue: T): [T, React.Dispatch<React.SetStateAction<T>>] => {
    const [state, setState] = useState<T>(() => {
        try {
            const item = window.localStorage.getItem(key);
            return item ? JSON.parse(item) : initialValue;
        } catch (error) {
            console.warn(`Error reading localStorage key “${key}”:`, error);
            return initialValue;
        }
    });

    useEffect(() => {
        try {
            window.localStorage.setItem(key, JSON.stringify(state));
        } catch (error) {
            console.warn(`Error setting localStorage key “${key}”:`, error);
        }
    }, [key, state]);

    return [state, setState];
};

const AppContent: React.FC = () => {
  const { t } = useI18n();
  const [userProfile, setUserProfile] = usePersistentState<PlayerProfile>('userProfile', USER_PROFILE);
  const [allPlayers, setAllPlayers] = usePersistentState<PlayerProfile[]>('allPlayers', ALL_PLAYERS);
  const [allMatches, setAllMatches] = usePersistentState<Match[]>('allMatches', INITIAL_MATCHES);
  const [matchHistory, setMatchHistory] = usePersistentState<CompletedMatch[]>('matchHistory', INITIAL_HISTORY);
  const [clubs, setClubs] = usePersistentState<Club[]>('clubs', INITIAL_CLUBS);
  const [tournaments, setTournaments] = usePersistentState<Tournament[]>('tournaments', INITIAL_TOURNAMENTS);
  const [notifications, setNotifications] = usePersistentState<Notification[]>('notifications', INITIAL_NOTIFICATIONS);

  const [toast, setToast] = useState<Toast | null>(null);
  const [activeTab, setActiveTab] = useState<MainTab>('home');
  const [view, setView] = useState<View>('main');
  const [activeSocialTab, setActiveSocialTab] = useState<SocialSubTab>('friends');
  
  // Modal states
  const [isRecordScoreModalOpen, setIsRecordScoreModalOpen] = useState(false);
  const [isCreateMatchModalOpen, setIsCreateMatchModalOpen] = useState(false);
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isClubDetailModalOpen, setIsClubDetailModalOpen] = useState(false);
  const [isFriendProfileModalOpen, setIsFriendProfileModalOpen] = useState(false);
  const [isClubAdminModalOpen, setIsClubAdminModalOpen] = useState(false);
  const [isCreateTournamentModalOpen, setIsCreateTournamentModalOpen] = useState(false);
  const [isTournamentDetailModalOpen, setIsTournamentDetailModalOpen] = useState(false);
  const [isRegisterTournamentModalOpen, setIsRegisterTournamentModalOpen] = useState(false);
  const [isFindPartnerModalOpen, setIsFindPartnerModalOpen] = useState(false);
  const [isTournamentScoreModalOpen, setIsTournamentScoreModalOpen] = useState(false);
  const [isMatchDetailModalOpen, setIsMatchDetailModalOpen] = useState(false);
  const [isAddPlayerModalOpen, setIsAddPlayerModalOpen] = useState(false);
  const [isSuperAdminModalOpen, setIsSuperAdminModalOpen] = useState(false);
  const [isContactAdminModalOpen, setIsContactAdminModalOpen] = useState(false);
  const [isAdminEditProfileModalOpen, setIsAdminEditProfileModalOpen] = useState(false);

  // Data for modals
  const [selectedMatch, setSelectedMatch] = useState<Match | CompletedMatch | null>(null);
  const [selectedClub, setSelectedClub] = useState<Club | null>(null);
  const [selectedFriend, setSelectedFriend] = useState<PlayerProfile | null>(null);
  const [selectedTournament, setSelectedTournament] = useState<Tournament | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<TournamentCategory | null>(null);
  const [selectedTournamentMatch, setSelectedTournamentMatch] = useState<BracketMatch | null>(null);
  const [addPlayerContext, setAddPlayerContext] = useState<{ match: Match; slotIndex: number } | null>(null);
  const [contactAdminType, setContactAdminType] = useState<'organizer' | 'clubAdmin'>('organizer');
  const [adminEditingProfile, setAdminEditingProfile] = useState<PlayerProfile | null>(null);
  
  useEffect(() => {
    window.Telegram.WebApp.ready();
  }, []);
  
  useEffect(() => {
    // FIX: Check if `import.meta.env` exists before accessing properties to prevent crash
    const googleMapsApiKey = (import.meta.env && import.meta.env.VITE_GOOGLE_MAPS_API_KEY) ? import.meta.env.VITE_GOOGLE_MAPS_API_KEY : null;
    
    if (googleMapsApiKey && !window.google) {
      window.initMap = function() {
        window.dispatchEvent(new CustomEvent('google-maps-loaded'));
      };

      const script = document.createElement('script');
      script.src = `https://maps.googleapis.com/maps/api/js?key=${googleMapsApiKey}&libraries=places,geometry&callback=initMap`;
      script.async = true;
      document.head.appendChild(script);
    } else if (!googleMapsApiKey) {
        console.warn("Google Maps API key is not configured or available. Map functionality will be disabled.");
    }
  }, []);

  useEffect(() => {
    // Scroll to top when tab changes
    window.scrollTo(0, 0);
  }, [activeTab]);

  const showToast = useCallback((message: string, type: Toast['type'] = 'success') => {
    setToast({ message, type });
  }, []);

  const handleCompleteOnboarding = useCallback((profileData: Omit<PlayerProfile, 'telegram' | 'avatarUrl' | 'circles' | 'friends' | 'friendRequests' | 'sentFriendRequests' | 'favoriteClubIds' | 'isOnboardingComplete'>) => {
    const tgUser = window.Telegram?.WebApp?.initDataUnsafe?.user;
    const isSuperAdmin = tgUser?.username === 'PadelPartner';

    const newUserProfile: PlayerProfile = {
      telegram: tgUser?.username || `user${tgUser?.id}`,
      avatarUrl: `https://ui-avatars.com/api/?name=${encodeURIComponent(profileData.name)}&background=random`,
      circles: [],
      friends: [],
      friendRequests: [],
      sentFriendRequests: [],
      ...profileData,
      isSuperAdmin: isSuperAdmin,
      isOnboardingComplete: true,
      favoriteClubIds: [],
    };
    setUserProfile(newUserProfile);
    setAllPlayers(prev => [...prev.filter(p => p.telegram !== USER_PROFILE.telegram), newUserProfile]);
    showToast(t('toasts.onboardingComplete'));
  }, [setUserProfile, setAllPlayers, showToast, t]);

  const handleSaveProfile = useCallback((updatedProfile: PlayerProfile) => {
    setUserProfile(updatedProfile);
    setAllPlayers(prev => prev.map(p => p.telegram === updatedProfile.telegram ? updatedProfile : p));
    showToast(t('toasts.profileUpdated'));
  }, [setUserProfile, setAllPlayers, showToast, t]);

  const handleToggleFavoriteClub = useCallback((clubId: number) => {
    setUserProfile(prev => {
        const isFavorite = prev.favoriteClubIds.includes(clubId);
        const club = clubs.find(c => c.id === clubId);
        if (isFavorite) {
            showToast(t('toasts.favoriteRemoved', { clubName: club?.name }));
            return { ...prev, favoriteClubIds: prev.favoriteClubIds.filter(id => id !== clubId) };
        } else {
            showToast(t('toasts.favoriteAdded', { clubName: club?.name }));
            return { ...prev, favoriteClubIds: [...prev.favoriteClubIds, clubId] };
        }
    });
  }, [setUserProfile, showToast, t, clubs]);
  
  const handleSaveClub = useCallback((updatedClub: Club) => {
    setClubs(prev => prev.map(c => c.id === updatedClub.id ? updatedClub : c));
    showToast(t('toasts.clubUpdated', {clubName: updatedClub.name}));
  }, [setClubs, showToast, t]);

  const handleAddMatch = useCallback(async (matchData: Omit<Match, 'id' | 'participants' | 'description' | 'format' | 'status' | 'duration'>, invitedPlayers: SuggestedPlayer[]) => {
    const club = clubs.find(c => c.id === matchData.clubId);
    if (!club) return "Club not found";

    const newMatch: Match = {
      ...matchData,
      id: Date.now(),
      participants: [userProfile],
      description: '', // Will be generated
      status: 'PLANNED',
      duration: 90,
      invitedPlayerIds: invitedPlayers.map(p => p.profile.telegram),
    };
    setAllMatches(prev => [...prev, newMatch]);
    showToast(t('toasts.matchCreated'));
    setSelectedMatch(newMatch);
    setIsCreateMatchModalOpen(false);
    setIsMatchDetailModalOpen(true);
    return null;
  }, [clubs, userProfile, setAllMatches, showToast, t]);

  const handleAddPlayerToMatch = useCallback((playerData: PlayerProfile | { name: string, level: number }, matchId: number, slotIndex: number) => {
    const isGuest = !('telegram' in playerData);
    let playerProfile: PlayerProfile;
    if (isGuest) {
      const guestName = playerData.name;
       playerProfile = { 
          name: guestName, 
          level: playerData.level, 
          telegram: `guest_${Date.now()}`,
          email: `${guestName.replace(' ', '.')}@guest.com`,
          avatarUrl: `https://ui-avatars.com/api/?name=${encodeURIComponent(guestName)}&background=random`,
          birthDate: '1990-01-01',
          gender: Gender.MALE,
          handedness: Handedness.RIGHT,
          side: Side.BOTH,
          favoriteClubIds: [], circles: [], friends: [], friendRequests: [], sentFriendRequests: [],
          isOnboardingComplete: false,
        };
    } else {
      playerProfile = playerData;
    }
    

    setAllMatches(prev => prev.map(m => {
      if (m.id === matchId) {
        const newParticipants = [...m.participants];
        while (newParticipants.length <= slotIndex) {
          newParticipants.push(null);
        }
        newParticipants[slotIndex] = playerProfile;
        return { ...m, participants: newParticipants };
      }
      return m;
    }));
    setIsAddPlayerModalOpen(false);
    showToast(t('toasts.playerAdded', { playerName: playerProfile.name }));
  }, [setAllMatches, showToast, t]);

  const handleCancelMatch = useCallback((matchId: number) => {
    setAllMatches(prev => prev.map(m => m.id === matchId ? {...m, status: 'CANCELED'} : m));
    showToast(t('toasts.matchCanceled'));
  }, [setAllMatches, showToast, t]);

  const handleRecordScore = useCallback((matchId: number, score: string) => {
    const matchToRecord = allMatches.find(m => m.id === matchId) as CompletedMatch;
    if (matchToRecord) {
        setAllMatches(prev => prev.filter(m => m.id !== matchId));
        setMatchHistory(prev => [{ ...matchToRecord, score, result: 'VICTORY' }, ...prev]);
        setIsRecordScoreModalOpen(false);
    }
  }, [allMatches, setAllMatches, setMatchHistory]);

  const handleAdminSaveProfile = (updatedProfile: PlayerProfile) => {
    setAllPlayers(prev => prev.map(p => p.telegram === updatedProfile.telegram ? updatedProfile : p));
    if(updatedProfile.telegram === userProfile.telegram) {
        setUserProfile(updatedProfile);
    }
    setAllMatches(prevMatches => prevMatches.map(m => ({
        ...m,
        participants: m.participants.map(p => p && p.telegram === updatedProfile.telegram ? updatedProfile : p)
    })));
    setMatchHistory(prevHistory => prevHistory.map(m => ({
        ...m,
        participants: m.participants.map(p => p && p.telegram === updatedProfile.telegram ? updatedProfile : p)
    })));
    setIsAdminEditProfileModalOpen(false);
    showToast(t('toasts.profileUpdated'));
  };

  const handleAddFriend = useCallback((friendId: string) => {
    const friend = allPlayers.find(p => p.telegram === friendId);
    if (!friend) return;

    const updatedUserProfile = {
      ...userProfile,
      sentFriendRequests: [...userProfile.sentFriendRequests, friendId],
    };
    setUserProfile(updatedUserProfile);
    
    setAllPlayers(prev => prev.map(p => {
      if (p.telegram === friendId) {
        return {
          ...p,
          friendRequests: [...p.friendRequests, { from: userProfile, status: 'pending' as const }],
        };
      }
      if (p.telegram === userProfile.telegram) {
        return updatedUserProfile;
      }
      return p;
    }));
    
    showToast(t('toasts.friendRequestSent', { name: friend.name }));
  }, [allPlayers, userProfile, setUserProfile, setAllPlayers, showToast, t]);

  const handleFriendRequest = useCallback((friendId: string, action: 'accept' | 'decline') => {
    const friend = allPlayers.find(p => p.telegram === friendId);
    if (!friend) return;
    
    const updatedUserProfile = {
      ...userProfile,
      friendRequests: userProfile.friendRequests.filter(req => req.from.telegram !== friendId),
    };

    if (action === 'accept') {
      updatedUserProfile.friends = [...updatedUserProfile.friends, friendId];
      
      setAllPlayers(prev => prev.map(p => {
        if (p.telegram === friendId) {
          return { ...p, friends: [...p.friends, userProfile.telegram], sentFriendRequests: p.sentFriendRequests.filter(id => id !== userProfile.telegram) };
        }
        if (p.telegram === userProfile.telegram) { return updatedUserProfile; }
        return p;
      }));
      showToast(t('toasts.friendRequestAccepted', { name: friend.name }));
    } else {
       setAllPlayers(prev => prev.map(p => p.telegram === userProfile.telegram ? updatedUserProfile : p));
      showToast(t('toasts.friendRequestDeclined', { name: friend.name }));
    }
    
    setUserProfile(updatedUserProfile);

  }, [allPlayers, userProfile, setUserProfile, setAllPlayers, showToast, t]);

  const handleUpdateCircles = useCallback((circles: PlayerCircle[]) => {
    const updatedUserProfile = { ...userProfile, circles };
    setUserProfile(updatedUserProfile);
    setAllPlayers(prev => prev.map(p => p.telegram === userProfile.telegram ? updatedUserProfile : p));
    showToast(t('toasts.circlesUpdated'));
  }, [userProfile, setUserProfile, setAllPlayers, showToast, t]);

  const handleOpenFriendProfile = useCallback((player: PlayerProfile) => {
    setSelectedFriend(player);
    setIsFriendProfileModalOpen(true);
  }, []);

  const handleOpenMyProfile = useCallback(() => {
    setIsProfileModalOpen(true);
  }, []);

  const myUpcomingMatches = useMemo(() => allMatches.filter(m => m.participants.some(p => p && p.telegram === userProfile.telegram) && new Date(m.matchDate) >= new Date(new Date().setDate(new Date().getDate() - 1)) && m.status === 'PLANNED').sort((a,b) => new Date(a.matchDate).getTime() - new Date(b.matchDate).getTime()), [allMatches, userProfile.telegram]);
  const openMatches = useMemo(() => allMatches.filter(m => m.participants.filter(p => p).length < 4 && !m.participants.some(p => p && p.telegram === userProfile.telegram) && new Date(m.matchDate) >= new Date() && m.status === 'PLANNED').sort((a,b) => new Date(a.matchDate).getTime() - new Date(b.matchDate).getTime()), [allMatches, userProfile.telegram]);
  const unreadNotifs = notifications.filter(n => !n.read).length;

  const handleOpenContactAdminModal = (type: 'organizer' | 'clubAdmin') => {
    setContactAdminType(type);
    setIsContactAdminModalOpen(true);
  }
  
  const handleMarkSectionVisited = (section: MainTab) => {
    setUserProfile(prev => ({
        ...prev,
        visitedSections: { ...prev.visitedSections, [section]: true }
    }));
  };

  const handleJoinMatch = useCallback((matchId: number, slotIndex: number) => {
    const matchToJoin = allMatches.find(m => m.id === matchId);
    if (matchToJoin) {
        const newParticipants = [...matchToJoin.participants];
        if (newParticipants[slotIndex] === null) {
            newParticipants[slotIndex] = userProfile;
            const updatedMatch = { ...matchToJoin, participants: newParticipants };
            setAllMatches(prev => prev.map(m => m.id === matchId ? updatedMatch : m));
            showToast(t('toasts.matchJoined'));
            setView('main');
        }
    }
  }, [allMatches, userProfile, setAllMatches, showToast, t]);

  if (!userProfile.isOnboardingComplete) {
    return <OnboardingModal onComplete={handleCompleteOnboarding} />;
  }

  return (
    <div className="flex flex-col min-h-screen bg-[var(--tg-theme-bg-color)] overflow-x-hidden">
      <Header profile={userProfile} onProfileClick={handleOpenMyProfile} onNotificationsClick={() => setView('notifications')} unreadCount={unreadNotifs}/>
      <main className="flex-grow w-full max-w-4xl mx-auto mb-16 px-4">
        <div>
          {view !== 'main' && (
            <button onClick={() => setView('main')} className="flex items-center gap-2 font-semibold mb-4 text-[var(--tg-theme-link-color)]">
              <ArrowLeftIcon className="w-5 h-5"/> {t('common.back')}
            </button>
          )}
        </div>
        
        {view === 'main' && (
          <>
            {activeTab === 'home' && <HomeTab userProfile={userProfile} myUpcomingMatches={myUpcomingMatches} openMatches={openMatches} clubs={clubs} tournaments={tournaments} onInvite={m => { setSelectedMatch(m); setIsInviteModalOpen(true); }} onAddFriend={handleAddFriend} onCancelMatch={handleCancelMatch} onSelectClub={c => { setSelectedClub(c); setIsClubDetailModalOpen(true); }} onShowAllUpcoming={() => setView('upcoming_matches')} onShowOpenMatches={() => setView('open_matches')} onShowAvailablePlayers={() => setView('available_players')} onShowMatchHistory={() => setView('match_history')} onAddPlayer={(matchId, slotIndex) => { const match = myUpcomingMatches.find(m => m.id === matchId); if (match) setAddPlayerContext({ match, slotIndex }); setIsAddPlayerModalOpen(true); }} onOpenFriendProfile={handleOpenFriendProfile} onOpenMyProfile={handleOpenMyProfile} onMarkSectionVisited={() => handleMarkSectionVisited('home')} />}
            {activeTab === 'clubs' && <div><ClubTab clubs={clubs} onSelectClub={c => { setSelectedClub(c); setIsClubDetailModalOpen(true); }} userProfile={userProfile} onToggleFavorite={handleToggleFavoriteClub} onMarkSectionVisited={() => handleMarkSectionVisited('clubs')}/></div>}
            {activeTab === 'social' && <div><SocialTab profile={userProfile} allPlayers={allPlayers} activeSocialTab={activeSocialTab} setActiveSocialTab={setActiveSocialTab} onFriendRequest={handleFriendRequest} onUpdateCircles={handleUpdateCircles} onOpenFriendProfile={handleOpenFriendProfile} onAddFriend={handleAddFriend} onMarkSectionVisited={() => handleMarkSectionVisited('social')} /></div>}
            {activeTab === 'tournaments' && <div><TournamentTab tournaments={tournaments} clubs={clubs} isLoading={false} userProfile={userProfile} onSelectTournament={t => { setSelectedTournament(t); setIsTournamentDetailModalOpen(true); }} onMarkSectionVisited={() => handleMarkSectionVisited('tournaments')} /></div>}
          </>
        )}
        <div>
          {view === 'notifications' && <NotificationsPage notifications={notifications} onNotificationClick={() => {}} />}
          {view === 'upcoming_matches' && <MatchList listType="user_upcoming" matches={myUpcomingMatches} isLoading={false} userProfile={userProfile} clubs={clubs} onAddFriend={handleAddFriend} onInvite={m => { setSelectedMatch(m); setIsInviteModalOpen(true); }} onCancel={handleCancelMatch} onAddPlayer={(matchId, slotIndex) => { const match = myUpcomingMatches.find(m => m.id === matchId); if (match) setAddPlayerContext({ match, slotIndex }); setIsAddPlayerModalOpen(true); }} onOpenFriendProfile={handleOpenFriendProfile} onOpenMyProfile={handleOpenMyProfile} />}
          {view === 'open_matches' && <MatchList listType="open" matches={openMatches} isLoading={false} userProfile={userProfile} clubs={clubs} onAddFriend={handleAddFriend} onJoin={handleJoinMatch} onOpenFriendProfile={handleOpenFriendProfile} onOpenMyProfile={handleOpenMyProfile} />}
          {view === 'match_history' && <MatchHistory matches={matchHistory} isLoading={false} clubs={clubs} onRecordScore={m => { setSelectedMatch(m); setIsRecordScoreModalOpen(true); }}/>}
        </div>
      </main>
      <BottomNavBar activeTab={activeTab} setActiveTab={setActiveTab} onCreateMatch={() => setIsCreateMatchModalOpen(true)} onCreateTournament={() => setIsCreateTournamentModalOpen(true)} userProfile={userProfile}/>

      {isProfileModalOpen && <ProfileModal profile={userProfile} allClubs={clubs} onClose={() => setIsProfileModalOpen(false)} onSave={handleSaveProfile} onOpenContactAdminModal={handleOpenContactAdminModal} onOpenSuperAdminPanel={() => setIsSuperAdminModalOpen(true)} />}
      {isFriendProfileModalOpen && selectedFriend && <FriendProfileModal friend={selectedFriend} allMatches={matchHistory} onClose={() => setIsFriendProfileModalOpen(false)} />}
      {isRecordScoreModalOpen && selectedMatch && <RecordScoreModal match={selectedMatch as CompletedMatch} userProfile={userProfile} onClose={() => setIsRecordScoreModalOpen(false)} onSave={handleRecordScore} clubs={clubs} />}
      {isCreateMatchModalOpen && <CreateMatchModal profile={userProfile} availabilities={INITIAL_AVAILABILITIES} clubs={clubs} onClose={() => setIsCreateMatchModalOpen(false)} addMatch={handleAddMatch} />}
      {isClubDetailModalOpen && selectedClub && <ClubDetailModal club={selectedClub} onClose={() => setIsClubDetailModalOpen(false)} isAdmin={userProfile.adminOfClubId === selectedClub.id} onEdit={c => { setSelectedClub(c); setIsClubAdminModalOpen(true); }} />}
      {isClubAdminModalOpen && selectedClub && <ClubAdminModal club={selectedClub} allTournaments={tournaments} onClose={() => setIsClubAdminModalOpen(false)} onSave={handleSaveClub} onPublish={()=>{}} onOpenCreateTournament={() => { setIsClubAdminModalOpen(false); setIsCreateTournamentModalOpen(true); }} />}
      {isInviteModalOpen && selectedMatch && <InvitePlayersModal match={selectedMatch as Match} availabilities={INITIAL_AVAILABILITIES} onClose={() => setIsInviteModalOpen(false)} onSendInvites={()=>{}} clubs={clubs} userProfile={userProfile} allPlayers={allPlayers} />}
      {isTournamentDetailModalOpen && selectedTournament && <TournamentDetailModal tournament={selectedTournament} club={clubs.find(c => c.id === selectedTournament.clubId)} userProfile={userProfile} allPlayers={allPlayers} onClose={() => setIsTournamentDetailModalOpen(false)} onRegisterClick={(t,c) => {setSelectedTournament(t); setSelectedCategory(c); setIsRegisterTournamentModalOpen(true);}} onOpenFindPartnerModal={(t,c) => {setSelectedTournament(t); setSelectedCategory(c); setIsFindPartnerModalOpen(true);}} onGenerateBracket={()=>{}} onRecordScore={()=>{}} onCancelTournament={()=>{}} onForceStartBracket={()=>{}} />}
      {isCreateTournamentModalOpen && <CreateTournamentModal userProfile={userProfile} allClubs={clubs} onClose={() => setIsCreateTournamentModalOpen(false)} onCreate={() => {}} />}
      {isSuperAdminModalOpen && <SuperAdminModal userProfile={userProfile} allPlayers={allPlayers} allClubs={clubs} onClose={() => setIsSuperAdminModalOpen(false)} onApproveOrganizer={()=>{}} onRejectOrganizer={()=>{}} onCreateClub={()=>{}} onAssignAdmin={()=>{}} onOpenAdminEditProfile={p => { setAdminEditingProfile(p); setIsAdminEditProfileModalOpen(true); }} />}
      {isAdminEditProfileModalOpen && adminEditingProfile && <AdminEditProfileModal profile={adminEditingProfile} onClose={() => setIsAdminEditProfileModalOpen(false)} onSave={handleAdminSaveProfile} />}
      {isContactAdminModalOpen && <ContactAdminModal onClose={() => setIsContactAdminModalOpen(false)} contactType={contactAdminType} />}
      {isMatchDetailModalOpen && selectedMatch && <MatchDetailModal match={selectedMatch as Match} userProfile={userProfile} clubs={clubs} onClose={() => setIsMatchDetailModalOpen(false)} onAccept={() => {}} onDecline={() => {}} />}
      {addPlayerContext && <AddPlayerModal match={addPlayerContext.match} slotIndex={addPlayerContext.slotIndex} allPlayers={allPlayers} onClose={() => setAddPlayerContext(null)} onAddPlayer={handleAddPlayerToMatch} />}
      {toast && <ToastComponent message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  );
};

const App: React.FC = () => (
  <I18nProvider>
    <AppContent />
  </I18nProvider>
);

export default App;