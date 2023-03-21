import { ImageBackground, Button, StyleSheet, Text, View } from "react-native";
import { useNavigation, Link } from "@react-navigation/native";
import { StackNavigation } from "../App";
import { TextInput } from "react-native-gesture-handler";
import { useRef, useState } from "react";
import { API_BASE_URL } from "@env";


const styles = StyleSheet.create({
    box: {
        flex: 1,
        alignItems: "center",
        justifyContent: "center",

        borderRadius: 10,
        border: "5px solid #000000",

        width: 300,
        height: 100
    }
});


export default function BoxLogin(props : {children: React.ReactNode}) {
    return <View style={styles.box}>{props.children}</View>;
}
