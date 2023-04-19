import { ImageBackground, Button, StyleSheet, Text, View } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { StackNavigation } from "../App";
import { TextInput } from "react-native-gesture-handler";
import { useContext, useEffect, useState } from "react";
import { API_BASE_URL } from "@env";
import Box from "../components/Box";
import { UserContext } from "../context/UserContext";
import request from "../utils/request";

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
    },
    Erreur: {
        color: "red",
        marginTop: 4,
        paddingTop: 5,
        fontSize: 20,
        fontFamily: "pixel"
    }
});

export default function Login(): React.ReactElement {
    const navigation = useNavigation<StackNavigation>();

    const [loginOrRegister, setLoginOrRegister] = useState(0);
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [messageErreur, setMessageErreur] = useState("");

    const context = useContext(UserContext);

    const verifyUserAndPass = (): void => {
        request(`${API_BASE_URL}/user/login`, {
            method: "POST",
            headers: {
                Accept: "application/json",
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                username: username,
                password: password
            })
        })
            .then((res) => res.json())
            .then((res) => {
                context.setToken(res.token);
                navigation.navigate("Home");
            })
            .catch((e) => setMessageErreur(e.message));
    };

    const registerUser = (): void => {
        fetch(`${API_BASE_URL}/user/register`, {
            method: "POST",
            headers: {
                Accept: "application/json",
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                username: username,
                password: password
            })
        })
            .then((res) => res.json())
            .then((res) => {
                context.setToken(res.token);
                navigation.navigate("Home");
            })
            .catch((e) => console.log(e));
    };

    return (
        <View style={styles.container}>
            <ImageBackground source={require("../assets/pxArt_6.png")} resizeMode="cover" style={styles.image}>
                <Box>
                    {loginOrRegister === 0 ? (
                        <>
                            <Text style={styles.texte}>Login</Text>
                            <TextInput placeholder="Login" aria-label="Login" onChangeText={setUsername} style={styles.TextInput} />
                            <TextInput placeholder="Mot de passe" aria-label="Mot de passe" onChangeText={setPassword} style={styles.TextInput} secureTextEntry />
                            <Button onPress={verifyUserAndPass} title="Login" />
                            <Text style={{ color: "white", marginTop: 4 }} onPress={(): void => setLoginOrRegister(loginOrRegister + 1)}>
                                Vous n'avez pas de compte, Enregistez vous!
                            </Text>
                        </>
                    ) : (
                        <>
                            <Text style={styles.texte}>Register</Text>
                            <TextInput placeholder="Pseudo" aria-label="Pseudo" onChangeText={setUsername} style={styles.TextInput} />
                            <TextInput placeholder="Mot de passe" aria-label="Mot de passe" onChangeText={setPassword} style={styles.TextInput} secureTextEntry />
                            <Button onPress={registerUser} title="Register" />
                            <Text style={{ color: "white", marginTop: 4 }} onPress={(): void => setLoginOrRegister(loginOrRegister - 1)}>
                                Vous avez deja un compte, Connectez vous!
                            </Text>
                        </>
                    )}

                    <Text style={styles.Erreur}>{messageErreur}</Text>
                </Box>
            </ImageBackground>
        </View>
    );
}
