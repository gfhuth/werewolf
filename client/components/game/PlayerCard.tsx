import { Actionsheet, Box, Center, Container, Image, Pressable, Text, Tooltip, View, useDisclose, useToast } from "native-base";
import { images } from "./image";
import { GameContext, Power, Role } from "../../context/GameContext";
import { useContext, useEffect, useState } from "react";
import { UserContext } from "../../context/UserContext";

export type Player = {
    username: string;
    roles: Array<Role>;
    powers: Array<Power>;
    alive: boolean
};

export default function PlayerCard(props: { player: Player }): React.ReactElement {
    const [isOpenVote, setIsOpen] = useState(false);
    const gameContext = useContext(GameContext);
    const userContext = useContext(UserContext);

    const { isOpen, onOpen, onClose } = useDisclose();
    const [playerVote, setPlayerVote] = useState("");

    const toast = useToast();

    const setMessageToast = (message: string): void => {
        toast.show({
            title: "Info",
            description: message,
            variant: "subtle",
            borderColor: "green.700",
            borderLeftWidth: 3
        });
    };

    const sendVote = (): void => {
        // TODO changer le type du vote
        gameContext.sendJsonMessage("VOTE_SENT", { vote_type: "", vote: playerVote });
    };

    const receivedVote = (): void => {
        setMessageToast("Le vote a bien été pris en compte");
    };

    useEffect(() => {
        gameContext.registerEventHandler("VOTE_RECEIVED", receivedVote);
    }, []);

    return (
        <Pressable
            onPress={(): void => {
                if (gameContext.me.alive) {
                    setPlayerVote(props.player.username);
                    onOpen();
                } else {
                    setMessageToast("Vous êtes mort, vous ne pouvez pas voter");
                }
            }}
        >
            <Box bg="light.100" borderRadius={5} p={2} overflow={"hidden"}>
                <Center display={"flex"} flexDirection={"row"}>
                    <Image alt="Player image" source={require("../../assets/images/player.png")} width={70} height={70} resizeMode="cover" />
                    <Container>
                        <Container display={"flex"} flexDirection={"row"} justifyContent={"space-between"} alignItems={"center"} mb={2} style={{ gap: 3 }}>
                            {props.player.roles.map((role, i) => (
                                <Tooltip key={i} label={role.toString()} placement="top">
                                    <Image alt={`${role.toString()} role image`} source={images[role.toString()].uri} width={30} height={30} resizeMode="cover" />
                                </Tooltip>
                            ))}
                            {props.player.powers.map((power, i) => (
                                <Tooltip key={i} label={power.toString()} placement="top">
                                    <Image alt={`${power.toString()} role image`} source={images[power.toString()].uri} width={30} height={30} resizeMode="cover" />
                                </Tooltip>
                            ))}
                        </Container>
                        <Text>{props.player.username}</Text>
                    </Container>

                    <Actionsheet isOpen={isOpen} onClose={onClose}>
                        <Actionsheet.Content>
                            <Box w="100%" h={60} px={4} justifyContent="center">
                                <Text
                                    fontSize="16"
                                    color="gray.500"
                                    bold
                                    _dark={{
                                        color: "gray.300"
                                    }}
                                >
                                    Actions possibles :
                                </Text>
                            </Box>
                            <Actionsheet.Item onPress={sendVote}>VOTE</Actionsheet.Item>
                            <Actionsheet.Item isDisabled>Share</Actionsheet.Item>
                            <Actionsheet.Item>Play</Actionsheet.Item>
                            <Actionsheet.Item>Favourite</Actionsheet.Item>
                            <Actionsheet.Item onPress={onClose}>Close</Actionsheet.Item>
                        </Actionsheet.Content>
                    </Actionsheet>
                </Center>
                {!props.player.alive ? (
                    <View backgroundColor={"rgba(56, 56, 56, 0.8)"} position={"absolute"} width={"100%"} height={"100%"} top={"0"} left={"0"}>
                        <View width={"100%"} position={"absolute"} backgroundColor={"white"} style={{ transform: [{ rotate: "-25deg" }, { translateX: -12 }, { translateY: -8 }] }}>
                            <Text paddingLeft={4} fontFamily={"pixel"} color={"red.700"} fontWeight={"900"} fontSize={"150%"}>
                                MORT
                            </Text>
                        </View>
                    </View>
                ) : (
                    ""
                )}
            </Box>
        </Pressable>
    );
}
