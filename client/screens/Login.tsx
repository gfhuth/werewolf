import { StatusBar } from "expo-status-bar";
import { Button, StyleSheet, Text, View } from "react-native";
import { useNavigation, Link } from "@react-navigation/native";
import Home from "./Home";
import { StackNavigation } from "../App";
import { TextInput } from "react-native-gesture-handler";

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#fff",
        alignItems: "center",
        justifyContent: "center"
    }
});

export default function Login() {
    const navigation = useNavigation<StackNavigation>();

    const verifyUserAndPass = () => {
        navigation.navigate("Home");
    };

    return (
        <View style={styles.container}>
            <Text>It's time to log in!</Text>
            <TextInput />
            <TextInput secureTextEntry />
            <Button onPress={verifyUserAndPass} title="Login" />
        </View>
    );
}