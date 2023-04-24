import { Box, Button, Center, Container, Hidden, Image, Pressable, Text, Tooltip } from "native-base";
import { images } from "./image";
import { useState } from "react";

export type Role = {
    name: string;
};
export type Player = {
    id: number;
    username: string;
    roles: Array<Role>;
};

export default function PlayerCard(props: { player: Player }): React.ReactElement {
    const [isOpen, setIsOpen] = useState(false);

    const vote = (): void => {
        console.log("A VOTE");
    };

    return (
        <Box bg="light.100" borderRadius={5} p={2}>
            <Center>
                <Pressable onPress={(): any => setIsOpen(!isOpen)} display={"flex"} flexDirection={"row"}>
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
                    {/* {isOpen ? <Button onPress={vote}> Voter </Button> : <Hidden children={null}></Hidden>} */}
                </Pressable>
            </Center>
        </Box>
    );
}
