import { Chat_type, Message } from "../../models/chatModel";
import { VoteType } from "../../models/voteModel";

export type EventType = {
    CHAT_RECEIVED: {
        author: number;
        date: number;
        chat_type: Chat_type;
        content: string;
    };
    CHAT_SENT: {
        date: number;
        chat_type: Chat_type;
        content: string;
    };
    GAME_DELETED: {
        message: string
    }
    GET_ALL_INFO: {}
    GET_ALL_INFO_CHAT: {
        [key in Chat_type]: Array<Message>
    }
    GET_ALL_INFO_GAME: {
        status: number
    }
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
    USE_POWER_VALID: {
        // Empty
    };
    VOTE_SENT: {
        vote_type: VoteType;
        vote: string;
    };
    VOTE_RECEIVED: {
        vote_type: VoteType;
    };
    VOTE_VALID: {
        vote_type: VoteType;
        result: string;
    };
};
export type EventName = keyof EventType;
