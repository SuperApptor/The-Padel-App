// Fix: Add Telegram WebApp types to the global Window interface to resolve TypeScript errors.
// Fix: Declare google.maps namespace to fix TypeScript errors related to Google Maps API.
// Fix: Moved google namespace into declare global to make it accessible across all modules.
declare global {
  namespace google {
    namespace maps {
      // Using 'any' for simplicity as we can't install @types/google.maps
      // Fix: Replace type aliases with class declarations for Google Maps API entities. This provides constructors for `new`, resolving errors related to `Map`, `Marker`, `Circle`, and `Autocomplete`.
      class Map {
        constructor(mapDiv: Element | null, opts?: any);
        [key: string]: any;
      }
      class Marker {
        constructor(opts?: any);
        [key:string]: any;
      }
      class Circle {
        constructor(opts?: any);
        [key:string]: any;
      }
      const SymbolPath: any;
      namespace places {
        class Autocomplete {
          constructor(inputElement: HTMLInputElement | null, opts?: any);
          [key:string]: any;
        }
      }
    }
  }

  interface Window {
    Telegram?: {
      WebApp?: {
        ready: () => void;
        themeParams: {
          [key: string]: string;
        };
        initDataUnsafe?: {
          user?: {
            // FIX: Add missing properties to the Telegram user object to resolve type errors in App.tsx.
            id?: number;
            first_name?: string;
            last_name?: string;
            username?: string;
            language_code?: string;
          };
        };
      };
    };
    google?: typeof google;
    initMap?: () => void;
  }
}

export enum Gender {
  MALE = "MALE",
  FEMALE = "FEMALE",
}

export enum Handedness {
  RIGHT = "RIGHT",
  LEFT = "LEFT",
}

export enum Side {
  LEFT = "LEFT",
  RIGHT = "RIGHT",
  BOTH = "BOTH",
}

export interface PlayerCircle {
  id: number;
  name: string;
  color: string; // e.g., 'blue', 'green', 'purple' for TailwindCSS theming
  members: string[]; // Array of friend telegram IDs
}

// Fix: Change FriendRequest `from` property to be a full PlayerProfile.
export interface FriendRequest {
  from: PlayerProfile;
  status: 'pending';
}

// FIX: Added 'PENDING' to OrganizerStatus to represent a pending organizer request. This resolves a type error in SuperAdminModal where 'PENDING' was being compared against a type that didn't include it.
export type OrganizerStatus = 'NONE' | 'PENDING' | 'APPROVED' | 'REJECTED';

export type MainTab = 'home' | 'tournaments' | 'social' | 'clubs';

export interface PlayerProfile {
  name: string;
  telegram: string;
  email: string;
  birthDate: string; // YYYY-MM-DD
  level: number;
  gender: Gender;
  handedness: Handedness;
  side: Side;
  favoriteClubIds: number[];
  avatarUrl: string;
  circles: PlayerCircle[];
  friends: string[];
  friendRequests: FriendRequest[];
  sentFriendRequests: string[];
  adminOfClubId?: number;
  isSuperAdmin?: boolean;
  organizerStatus?: OrganizerStatus;
  isOnboardingComplete?: boolean;
  city?: string;
  lat?: number;
  lng?: number;
  visitedSections?: { [key in MainTab]?: boolean };
}

export enum SetType {
    CLASSIC_6_GAMES_TB = 'CLASSIC_6_GAMES_TB', // 6 games, tie-break at 6-6
    SHORT_4_GAMES_TB = 'SHORT_4_GAMES_TB', // 4 games, tie-break at 4-4
    SHORT_4_GAMES_NO_TB = 'SHORT_4_GAMES_NO_TB', // 4 games, win at 4-0, 4-1, 4-2, 4-3
    PRO_SET_9_GAMES = 'PRO_SET_9_GAMES', // Special case for 1 set matches
}

export enum FinalSetType {
    CLASSIC_6_GAMES_TB = 'CLASSIC_6_GAMES_TB',
    SHORT_4_GAMES_TB = 'SHORT_4_GAMES_TB',
    SHORT_4_GAMES_NO_TB = 'SHORT_4_GAMES_NO_TB',
    SHORT_4_GAMES_2_GAMES_DIFF = 'SHORT_4_GAMES_2_GAMES_DIFF', // win by 2 games, no tie-break
    SUPER_TIEBREAK_10_POINTS = 'SUPER_TIEBREAK_10_POINTS',
}

export enum PointSystem {
    GOLDEN_POINT = 'GOLDEN_POINT',
    ADVANTAGE = 'ADVANTAGE',
}

export interface MatchFormatConfiguration {
    setsToWin: 1 | 2 | 3;
    regularSetType: SetType;
    finalSetType: FinalSetType;
    pointSystem: PointSystem;
}

export type MatchStatus = 'PLANNED' | 'CANCELED';

export enum MatchType {
    MEN = "MEN",
    WOMEN = "WOMEN",
    MIXED = "MIXED",
    OPEN = "OPEN",
}

export interface Match {
  id: number;
  type: MatchType;
  participants: (PlayerProfile | null)[];
  clubId: number;
  levelMin: number;
  levelMax: number;
  matchDate: string;
  matchTime: string;
  description: string;
  format?: MatchFormatConfiguration;
  circleId?: number; // Optional: ID of the circle this match is restricted to
  invitedPlayerIds?: string[]; // Optional: Array of telegram IDs of invited players
  status: MatchStatus;
  duration: number; // Duration in minutes
}

export type MatchResult = 'VICTORY' | 'DEFEAT' | null;

