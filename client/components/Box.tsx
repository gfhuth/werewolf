import { ImageBackground, Button, StyleSheet, Text, View } from "react-native";
import { useNavigation, Link } from "@react-navigation/native";
import { StackNavigation } from "../App";
import { TextInput } from "react-native-gesture-handler";
import { useRef, useState } from "react";
import { API_BASE_URL } from "@env";


const styles = StyleSheet.create({
    box: {
        borderRadius: 10,
        border: "5px solid #FFFFFF",
        padding: "2rem",
        textAlign: "center"
    }
});


export default function BoxLogin(props : {children: React.ReactNode}) {
    return <View style={styles.box}>{props.children}</View>;
}
