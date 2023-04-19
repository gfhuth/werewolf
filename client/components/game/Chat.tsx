import { Button, ScrollView, View, Text } from "react-native";
import InputText from "../inputs/InputText";
import { useForm } from "react-hook-form";
import { GameContext } from "../../context/GameContext";
import { useCallback, useContext, useEffect, useState } from "react";

type FormFieldsValue = {
    message: string;
};
type Message = {
    date: Date;
    author: string;
    content: string;
};

export default function ChatComponent(): React.ReactElement {
    const { control, handleSubmit } = useForm<FormFieldsValue>();
    const gameContext = useContext(GameContext);

    const [messages, setMessages] = useState<Array<Message>>([]);

    const sendMessage = (fields: FormFieldsValue): void => {
        const message = fields.message;
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
                {messages.map((message, i) => (
                    <View key={i}>
                        <Text>
                            {message.author} : {message.content}
                        </Text>
                    </View>
                ))}
            </ScrollView>
            <InputText control={control} name="message" defaultValue="" />
            <Button onPress={handleSubmit(sendMessage)} title="Send" />
        </View>
    );
}
