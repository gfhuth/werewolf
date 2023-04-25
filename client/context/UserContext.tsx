import React, { useState } from "react";

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
    const [token, setToken] = useState("");
    const [username, setUsername] = useState("");
    const [role, setRole] = useState("");
    const [pouvoir, setPouvoir] = useState("");

    return <UserContext.Provider value={{ token, setToken, username, setUsername }}>{props.children}</UserContext.Provider>;
}
