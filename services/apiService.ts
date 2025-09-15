import { Match, PlayerProfile, CompletedMatch, Club, Tournament, Notification, PlayerAvailability, PlayerCircle, SuggestedPlayer, Gender, Handedness, Side } from '../types';
import { INITIAL_MATCHES, USER_PROFILE, INITIAL_HISTORY, ALL_PLAYERS, INITIAL_CLUBS, INITIAL_TOURNAMENTS, INITIAL_NOTIFICATIONS, INITIAL_AVAILABILITIES } from '../constants';

// --- MOCK DATABASE ---
// This simulates a real database. In a real application, these would be API calls to a server.
let db = {
    matches: [...INITIAL_MATCHES],
    players: [...ALL_PLAYERS],
    history: [...INITIAL_HISTORY],
    clubs: [...INITIAL_CLUBS],
    tournaments: [...INITIAL_TOURNAMENTS],
    notifications: [...INITIAL_NOTIFICATIONS],
    availabilities: [...INITIAL_AVAILABILITIES],
    user: { ...USER_PROFILE }
};

const simulateDelay = (delay = 300) => new Promise(res => setTimeout(res, delay));

// --- API FUNCTIONS ---

// PROFILE
export const getUserProfile = async (): Promise<PlayerProfile> => {
    await simulateDelay();
    return db.user;
};

export const getAllPlayers = async (): Promise<PlayerProfile[]> => {
    await simulateDelay();
    return db.players;
}

export const updateUserProfile = async (profileData: Partial<PlayerProfile>): Promise<PlayerProfile> => {
    await simulateDelay();
    const isNewUser = !db.players.some(p => p.telegram === db.user.telegram);

    // For onboarding, we get partial data
    const tgUser = window.Telegram?.WebApp?.initDataUnsafe?.user;
    const isSuperAdmin = tgUser?.username === 'PadelPartner';

    const fullProfile: PlayerProfile = {
        telegram: tgUser?.username || `user${tgUser?.id}`,
        avatarUrl: `https://ui-avatars.com/api/?name=${encodeURIComponent(profileData.name || 'User')}&background=random`,
        circles: [],
        friends: [],
        friendRequests: [],
        sentFriendRequests: [],
        favoriteClubIds: [],
        isSuperAdmin,
        isOnboardingComplete: true,
        ...profileData
    } as PlayerProfile;

    db.user = { ...db.user, ...fullProfile };
    
    if (isNewUser) {
        db.players.push(db.user);
    } else {
        db.players = db.players.map(p => p.telegram === db.user.telegram ? db.user : p);
    }
    return db.user;
};

export const toggleFavoriteClub = async (userId: string, clubId: number): Promise<PlayerProfile> => {
    await simulateDelay();
    const user = db.players.find(p => p.telegram === userId);
    if (user) {
        const isFavorite = user.favoriteClubIds.includes(clubId);
        if (isFavorite) {
            user.favoriteClubIds = user.favoriteClubIds.filter(id => id !== clubId);
        } else {
            user.favoriteClubIds.push(clubId);
        }
        if (db.user.telegram === userId) {
            db.user = { ...user };
        }
    }
    return user || db.user;
}


// MATCHES
export const getMatches = async (): Promise<Match[]> => {
    await simulateDelay();
    return db.matches;
};

export const getMatchHistory = async (): Promise<CompletedMatch[]> => {
    await simulateDelay();
    return db.history;
};

export const createMatch = async (matchData: Omit<Match, 'id' | 'participants' | 'description' | 'format' | 'status' | 'duration' | 'invitedPlayerIds'>, creator: PlayerProfile, invitedPlayers: SuggestedPlayer[]): Promise<Match> => {
    await simulateDelay();
    const club = db.clubs.find(c => c.id === matchData.clubId);
    if (!club) throw new Error("Club not found");

    const description = `Recherche de joueurs pour un match amical à ${club.name}. Niveau ${matchData.levelMin}-${matchData.levelMax}.`;

    const newMatch: Match = {
      ...matchData,
      id: Date.now(),
      participants: [creator, null, null, null],
      description,
      status: 'PLANNED',
      duration: 90,
      invitedPlayerIds: invitedPlayers.map(p => p.profile.telegram),
    };

    db.matches.push(newMatch);
    return newMatch;
};

export const addPlayerToMatch = async (playerData: PlayerProfile | { name: string, level: number }, matchId: number, slotIndex: number): Promise<Match> => {
    await simulateDelay();
    const match = db.matches.find(m => m.id === matchId);
    if (!match) throw new Error("Match not found");

    let playerProfile: PlayerProfile;
    if (!('telegram' in playerData)) {
        playerProfile = { 
            name: playerData.name, 
            level: playerData.level, 
            telegram: `guest_${Date.now()}`,
            email: `${playerData.name.replace(' ', '.')}@guest.com`,
            avatarUrl: `https://ui-avatars.com/api/?name=${encodeURIComponent(playerData.name)}&background=random`,
            birthDate: '1990-01-01', gender: Gender.MALE, handedness: Handedness.RIGHT, side: Side.BOTH,
            favoriteClubIds: [], circles: [], friends: [], friendRequests: [], sentFriendRequests: [], isOnboardingComplete: false,
        };
    } else {
        playerProfile = playerData;
    }
    
    const newParticipants = [...match.participants];
    newParticipants[slotIndex] = playerProfile;
    match.participants = newParticipants;

    return match;
};


