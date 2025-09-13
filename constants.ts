

import { Match, PlayerProfile, Gender, Handedness, Side, CompletedMatch, PlayerCircle, PlayerAvailability, AvailabilityType, FriendRequest, Club, Tournament, TournamentFormat, RegistrationStatus, TournamentTeam, BracketMatch, TournamentRegistration, TournamentStatus, SetType, FinalSetType, MatchFormatConfiguration, PointSystem, Notification, NotificationType, MatchType, OpeningHours } from './types';

export const DAYS_OF_WEEK = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
export const AVAILABILITY_TYPES: AvailabilityType[] = [AvailabilityType.ONE_TIME, AvailabilityType.DATE_RANGE, AvailabilityType.RECURRING];

export const GENDERS: Gender[] = [Gender.MALE, Gender.FEMALE];
export const HANDEDNESS_OPTIONS: Handedness[] = [Handedness.RIGHT, Handedness.LEFT];
export const SIDE_OPTIONS: Side[] = [Side.LEFT, Side.RIGHT, Side.BOTH];

export const SET_TYPES: SetType[] = [
    SetType.CLASSIC_6_GAMES_TB,
    SetType.SHORT_4_GAMES_TB,
    SetType.SHORT_4_GAMES_NO_TB,
];
export const PRO_SET_TYPES: SetType[] = [
    SetType.PRO_SET_9_GAMES,
    ...SET_TYPES
];
export const FINAL_SET_TYPES: FinalSetType[] = [
    FinalSetType.CLASSIC_6_GAMES_TB,
    FinalSetType.SHORT_4_GAMES_TB,
    FinalSetType.SHORT_4_GAMES_NO_TB,
    FinalSetType.SHORT_4_GAMES_2_GAMES_DIFF,
    FinalSetType.SUPER_TIEBREAK_10_POINTS
];
export const POINT_SYSTEMS: PointSystem[] = [PointSystem.GOLDEN_POINT, PointSystem.ADVANTAGE];

export const DEFAULT_MATCH_FORMAT: MatchFormatConfiguration = {
    setsToWin: 2,
    regularSetType: SetType.CLASSIC_6_GAMES_TB,
    finalSetType: FinalSetType.CLASSIC_6_GAMES_TB,
    pointSystem: PointSystem.GOLDEN_POINT,
};

// --- PLAYER DEFINITIONS ---

const allPlayerNames = [
    "Jean Martin", "Pierre Dubois", "Michel Bernard", "Luc Thomas", "Nicolas Robert", "David Richard", "Daniel Petit", "Philippe Durand", "Alain Leroy", "Laurent Moreau", "Patrick Simon", "Didier Michel", "Christian Laurent", "Vincent Lefebvre", "Bruno Roux", "Gérard Garcia", "François Martinez", "Christophe Bernard", "Olivier Lambert", "Thierry David", 
    "Marie Dubois", "Nathalie Martin", "Isabelle Thomas", "Sylvie Robert", "Catherine Petit", "Françoise Durand", "Monique Lefebvre", "Christine Garcia", "Valérie Simon", "Chantal Roux",
    "Antoine Griezmann", "Kylian Mbappé", "Olivier Giroud", "N'Golo Kanté", "Paul Pogba", "Hugo Lloris", "Raphaël Varane", "Lucas Hernandez", "Benjamin Pavard", "Presnel Kimpembe",
    "Jules Koundé", "Adrien Rabiot", "Aurélien Tchouaméni", "Kingsley Coman", "Ousmane Dembélé", "Karim Benzema", "Mike Maignan", "Theo Hernandez", "Dayot Upamecano", "Ibrahima Konaté",
    "William Saliba", "Eduardo Camavinga", "Youssouf Fofana", "Randal Kolo Muani", "Marcus Thuram", "Moussa Diaby", "Christopher Nkunku", "Zinédine Zidane", "Thierry Henry", "Michel Platini"
];