export interface Opponent {
    name: string;
    level: number;
}

export interface CompletedMatch extends Match {
    result: MatchResult;
    score: string | null;
    partner: Opponent | null;
    opponents: [Opponent, Opponent] | null;
    eloChange: number | null;
}

export enum AvailabilityType {
    RECURRING = 'RECURRING',
    DATE_RANGE = 'DATE_RANGE',
    ONE_TIME = 'ONE_TIME',
}

export interface PlayerAvailability {
  id: number;
  player: PlayerProfile;
  type: AvailabilityType;
  days: string[]; // For RECURRING and DATE_RANGE
  date?: string; // For ONE_TIME (YYYY-MM-DD)
  startDate?: string; // For DATE_RANGE (YYYY-MM-DD)
  endDate?: string; // For DATE_RANGE (YYYY-MM-DD)
  startTime: string;
  endTime: string;
  clubIds: number[];
  levelMin: number;
  levelMax: number;
}

export interface SuggestedPlayer {
  profile: PlayerProfile;
  availabilityId: number;
}

export type ToastType = 'success' | 'error';

export interface Toast {
    message: string;
    type: ToastType;
}

export interface Court {
    id: number;
    name: string;
    type: 'indoor' | 'outdoor';
}

export interface ClubAnnouncement {
    id: number;
    message: string;
    date: string; // ISO string
}

export interface OpeningHours {
    [day: string]: { open: string; close: string } | null; // e.g., { "Monday": { open: "09:00", close: "22:00" }, "Tuesday": null }
}

export interface Club {
    id: number;
    name: string;
    city: string;
    address: string;
    phone: string;
    email: string;
    imageUrl: string;
    courts: Court[];
    lat: number;
    lng: number;
    announcements: ClubAnnouncement[];
    openingHours: OpeningHours;
}

export enum TournamentFormat {
    DIRECT_ELIMINATION = 'DIRECT_ELIMINATION',
    POULES_THEN_ELIMINATION = 'POULES_THEN_ELIMINATION',
    MULTI_BRACKET = 'MULTI_BRACKET',
    PROGRESSIVE_MULTI_BRACKET = 'PROGRESSIVE_MULTI_BRACKET',
}

export interface BracketMatch {
    id: number;
    round: number;
    matchInRound: number;
    team1Id?: number;
    team2Id?: number;
    nextMatchId?: number;
    isWinnerBracket: boolean;
    score?: string;
    winnerTeamId?: number;
}

export interface TournamentTeam {
    id: number;
    name: string;
    player1Id: string;
    player2Id: string;
    seed?: number;
    level: number;
}

export interface TournamentCategory {
    id: number;
    name: string; // e.g., "P100 Hommes"
    maxTeams: number;
    defaultMatchFormat: MatchFormatConfiguration;
    finalMatchFormat?: MatchFormatConfiguration;
    teams?: TournamentTeam[];
    bracket?: BracketMatch[];
}

export enum RegistrationStatus {
    CONFIRMED = 'CONFIRMED', 
    PENDING_PARTNER_APPROVAL = 'PENDING_PARTNER_APPROVAL',
    LOOKING_FOR_PARTNER = 'LOOKING_FOR_PARTNER',
    PENDING_ADMIN_APPROVAL = 'PENDING_ADMIN_APPROVAL',
}

export interface TournamentRegistration {
    id: number;
    tournamentId: number;
    categoryId: number;
    player1Id: string; // telegram ID
    player2Id?: string; // telegram ID, optional for solo registration or invitations
    status: RegistrationStatus;
    invitationSentTo?: string; // telegram ID of the player invited by player1
}

export type PromotionCount = 0 | 2 | 4;

export interface BracketLink {
    fromBracketId: number;
    toBracketId: number;
    promotionCount: PromotionCount;
}

export enum TournamentStatus {
    PENDING_APPROVAL = 'PENDING_APPROVAL',
    PLANNED = 'PLANNED',
    IN_PROGRESS = 'IN_PROGRESS',
    COMPLETED = 'COMPLETED',
    CANCELED = 'CANCELED',
}

export interface Tournament {
    id: number;
    name: string;
    clubId: number;
    organizerId?: string; // telegram ID of the external organizer
    startDate: string; // YYYY-MM-DD
    endDate: string; // YYYY-MM-DD
    categories: TournamentCategory[];
    format: TournamentFormat;
    registrations: TournamentRegistration[];
    imageUrl: string;
    description: string;
    prize?: string;
    bracketLinks?: BracketLink[];
    status: TournamentStatus;
}

export enum NotificationType {
    FRIEND_REQUEST = 'FRIEND_REQUEST',
    MATCH_INVITE = 'MATCH_INVITE',
    TOURNAMENT_REGISTRATION = 'TOURNAMENT_REGISTRATION',
    CLUB_ANNOUNCEMENT = 'CLUB_ANNOUNCEMENT',
    FRIEND_ACCEPTED = 'FRIEND_ACCEPTED',
    MATCH_CONFIRMED = 'MATCH_CONFIRMED',
    TOURNAMENT_APPROVAL_REQUEST = 'TOURNAMENT_APPROVAL_REQUEST',
    ORGANIZER_STATUS_UPDATE = 'ORGANIZER_STATUS_UPDATE',
}

export interface Notification {
    id: number;
    type: NotificationType;
    message: string;
    date: string; // ISO String
    read: boolean;
    link?: { 
        type: 'user' | 'match' | 'tournament' | 'club';
        id: string | number;
    };
    actor?: {
        name: string;
        avatarUrl?: string;
    };
}
