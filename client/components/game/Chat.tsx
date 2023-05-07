import InputText from "../inputs/InputText";
import { GameContext } from "../../context/GameContext";
import { useCallback, useContext, useEffect, useState } from "react";
import { ScrollView, View, Text, IconButton, Select } from "native-base";
import { Ionicons } from "@expo/vector-icons";
import Collapsible from "../Collapsible";

type LocalMessage = {
    type: ChatType;
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

enum ChatType {
    CHAT_VILLAGE = "CHAT_VILLAGE",
    CHAT_WEREWOLF = "CHAT_WEREWOLF",
    CHAT_SPIRITISM = "CHAT_SPIRITISM",
}
const ChatName: { [key in ChatType]: string } = {
    CHAT_VILLAGE: "Village",
    CHAT_WEREWOLF: "Loups",
    CHAT_SPIRITISM: "Spiritisme"
};

export default function ChatComponent(): React.ReactElement {
    const gameContext = useContext(GameContext);

    const [messages, setMessages] = useState<Array<LocalMessage>>([]);
    const [message, setMessage] = useState("");
    const [chats, setChats] = useState<Array<ChatType>>([]);
    const [selectedChat, setSelectedChat] = useState<ChatType>(ChatType.CHAT_VILLAGE);

    const sendMessage = (): void => {
        console.log(gameContext.jourNuit);
        gameContext.sendJsonMessage("CHAT_SENT", { date: new Date().getTime(), content: message, chat_type: selectedChat });
        setMessage("");
    };

    const infoChat = (data: { [key in ChatType]: Array<ServerMessage> }): void => {
        // Il s'agit du récap des chats : l'info qu'on avait avant devient invalide
        const msgs: Array<LocalMessage> = [];
        const newChats = Object.keys(data) as unknown as ChatType[];
        for (const key of newChats) {
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
        setSelectedChat(newChats[0]);
        setMessages(msgs);
    };

    const onMessage = useCallback((data: { date: number; author: string; chat_type: string; content: string }): void => {
        setMessages((currentMessages) => [
            ...currentMessages,
            {
                type: data.chat_type as unknown as ChatType,
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
            <Select selectedValue={selectedChat} onValueChange={(value): void => setSelectedChat(value as unknown as ChatType)}>
                {chats.map((chat) => (
                    <Select.Item label={ChatName[chat]} value={chat} />
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
