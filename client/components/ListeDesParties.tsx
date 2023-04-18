import React, { useContext, useEffect, useState } from "react";
import { Button, View, Text, StyleSheet } from "react-native";
import { API_BASE_URL } from "@env";
import { UserContext } from "../context/UserContext";
import request from "../utils/request";
import Message from "./Message";

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
                setListeParties(res.games);
            })
            .catch((e) => console.log(e));
    };

    useEffect(() => {
        requestListeDesParties();
    }, []);

    return (
        <View>
            {listeParties &&
                listeParties.map((informationPartie) => (
                    <View
                        key={informationPartie.id}
                        style={{
                            borderBottomColor: "white",
                            borderBottomWidth: StyleSheet.hairlineWidth
                        }}
                    >
                        <Text style={styles.baseText}>currentNumberOfPlayer :{informationPartie.currentNumberOfPlayer}</Text>
                        <Text style={styles.baseText}>hostId :{informationPartie.hostId}</Text>
                        <Text style={styles.baseText}>id :{informationPartie.id}</Text>
                        <Text style={styles.baseText}>nbPlayerMax :{informationPartie.nbPlayerMax}</Text>
                        <Text style={styles.baseText}>startDate :{informationPartie.startDate}</Text>
                    </View>
                ))}
        </View>
    );
}
