import InputText from "../inputs/InputText";
import { GameContext } from "../../context/GameContext";
import { useCallback, useContext, useEffect, useState } from "react";
import { ScrollView, View, Text, Button } from "native-base";

type Message = {
    date: Date;
    author: string;
    content: string;
};

type AllMessage = {
    game: number;
    type: number;
    username: string;
    content: string;
    date: number;
};
enum Chat_type {
    CHAT_VILLAGE,
    CHAT_WEREWOLF,
    CHAT_SPIRITISM,
}

export default function ChatComponent(): React.ReactElement {
    const gameContext = useContext(GameContext);

    const [messages, setMessages] = useState<Array<Message>>([]);
    const [message, setMessage] = useState("");

    const sendMessage = (): void => {
        console.log(gameContext.jourNuit);
        gameContext.sendJsonMessage("CHAT_SENT", { date: new Date().getTime(), content: message, chat_type: 0 });
    };

    const infoChat = (data: { [key in Chat_type]: Array<AllMessage>}): void => {
        for (const key of Object.keys(data) as unknown as Chat_type[]) {
            setMessages(data[key].map(dataInformation => ({
                date: new Date(dataInformation.date),
                author: dataInformation.username,
                content: dataInformation.content
            }))); 
        }
    };

    const onMessage = useCallback((data: { date: number; author: string; chat_type: string; content: string }): void => {
        setMessages((currentMessages) => [
            ...currentMessages,
            {
                date: new Date(data.date),
                author: data.author,
                content: data.content
            }
        ]);
    }, []);

    useEffect(() => {
        gameContext.registerEventHandler("CHAT_RECEIVED", onMessage);
        gameContext.registerEventHandler("GET_ALL_INFO_CHAT", infoChat);
    }, []);

    return (
        <View>
            <ScrollView>
                {messages.map((msg, i) => (
                    <View key={i}>
                        <Text>
                            {msg.author} : {msg.content}
                        </Text>
                    </View>
                ))}
            </ScrollView>
            <InputText value={message} onChange={setMessage} />
            <Button onPress={sendMessage}>Send</Button>
        </View>
    );
}