export const cancelMatch = async (matchId: number): Promise<Match> => {
    await simulateDelay();
    const match = db.matches.find(m => m.id === matchId);
    if (!match) throw new Error("Match not found");
    match.status = 'CANCELED';
    return match;
};

export const recordScore = async (matchId: number, score: string): Promise<{ updatedHistory: CompletedMatch[], updatedMatches: Match[] }> => {
    await simulateDelay();
    const matchToRecord = db.matches.find(m => m.id === matchId);
    if (!matchToRecord) throw new Error("Match not found");

    db.matches = db.matches.filter(m => m.id !== matchId);
    
    const completedMatch: CompletedMatch = {
        ...matchToRecord,
        score,
        result: 'VICTORY', // Simplified for now
        partner: null,
        opponents: null,
        eloChange: 0.15
    };

    db.history.unshift(completedMatch);
    return { updatedHistory: db.history, updatedMatches: db.matches };
};

export const joinMatch = async (player: PlayerProfile, matchId: number, slotIndex: number): Promise<Match> => {
    await simulateDelay();
    const match = db.matches.find(m => m.id === matchId);
    if (!match) throw new Error("Match not found");
    if (match.participants[slotIndex] === null) {
        match.participants[slotIndex] = player;
    }
    return match;
};

// SOCIAL
export const addFriend = async (userId: string, friendId: string): Promise<{ updatedProfile: PlayerProfile, updatedPlayers: PlayerProfile[] }> => {
    await simulateDelay();
    const user = db.players.find(p => p.telegram === userId);
    const friend = db.players.find(p => p.telegram === friendId);
    if (user && friend) {
        user.sentFriendRequests.push(friendId);
        friend.friendRequests.push({ from: user, status: 'pending' });
    }
    if (db.user.telegram === userId) db.user = { ...user! };
    return { updatedProfile: db.user, updatedPlayers: db.players };
};

export const handleFriendRequest = async (userId: string, friendId: string, action: 'accept' | 'decline'): Promise<{ updatedProfile: PlayerProfile, updatedPlayers: PlayerProfile[] }> => {
    await simulateDelay();
    const user = db.players.find(p => p.telegram === userId);
    const friend = db.players.find(p => p.telegram === friendId);

    if (user && friend) {
        user.friendRequests = user.friendRequests.filter(req => req.from.telegram !== friendId);
        if (action === 'accept') {
            user.friends.push(friendId);
            friend.friends.push(userId);
            friend.sentFriendRequests = friend.sentFriendRequests.filter(id => id !== userId);
        }
    }
    if (db.user.telegram === userId) db.user = { ...user! };
    return { updatedProfile: db.user, updatedPlayers: db.players };
};

export const updateCircles = async (userId: string, circles: PlayerCircle[]): Promise<PlayerProfile> => {
    await simulateDelay();
    const user = db.players.find(p => p.telegram === userId);
    if (user) {
        user.circles = circles;
    }
    if (db.user.telegram === userId) db.user = { ...user! };
    return db.user;
};

// This function is to ensure data consistency after a profile is edited by an admin
export const updateParticipantDetailsInMatches = async (updatedProfile: PlayerProfile): Promise<{ updatedMatches: Match[], updatedHistory: CompletedMatch[] }> => {
    await simulateDelay();
    db.matches = db.matches.map(m => ({
        ...m,
        participants: m.participants.map(p => p && p.telegram === updatedProfile.telegram ? updatedProfile : p)
    }));
    db.history = db.history.map(m => ({
        ...m,
        participants: m.participants.map(p => p && p.telegram === updatedProfile.telegram ? updatedProfile : p)
    }));
    return { updatedMatches: db.matches, updatedHistory: db.history };
};


// CLUBS
export const getClubs = async (): Promise<Club[]> => {
    await simulateDelay();
    return db.clubs;
};

export const updateClub = async (updatedClub: Club): Promise<Club> => {
    await simulateDelay();
    db.clubs = db.clubs.map(c => c.id === updatedClub.id ? updatedClub : c);
    return updatedClub;
};

// TOURNAMENTS
export const getTournaments = async (): Promise<Tournament[]> => {
    await simulateDelay();
    return db.tournaments;
};

// NOTIFICATIONS
export const getNotifications = async (): Promise<Notification[]> => {
    await simulateDelay();
    return db.notifications;
};

// AVAILABILITIES
export const getAvailabilities = async (): Promise<PlayerAvailability[]> => {
    await simulateDelay();
    return db.availabilities;
};