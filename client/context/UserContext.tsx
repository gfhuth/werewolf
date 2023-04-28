import React, { useContext, useEffect, useState } from "react";
import { GameContext } from "./GameContext";
import Logger from "../utils/Logger";

const LOGGER = new Logger("WEBSOCKET");

export enum mortVivantEnum {
    vivant = 0,
    mort = 1
}

export enum Role {
    VILLAGER = 0,
    WEREWOLF = 1,
}

export const UserContext = React.createContext<{
    token: string;
    etatUser: mortVivantEnum;
    setToken:(token: string) => void;
    username: string;
    role :Role;
    pouvoir: string;
    setUsername: (username: string) => void;
    setRole: (role: string) => void;
    setPouvoir: (pouvoir: string) => void;
    setEtatUser: (etat: mortVivantEnum) => void;
        }>({
            role: Role.VILLAGER,
            etatUser: mortVivantEnum.vivant, //Vivant ou mort
            pouvoir: "",
            token: "",
            setToken: () => null,
            username: "",
            setUsername: () => null,
            setRole: () => null,
            setPouvoir: () => null,
            setEtatUser: () => null
        });

export function UserProvider(props: { children: React.ReactNode }): React.ReactElement {
    const gameContext = useContext(GameContext);
    
    const [token, setToken] = useState("");
    const [username, setUsername] = useState("");
    const [role, setRole] = useState<Role>(Role.VILLAGER);
    const [pouvoir, setPouvoir] = useState("");
    const [etatUser, setEtatUser] = useState<mortVivantEnum>(mortVivantEnum.vivant);


    const onRole = (data: { role: Role; nbWerewolfs: number }): void => {
        LOGGER.log(`Nouveau role: ${data.role}`);
        setRole(data.role);
    };
    const onPouvoir = (data: { power: string}): void => {
        LOGGER.log(`Nouveau pouvoir: ${data.power}`);
        setPouvoir(data.power);
    };

    useEffect(() => {
        gameContext.registerEventHandler("SET_ROLE", onRole);
        gameContext.registerEventHandler("SET_POWER", onPouvoir);
    }, []);

    return <UserContext.Provider value={{ etatUser, role, pouvoir, token, setToken, username, setUsername, setRole, setPouvoir, setEtatUser }}>{props.children}</UserContext.Provider>;
}
