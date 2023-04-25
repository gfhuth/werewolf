import { useIsFocused, useNavigation } from "@react-navigation/native";
import { StackNavigation } from "../App";
import Background from "../components/Background";
import NavigationUI from "../components/NavigationUI";
import { Fab, Icon, ScrollView, View, Text, Box, Heading, Center, Divider, Button } from "native-base";
import { AntDesign } from "@expo/vector-icons";
import { useContext, useEffect, useState } from "react";
import { UserContext } from "../context/UserContext";
import request from "../utils/request";
import { API_BASE_URL } from "@env";

type Partie = {
    currentNumberOfPlayer: number;
    hostId: number;
    id: number;
    nbPlayerMax: number;
    startDate: number;
    date: String;
};

export default function Home(): React.ReactElement {
    const navigation = useNavigation<StackNavigation>();
    const isFocused = useIsFocused();

    const createGame = (): void => {
        navigation.navigate("CreateGame");
    };
    const goToGame = (gameId: number): void => {
        navigation.navigate("Game", { gameId: gameId });
    };
    const context = useContext(UserContext);
    const [listeParties, setListeParties] = useState<Array<Partie>>([]);
    const [listePartiesUser, setListePartiesUser] = useState<Array<Partie>>([]);

    const requestListeDesParties = (): void => {
        request(`${API_BASE_URL}/game/search`, {
            method: "GET",
            headers: {
                Accept: "application/json",
                "Content-Type": "application/json",
                "x-access-token": context.token
            }
        })
            .then((res) => res.json())
            .then((res) => {
                console.log(res.games);
                res.games.map((info: Partie) => {
                    info.date = new Date(info.startDate).toString();
                });
                setListeParties(res.games);
            })
            .catch((e) => console.log(e));
    };

    const requestListeDesPartiesUser = (): void => {
        request(`${API_BASE_URL}/game/me`, {
            method: "GET",
            headers: {
                Accept: "application/json",
                "Content-Type": "application/json",
                "x-access-token": context.token
            }
        })
            .then((res) => res.json())
            .then((res) => {
                console.log(res.games);
                res.games.map((info: Partie) => {
                    info.date = new Date(info.startDate).toString();
                });
                setListePartiesUser(res.games);
            })
            .catch((e) => console.log(e));
    };

    const joinGame = (gameId: number): void => {
        request(`${API_BASE_URL}/game/${gameId}/join`, {
            method: "POST",
            headers: {
                Accept: "application/json",
                "Content-Type": "application/json",
                "x-access-token": context.token
            }
        })
            .then((res) => {
                requestListeDesParties();
                requestListeDesPartiesUser();
            })
            .catch(console.error);
    };

    useEffect(() => {
        if (isFocused) {
            requestListeDesParties();
            requestListeDesPartiesUser();
        }
    }, [isFocused]);

    return (
        <Background>
            <NavigationUI allowBack={false} />

            <ScrollView>
                <View>
                    <Heading color={"light.100"} mt={5}>
                        Liste des parties existantes:
                    </Heading>
                    {listeParties &&
                        listeParties
                            .filter((partie) => !listePartiesUser || !listePartiesUser.find((p) => p.id === partie.id))
                            .map((informationPartie) => (
                                <View key={informationPartie.id}>
                                    <Box padding={3} bgColor={"light.100"} borderRadius={5}>
                                        <Text>Nombre de joueur présent :{informationPartie.currentNumberOfPlayer}</Text>
                                        <Text>hostId :{informationPartie.hostId}</Text>
                                        <Text>id :{informationPartie.id}</Text>
                                        <Text>Nombre maximum de joueur :{informationPartie.nbPlayerMax}</Text>
                                        <Text>Date : {informationPartie.date}</Text>
                                        <Center>
                                            <Button size="md" fontSize="lg" width={"130"} onPress={(): void => joinGame(informationPartie.id)}>
                                                Rejoindre la partie
                                            </Button>
                                        </Center>
                                    </Box>
                                    <Divider my={5} thickness="0" />
                                </View>
                            ))}
                </View>

                <View>
                    <Heading color={"light.100"}>Liste de vos parties:</Heading>
                    {listePartiesUser &&
                        listePartiesUser.map((informationPartie) => (
                            <View key={informationPartie.id}>
                                <Box padding={3} bgColor={"light.100"} borderRadius={5}>
                                    <Text>Nombre de joueur présent :{informationPartie.currentNumberOfPlayer}</Text>
                                    <Text>hostId :{informationPartie.hostId}</Text>
                                    <Text>id :{informationPartie.id}</Text>
                                    <Text>Nombre maximum de joueur :{informationPartie.nbPlayerMax}</Text>
                                    <Text>Date : {informationPartie.date}</Text>
                                    <Center>
                                        <Button size="md" fontSize="lg" width={"20"} onPress={(): void => goToGame(informationPartie.id)}>
                                            Go to game
                                        </Button>
                                    </Center>
                                </Box>
                                <Divider my={5} thickness="0" />
                            </View>
                        ))}
                </View>
            </ScrollView>
            <Fab onPress={createGame} renderInPortal={false} shadow={2} size="sm" icon={<Icon color="white" as={AntDesign} name="plus" size="sm" />} />
        </Background>
    );
}
