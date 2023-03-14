import { StatusBar } from "expo-status-bar";
import { Button, StyleSheet, Text, View } from "react-native";
import { useNavigation, Link } from "@react-navigation/native";
import Home from "./Home";
import { StackNavigation } from "../App";
import { TextInput } from "react-native-gesture-handler";
import { useRef, useState } from "react";
import { API_BASE_URL } from "@env";
import Counter from "../components/Counter";

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

    const [count, setCount] = useState(0);

    const userInputRef = useRef<TextInput>(null);
    const passInputRef = useRef<TextInput>(null);

    const verifyUserAndPass = () => {
        setCount(count + 1);
        // navigation.navigate("Home");
        // fetch(`${API_BASE_URL}/login`)
        // .then(res => res.json())
        // .then(res => setToken(res.token))
        // .catch(e => ...);
    };

    return (
        <View style={styles.container}>
            <Text>It's time to log in!</Text>
            <TextInput ref={userInputRef} />
            <TextInput ref={passInputRef} secureTextEntry />
            <Button onPress={verifyUserAndPass} title="Login" />
            <Counter count={count} />
        </View>
    );
}
