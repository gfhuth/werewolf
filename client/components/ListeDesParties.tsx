import React, { useContext, useEffect, useState } from "react";
import { View, StyleSheet } from "react-native";
import { API_BASE_URL } from "@env";
import { UserContext } from "../context/UserContext";
import request from "../utils/request";
import Message from "./Message";
import { Box, Divider, Button, Text, Center, Heading } from "native-base";
import { StackNavigation } from "../App";
import { useNavigation } from "@react-navigation/native";

const styles = StyleSheet.create({
    baseText: {
        height: 30,
        marginTop: 10,
        color: "#fff",
        paddingLeft: 10
    }
});

export default function ListeDesParties(): React.ReactElement {
    const context = useContext(UserContext);
    type Partie = {
        currentNumberOfPlayer: number;
        hostId: number;
        id: number;
        nbPlayerMax: number;
        startDate: number;
        date: String;
    };
    const [listeParties, setListeParties] = useState<Array<Partie>>([]);

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

    useEffect(() => {
        requestListeDesParties();
    }, []);

    const navigation = useNavigation<StackNavigation>();
    const goToGame = (): void => {
        navigation.navigate("Jeux");
    };

    return (
        <View>
            <Text fontSize="2xl" color={"light.100"}>
                Liste des parties existantes:
            </Text>
            {listeParties &&
                listeParties.map((informationPartie) => (
                    <View key={informationPartie.id}>
                        <Box padding={3} bgColor={"light.100"} borderRadius={5}>
                            <Heading>Nombre de joueur présent :{informationPartie.currentNumberOfPlayer}</Heading>
                            <Text fontSize="lg">hostId :{informationPartie.hostId}</Text>
                            <Text fontSize="lg">id :{informationPartie.id}</Text>
                            <Text fontSize="lg">Nombre maximum de joueur :{informationPartie.nbPlayerMax}</Text>
                            <Text fontSize="lg">Date : {informationPartie.date}</Text>
                            <Center>
                                <Button size="md" fontSize="lg" width={"20"} onPress={goToGame}>
                                    Go to game
                                </Button>
                            </Center>
                        </Box>
                        <Divider my={5} thickness="0" />
                    </View>
                ))}
        </View>
    );
}
