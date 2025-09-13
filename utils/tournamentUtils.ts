import { TournamentTeam, BracketMatch, Tournament, TournamentCategory, MatchFormatConfiguration } from '../types';

// Helper to shuffle an array
const shuffleArray = <T>(array: T[]): T[] => {
    const newArray = [...array];
    for (let i = newArray.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
    }
    return newArray;
};


export const generateBracket = (
    confirmedTeams: TournamentTeam[],
    numSeeds: number
): { teams: TournamentTeam[]; bracket: BracketMatch[] } => {
    
    // 1. Sort all teams by level to determine seeds
    const sortedTeams = [...confirmedTeams].sort((a, b) => b.level - a.level);
    const seededTeams = sortedTeams.slice(0, numSeeds).map((team, i) => ({ ...team, seed: i + 1 }));
    const unseededTeams = shuffleArray(sortedTeams.slice(numSeeds));
    
    // 2. Determine bracket size (next power of 2)
    const numTeams = confirmedTeams.length;
    const bracketSize = Math.pow(2, Math.ceil(Math.log2(numTeams)));
    const numByes = bracketSize - numTeams;

    // 3. Prepare the final list of teams for the first round, placing seeds
    const finalTeams: (TournamentTeam | null)[] = new Array(bracketSize).fill(null);
    const finalTeamListWithSeeds = [...seededTeams, ...unseededTeams];
    
    // Standard seed placement order for a bracket of 16 (can be adapted for other sizes)
    const seedPlacementOrder: { [key: number]: number[] } = {
        8: [1, 8, 5, 4, 3, 6, 7, 2],
        16: [1, 16, 9, 8, 5, 12, 13, 4, 3, 14, 11, 6, 7, 10, 15, 2],
        32: [1, 32, 17, 16, 9, 24, 25, 8, 5, 28, 21, 12, 13, 20, 29, 4, 3, 30, 19, 14, 11, 22, 27, 6, 7, 26, 23, 10, 15, 18, 31, 2]
    };

    const placementOrder = seedPlacementOrder[bracketSize] || Array.from({length: bracketSize}, (_, i) => i + 1);

    const seededPlacements: (TournamentTeam | null)[] = new Array(bracketSize).fill(null);
    seededTeams.forEach(team => {
        const position = placementOrder.indexOf(team.seed!);
        if (position !== -1) {
            seededPlacements[position] = team;
        }
    });

    // Fill remaining spots with unseeded teams
    let unseededIndex = 0;
    for (let i = 0; i < bracketSize; i++) {
        if (seededPlacements[i] === null) {
            if (unseededIndex < unseededTeams.length) {
                seededPlacements[i] = unseededTeams[unseededIndex];
                unseededIndex++;
            }
        }
    }

    // 4. Create the bracket structure
    const bracket: BracketMatch[] = [];
    let matchIdCounter = 1;
    let matchesInCurrentRound = bracketSize / 2;
    let round = 1;

    // Round 1
    for (let i = 0; i < matchesInCurrentRound; i++) {
        const team1 = seededPlacements[i*2];
        const team2 = seededPlacements[i*2 + 1];
        bracket.push({
            id: matchIdCounter++,
            round: 1,
            matchInRound: i + 1,
            team1Id: team1?.id,
            team2Id: team2?.id,
            isWinnerBracket: true,
        });
    }

    // Subsequent rounds
    while (matchesInCurrentRound >= 1) {
        round++;
        const matchesInPreviousRound = matchesInCurrentRound * 2;
        matchesInCurrentRound /= 2;
        
        if(matchesInCurrentRound < 1) break;

        const previousRoundStartId = matchIdCounter - matchesInPreviousRound;
        for (let i = 0; i < matchesInCurrentRound; i++) {
            const match1 = bracket.find(m => m.id === previousRoundStartId + i*2);
            const match2 = bracket.find(m => m.id === previousRoundStartId + i*2 + 1);
            
            const newMatch: BracketMatch = {
                 id: matchIdCounter++,
                 round,
                 matchInRound: i + 1,
                 isWinnerBracket: true,
            };

            if (match1) match1.nextMatchId = newMatch.id;
            if (match2) match2.nextMatchId = newMatch.id;

            bracket.push(newMatch);
        }
    }
    
    // Assign byes automatically
    const byesToAssign = numByes;
    const teamsWithByes = seededTeams.slice(0, byesToAssign);
    
    teamsWithByes.forEach(team => {
        const firstRoundMatch = bracket.find(m => m.round === 1 && (m.team1Id === team.id || m.team2Id === team.id));
        if (firstRoundMatch) {
            firstRoundMatch.winnerTeamId = team.id;
            firstRoundMatch.score = 'BYE';
            if (firstRoundMatch.nextMatchId) {
                const nextMatch = bracket.find(m => m.id === firstRoundMatch.nextMatchId);
                if (nextMatch) {
                    if (firstRoundMatch.matchInRound % 2 !== 0) { // First match of a pair
                        nextMatch.team1Id = team.id;
                    } else { // Second match
                        nextMatch.team2Id = team.id;
                    }
                }
            }
        }
    });


    return { teams: finalTeamListWithSeeds, bracket };
};

export const getTournamentStatus = (tournament: Tournament): 'current' | 'upcoming' | 'past' => {
    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    
    const startDate = new Date(tournament.startDate);
    const endDate = new Date(tournament.endDate);
    endDate.setHours(23, 59, 59, 999); // Ensure the whole end day is included

    if (endDate < startOfToday) {
        return 'past';
    }
    if (startDate > now) {
        return 'upcoming';
    }
    return 'current';
};

export const getMatchFormatForRound = (
    category: TournamentCategory,
    match: BracketMatch
): MatchFormatConfiguration => {
    if (category.maxTeams <= 0) {
        return category.defaultMatchFormat;
    }
    // Calculate the maximum number of rounds for a direct elimination bracket
    const maxRounds = Math.ceil(Math.log2(category.maxTeams));

    // Check if the current match is in the final round and if a specific final format exists
    if (match.round === maxRounds && category.finalMatchFormat) {
        return category.finalMatchFormat;
    }
    
    // Fallback to the default format for all other rounds
    return category.defaultMatchFormat;
};
