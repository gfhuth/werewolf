import { StatusBar } from "expo-status-bar";
import { ImageBackground, Button, StyleSheet, Text, View } from "react-native";
import { useNavigation, Link } from "@react-navigation/native";
import Home from "./Home";
import { StackNavigation } from "../App";
import { TextInput } from "react-native-gesture-handler";
import { useRef, useState } from "react";
import { API_BASE_URL } from "@env";
import Counter from "../components/Counter";
import Box from "../components/Box";


const image = { uri: './assets/pxArt_6.png' };

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: "center",
        justifyContent: "center"
    }, 
    image: {
        flex: 1,
        width: '100%', 
        height: '100%'
    },
    texte: {
        flex: 1,
        color: "white"
    },
    TextInput: {
        backgroundColor: "#fff"
    }
});

export default function Login() {
    const navigation = useNavigation<StackNavigation>();

    const [count, setCount] = useState(0);

    const userInputRef = useRef<TextInput>(null);
    const passInputRef = useRef<TextInput>(null);

    const verifyUserAndPass = () => {
        //setCount(count + 1);
        navigation.navigate("Home");
        fetch(`${API_BASE_URL}login`)
            .then(res => res.json());
        // .then(res => setToken(res.token))
        // .catch(e => ...);
    };

    return (
        <View style={styles.container}>
            <ImageBackground source={require('../assets/pxArt_6.png')} resizeMode="cover" style={styles.image}> 
       

                <Box>
                    <Text style={styles.texte}>Login</Text>
                    <TextInput aria-label="Login" ref={userInputRef} style={styles.TextInput}/>
                    <TextInput aria-label="Mot de passe" ref={passInputRef} secureTextEntry />
                    <Button onPress={verifyUserAndPass} title="Login" />
                </Box>

            
            </ImageBackground>
        </View>
    );
}
