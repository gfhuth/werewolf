import React, { useContext, useEffect, useState } from "react";
import { GameContext } from "./GameContext";
import Logger from "../utils/Logger";

const LOGGER = new Logger("WEBSOCKET");


export const UserContext = React.createContext<{
    token: string;
    setToken:(token: string) => void;
    username: string;
    role :string;
    pouvoir: string;
    setUsername: (username: string) => void;
    setRole: (role: string) => void;
    setPouvoir: (pouvoir: string) => void;
        }>({
            role: "",
            pouvoir: "",
            token: "",
            setToken: () => null,
            username: "",
            setUsername: () => null,
            setRole: () => null,
            setPouvoir: () => null
        });

export function UserProvider(props: { children: React.ReactNode }): React.ReactElement {
    const gameContext = useContext(GameContext);
    
    const [token, setToken] = useState("");
    const [username, setUsername] = useState("");
    const [role, setRole] = useState("");
    const [pouvoir, setPouvoir] = useState("");


    const onRole = (data: { role: string; nbWerewolfs: number }): void => {
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

    return <UserContext.Provider value={{ role, pouvoir, token, setToken, username, setUsername, setRole, setPouvoir }}>{props.children}</UserContext.Provider>;
}
