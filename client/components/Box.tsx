import { StyleSheet, View } from "react-native";

const styles = StyleSheet.create({
    box: {
        borderRadius: 10,
        border: "5px solid #FFFFFF",
        padding: 32,
        textAlign: "center"
    }
});

export default function Box(props : {children: React.ReactNode}): React.ReactElement {
    return <View style={styles.box}>{props.children}</View>;
}