const allPlayersGenerated: PlayerProfile[] = allPlayerNames.map((name, i) => ({
    name: name,
    telegram: name.toLowerCase().replace(/[\s']/g, ''),
    email: `${name.toLowerCase().replace(/[\s']/g, '.')}@example.com`,
    birthDate: `${2024 - (22 + i)}-${String(i % 12 + 1).padStart(2, '0')}-${String(i % 28 + 1).padStart(2, '0')}`,
    level: 4.5 + (i * 0.08),
    gender: i < 30 ? Gender.MALE : Gender.FEMALE, // Adjust gender distribution
    handedness: i % 5 === 0 ? Handedness.LEFT : Handedness.RIGHT,
    side: Side.BOTH,
    favoriteClubIds: [],
    avatarUrl: `https://i.pravatar.cc/150?u=${name.toLowerCase().replace(/[\s']/g, '')}`,
    circles: [], friends: [], friendRequests: [], sentFriendRequests: [],
    organizerStatus: 'NONE',
    isOnboardingComplete: true,
}));

const superAdminProfile: PlayerProfile = {
    name: "Admin Padel",
    telegram: "PadelPartner", // Your Telegram username
    email: "admin@thepadelpartnerapp.com",
    birthDate: "1990-01-01",
    level: 7.5,
    gender: Gender.MALE,
    handedness: Handedness.RIGHT,
    side: Side.RIGHT,
    favoriteClubIds: [101, 104, 105],
    avatarUrl: 'https://images.unsplash.com/photo-1633332755192-727a05c4013d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=200&q=80',
    circles: [
        { id: 1, name: "Experts", color: "red", members: ["lucasgarcia", "chloedurand"] },
        { id: 2, name: "Collègues", color: "blue", members: [] },
    ],
    friends: ["julienroux", "lucasgarcia", "chloedurand"],
    friendRequests: [
        { from: allPlayersGenerated[20], status: 'pending' }, // Marie Dubois
        { from: allPlayersGenerated[21], status: 'pending' }, // Nathalie Martin
    ],
    sentFriendRequests: ["leadubois", "sophiemartin"],
    organizerStatus: 'NONE',
    isSuperAdmin: true,
    isOnboardingComplete: true,
    city: "Paris, France",
    lat: 48.8566,
    lng: 2.3522,
};


const leaDubois: PlayerProfile = {
    name: "Léa Dubois",
    telegram: "leadubois",
    email: "lea.dubois@example.com",
    birthDate: "1996-03-20",
    level: 5.0,
    gender: Gender.FEMALE,
    handedness: Handedness.RIGHT,
    side: Side.LEFT,
    favoriteClubIds: [102],
    avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=200&q=80',
    circles: [],
    friends: [],
    friendRequests: [],
    sentFriendRequests: [],
    organizerStatus: 'NONE',
    isOnboardingComplete: true,
    city: "Lyon, France",
    lat: 45.7640,
    lng: 4.8357,
};

const sophieMartin: PlayerProfile = { 
    name: "Sophie Martin", 
    telegram: "sophiemartin",
    email: "sophie.martin@example.com",
    birthDate: "1994-11-02",
    level: 5.2,
    gender: Gender.FEMALE,
    handedness: Handedness.RIGHT,
    side: Side.RIGHT,
    favoriteClubIds: [103], 
    avatarUrl: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=200&q=80',
    circles: [],
    friends: [],
    friendRequests: [],
    sentFriendRequests: [],
    organizerStatus: 'PENDING',
    isOnboardingComplete: true,
    city: "Lyon, France",
    lat: 45.7640,
    lng: 4.8357,
};

const julienRoux: PlayerProfile = { 
    name: "Julien Roux", 
    telegram: "julienroux",
    email: "julien.roux@example.com",
    birthDate: "1989-07-30",
    level: 6.8, 
    gender: Gender.MALE,
    handedness: Handedness.RIGHT,
    side: Side.RIGHT,
    favoriteClubIds: [101],
    avatarUrl: 'https://images.unsplash.com/photo-1557862921-37829c790f19?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%D3D&auto=format&fit=crop&w=200&q=80',
    circles: [],
    friends: [superAdminProfile.telegram],
    friendRequests: [],
    sentFriendRequests: [],
    organizerStatus: 'NONE',
    adminOfClubId: 101,
    isOnboardingComplete: true,
    city: "Lyon, France",
    lat: 45.7640,
    lng: 4.8357,
};

const emiliePetit: PlayerProfile = { 
    name: "Émilie Petit", 
    telegram: "emiliepetit",
    email: "emilie.petit@example.com",
    birthDate: "1995-01-10",
    level: 6.1,
    gender: Gender.FEMALE,
    handedness: Handedness.LEFT,
    side: Side.LEFT,
    favoriteClubIds: [102, 103],
    avatarUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=200&q=80',
    circles: [],
    friends: [],
    friendRequests: [],
    sentFriendRequests: [],
    organizerStatus: 'PENDING',
    isOnboardingComplete: true,
    city: "Villefranche-sur-Saône, France",
    lat: 45.9900,
    lng: 4.7180,
};

const lucasGarcia: PlayerProfile = { 
    name: "Lucas Garcia", 
    telegram: "lucasgarcia",
    email: "lucas.garcia@example.com",
    birthDate: "1997-09-05",
    level: 7.1,
    gender: Gender.MALE,
    handedness: Handedness.LEFT,
    side: Side.BOTH,
    favoriteClubIds: [101, 102],
    avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=200&q=80',
    circles: [],
    friends: [superAdminProfile.telegram],
    friendRequests: [],
    sentFriendRequests: [],
    organizerStatus: 'APPROVED',
    isOnboardingComplete: true,
    city: "Lyon, France",
    lat: 45.7640,
    lng: 4.8357,
};

const chloeDurand: PlayerProfile = { 
    name: "Chloé Durand", 
    telegram: "chloedurand",
    email: "chloe.durand@example.com",
    birthDate: "1993-06-25",
    level: 6.9,
    gender: Gender.FEMALE,
    handedness: Handedness.RIGHT,
    side: Side.RIGHT,
    favoriteClubIds: [101, 104],
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=200&q=80',
    circles: [],
    friends: [superAdminProfile.telegram],
    friendRequests: [],
    sentFriendRequests: [],
    organizerStatus: 'NONE',
    isOnboardingComplete: true,
    city: "Paris, France",
    lat: 48.8566,
    lng: 2.3522,
};

export const USER_PROFILE: PlayerProfile = superAdminProfile;

export const ALL_PLAYERS: PlayerProfile[] = [
    superAdminProfile,
    leaDubois,
    sophieMartin,
    julienRoux,
    emiliePetit,
    lucasGarcia,
    chloeDurand,
    ...allPlayersGenerated
];
// --- END PLAYER DEFINITIONS ---


// --- PREVIEW DATA FOR IN-PROGRESS TOURNAMENT ---
const playersForCurrentTournament = [...ALL_PLAYERS].slice(0, 32);
const currentTournamentRegistrations: TournamentRegistration[] = [];
const currentTournamentTeams: TournamentTeam[] = [];

for (let i = 0; i < 16; i++) {
    const p1 = playersForCurrentTournament[i*2];
    const p2 = playersForCurrentTournament[i*2 + 1];
    const regId = 500 + i;
    currentTournamentRegistrations.push({
        id: regId,
        tournamentId: 1,
        categoryId: 1, // P250 Hommes
        player1Id: p1.telegram,
        player2Id: p2.telegram,
        status: RegistrationStatus.CONFIRMED,
    });
    currentTournamentTeams.push({
        id: regId,
        name: `${p1.name.split(' ')[0]} / ${p2.name.split(' ')[0]}`,
        player1Id: p1.telegram,
        player2Id: p2.telegram,
        level: (p1.level + p2.level) / 2,
        seed: i < 4 ? i + 1 : undefined,
    });
}

const playedBracket: BracketMatch[] = [
  // Round 1
  { id: 1001, round: 1, matchInRound: 1, team1Id: 500, team2Id: 515, nextMatchId: 1009, isWinnerBracket: true, score: "6-2 / 6-3", winnerTeamId: 500 },
  { id: 1002, round: 1, matchInRound: 2, team1Id: 508, team2Id: 507, nextMatchId: 1009, isWinnerBracket: true, score: "4-6 / 6-3 / 7-5", winnerTeamId: 507 },
  { id: 1003, round: 1, matchInRound: 3, team1Id: 504, team2Id: 511, nextMatchId: 1010, isWinnerBracket: true, score: "7-5 / 6-1", winnerTeamId: 504 },
  { id: 1004, round: 1, matchInRound: 4, team1Id: 512, team2Id: 503, nextMatchId: 1010, isWinnerBracket: true, score: "1-6 / 3-6", winnerTeamId: 503 },
  { id: 1005, round: 1, matchInRound: 5, team1Id: 502, team2Id: 513, nextMatchId: 1011, isWinnerBracket: true, score: "6-4 / 6-4", winnerTeamId: 502 },
  { id: 1006, round: 1, matchInRound: 6, team1Id: 510, team2Id: 505, nextMatchId: 1011, isWinnerBracket: true, score: "6-7 / 6-2 / 6-3", winnerTeamId: 510 },
  { id: 1007, round: 1, matchInRound: 7, team1Id: 506, team2Id: 509, nextMatchId: 1012, isWinnerBracket: true, score: "3-6 / 2-6", winnerTeamId: 509 },
  { id: 1008, round: 1, matchInRound: 8, team1Id: 514, team2Id: 501, nextMatchId: 1012, isWinnerBracket: true, score: "0-6 / 1-6", winnerTeamId: 501 },
  // Round 2 (Quarters)
  { id: 1009, round: 2, matchInRound: 1, team1Id: 500, team2Id: 507, nextMatchId: 1013, isWinnerBracket: true, score: "6-4 / 7-6", winnerTeamId: 500 },
  { id: 1010, round: 2, matchInRound: 2, team1Id: 504, team2Id: 503, nextMatchId: 1013, isWinnerBracket: true, score: "5-7 / 2-6", winnerTeamId: 503 },
  { id: 1011, round: 2, matchInRound: 3, team1Id: 502, team2Id: 510, nextMatchId: 1014, isWinnerBracket: true, score: "7-5 / 6-3", winnerTeamId: 502 },
  { id: 1012, round: 2, matchInRound: 4, team1Id: 509, team2Id: 501, nextMatchId: 1014, isWinnerBracket: true, score: "2-6 / 3-6", winnerTeamId: 501 },
  // Round 3 (Semis)
  { id: 1013, round: 3, matchInRound: 1, team1Id: 500, team2Id: 503, nextMatchId: 1015, isWinnerBracket: true },
  { id: 1014, round: 3, matchInRound: 2, team1Id: 502, team2Id: 501, nextMatchId: 1015, isWinnerBracket: true },
  // Round 4 (Final)
  { id: 1015, round: 4, matchInRound: 1, isWinnerBracket: true },
];

// --- PREVIEW DATA FOR PAST TOURNAMENT ---
const playersForPastTournament = [...ALL_PLAYERS].slice(4, 20); // Use a different set of players
const pastTournamentRegistrations: TournamentRegistration[] = [];
const pastTournamentTeams: TournamentTeam[] = [];

for (let i = 0; i < 8; i++) {
    const p1 = playersForPastTournament[i*2];
    const p2 = playersForPastTournament[i*2 + 1];
    const regId = 600 + i;
    pastTournamentRegistrations.push({
        id: regId,
        tournamentId: 2,
        categoryId: 3, // P500 Hommes
        player1Id: p1.telegram,
        player2Id: p2.telegram,
        status: RegistrationStatus.CONFIRMED,
    });
    pastTournamentTeams.push({
        id: regId,
        name: `${p1.name.split(' ')[0]} / ${p2.name.split(' ')[0]}`,
        player1Id: p1.telegram,
        player2Id: p2.telegram,
        level: (p1.level + p2.level) / 2,
        seed: i < 2 ? i + 1 : undefined,
    });
}
const pastBracket: BracketMatch[] = [
    // Round 1
    { id: 2001, round: 1, matchInRound: 1, team1Id: 600, team2Id: 607, nextMatchId: 2005, isWinnerBracket: true, score: "6-1 / 6-2", winnerTeamId: 600 },
    { id: 2002, round: 1, matchInRound: 2, team1Id: 604, team2Id: 605, nextMatchId: 2005, isWinnerBracket: true, score: "7-5 / 6-4", winnerTeamId: 604 },
    { id: 2003, round: 1, matchInRound: 3, team1Id: 603, team2Id: 602, nextMatchId: 2006, isWinnerBracket: true, score: "3-6 / 6-4 / 6-2", winnerTeamId: 602 },
    { id: 2004, round: 1, matchInRound: 4, team1Id: 606, team2Id: 601, nextMatchId: 2006, isWinnerBracket: true, score: "2-6 / 1-6", winnerTeamId: 601 },
    // Semis
    { id: 2005, round: 2, matchInRound: 1, team1Id: 600, team2Id: 604, nextMatchId: 2007, isWinnerBracket: true, score: "6-3 / 6-4", winnerTeamId: 600 },
    { id: 2006, round: 2, matchInRound: 2, team1Id: 602, team2Id: 601, nextMatchId: 2007, isWinnerBracket: true, score: "4-6 / 7-6 / 5-7", winnerTeamId: 601 },
    // Final
    { id: 2007, round: 3, matchInRound: 1, team1Id: 600, team2Id: 601, isWinnerBracket: true, score: "7-5 / 2-6 / 6-4", winnerTeamId: 600 },
];

const defaultOpeningHours: OpeningHours = {
    Monday: { open: "09:00", close: "22:00" },
    Tuesday: { open: "09:00", close: "22:00" },
    Wednesday: { open: "09:00", close: "22:00" },
    Thursday: { open: "09:00", close: "22:00" },
    Friday: { open: "09:00", close: "23:00" },
    Saturday: { open: "10:00", close: "23:00" },
    Sunday: null, // Closed
};

export const INITIAL_CLUBS: Club[] = [
    {
        id: 101,
        name: "Spirit Padel Lyon",
        city: "Lyon",
        address: "123 Rue du Padel, 69000 Lyon",
        phone: "04 78 00 00 01",
        email: "contact@spirit-padel.fr",
        imageUrl: "https://lyon.espritpadel.com/wp-content/uploads/2024/03/esprit-padel-vue-dessus-scaled-1-1536x985.jpg",
        courts: [ { id: 1, name: "Court 1", type: "indoor" }, { id: 2, name: "Court 2", type: "indoor" }, { id: 3, name: "Court 3", type: "indoor" }, { id: 4, name: "Court 4", type: "outdoor" }, { id: 5, name: "Court 5", type: "outdoor" } ],
        lat: 45.7578, lng: 4.832,
        announcements: [ { id: 205, message: "Nouveau : Cours de cardio-padel tous les mardis soirs. Première séance d'essai gratuite !", date: "2024-09-18T18:00:00.000Z" }, { id: 204, message: "Soirée Padel & Tapas ce vendredi ! Venez nombreux pour jouer et déguster nos spécialités.", date: "2024-09-10T14:00:00.000Z" } ],
        openingHours: defaultOpeningHours,
    },
    {
        id: 102,
        name: "PadelShot Lyon",
        city: "Lyon",
        address: "456 Avenue de la Bandeja, 69003 Lyon",
        phone: "04 78 00 00 02",
        email: "lyon@padelshot.fr",
        imageUrl: "https://picsum.photos/seed/padelshot/800/600",
        courts: [ { id: 1, name: "Court Central", type: "indoor" }, { id: 2, name: "Court A", type: "indoor" }, { id: 3, name: "Court B", type: "indoor" }, { id: 4, name: "Court C", type: "outdoor" } ],
        lat: 45.760, lng: 4.86,
        announcements: [],
        openingHours: defaultOpeningHours,
    },
     {
        id: 103,
        name: "All In Padel Villefranche",
        city: "Villefranche-sur-Saône",
        address: "789 Boulevard de la Vibora, 69400 Villefranche",
        phone: "04 74 00 00 03",
        email: "contact@allin-padel.com",
        imageUrl: "https://picsum.photos/seed/allinpadel/800/600",
        courts: [ { id: 1, name: "Court 1", type: "indoor" }, { id: 2, name: "Court 2", type: "indoor" }, { id: 3, name: "Court 3", type: "outdoor" } ],
        lat: 45.990, lng: 4.718,
        announcements: [ { id: 301, message: "Nouveaux terrains outdoor disponibles à la réservation dès aujourd'hui !", date: "2024-08-05T12:30:00.000Z" } ],
        openingHours: defaultOpeningHours,
    },
    {
        id: 104,
        name: "Casa Padel Paris",
        city: "Paris",
        address: "103 Rue Charles Michels, 93200 Saint-Denis",
        phone: "01 84 21 49 00",
        email: "contact@casapadel.fr",
        imageUrl: "https://picsum.photos/seed/casapadel/800/600",
        courts: [ { id: 1, name: "Court 1", type: "indoor" }, { id: 2, name: "Court 2", type: "indoor" }, { id: 3, name: "Court 3", type: "indoor" }, { id: 4, name: "Court 4", type: "indoor" } ],
        lat: 48.916, lng: 2.35,
        announcements: [],
        openingHours: { ...defaultOpeningHours, Sunday: { open: "10:00", close: "20:00" } },
    },
    {
        id: 105,
        name: "4Padel Marseille",
        city: "Marseille",
        address: "100 Boulevard de la Fourragère, 13012 Marseille",
        phone: "04 91 00 00 05",
        email: "marseille@4padel.fr",
        imageUrl: "https://picsum.photos/seed/4padelmarseille/800/600",
        courts: Array.from({ length: 8 }, (_, i) => ({ id: i + 1, name: `Indoor ${i + 1}`, type: "indoor" })),
        lat: 43.30, lng: 5.43,
        announcements: [{ id: 401, message: "Stage intensif de perfectionnement du 1 au 5 Octobre.", date: "2024-09-15T10:00:00.000Z"}],
        openingHours: defaultOpeningHours,
    },
    {
        id: 106,
        name: "Padel Riviera Mougins",
        city: "Nice",
        address: "2000 Avenue du Maréchal Juin, 06250 Mougins",
        phone: "04 93 00 00 06",
        email: "contact@padelriviera.fr",
        imageUrl: "https://picsum.photos/seed/padelriviera/800/600",
        courts: Array.from({ length: 6 }, (_, i) => ({ id: i + 1, name: `Court ${i + 1}`, type: i < 3 ? "indoor" : "outdoor" })),
        lat: 43.60, lng: 7.00,
        announcements: [],
        openingHours: defaultOpeningHours,
    }
];

export const DEMO_CLUBS: string[] = INITIAL_CLUBS.map(club => club.name);

const today = new Date();
const tomorrow = new Date(today);
tomorrow.setDate(tomorrow.getDate() + 1);
const tomorrowString = tomorrow.toISOString().split('T')[0];

const dayAfterTomorrow = new Date(today);
dayAfterTomorrow.setDate(dayAfterTomorrow.getDate() + 2);
const dayAfterTomorrowString = dayAfterTomorrow.toISOString().split('T')[0];


export const INITIAL_MATCHES: Match[] = [
  {
    id: 1, type: MatchType.MIXED, participants: [superAdminProfile, emiliePetit, null, null], clubId: 104, levelMin: 6.5, levelMax: 8.0, matchDate: "2024-09-28", matchTime: "18:30",
    description: "Recherche un dernier guerrier niveau compétition pour une partie endiablée à Paris. Bandejas et bonne humeur exigées.", circleId: 1, invitedPlayerIds: [], status: 'PLANNED', duration: 90,
  },
   {
    id: 8, type: MatchType.OPEN, participants: [superAdminProfile, julienRoux, lucasGarcia, null], clubId: 101, levelMin: 7.0, levelMax: 8.0, matchDate: tomorrowString, matchTime: "19:00",
    description: "Partie de haut niveau pour demain à Lyon. On cherche un 4ème solide !", status: 'PLANNED', duration: 90,
  },
  {
    id: 9, type: MatchType.MEN, participants: [superAdminProfile, allPlayersGenerated[30], null, null], clubId: 105, levelMin: 6.0, levelMax: 7.5, matchDate: dayAfterTomorrowString, matchTime: "20:30",
    description: "Match amical mais sérieux à Marseille dans 2 jours. On a besoin de 2 joueurs pour compléter.", status: 'PLANNED', duration: 90,
  },
  {
    id: 2, type: MatchType.WOMEN, participants: [leaDubois, sophieMartin, null, null], clubId: 102, levelMin: 4.5, levelMax: 6.0, matchDate: "2024-09-29", matchTime: "20:00",
    description: "Qui est chaud pour compléter une team à Lyon ? On a le terrain, la motivation, il ne manque plus que vous pour mettre le feu !", status: 'PLANNED', duration: 90,
  },
  {
    id: 4, type: MatchType.MIXED, participants: [julienRoux, emiliePetit, null, null], clubId: 101, levelMin: 6.0, levelMax: 7.5, matchDate: tomorrowString, matchTime: "20:00",
    description: "On cherche notre 4ème pour une partie sympa demain soir ! Qui est partant ?", status: 'PLANNED', duration: 90,
  },
  {
    id: 5, type: MatchType.OPEN, participants: [lucasGarcia, sophieMartin, leaDubois, julienRoux], clubId: 103, levelMin: 5.0, levelMax: 7.5, matchDate: dayAfterTomorrowString, matchTime: "19:00",
    description: "Match complet pour après-demain !", status: 'PLANNED', duration: 90,
  },
  {
    id: 6, type: MatchType.MEN, participants: [allPlayersGenerated[10], allPlayersGenerated[11], null, null], clubId: 105, levelMin: 5.0, levelMax: 6.5, matchDate: tomorrowString, matchTime: "19:30",
    description: "Match amical à Marseille, on cherche deux joueurs motivés.", status: 'PLANNED', duration: 90,
  },
  {
    id: 7, type: MatchType.OPEN, participants: [allPlayersGenerated[30], null, null, null], clubId: 106, levelMin: 7.0, levelMax: 8.0, matchDate: dayAfterTomorrowString, matchTime: "18:00",
    description: "Partie de haut niveau à Mougins, 3 places à prendre !", status: 'PLANNED', duration: 90,
  },
];


export const INITIAL_HISTORY: CompletedMatch[] = [
    {
       id: 3, type: MatchType.OPEN, participants: [superAdminProfile, julienRoux, emiliePetit, lucasGarcia], clubId: 101, levelMin: 6.0, levelMax: 7.5, matchDate: "2024-08-25", matchTime: "11:00",
       description: "Match test pour enregistrement de score.", status: 'PLANNED', result: 'VICTORY', score: '6-4 / 2-6 / 7-5', eloChange: 0.21, partner: julienRoux, opponents: [emiliePetit, lucasGarcia], duration: 90,
    },
    {
       id: 101, type: MatchType.MIXED, participants: [superAdminProfile, chloeDurand, emiliePetit, lucasGarcia], clubId: 101, levelMin: 6.0, levelMax: 7.0, matchDate: "2024-08-20", matchTime: "19:00",
       description: "Match amical mais intense !", result: "VICTORY", score: "6-4 / 7-6", eloChange: 0.18, partner: chloeDurand, opponents: [emiliePetit, lucasGarcia], status: 'PLANNED', duration: 90,
    },
    {
       id: 102, type: MatchType.OPEN, participants: [superAdminProfile, julienRoux, allPlayersGenerated[20], allPlayersGenerated[22]], clubId: 103, levelMin: 6.0, levelMax: 7.0, matchDate: "2024-08-18", matchTime: "20:30",
       description: "Super partie, très serrée", result: "DEFEAT", score: "6-2 / 4-6 / 5-7", eloChange: -0.07, partner: julienRoux, opponents: [allPlayersGenerated[20], allPlayersGenerated[22]], status: 'PLANNED', duration: 90,
    },
    {
       id: 103, type: MatchType.MEN, participants: [superAdminProfile, lucasGarcia, allPlayersGenerated[30], allPlayersGenerated[31]], clubId: 104, levelMin: 8.0, levelMax: 9.0, matchDate: "2024-08-15", matchTime: "18:00",
       description: "Tournoi interne", result: "VICTORY", score: "6-2 / 6-3", eloChange: 0.12, partner: lucasGarcia, opponents: [allPlayersGenerated[30], allPlayersGenerated[31]], status: 'PLANNED', duration: 90,
    }
];

export const INITIAL_AVAILABILITIES: PlayerAvailability[] = [
    { id: 1, player: superAdminProfile, type: AvailabilityType.DATE_RANGE, days: ["Monday", "Wednesday", "Friday"], startDate: "2024-09-01", endDate: "2024-10-31", startTime: "18:00", endTime: "21:00", clubIds: [104], levelMin: 7.0, levelMax: 9.5, },
    { id: 2, player: leaDubois, type: AvailabilityType.RECURRING, days: ["Tuesday", "Thursday"], startTime: "12:00", endTime: "14:00", clubIds: [102, 101], levelMin: 4.5, levelMax: 6.0, },
    { id: 3, player: sophieMartin, type: AvailabilityType.ONE_TIME, date: "2024-09-29", days: [], startTime: "19:00", endTime: "22:00", clubIds: [103], levelMin: 5.0, levelMax: 6.5, },
    { id: 4, player: julienRoux, type: AvailabilityType.RECURRING, days: ["Monday", "Tuesday", "Thursday"], startTime: "19:30", endTime: "22:00", clubIds: [101], levelMin: 6.5, levelMax: 7.5, },
    { id: 5, player: emiliePetit, type: AvailabilityType.DATE_RANGE, days: ["Wednesday", "Friday"], startDate: "2024-09-01", endDate: "2024-12-31", startTime: "18:30", endTime: "21:30", clubIds: [102, 103], levelMin: 5.5, levelMax: 7.0, },
    { id: 6, player: lucasGarcia, type: AvailabilityType.RECURRING, days: ["Monday", "Wednesday", "Friday", "Saturday", "Sunday"], startTime: "17:00", endTime: "20:00", clubIds: [101, 102], levelMin: 6.8, levelMax: 8.0, }
];

export const INITIAL_TOURNAMENTS: Tournament[] = [
    { id: 1, name: "Grand Tournoi P250 de la Rentrée", clubId: 101, startDate: "2024-09-20", endDate: "2024-09-22", categories: [ { id: 1, name: "P250 Hommes", maxTeams: 16, defaultMatchFormat: { setsToWin: 2, regularSetType: SetType.CLASSIC_6_GAMES_TB, finalSetType: FinalSetType.CLASSIC_6_GAMES_TB, pointSystem: PointSystem.GOLDEN_POINT }, teams: currentTournamentTeams, bracket: playedBracket, } ], format: TournamentFormat.DIRECT_ELIMINATION, registrations: currentTournamentRegistrations, imageUrl: "https://picsum.photos/seed/tournoi1/800/600", description: "Le tournoi de la rentrée pour se remettre en jambes ! Format poules puis tableau final. Ambiance garantie.", prize: "Lots pour les vainqueurs et finalistes", status: TournamentStatus.IN_PROGRESS, },
    { id: 2, name: "Open de Paris P500", clubId: 104, startDate: "2024-08-10", endDate: "2024-08-11", categories: [ { id: 3, name: "P500 Hommes", maxTeams: 8, teams: pastTournamentTeams, bracket: pastBracket, defaultMatchFormat: { setsToWin: 2, regularSetType: SetType.CLASSIC_6_GAMES_TB, finalSetType: FinalSetType.CLASSIC_6_GAMES_TB, pointSystem: PointSystem.ADVANTAGE } } ], format: TournamentFormat.DIRECT_ELIMINATION, registrations: pastTournamentRegistrations, imageUrl: "https://picsum.photos/seed/tournoi2/800/600", description: "Affrontez les meilleurs joueurs de la région dans ce tournoi à élimination directe.", prize: "1000€ de prize money", status: TournamentStatus.COMPLETED, },
    { id: 3, name: "Tournoi Multi-Chances P100", clubId: 103, startDate: "2024-10-12", endDate: "2024-10-12", categories: [ { id: 4, name: "P100 Mixte", maxTeams: 16, defaultMatchFormat: { setsToWin: 2, regularSetType: SetType.SHORT_4_GAMES_TB, finalSetType: FinalSetType.SUPER_TIEBREAK_10_POINTS, pointSystem: PointSystem.GOLDEN_POINT } }, { id: 5, name: "P100 Hommes", maxTeams: 16, defaultMatchFormat: { setsToWin: 2, regularSetType: SetType.SHORT_4_GAMES_TB, finalSetType: FinalSetType.SUPER_TIEBREAK_10_POINTS, pointSystem: PointSystem.GOLDEN_POINT } } ], format: TournamentFormat.MULTI_BRACKET, registrations: [ { id: 302, tournamentId: 3, categoryId: 5, player1Id: lucasGarcia.telegram, status: RegistrationStatus.LOOKING_FOR_PARTNER }, { id: 303, tournamentId: 3, categoryId: 4, player1Id: emiliePetit.telegram, player2Id: julienRoux.telegram, status: RegistrationStatus.CONFIRMED }, ], imageUrl: "https://picsum.photos/seed/tournoi3/800/600", description: "Un tournoi sur une journée avec des tableaux progressifs. Que vous gagniez ou perdiez, vous continuez à jouer !", status: TournamentStatus.PLANNED, },
    { id: 4, name: "Tournoi d'Automne P100", clubId: 101, startDate: "2024-09-15", endDate: "2024-09-15", categories: [{ id: 6, name: "P100 Hommes", maxTeams: 16, defaultMatchFormat: DEFAULT_MATCH_FORMAT }], format: TournamentFormat.DIRECT_ELIMINATION, registrations: [ { id: 401, tournamentId: 4, categoryId: 6, player1Id: 'PadelPartner', player2Id: 'julienroux', status: RegistrationStatus.CONFIRMED }, { id: 402, tournamentId: 4, categoryId: 6, player1Id: 'lucasgarcia', player2Id: 'jeamartin', status: RegistrationStatus.CONFIRMED }, ], imageUrl: "https://picsum.photos/seed/tournoi4/800/600", description: "Tournoi d'automne, places limitées.", prize: "Equipement Padel", status: TournamentStatus.PLANNED, },
    { id: 6, name: "Tournoi de l'Espoir P100", clubId: 102, organizerId: "lucasgarcia", startDate: "2024-11-01", endDate: "2024-11-02", categories: [{ id: 8, name: "P100 Hommes", maxTeams: 16, defaultMatchFormat: DEFAULT_MATCH_FORMAT }], format: TournamentFormat.DIRECT_ELIMINATION, registrations: [], imageUrl: "https://picsum.photos/seed/tournoi6/800/600", description: "Tournoi caritatif organisé par un membre de la communauté. Tous les bénéfices seront reversés à une association.", prize: "Le plaisir de jouer pour une bonne cause", status: TournamentStatus.PENDING_APPROVAL, },
];

export const INITIAL_NOTIFICATIONS: Notification[] = [
    { id: 1, type: NotificationType.FRIEND_REQUEST, message: "Léa Dubois vous a envoyé une demande d'ami.", date: new Date(Date.now() - 1000 * 60 * 30).toISOString(), read: false, actor: { name: "Léa Dubois", avatarUrl: leaDubois.avatarUrl }, link: { type: 'user', id: 'leadubois' }, },
    { id: 2, type: NotificationType.FRIEND_REQUEST, message: "Sophie Martin vous a envoyé une demande d'ami.", date: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(), read: false, actor: { name: "Sophie Martin", avatarUrl: sophieMartin.avatarUrl }, link: { type: 'user', id: 'sophiemartin' }, },
    { id: 5, type: NotificationType.MATCH_INVITE, message: "Alexandre Moreau vous a invité à un match à Casa Padel Paris.", date: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(), read: false, actor: { name: "Alexandre Moreau", avatarUrl: superAdminProfile.avatarUrl }, link: { type: 'match', id: 1 }, },
    { id: 3, type: NotificationType.CLUB_ANNOUNCEMENT, message: "Spirit Padel Lyon a publié une nouvelle annonce : 'Nouveau : Cours de cardio-padel...'", date: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(), read: true, actor: { name: "Spirit Padel Lyon", avatarUrl: INITIAL_CLUBS.find(c=>c.id===101)?.imageUrl }, link: { type: 'club', id: 101 }, },
    { id: 4, type: NotificationType.FRIEND_ACCEPTED, message: "Julien Roux a accepté votre demande d'ami.", date: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(), read: true, actor: { name: "Julien Roux", avatarUrl: julienRoux.avatarUrl }, link: { type: 'user', id: 'julienroux' }, },
];