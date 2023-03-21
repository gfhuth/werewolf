import React, { useState } from "react";

export const UserContext = React.createContext<{
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

export function UserProvider(props: { children: React.ReactNode }) {
    const [token, setToken] = useState("");
    const [username, setUsername] = useState("");

    return <UserContext.Provider value={{ token, setToken, username, setUsername }}>{props.children}</UserContext.Provider>;
}
