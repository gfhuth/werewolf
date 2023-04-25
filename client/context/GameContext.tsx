import { WS } from "@env";
import React, { useState } from "react";
import useWebSocket, { SendMessage } from "react-use-websocket";
import { SendJsonMessage } from "react-use-websocket/dist/lib/types";
import Logger from "../utils/Logger";
import { useToast } from "native-base";

export type EventHandlerCallback = (data: any) => void;

const LOGGER = new Logger("WEBSOCKET");

export const GameContext = React.createContext<{
    eventHandlers: { [key: string]: EventHandlerCallback };
    registerEventHandler:(event: string, callback: EventHandlerCallback) => void;
    sendJsonMessage: (event: string, data: any) => void;
    onMessage: (event: MessageEvent<any>) => void;
        }>({
            eventHandlers: {},
            registerEventHandler: () => null,
            onMessage: () => null,
            sendJsonMessage: () => null
        });

export function GameProvider(props: { children: React.ReactNode; gameId: number }): React.ReactElement {
    const [eventHandlers, setEventHandlers] = useState<{ [key: string]: EventHandlerCallback }>({});
    const toast = useToast();

    const setMessageErreur = (messageErreur: string): void => {
        toast.show({
            title: "Erreur",
            description: messageErreur,
            variant: "subtle",
            borderColor: "red.700",
            borderLeftWidth: 3
        });
    };

    const onMessage = (event: MessageEvent<any>): void => {
        LOGGER.log(`Message received : ${JSON.stringify(event)}`);
        try {
            const data = JSON.parse(event.data);
            LOGGER.log(`Message received data : ${data.event}`);

            if (data.event === "CHAT_ERROR") 
                setMessageErreur(data.message);
            

            const eventName = data.event as string;
            const handler = eventHandlers[eventName];
            if (handler) handler(data.data);
        } catch (e) {
            LOGGER.log(`Failed to handle message : ${event.data} (${e})`);
        }
    };

    const onError = (event: Event): void => {
        LOGGER.log(`Error : ${event}`);
    };

    const { sendJsonMessage } = useWebSocket(WS, {
        onOpen: () => {
            LOGGER.log("Connection opened");
        },
        onMessage: onMessage,
        onError: onError,
        //Will attempt to reconnect on all close events, such as server shutting down
        shouldReconnect: () => true
    });

    const registerEventHandler = (event: string, callback: EventHandlerCallback): void => {
        eventHandlers[event] = callback;
        setEventHandlers({ ...eventHandlers });
    };

    const sendMessage = (event: string, data: any): void => {
        const result = {
            game_id: props.gameId,
            event: event,
            data: data
        };
        console.log(`Sending ${JSON.stringify(result)} ...`);
        sendJsonMessage(result);
    };

    return <GameContext.Provider value={{ eventHandlers, registerEventHandler, onMessage, sendJsonMessage: sendMessage }}>{props.children}</GameContext.Provider>;
}
