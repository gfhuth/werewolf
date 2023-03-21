import React, { useState } from "react";

export const SettingsContext = React.createContext<{
    token: string;
    setToken:(token: string) => void;
    username: string;
    setUsername: (username: string) => void;
        }>({
            token: "",
            setToken: () => null,
            username: "",
            setUsername: () => null
        });

export function SettingsProvider(props: { children: React.ReactNode }) {
    const [token, setToken] = useState("");
    const [username, setUsername] = useState("");

    return <SettingsContext.Provider value={{ token, setToken, username, setUsername }}>{props.children}</SettingsContext.Provider>;
}
