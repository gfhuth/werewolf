import { useState } from "react";
import { Pressable, View, Text } from "react-native";

export default function Collapsible(props: { name: string, isDefaultOpen?: boolean; children: React.ReactNode }): React.ReactElement {
    const [isOpen, setIsOpen] = useState(props.isDefaultOpen);

    return (
        <View>
            <Pressable onPress={(): void => setIsOpen((open) => !open)}>
                <View>
                    <Text>{props.name}</Text>
                </View>
            </Pressable>
            {isOpen && <View>{props.children}</View>}
        </View>
    );
}
