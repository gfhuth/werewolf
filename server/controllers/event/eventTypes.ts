import { Chat_type, Message } from "../../models/chatModel";
import { Vote_type } from "../../models/voteModel";

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
    GET_ALL_INFO_CHAT: {
        [key in Chat_type]: Array<Message>
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
        vote_type: Vote_type;
        vote: string;
    };
    VOTE_RECEIVED: {
        vote_type: Vote_type;
    };
    VOTE_VALID: {
        vote_type: Vote_type;
        result: string;
    };
};
export type EventName = keyof EventType;
