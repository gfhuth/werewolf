import { ChatType } from "../../models/chatModel";
import { Role } from "../../models/gameModel";
import { VoteType } from "../../models/voteModel";

export type ClientToServerEvents = {
    CHAT_SENT: {
        date: number;
        chat_type: ChatType;
        content: string;
    };
    GET_ALL_INFO: {};
    RESPONSE_RATIFICATION: {
        vote_type: VoteType;
        playerVoted: string;
        ratification: boolean;
    };
    USE_POWER_SPIRITISM: {
        target: string;
    };
    USE_POWER_CLAIRVOYANCE: {
        target: string;
    };
    USE_POWER_CONTAMINATION: {
        target: string;
    };
    VOTE_SENT: {
        vote_type: VoteType;
        playerVoted: string;
    };
};

export type ServerToClientEvents = {
    ASK_RATIFICATION: {
        vote_type: VoteType;
        playerVoted: string;
    };
    CHAT_RECEIVED: {
        author: string;
        date: number;
        chat_type: ChatType;
        content: string;
    };
    CLAIRVOYANCE_RESPONSE: {
        role: Role;
        power: string;
    };
    DAY_STARTS: {};
    END_GAME: {
        winningRole: Role;
    };
    GAME_DELETED: {
        message: string;
    };
    GET_ALL_INFO_CHAT: {
        [key in ChatType]?: Array<{
            author: string;
            date: number;
            chat_type: ChatType;
            content: string;
        }>;
    };
    GET_ALL_INFO_GAME: {
        status: number;
    };
    GET_ALL_INFO_PLAYER: {
        role: Role;
        power: string;
    };
    GET_ALL_INFO_PLAYERS_LIST: {
        players: Array<{ name: string, alive: boolean }>;
    };
    GET_ALL_INFO_VOTE: {
        [key: string]: { nbValidation: number; nbInvalidation: number };
    };
    LIST_PLAYERS: {
        players: Array<{ user: string; alive: boolean }>;
    };
    NIGHT_STARTS: {};
    SET_POWER: {
        power: string;
    };
    SET_ROLE: {
        role: Role;
        nbWerewolfs: number;
    };
    UPDATE_PROPOSITION: {
        vote_type: VoteType;
        playerVoted: string;
        nbValidation: number;
        nbInvalidation: number;
    };
    USE_POWER_VALID: {
        // Empty
    };
    VOTE_INVALID: {
        vote_type: VoteType;
        playerVoted: string;
    };
    VOTE_VALID: {
        vote_type: VoteType;
        playerVoted: string;
    };
};
