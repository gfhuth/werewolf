import InputText from "../inputs/InputText";
import { GameContext } from "../../context/GameContext";
import { useCallback, useContext, useEffect, useState } from "react";
import { ScrollView, View, Text, IconButton, Select } from "native-base";
import { Ionicons } from "@expo/vector-icons";
import Collapsible from "../Collapsible";

type LocalMessage = {
    type: TypeChat;
    date: Date;
    author: string;
    content: string;
};

type ServerMessage = {
    game: number;
    type: number;
    username: string;
    content: string;
    date: number;
};

enum TypeChat {
    CHAT_VILLAGE,
    CHAT_WEREWOLF,
    CHAT_SPIRITISM,
}

export default function ChatComponent(): React.ReactElement {
    const gameContext = useContext(GameContext);

    const [messages, setMessages] = useState<Array<LocalMessage>>([]);
    const [message, setMessage] = useState("");
    const [chats, setChats] = useState<Array<TypeChat>>([]);
    const [selectedChat, setSelectedChat] = useState<TypeChat>(TypeChat.CHAT_VILLAGE);

    const sendMessage = (): void => {
        console.log(gameContext.jourNuit);
        gameContext.sendJsonMessage("CHAT_SENT", { date: new Date().getTime(), content: message, chat_type: 0 });
        setMessage("");
    };

    const infoChat = (data: { [key in TypeChat]: Array<ServerMessage> }): void => {
        // Il s'agit du récap des chats : l'info qu'on avait avant devient invalide
        const msgs: Array<LocalMessage> = [];
        const newChats = Object.keys(data) as unknown as TypeChat[];
        for (const key of chats) {
            msgs.push(
                ...data[key].map((msg) => ({
                    date: new Date(msg.date),
                    author: msg.username,
                    content: msg.content,
                    type: key
                }))
            );
        }
        setChats(newChats);
        setMessages(msgs);
    };

    const onMessage = useCallback((data: { date: number; author: string; chat_type: string; content: string }): void => {
        setMessages((currentMessages) => [
            ...currentMessages,
            {
                type: data.chat_type as unknown as TypeChat,
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
        <Collapsible name="Chat" isDefaultOpen={false}>
            <Select selectedValue={selectedChat as unknown as string} onValueChange={(value):void => setSelectedChat(value as unknown as TypeChat)}>
                {chats.map(chat => (
                    <Select.Item label={TypeChat[chat]} value={chat as unknown as string} />
                ))}
            </Select>
            <View>
                <ScrollView bg={"light.300"} p={2}>
                    {messages.length > 0 ? (
                        messages.map((msg, i) => (
                            <View key={i}>
                                <Text>
                                    {msg.author} : {msg.content}
                                </Text>
                            </View>
                        ))
                    ) : (
                        <Text>Aucun message</Text>
                    )}
                </ScrollView>
                <InputText value={message} onChange={setMessage} InputRightElement={<IconButton icon={<Ionicons name="send" />} onPress={sendMessage} />} />
            </View>
        </Collapsible>
    );
}
