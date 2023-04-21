import { Box, Center, Container, Image, Text, Tooltip } from "native-base";

export type Role = {
    name: string;
};
export type Player = {
    id: number;
    username: string;
    roles: Array<Role>;
};

export default function PlayerCard(props: { player: Player }): React.ReactElement {
    return (
        <Box bg="light.100" p={2}>
            <Center>
                <Container display={"flex"} flexDirection={"row"} justifyContent={"space-between"} alignItems={"center"} mb={2} style={{gap: 3}}>
                    {props.player.roles.map((role, i) => (
                        <Tooltip key={i} label={role.name} placement="top">
                            <Image alt={`${role.name} role image`} source={require(`../../assets/images/roles/${role.name}.png`)} width={25} height={25} resizeMode="cover" />
                        </Tooltip>
                    ))}
                </Container>
                <Image alt="Player image" source={require("../../assets/images/player.png")} width={70} height={70} resizeMode="cover" />
                <Text>{props.player.username}</Text>
            </Center>
        </Box>
    );
}
