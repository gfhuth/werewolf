import { ChatType, Message } from "../../models/chatModel";
import { VoteType } from "../../models/voteModel";

export type ClientToServerEvents = {
    CHAT_SENT: {
        date: number;
        chat_type: ChatType;
        content: string;
    };
    GET_ALL_INFO: {};
    UPDATE_CHAT_SPIRITSM: {
        dead_player: string;
    };
    USE_POWER_VOYANCE: {
        target: number;
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
    GAME_DELETED: {
        message: string;
    };
    GET_ALL_INFO_CHAT: {
        [key in ChatType]: Array<Message>;
    };
    GET_ALL_INFO_GAME: {
        status: number;
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
