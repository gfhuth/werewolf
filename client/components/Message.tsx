import { StyleSheet, View, Text } from "react-native";

const styles = StyleSheet.create({
    mesageStyle: {
     
    }
});

export type MessageType = {
    sender : string;
    date : Date;
    message : string; 
  };

export default function Message(props: {message:MessageType}): React.ReactElement {
    return <View style={styles.mesageStyle}>
        <Text>{props.message.sender}</Text>
        <Text>{(props.message.date).toDateString()}</Text>
        <Text>{props.message.message}</Text>
    </View>;
}
