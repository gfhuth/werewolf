import { WS } from "@env";
import React, { useEffect, useState } from "react";
import useWebSocket from "react-use-websocket";
import Logger from "../utils/Logger";
import { useToast } from "native-base";

export type EventHandlerCallback = (data: any) => void;

const LOGGER = new Logger("WEBSOCKET");

export enum jourOuNuit {
    jour = 0,
    nuit = 1,
}

export enum Role {
    HUMAN = "HUMAN",
    WEREWOLF = "WEREWOLF",
}
export enum Power {
    NONE,
    CONTAMINATION = "CONTAMINATION",
    SPIRITISM = "SPIRITISM",
    CLAIRVOYANCE = "CLAIRVOYANCE",
    INSOMNIA = "INSOMNIA"
}

type SelfInfos = {
    alive: boolean;
    role: Role;
    power: Power;
};

export const GameContext = React.createContext<{
    jourNuit: jourOuNuit;
    setJourNuit:(enumJourNuit: jourOuNuit) => void;
    eventHandlers: { [key: string]: EventHandlerCallback };
    registerEventHandler: (event: string, callback: EventHandlerCallback) => void;
    sendJsonMessage: (event: string, data: any) => void;
    onMessage: (event: MessageEvent<any>) => void;
    me: SelfInfos & {
        setIsAlive: (isAlive: boolean) => void;
        setRole: (role: Role) => void;
        setPower: (power: Power) => void;
    };
        }>({
            jourNuit: jourOuNuit.nuit,
            setJourNuit: () => null,
            eventHandlers: {},
            registerEventHandler: () => null,
            onMessage: () => null,
            sendJsonMessage: () => null,
            me: {
                alive: true,
                role: Role.HUMAN,
                power: Power.NONE,
                setIsAlive: () => null,
                setRole: () => null,
                setPower: () => null
            }
        });

export function GameProvider(props: { children: React.ReactNode; gameId: number }): React.ReactElement {
    const toast = useToast();

    const [eventHandlers, setEventHandlers] = useState<{ [key: string]: EventHandlerCallback }>({});
    const [jourNuit, setJourNuit] = useState<jourOuNuit>(jourOuNuit.nuit);
    const [myInfos, setMyInfos] = useState<SelfInfos>({ alive: true, role: Role.HUMAN, power: Power.NONE });

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

    // User infos

    const setIsAlive = (isAlive: boolean): void => {
        setMyInfos({ ...myInfos, alive: isAlive });
    };
    const setRole = (role: Role): void => {
        setMyInfos({ ...myInfos, role: role });
    };
    const setPower = (power: Power): void => {
        setMyInfos({ ...myInfos, power: power });
    };

    const onRole = (data: { role: Role; nbWerewolfs: number }): void => {
        LOGGER.log(`Nouveau role: ${data.role}`);
        setRole(data.role);
    };
    const onPouvoir = (data: { power: Power }): void => {
        LOGGER.log(`Nouveau pouvoir: ${data.power}`);
        setPower(data.power);
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
        registerEventHandler("NIGHT_STARTS", setNuit);
        registerEventHandler("DAY_STARTS", setJour);
        registerEventHandler("SET_ROLE", onRole);
        registerEventHandler("SET_POWER", onPouvoir);
    }, []);

    return (
        <GameContext.Provider value={{ jourNuit, setJourNuit, eventHandlers, registerEventHandler, onMessage, sendJsonMessage: sendMessage, me: { ...myInfos, setIsAlive, setPower, setRole } }}>
            {props.children}
        </GameContext.Provider>
    );
}
