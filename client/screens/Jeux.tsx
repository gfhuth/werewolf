import Background from "../components/Background";
import NavigationUI from "../components/NavigationUI";
import useWebSocket from "react-use-websocket";
import { TextInput } from "react-native-gesture-handler";
import { ImageBackground, Button, StyleSheet, Text, View } from "react-native";
import React, { useState, useCallback, useEffect, useContext } from "react";
import { UserContext } from "../context/UserContext";
import { GameContext } from "../context/GameContext";
import ChatComponent from "../components/game/Chat";
import Collapsible from "../components/Collapsible";

export default function Jeux(): React.ReactElement {
    const gameContext = useContext(GameContext);

    const { token } = useContext(UserContext);

    useEffect(() => {
        gameContext.sendJsonMessage("AUTHENTICATION", { token: token });
    }, []);

    return (
        <Background>
            <NavigationUI allowBack />

            <Collapsible name="Chat" isDefaultOpen={false}>
                <ChatComponent />
            </Collapsible>
        </Background>
    );
}
