import React, { useState, useCallback, useEffect, useMemo } from 'react';
import { Match, PlayerProfile, CompletedMatch, Toast, PlayerCircle, Club, Tournament, Notification, MainTab, MatchType, Gender, Handedness, Side, SuggestedPlayer, BracketMatch, TournamentCategory } from './types';
import Header from './components/Header';
import MatchList from './components/MatchList';
import MatchHistory from './components/MatchHistory';
import RecordScoreModal from './components/RecordScoreModal';
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
import * as api from './services/apiService';
import { SpinnerIcon } from './components/icons/SpinnerIcon';

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

const AppContent: React.FC = () => {
  const { t } = useI18n();
  const [isLoading, setIsLoading] = useState(true);

  // States for data
  const [userProfile, setUserProfile] = useState<PlayerProfile | null>(null);
  const [allPlayers, setAllPlayers] = useState<PlayerProfile[]>([]);
  const [allMatches, setAllMatches] = useState<Match[]>([]);
  const [matchHistory, setMatchHistory] = useState<CompletedMatch[]>([]);
  const [clubs, setClubs] = useState<Club[]>([]);
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [availabilities, setAvailabilities] = useState<any[]>([]);

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
    const googleMapsApiKey = (typeof import.meta !== 'undefined' && import.meta.env) ? import.meta.env.VITE_GOOGLE_MAPS_API_KEY : null;
    
    if (googleMapsApiKey && !window.google) {
      window.initMap = function() {
        window.dispatchEvent(new CustomEvent('google-maps-loaded'));
      };
      const script = document.createElement('script');
      script.src = `https://maps.googleapis.com/maps/api/js?key=${googleMapsApiKey}&libraries=places,geometry&callback=initMap`;
      script.async = true;
      document.head.appendChild(script);
    } else if (!googleMapsApiKey) {
        console.warn("Google Maps API key is not configured. Map functionality will be disabled.");
    }
  }, []);

  useEffect(() => {
    const loadInitialData = async () => {
        setIsLoading(true);
        try {
            const [
                profile, players, matches, history, initialClubs,
                initialTournaments, initialNotifications, initialAvailabilities
            ] = await Promise.all([
                api.getUserProfile(),
                api.getAllPlayers(),
                api.getMatches(),
                api.getMatchHistory(),
                api.getClubs(),
                api.getTournaments(),
                api.getNotifications(),
                api.getAvailabilities()
            ]);
            setUserProfile(profile);
            setAllPlayers(players);
            setAllMatches(matches);
            setMatchHistory(history);
            setClubs(initialClubs);
            setTournaments(initialTournaments);
            setNotifications(initialNotifications);
            setAvailabilities(initialAvailabilities);
        } catch (error) {
            console.error("Failed to load initial data:", error);
            showToast("Error loading application data.", 'error');
        } finally {
            setIsLoading(false);
        }
    };
    loadInitialData();
  }, []);


  useEffect(() => {
    window.scrollTo(0, 0);
  }, [activeTab]);

  const showToast = useCallback((message: string, type: Toast['type'] = 'success') => {
    setToast({ message, type });
  }, []);

  const handleCompleteOnboarding = useCallback(async (profileData: Omit<PlayerProfile, 'telegram' | 'avatarUrl' | 'circles' | 'friends' | 'friendRequests' | 'sentFriendRequests' | 'favoriteClubIds' | 'isOnboardingComplete'>) => {
    const updatedProfile = await api.updateUserProfile(profileData);
    setUserProfile(updatedProfile);
    setAllPlayers(prev => [...prev.filter(p => p.telegram !== updatedProfile.telegram), updatedProfile]);
    showToast(t('toasts.onboardingComplete'));
  }, [showToast, t]);

  const handleSaveProfile = useCallback(async (updatedProfile: PlayerProfile) => {
    const savedProfile = await api.updateUserProfile(updatedProfile);
    setUserProfile(savedProfile);
    setAllPlayers(prev => prev.map(p => p.telegram === savedProfile.telegram ? savedProfile : p));
    showToast(t('toasts.profileUpdated'));
  }, [showToast, t]);

  const handleToggleFavoriteClub = useCallback(async (clubId: number) => {
    if (!userProfile) return;
    const isFavorite = userProfile.favoriteClubIds.includes(clubId);
    const updatedProfile = await api.toggleFavoriteClub(userProfile.telegram, clubId);
    setUserProfile(updatedProfile);
    
    const club = clubs.find(c => c.id === clubId);
    showToast(isFavorite ? t('toasts.favoriteRemoved', { clubName: club?.name }) : t('toasts.favoriteAdded', { clubName: club?.name }), 'success');
  }, [userProfile, showToast, t, clubs]);
  
  const handleSaveClub = useCallback(async (updatedClub: Club) => {
    const savedClub = await api.updateClub(updatedClub);
    setClubs(prev => prev.map(c => c.id === savedClub.id ? savedClub : c));
    showToast(t('toasts.clubUpdated', {clubName: savedClub.name}));
  }, [setClubs, showToast, t]);

  const handleAddMatch = useCallback(async (matchData: Omit<Match, 'id' | 'participants' | 'description' | 'format' | 'status' | 'duration'>, invitedPlayers: SuggestedPlayer[]) => {
    if(!userProfile) return "User not found";

    const createdMatch = await api.createMatch(matchData, userProfile, invitedPlayers);
    setAllMatches(prev => [...prev, createdMatch]);
    
    showToast(t('toasts.matchCreated'));
    setSelectedMatch(createdMatch);
    setIsCreateMatchModalOpen(false);
    setIsMatchDetailModalOpen(true);
    return null;
  }, [userProfile, showToast, t]);

  const handleAddPlayerToMatch = useCallback(async (playerData: PlayerProfile | { name: string, level: number }, matchId: number, slotIndex: number) => {
    const updatedMatch = await api.addPlayerToMatch(playerData, matchId, slotIndex);
    setAllMatches(prev => prev.map(m => m.id === matchId ? updatedMatch : m));
    setIsAddPlayerModalOpen(false);
    showToast(t('toasts.playerAdded', { playerName: updatedMatch.participants[slotIndex]?.name || 'Guest' }));
  }, [setAllMatches, showToast, t]);

  const handleCancelMatch = useCallback(async (matchId: number) => {
    const updatedMatch = await api.cancelMatch(matchId);
    setAllMatches(prev => prev.map(m => m.id === matchId ? updatedMatch : m));
    showToast(t('toasts.matchCanceled'));
  }, [setAllMatches, showToast, t]);

  const handleRecordScore = useCallback(async (matchId: number, score: string) => {
    const { updatedHistory, updatedMatches } = await api.recordScore(matchId, score);
    setMatchHistory(updatedHistory);
    setAllMatches(updatedMatches);
    setIsRecordScoreModalOpen(false);
  }, []);

  const handleAdminSaveProfile = async (updatedProfile: PlayerProfile) => {
    const savedProfile = await api.updateUserProfile(updatedProfile);
    setAllPlayers(prev => prev.map(p => p.telegram === savedProfile.telegram ? savedProfile : p));
    if(userProfile && savedProfile.telegram === userProfile.telegram) {
        setUserProfile(savedProfile);
    }
    const { updatedMatches, updatedHistory } = await api.updateParticipantDetailsInMatches(savedProfile);
    setAllMatches(updatedMatches);
    setMatchHistory(updatedHistory);
    setIsAdminEditProfileModalOpen(false);
    showToast(t('toasts.profileUpdated'));
  };

  const handleAddFriend = useCallback(async (friendId: string) => {
    if (!userProfile) return;
    const { updatedProfile, updatedPlayers } = await api.addFriend(userProfile.telegram, friendId);
    setUserProfile(updatedProfile);
    setAllPlayers(updatedPlayers);
    const friend = allPlayers.find(p => p.telegram === friendId);
    if(friend) showToast(t('toasts.friendRequestSent', { name: friend.name }));
  }, [userProfile, allPlayers, showToast, t]);

  const handleFriendRequest = useCallback(async (friendId: string, action: 'accept' | 'decline') => {
    if (!userProfile) return;
    const { updatedProfile, updatedPlayers } = await api.handleFriendRequest(userProfile.telegram, friendId, action);
    setUserProfile(updatedProfile);
    setAllPlayers(updatedPlayers);
    const friend = allPlayers.find(p => p.telegram === friendId);
    if(friend) showToast(action === 'accept' ? t('toasts.friendRequestAccepted', { name: friend.name }) : t('toasts.friendRequestDeclined', { name: friend.name }));
  }, [userProfile, allPlayers, showToast, t]);

  const handleUpdateCircles = useCallback(async (circles: PlayerCircle[]) => {
    if (!userProfile) return;
    const updatedProfile = await api.updateCircles(userProfile.telegram, circles);
    setUserProfile(updatedProfile);
    setAllPlayers(prev => prev.map(p => p.telegram === updatedProfile.telegram ? updatedProfile : p));
    showToast(t('toasts.circlesUpdated'));
  }, [userProfile, showToast, t]);

  const handleOpenFriendProfile = useCallback((player: PlayerProfile) => {
    setSelectedFriend(player);
    setIsFriendProfileModalOpen(true);
  }, []);

  const handleOpenMyProfile = useCallback(() => {
    setIsProfileModalOpen(true);
  }, []);
  
  const handleMarkSectionVisited = useCallback((section: MainTab) => {
    if (!userProfile) return;
    const updatedProfile = { ...userProfile, visitedSections: { ...userProfile.visitedSections, [section]: true } };
    setUserProfile(updatedProfile);
    // This is a UI-only state, can be updated optimistically without a dedicated API call for now
  }, [userProfile]);

  const handleJoinMatch = useCallback(async (matchId: number, slotIndex: number) => {
    if (!userProfile) return;
    const updatedMatch = await api.joinMatch(userProfile, matchId, slotIndex);
    setAllMatches(prev => prev.map(m => m.id === matchId ? updatedMatch : m));
    showToast(t('toasts.matchJoined'));
    setView('main');
  }, [userProfile, showToast, t]);
  
  const myUpcomingMatches = useMemo(() => userProfile ? allMatches.filter(m => m.participants.some(p => p && p.telegram === userProfile.telegram) && new Date(m.matchDate) >= new Date(new Date().setDate(new Date().getDate() - 1)) && m.status === 'PLANNED').sort((a,b) => new Date(a.matchDate).getTime() - new Date(b.matchDate).getTime()) : [], [allMatches, userProfile]);
  const openMatches = useMemo(() => userProfile ? allMatches.filter(m => m.participants.filter(p => p).length < 4 && !m.participants.some(p => p && p.telegram === userProfile.telegram) && new Date(m.matchDate) >= new Date() && m.status === 'PLANNED').sort((a,b) => new Date(a.matchDate).getTime() - new Date(b.matchDate).getTime()) : [], [allMatches, userProfile]);
  const unreadNotifs = notifications.filter(n => !n.read).length;

  const handleOpenContactAdminModal = (type: 'organizer' | 'clubAdmin') => {
    setContactAdminType(type);
    setIsContactAdminModalOpen(true);
  }

  if (isLoading || !userProfile) {
    return (
        <div className="flex items-center justify-center min-h-screen bg-[var(--tg-theme-bg-color)]">
            <SpinnerIcon className="w-10 h-10 text-[var(--tg-theme-button-color)] animate-spin" />
        </div>
    );
  }

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
            {activeTab === 'tournaments' && <div><TournamentTab tournaments={tournaments} clubs={clubs} isLoading={isLoading} userProfile={userProfile} onSelectTournament={t => { setSelectedTournament(t); setIsTournamentDetailModalOpen(true); }} onMarkSectionVisited={() => handleMarkSectionVisited('tournaments')} /></div>}
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
      {isCreateMatchModalOpen && <CreateMatchModal profile={userProfile} availabilities={availabilities} clubs={clubs} onClose={() => setIsCreateMatchModalOpen(false)} addMatch={handleAddMatch} />}
      {isClubDetailModalOpen && selectedClub && <ClubDetailModal club={selectedClub} onClose={() => setIsClubDetailModalOpen(false)} isAdmin={userProfile.adminOfClubId === selectedClub.id} onEdit={c => { setSelectedClub(c); setIsClubAdminModalOpen(true); }} />}
      {isClubAdminModalOpen && selectedClub && <ClubAdminModal club={selectedClub} allTournaments={tournaments} onClose={() => setIsClubAdminModalOpen(false)} onSave={handleSaveClub} onPublish={()=>{}} onOpenCreateTournament={() => { setIsClubAdminModalOpen(false); setIsCreateTournamentModalOpen(true); }} />}
      {isInviteModalOpen && selectedMatch && <InvitePlayersModal match={selectedMatch as Match} availabilities={availabilities} onClose={() => setIsInviteModalOpen(false)} onSendInvites={()=>{}} clubs={clubs} userProfile={userProfile} allPlayers={allPlayers} />}
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