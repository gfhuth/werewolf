import { ImageBackground, StyleSheet, View } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { StackNavigation } from "../App";
import { TextInput } from "react-native-gesture-handler";
import { useContext, useEffect, useState } from "react";
import { API_BASE_URL } from "@env";
import { Box, Button, Divider, Heading, Input, Text, useToast } from "native-base";
import { UserContext } from "../context/UserContext";
import request from "../utils/request";
import Background from "../components/Background";

export default function Login(): React.ReactElement {
    const navigation = useNavigation<StackNavigation>();

    const [isAchievingLogin, setIsAchievingLogin] = useState(true);
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");

    const context = useContext(UserContext);

    const toast = useToast();

    const setMessageErreur = (message: string): void => {
        toast.show({
            title: "Erreur",
            description: message,
            variant: "subtle",
            borderColor: "red.700",
            borderLeftWidth: 3
        });
    };

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
        <Background>
            <Box padding={10} bgColor={"light.100"} borderRadius={5}>
                {isAchievingLogin ? (
                    <>
                        <Heading>Connexion</Heading>
                        <Divider my={5} />
                        <Input mt={2} placeholder="Pseudo" onChangeText={setUsername} />
                        <Input mt={2} placeholder="Mot de passe" type="password" onChangeText={setPassword} />
                        <Button mt={2} onPress={verifyUserAndPass}>
                            Connexion
                        </Button>
                        <Divider my={5} />
                        <Text onPress={(): void => setIsAchievingLogin(false)}>Vous n'avez pas de compte, Enregistez vous!</Text>
                    </>
                ) : (
                    <>
                        <Heading>Inscription</Heading>
                        <Divider my={5} />
                        <Input mt={2} placeholder="Pseudo" onChangeText={setUsername} />
                        <Input mt={2} placeholder="Mot de passe" type="password" onChangeText={setPassword} />
                        <Button mt={2} onPress={registerUser}>
                            S'inscrire
                        </Button>
                        <Divider my={5} />
                        <Text onPress={(): void => setIsAchievingLogin(true)}>Vous avez deja un compte, Connectez vous!</Text>
                    </>
                )}
            </Box>
        </Background>
    );
}
