import { Actionsheet, Box, Button, Center, Container, Hidden, Image, Pressable, Text, Tooltip, useDisclose, useToast } from "native-base";
import { images } from "./image";
import { GameContext } from "../../context/GameContext";
import { useContext, useEffect, useState } from "react";

export type Role = {
    name: string;
};
export type Player = {
    id: number;
    username: string;
    roles: Array<Role>;
};

export default function PlayerCard(props: { player: Player }): React.ReactElement {
    const [isOpenVote, setIsOpen] = useState(false);
    const gameContext = useContext(GameContext);

    const toast = useToast();

    const setMessageToast = (message: string): void => {
        toast.show({
            title: "Erreur",
            description: message,
            variant: "subtle",
            borderColor: "red.700",
            borderLeftWidth: 3
        });
    };

    const vote = (): void => {
        gameContext.sendJsonMessage("VOTE_SENT", { vote_type: "village", vote: "username de la personne" });
    };

    const receivedVote = (): void => {
        setMessageToast("Le vote a bien était pris en compte");
    };

    useEffect(() => {
        gameContext.registerEventHandler("VOTE_RECEIVED", receivedVote);
    }, []);

    const { isOpen, onOpen, onClose } = useDisclose();
    return (
        <Box bg="light.100" borderRadius={5} p={2}>
            <Center>
                <Pressable onPress={onOpen} display={"flex"} flexDirection={"row"}>
                    <Image alt="Player image" source={require("../../assets/images/player.png")} width={70} height={70} resizeMode="cover" />
                    <Container>
                        <Container display={"flex"} flexDirection={"row"} justifyContent={"space-between"} alignItems={"center"} mb={2} style={{ gap: 3 }}>
                            {props.player.roles.map((role, i) => (
                                <Tooltip key={i} label={role.name} placement="top">
                                    <Image alt={`${role.name} role image`} source={images[role.name].uri} width={30} height={30} resizeMode="cover" />
                                </Tooltip>
                            ))}
                        </Container>
                        <Text>{props.player.username}</Text>
                    </Container>
                </Pressable>

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
                        <Actionsheet.Item onPress={vote}>VOTE</Actionsheet.Item>
                        <Actionsheet.Item isDisabled>Share</Actionsheet.Item>
                        <Actionsheet.Item>Play</Actionsheet.Item>
                        <Actionsheet.Item>Favourite</Actionsheet.Item>
                        <Actionsheet.Item onPress={onClose}>Close</Actionsheet.Item>
                    </Actionsheet.Content>
                </Actionsheet>
            </Center>
        </Box>
    );
}
