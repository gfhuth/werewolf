import { StatusBar } from "expo-status-bar";
import { StyleSheet, Text, View } from "react-native";
import Background from "../components/Background";
import NavigationUI from "../components/NavigationUI";

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#fff",
        alignItems: "center",
        justifyContent: "center"
    }
});

export default function Home() {
    return (
        <Background>
            <NavigationUI allowBack={false} />
        </Background>
    );
}
