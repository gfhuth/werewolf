import Background from "../components/Background";
import NavigationUI from "../components/NavigationUI";
import React, { useEffect, useContext } from "react";
import { UserContext } from "../context/UserContext";
import { GameContext, jourOuNuit } from "../context/GameContext";
import ChatComponent from "../components/game/Chat";
import Collapsible from "../components/Collapsible";
import { Box, Text, View } from "native-base";
import PlayersList from "../components/game/PlayersList";

export default function Jeux(): React.ReactElement {
    const gameContext = useContext(GameContext);

    const { token } = useContext(UserContext);

    useEffect(() => {
        gameContext.sendJsonMessage("AUTHENTICATION", { token: token });
    }, []);

    return (
        <Background>
            <NavigationUI allowBack />
            <View>
                {gameContext.jourNuit == jourOuNuit.jour ? (
                    <Text color={"white"} fontWeight={"900"} fontSize={"150%"}>
                        TMP : Jour
                    </Text>
                ) : (
                    <Text color={"white"} fontWeight={"900"} fontSize={"150%"}>
                        TMP : Nuit
                    </Text>
                )}
            </View>

            <PlayersList />

            <Box bg="light.100" minWidth={200} px={5} py={2} position={"absolute"} maxWidth={"100%"} right={0} bottom={0}>
                <Collapsible name="Chat" isDefaultOpen={false}>
                    <ChatComponent />
                </Collapsible>
            </Box>
        </Background>
    );
}
