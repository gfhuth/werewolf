import Background from "../components/Background";
import NavigationUI from "../components/NavigationUI";
import useWebSocket from 'react-use-websocket';
import { TextInput } from "react-native-gesture-handler";
import { ImageBackground, Button, StyleSheet, Text, View } from "react-native";
import React, { useState, useCallback, useEffect, useContext } from 'react';
import { UserContext } from "../context/UserContext";
import { WS } from "@env";

export default function Jeux(): React.ReactElement {
    const {
        sendMessage,
        sendJsonMessage,
        lastMessage,
        lastJsonMessage,
        readyState,
        getWebSocket
    } = useWebSocket(WS, {
        onOpen: () => console.log('opened'),
        //Will attempt to reconnect on all close events, such as server shutting down
        shouldReconnect: (closeEvent) => true
    });

    const context = useContext(UserContext);

    const [username, setMessage] = useState("");
    const request = {
        event: "AUTHENTICATION",
        data: {
            token: context.token
        }
    };

    const handleClickSendMessage = useCallback(() => sendJsonMessage(request), []);


    const styles = StyleSheet.create({
        TextInput: {
            height: 30,
            marginTop: 10,
            backgroundColor: "#fff",
            paddingLeft: 10
        },
        Button: {
            marginTop: 10
        }
    });
   

    return (
        <Background>
            <NavigationUI allowBack={false} />
            <TextInput placeholder="Login" aria-label="Login" onChangeText={setMessage} style={styles.TextInput} />
            <Button onPress={handleClickSendMessage} title="Login" />

            {lastMessage ? <span>Message: {lastMessage.data}</span> : null}
        </Background>
    );
}
