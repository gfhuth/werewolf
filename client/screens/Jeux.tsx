import Background from "../components/Background";
import NavigationUI from "../components/NavigationUI";
import React, { useEffect, useContext } from "react";
import { UserContext } from "../context/UserContext";
import { GameContext, GamePhase } from "../context/GameContext";
import ChatComponent from "../components/game/Chat";
import { Box, Text, View } from "native-base";
import PlayersList from "../components/game/PlayersList";

export default function Jeux(): React.ReactElement {
    const gameContext = useContext(GameContext);

    const { token } = useContext(UserContext);

    const getAllInfos = (): void => {
        gameContext.sendJsonMessage("GET_ALL_INFO", {});
    };

    useEffect(() => {
        gameContext.registerEventHandler("AUTHENTICATION", getAllInfos);
        gameContext.sendJsonMessage("AUTHENTICATION", { token: token });
    }, []);

    return (
        <Background>
            <NavigationUI allowBack />
            <View>
                {gameContext.phase == GamePhase.DAY ? (
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

            <Box bg="light.100" minWidth={200} position={"absolute"} maxWidth={"100%"} right={0} bottom={0}>
                <ChatComponent />
            </Box>
        </Background>
    );
}
