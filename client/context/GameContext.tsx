import { WS } from "@env";
import React, { useContext, useEffect, useState } from "react";
import useWebSocket from "react-use-websocket";
import Logger from "../utils/Logger";
import { useToast } from "native-base";
import { UserContext, mortVivantEnum } from "./UserContext";

export type EventHandlerCallback = (data: any) => void;

const LOGGER = new Logger("WEBSOCKET");

export enum jourOuNuit {
    jour = 0,
    nuit = 1,
}

export const GameContext = React.createContext<{
    jourNuit: jourOuNuit;
    setJourNuit:(enumJourNuit: jourOuNuit) => void;
    eventHandlers: { [key: string]: EventHandlerCallback };
    registerEventHandler: (event: string, callback: EventHandlerCallback) => void;
    sendJsonMessage: (event: string, data: any) => void;
    onMessage: (event: MessageEvent<any>) => void;
        }>({
            jourNuit: jourOuNuit.nuit,
            setJourNuit: () => null,
            eventHandlers: {},
            registerEventHandler: () => null,
            onMessage: () => null,
            sendJsonMessage: () => null
        });

export function GameProvider(props: { children: React.ReactNode; gameId: number }): React.ReactElement {
    const [eventHandlers, setEventHandlers] = useState<{ [key: string]: EventHandlerCallback }>({});
    const [jourNuit, setJourNuit] = useState<jourOuNuit>(jourOuNuit.nuit);
    const toast = useToast();
    const userContext = useContext(UserContext);

    const setMessageErreur = (messageErreur: string): void => {
        toast.show({
            title: "Erreur",
            description: messageErreur,
            placement: "top",
            variant: "subtle",
            borderColor: "red.700",
            borderLeftWidth: 3
        });
    };

    const onMessage = (event: MessageEvent<any>): void => {
        LOGGER.log(`Message received : ${JSON.stringify(event)}`);
        try {
            const data = JSON.parse(event.data);
            const eventName = data.event as string;
            const handler = eventHandlers[eventName];
            try {
                if (handler) handler(data.data);
            } catch (e) {
                LOGGER.log(`Handle threw an error on event ${data.event} : ${e}`);
            }
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
            // eslint-disable-next-line @typescript-eslint/no-use-before-define
            sendMessage("GET_ALL_INFO", {});
        },
        onMessage: onMessage,
        onError: onError,
        //Will attempt to reconnect on all close events, such as server shutting down
        shouldReconnect: () => true
    });

    const errorHandler = (data: { status: number; message: string }): void => {
        LOGGER.log(`Websocket error : ${data.message}`);
        setMessageErreur(data.message);
    };

    const registerEventHandler = (event: string, callback: EventHandlerCallback): void => {
        setEventHandlers((eh) => ({ ...eh, [event]: callback }));
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

    /**
     * Utilisé pour set vivant ou mort une personne
     * @param data array des informations
     */
    const listeDesInfosDesJoueur = (data: { players: Array<{ user: string; alive: boolean }> }): void => {
        LOGGER.log(`Liste des informations des joueurs`);

        const result = data.players.filter((info) => info.user == userContext.username);
        if (result[1].alive == true) 
            userContext.setEtatUser(mortVivantEnum.vivant);
        else 
            userContext.setEtatUser(mortVivantEnum.mort);
    };

    const setJour = (): void => {
        LOGGER.log(`Jour`);
        setJourNuit(jourOuNuit.jour);
    };
    const setNuit = (): void => {
        LOGGER.log(`Nuit`);
        setJourNuit(jourOuNuit.nuit);
    };

    useEffect(() => {
        registerEventHandler("CHAT_ERROR", errorHandler);
        registerEventHandler("VOTE_ERROR", errorHandler);
        registerEventHandler("GAME_DELETED", errorHandler);
        registerEventHandler("LIST_PLAYERS", listeDesInfosDesJoueur);
        registerEventHandler("NIGHT_STARTS", setNuit);
        registerEventHandler("DAY_STARTS", setJour);
    }, []);

    return <GameContext.Provider value={{ jourNuit, setJourNuit, eventHandlers, registerEventHandler, onMessage, sendJsonMessage: sendMessage }}>{props.children}</GameContext.Provider>;
}
