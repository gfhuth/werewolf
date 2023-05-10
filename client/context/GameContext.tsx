import { WS } from "@env";
import React, { useContext, useEffect, useState } from "react";
import useWebSocket from "react-use-websocket";
import Logger from "../utils/Logger";
import { useToast } from "native-base";
import { UserContext } from "./UserContext";

export type EventHandlerCallback = (data: any) => void;

const LOGGER = new Logger("WEBSOCKET");

export enum GamePhase {
    DAY,
    NIGHT,
}

export enum Role {
    HUMAN = "HUMAN",
    WEREWOLF = "WEREWOLF",
}
export enum Power {
    NO_POWER = "NO_POWER",
    NONE = "",
    CONTAMINATION = "CONTAMINATION",
    SPIRITISM = "SPIRITISM",
    CLAIRVOYANCE = "CLAIRVOYANCE",
    INSOMNIA = "INSOMNIA",
}

type SelfInfos = {
    alive: boolean;
    role: Role;
    power: Power;
};

export type Player = {
    username: string;
    roles: Array<Role>;
    powers: Array<Power>;
    alive: boolean;
};

export const GameContext = React.createContext<{
    eventHandlers: { [key: string]: EventHandlerCallback };
    registerEventHandler:(event: string, callback: EventHandlerCallback) => void;
    sendJsonMessage: (event: string, data: any) => void;
    onMessage: (event: MessageEvent<any>) => void;
    phase: GamePhase;
    setPhase: (phase: GamePhase) => void;
    me: SelfInfos & {
        setIsAlive: (isAlive: boolean) => void;
        setRole: (role: Role) => void;
        setPower: (power: Power) => void;
    };
    players: Array<Player>;
        }>({
            phase: GamePhase.NIGHT,
            setPhase: () => null,
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
            },
            players: []
        });

export function GameProvider(props: { children: React.ReactNode; gameId: number }): React.ReactElement {
    const toast = useToast();
    const userContext = useContext(UserContext);

    const [eventHandlers, setEventHandlers] = useState<{ [key: string]: EventHandlerCallback }>({});
    const [phase, setPhase] = useState<GamePhase>(GamePhase.NIGHT);
    const [myInfos, setMyInfos] = useState<SelfInfos>({ alive: true, role: Role.HUMAN, power: Power.NONE });
    const [players, setPlayers] = useState<Array<Player>>([
        {
            alive: true,
            roles: [],
            powers: [],
            username: "bat"
        }
    ]);

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

    const onPlayerInfo = (data: { role: Role; power: Power }): void => {
        const newRole = data.role;
        const newPower = data.power === Power.NO_POWER ? Power.NONE : data.power;
        setRole(newRole);
        setPower(newPower);
        // Update players list
        setPlayers((pl) => {
            const me = pl.find((p) => p.username === userContext.username);
            return [
                ...pl.filter((p) => p.username !== userContext.username),
                {
                    ...me,
                    roles: newRole ? [newRole] : [],
                    powers: newPower ? [newPower] : []
                }
            ] as Player[];
        });
    };

    const onDayStart = (): void => {
        LOGGER.log(`Day started`);
        setPhase(GamePhase.DAY);
    };
    const onNightStart = (): void => {
        LOGGER.log(`Night started`);
        setPhase(GamePhase.NIGHT);
    };

    const onPlayerListUpdate = (data: { players: Array<{ user: string; alive: boolean; role: Role; power: Power }> }): void => {
        // Update myself
        const me = data.players.find((player) => player.user === userContext.username);
        if (!me) {
            LOGGER.log("User not in players list");
            return;
        }
        setIsAlive(me.alive);
        if (me.power === Power.NO_POWER) me.power = Power.NONE;
        setRole(me.role);
        setPower(me.power);

        // Players
        setPlayers(
            data.players.map((player) => ({
                username: player.user,
                roles: [player.role].filter(Boolean),
                powers: [player.power].filter(Boolean),
                alive: player.alive
            }))
        );
    };

    useEffect(() => {
        registerEventHandler("CHAT_ERROR", errorHandler);
        registerEventHandler("VOTE_ERROR", errorHandler);
        registerEventHandler("GAME_DELETED", errorHandler);
        registerEventHandler("NIGHT_STARTS", onNightStart);
        registerEventHandler("DAY_STARTS", onDayStart);
        registerEventHandler("LIST_PLAYERS", onPlayerListUpdate);
    }, []);

    return (
        <GameContext.Provider
            value={{ phase: phase, setPhase: setPhase, eventHandlers, registerEventHandler, onMessage, sendJsonMessage: sendMessage, me: { ...myInfos, setIsAlive, setPower, setRole }, players }}
        >
            {props.children}
        </GameContext.Provider>
    );
}
