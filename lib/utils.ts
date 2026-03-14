import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { Bracket, Group, KnockoutRound, Match, Participant } from "@/lib/types";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

function shuffleArray(array: any[]) {
  const newArray = [...array];
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
  }
  return newArray;
}

function getRoundName(numParticipants: number): string {
    if (numParticipants > 16) return `Round of ${numParticipants}`;
    if (numParticipants > 8) return 'Ottavi di Finale';
    if (numParticipants > 4) return 'Quarti di Finale';
    if (numParticipants > 2) return 'Semifinale';
    if (numParticipants === 2) return 'Finale';
    return 'Tabellone';
}

function generateKnockoutRounds(players: Participant[]): KnockoutRound[] {
    const rounds: KnockoutRound[] = [];
    let currentPlayers = [...players];

    let numParticipants = currentPlayers.length;
    if (numParticipants <= 0) return [];
    
    // Adjust to the next power of two
    const nextPowerOfTwo = Math.pow(2, Math.ceil(Math.log2(numParticipants)));
    const numByes = nextPowerOfTwo - numParticipants;

    const byes: Participant[] = Array(numByes).fill({ username: 'BYE' });
    
    // Intersperse BYEs with real players for the first round
    // This is a simple distribution, could be made more sophisticated
    let roundPlayers = [...currentPlayers, ...byes];
    if(roundPlayers.length !== nextPowerOfTwo) {
        //If we have an odd number of players, we might have an issue
        //For now, let's patch it
        const missingPlayers = nextPowerOfTwo - roundPlayers.length;
        for(let i=0; i<missingPlayers; i++) {
            roundPlayers.push({ username: 'BYE' });
        }
    }
    
    roundPlayers = shuffleArray(roundPlayers);

    let roundCount = 1;
    while (roundPlayers.length >= 2) {
        const roundName = getRoundName(roundPlayers.length);
        const matches: Match[] = [];
        
        for (let i = 0; i < roundPlayers.length; i += 2) {
            matches.push({
                player1: roundPlayers[i],
                player2: roundPlayers[i + 1],
            });
        }
        
        rounds.push({ name: roundName, matches: matches });

        // Prepare for next round
        const nextRoundPlayers: Participant[] = matches.map((match, i) => ({
             username: `Vincitore ${roundName === 'Finale' ? '' : 'Match'} ${i + 1}`
        }));
        
        roundPlayers = nextRoundPlayers;
        roundCount++;
    }

    return rounds;
}


export function generateBracket(participants: Participant[], settings: any): Bracket | null {
    if (!participants || participants.length < 4) {
        return null;
    }

    let groups: Group[] | null = null;
    let knockoutPlayers: Participant[] = [];

    // CASE 1: Group Stage enabled
    if (settings && settings.groups && settings.numGroups > 0) {
        const numGroups = settings.numGroups;
        const generatedGroups: Group[] = Array.from({ length: numGroups }, (_, i) => ({
            name: `Girone ${String.fromCharCode(65 + i)}`,
            participants: [],
        }));
        
        const shuffledParticipants = shuffleArray(participants);
        shuffledParticipants.forEach((participant: Participant, index: number) => {
            generatedGroups[index % numGroups].participants.push(participant);
        });
        groups = generatedGroups;

        // Generate placeholder qualifiers for the knockout preview
        const numQualifiers = settings.numQualifiers > 0 ? settings.numQualifiers : 1; // Default to 1 if not set
        for (let i = 0; i < numGroups; i++) {
            for (let j = 0; j < numQualifiers; j++) {
                // Ensure we don't create more qualifiers than participants in a group
                if (j < groups[i].participants.length) {
                    knockoutPlayers.push({ username: `${j + 1}° Girone ${String.fromCharCode(65 + i)}` });
                }
            }
        }
    } else {
        // CASE 2: Simple Knockout, all participants go to the bracket
        knockoutPlayers = shuffleArray(participants);
    }

    const knockoutRounds = generateKnockoutRounds(knockoutPlayers);
    
    return {
        groups: groups,
        knockout: {
            rounds: knockoutRounds,
        }
    };
}
