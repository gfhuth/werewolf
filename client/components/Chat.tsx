import { StyleSheet, View } from "react-native";
import Message, { MessageType } from "./Message";

const styles = StyleSheet.create({
    box: {
        borderRadius: 10,
        border: "5px solid #FFFFFF",
        padding: 32,
        textAlign: "center"
    }
});

export default function Chat(props: {messages:Array<MessageType>}): React.ReactElement {
    return <View style={styles.box}>
    
        {props.messages.map((el, i) => <Message message={el} key={i} />)}

    </View>;
}
