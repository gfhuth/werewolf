import { Actionsheet, Box, Button, Center, Container, Heading, Image, Pressable, Text, Tooltip, View, useDisclose, useToast } from "native-base";
import { getImageSource, images } from "./image";
import { GameContext, Player } from "../../context/GameContext";
import { useContext } from "react";
import { UserContext } from "../../context/UserContext";
import { VoteContext } from "../../context/VoteContext";

export default function PlayerCard(props: { player: Player }): React.ReactElement {
    const gameContext = useContext(GameContext);
    const userContext = useContext(UserContext);
    const voteContext = useContext(VoteContext);

    const { isOpen, onOpen, onClose } = useDisclose();

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

    const suggestVote = (): void => {
        voteContext.vote(props.player.username, true);
        onClose();
    };
    const ratify = (shouldKill: boolean): void => {
        voteContext.vote(props.player.username, shouldKill);
        onClose();
    };

    const playerRatification = voteContext.ratifications.find((r) => r.target === props.player.username);

    const getVoteElement = (): React.ReactNode => {
        if (props.player.username === userContext.username) return undefined;
        if (playerRatification) {
            return (
                <Actionsheet.Item display={"flex"} flexDirection={"row"}>
                    <Button bg="green.400" onPress={(): void => ratify(false)}>
                        VIVRE
                    </Button>
                    <Button bg="red.400" onPress={(): void => ratify(true)}>
                        MOURIR
                    </Button>
                </Actionsheet.Item>
            );
        } else {
            return <Actionsheet.Item onPress={suggestVote}>VOTE</Actionsheet.Item>;
        }
    };

    return (
        <Pressable
            onPress={(): void => {
                if (!gameContext.me.alive) {
                    setMessageToast("Vous ne pouvez pas interagir lorsque vous êtes mort");
                    return;
                }
                onOpen();
            }}
        >
            <Box bg={props.player.username === userContext.username ? "amber.200" : "light.100"} borderRadius={5} p={2} overflow={"hidden"}>
                <Center display={"flex"} flexDirection={"row"}>
                    <Image alt="Player image" source={require("../../assets/images/player.png")} width={70} height={70} resizeMode="cover" />
                    <Container>
                        <Container display={"flex"} flexDirection={"row"} justifyContent={"space-between"} alignItems={"center"} mb={2} style={{ gap: 3 }}>
                            {props.player.roles.map((role, i) => (
                                <Tooltip key={i} label={role.toString()} placement="top">
                                    <Image alt={`${role.toString()} role image`} source={getImageSource(role).uri} width={30} height={30} resizeMode="cover" />
                                </Tooltip>
                            ))}
                            {props.player.powers.map((power, i) => (
                                <Tooltip key={i} label={power.toString()} placement="top">
                                    <Image alt={`${power.toString()} role image`} source={getImageSource(power).uri} width={30} height={30} resizeMode="cover" />
                                </Tooltip>
                            ))}
                        </Container>
                        <Text>{props.player.username}</Text>
                    </Container>

                    <Actionsheet isOpen={isOpen} onClose={onClose}>
                        <Actionsheet.Content>
                            <Heading w="100%" textAlign={"center"}>
                                {props.player.username}
                            </Heading>
                            {getVoteElement()}
                        </Actionsheet.Content>
                    </Actionsheet>
                </Center>
                {!props.player.alive && (
                    <View backgroundColor={"rgba(56, 56, 56, 0.8)"} position={"absolute"} width={"100%"} height={"100%"} top={"0"} left={"0"}>
                        <View width={"100%"} position={"absolute"} backgroundColor={"white"} style={{ transform: [{ rotate: "-25deg" }, { translateX: -12 }, { translateY: -8 }] }}>
                            <Text paddingLeft={4} fontFamily={"pixel"} color={"red.700"} fontWeight={"900"} fontSize={"150%"}>
                                MORT
                            </Text>
                        </View>
                    </View>
                )}
                {playerRatification && (
                    <View position={"absolute"} width={"100%"} height={2} display={"flex"} justifyContent={"space-between"} left={0} bottom={0} flexDirection={"row"}>
                        <View bg={"red.400"} width={`${(playerRatification.countForKilling / (gameContext.players.length - 1)) * 100}%`} height={"100%"} />
                        <View bg={"green.400"} width={`${(playerRatification.countForLiving / (gameContext.players.length - 1)) * 100}%`} height={"100%"} />
                    </View>
                )}
            </Box>
        </Pressable>
    );
}
