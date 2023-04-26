import { ChatType, Message } from "../../models/chatModel";
import { Role } from "../../models/gameModel";
import { VoteType } from "../../models/voteModel";

export type ClientToServerEvents = {
    CHAT_SENT: {
        date: number;
        chat_type: ChatType;
        content: string;
    };
    GET_ALL_INFO: {};
    USE_POWER_SPIRITISM: {
        target: string;
    };
    USE_POWER_CLAIRVOYANCE: {
        target: string;
    };
    USE_POWER_CONTAMINATION: {
        target: string;
    };
    USE_POWER: {
        // FIXME ça n'a aucun sens
        victimId: string;
    };
    VOTE_SENT: {
        vote_type: VoteType;
        vote: string;
    };
};

export type ServerToClientEvents = {
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
        message: string;
    };
    GAME_DELETED: {
        message: string;
    };
    GET_ALL_INFO_CHAT: {
        [key in ChatType]: Array<Message>;
    };
    GET_ALL_INFO_GAME: {
        status: number;
    };
    LIST_PLAYERS: {
        players: Array<{ user: string; alive: boolean }>;
    };
    NIGHT_STARTS: {};
    SET_POWER: {
        power: string;
    };
    SET_ROLE: {
        role: number;
        nbWerewolfs: number;
    };
    VOTE_RECEIVED: {
        vote_type: VoteType;
    };
    VOTE_VALID: {
        vote_type: VoteType;
        result: string;
    };
    USE_POWER_VALID: {
        // Empty
    };
};
