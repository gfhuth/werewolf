import { StatusBar } from "expo-status-bar";
import { ImageBackground, Button, StyleSheet, Text, View, Linking } from "react-native";
import { useNavigation, Link } from "@react-navigation/native";
import Home from "./Home";
import { StackNavigation } from "../App";
import { TextInput } from "react-native-gesture-handler";
import { useRef, useState } from "react";
import { API_BASE_URL } from "@env";
import Box from "../components/Box";

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: "center",
        justifyContent: "center"
    },
    image: {
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flex: 1,
        width: "100%",
        height: "100%"
    },
    texte: {
        flex: 1,
        color: "white",
        fontFamily: "pixel",
        fontSize: 25
    },
    TextInput: {
        height: 30,
        marginTop: 10,
        backgroundColor: "#fff",
        paddingLeft: 10
    },
    Button: {
        marginTop: 10
    }
});

export default function Login() {
    const navigation = useNavigation<StackNavigation>();

    const [loginOrRegister, setLoginOrRegister] = useState(0);

    const userInputRef = useRef<TextInput>(null);
    const passInputRef = useRef<TextInput>(null);
    const pseudoInputRef = useRef<TextInput>(null);

    const verifyUserAndPass = () => {
        //setCount(count + 1);
        navigation.navigate("Home");
        fetch(`${API_BASE_URL}login`).then((res) => res.json());
        // .then(res => setToken(res.token))
        // .catch(e => ...);
    };

    const registerUser = () => {
        navigation.navigate("Home"); // TODO: A mettre dans le then
        fetch(`${API_BASE_URL}login`).then((res) => res.json());
        // .then(res => setToken(res.token))
        // .catch(e => ...);
    };

    return (
        <View style={styles.container}>
            <ImageBackground source={require("../assets/pxArt_6.png")} resizeMode="cover" style={styles.image}>
                <Box>
                    {loginOrRegister === 0 ? (
                        <>
                            <Text style={styles.texte}>Login</Text>
                            <TextInput placeholder="Login" aria-label="Login" ref={userInputRef} style={styles.TextInput} />
                            <TextInput placeholder="Mot de passe" aria-label="Mot de passe" ref={passInputRef} style={styles.TextInput} secureTextEntry />
                            <Button onPress={verifyUserAndPass} title="Login" />
                            <Text style={{ color: "white", marginTop: 4 }} onPress={() => setLoginOrRegister(loginOrRegister + 1)}>
                                Vous n'avez pas de compte, Enregistez vous!
                            </Text>
                        </>
                    ) : (
                        <>
                            <Text style={styles.texte}>Register</Text>
                            <TextInput placeholder="Pseudo" aria-label="Pseudo" ref={pseudoInputRef} style={styles.TextInput} />
                            <TextInput placeholder="Mot de passe" aria-label="Mot de passe" ref={passInputRef} style={styles.TextInput} secureTextEntry />
                            <Button onPress={registerUser} title="Register" />
                            <Text style={{ color: "white", marginTop: 4 }} onPress={() => setLoginOrRegister(loginOrRegister - 1)}>
                                Vous avez deja un compte, Connectez vous!
                            </Text>
                        </>
                    )}
                </Box>
            </ImageBackground>
        </View>
    );
}
