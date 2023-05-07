import { useIsFocused, useNavigation } from "@react-navigation/native";
import { StackNavigation } from "../App";
import Background from "../components/Background";
import NavigationUI from "../components/NavigationUI";
import { Fab, Icon, ScrollView, View, Text, Box, Heading, Center, Divider, Button, HStack } from "native-base";
import { AntDesign, Ionicons } from "@expo/vector-icons";
import React, { useContext, useEffect, useState } from "react";
import { UserContext } from "../context/UserContext";
import request from "../utils/request";
import { API_BASE_URL } from "@env";
import moment from "moment";
moment.locale("fr");

type Partie = {
    currentNumberOfPlayer: number;
    host: string;
    id: number;
    nbPlayerMax: number;
    startDate: number;
    date: Date;
};

function capitalize(text: string): string {
    return text.charAt(0).toUpperCase() + text.toLocaleLowerCase().substring(1);
}

function GameCard(props: { game: Partie; buttons?: Array<React.ReactNode> }): React.ReactElement {
    const game = props.game;
    return (
        <View key={game.id}>
            <Box padding={2} bgColor={"light.100"} borderRadius={5}>
                <HStack justifyContent={"space-between"}>
                    <Text fontSize={"lg"} fontWeight={"bold"} color={"black"}>
                        # {game.id}
                    </Text>
                    <HStack alignItems={"center"} p={1} bg={"primary.100"} borderRadius={5}>
                        <Icon mr={2} name="people" as={<Ionicons />} fontSize={"lg"} fontWeight={"bold"} color={"black"} />
                        <Text fontSize={"lg"} fontWeight={"bold"} color={"black"}>
                            {game.currentNumberOfPlayer} / {game.nbPlayerMax}
                        </Text>
                    </HStack>
                </HStack>
                <Text fontSize={"105%"}>
                    Créateur : <Text fontWeight={"500"}>{game.host}</Text>
                </Text>
                <HStack justifyContent={"space-between"} alignItems={"end"}>
                    <Text fontSize={"105%"}>{capitalize(game.date < new Date() ? moment(game.date).from(moment()) : moment().to(moment(game.date)))}</Text>
                    <View display={"flex"} alignItems={"end"}>{props.buttons}</View>
                </HStack>
            </Box>
            <Divider my={5} thickness="0" />
        </View>
    );
}

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
                    info.date = new Date(info.startDate);
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
                    info.date = new Date(info.startDate);
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

    const leaveGame = (gameId: number): void => {
        request(`${API_BASE_URL}/game/${gameId}/leave`, {
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
                                <GameCard
                                    key={informationPartie.id}
                                    game={informationPartie}
                                    buttons={[
                                        informationPartie.date > new Date() ? (
                                            <Button key={1} size="md" fontSize="lg" width={"130"} onPress={(): void => joinGame(informationPartie.id)}>
                                                Rejoindre la partie
                                            </Button>
                                        ) : (
                                            <Text fontSize={"sm"} color={"muted.600"} width={150} textAlign={"right"}>
                                                La partie a déjà commencée
                                            </Text>
                                        )
                                    ]}
                                />
                            ))}
                </View>

                <View>
                    <Heading color={"light.100"}>Liste de vos parties:</Heading>
                    {listePartiesUser &&
                        listePartiesUser.map((informationPartie) => (
                            <GameCard
                                key={informationPartie.id}
                                game={informationPartie}
                                buttons={[
                                    informationPartie.date < new Date() ? (
                                        <Button key={1} size="md" fontSize="lg" width={"20"} onPress={(): void => goToGame(informationPartie.id)}>
                                            Go to game
                                        </Button>
                                    ) : (
                                        <>
                                            <Text fontSize={"sm"} color={"muted.600"} width={150} textAlign={"right"}>
                                                La partie n'a pas encore commencée
                                            </Text>
                                            <Button key={1} size="md" fontSize="lg" width={"20"} colorScheme={"red"} onPress={(): void => leaveGame(informationPartie.id)}>
                                                Quitter
                                            </Button>
                                        </>
                                    )
                                ]}
                            />
                        ))}
                </View>
            </ScrollView>
            <Fab onPress={createGame} renderInPortal={false} shadow={2} size="sm" icon={<Icon color="white" as={AntDesign} name="plus" size="sm" />} />
        </Background>
    );
}
