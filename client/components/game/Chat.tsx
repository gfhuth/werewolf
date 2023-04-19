import InputText from "../inputs/InputText";
import { GameContext } from "../../context/GameContext";
import { useCallback, useContext, useEffect, useState } from "react";
import { ScrollView, View, Text, Button } from "native-base";

type Message = {
    date: Date;
    author: string;
    content: string;
};

export default function ChatComponent(): React.ReactElement {
    const gameContext = useContext(GameContext);

    const [messages, setMessages] = useState<Array<Message>>([]);
    const [message, setMessage] = useState("");

    const sendMessage = (): void => {
        gameContext.sendJsonMessage("CHAT_SENT", { date: new Date().getTime(), content: message, chat_type: 0 });
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
