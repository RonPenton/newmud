/**
 * A player is a person who logs into the game to play. 
 * A player can have multiple characters (actors) in the game. 
 */
export type PlayerStorage = {
    id: number;
    uniqueName: string;
    passwordHash: string;
    created: string;
    lastLogin: string;
    suspendedUntil?: string;
    suspensionReason?: string;
}
