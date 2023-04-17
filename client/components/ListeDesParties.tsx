import React, { useContext } from "react";
import { View } from "react-native";
import { API_BASE_URL } from "@env";
import { UserContext } from "../context/UserContext";
import request from "../utils/request";
import Message from "./Message";


export default function ListeDesParties(props: { children: React.ReactNode }): React.ReactElement {
    const context = useContext(UserContext);
    let listeParties:Array<String> = [];
    
    const RequestListeDesParties = (): void => {
        request(`${API_BASE_URL}/user/login`, {
            method: "POST",
            headers: {
                Accept: "application/json",
                "Content-Type": "application/json",
                "x-access-token": context.token
            }
        })
            .then((res) => res.json())
            .then((res) => {
                listeParties = res.games;
            })
            .catch((e) => console.log(e));
    };

    return <View>

        {listeParties.map((el: any, i: React.Key | null | undefined) => <Message message={el} key={i} />)}

    </View>;
}
