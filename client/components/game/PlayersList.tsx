import { useContext, useEffect, useState } from "react";
import { GameContext } from "../../context/GameContext";
import PlayerCard, { Player } from "./PlayerCard";
import { Container, Text } from "native-base";

export default function PlayersList(props: {}): React.ReactElement {
    const gameContext = useContext(GameContext);

    const [players, setPlayers] = useState<Array<Player>>([
        {
            id: 1,
            username: "Batman",
            roles: [
                {
                    name: "Loup"
                },
                {
                    name: "Villageois"
                }
            ]
        },
        {
            id: 2,
            username: "Robin",
            roles: [
                {
                    name: "Loup"
                },
                {
                    name: "Villageois"
                }
            ]
        },
        {
            id: 3,
            username: "Alfred",
            roles: [
                {
                    name: "Loup"
                },
                {
                    name: "Villageois"
                }
            ]
        },
        {
            id: 4,
            username: "Joker",
            roles: [
                {
                    name: "Loup"
                },
                {
                    name: "Villageois"
                }
            ]
        },
        {
            id: 5,
            username: "Wayne",
            roles: [
                {
                    name: "Loup"
                },
                {
                    name: "Villageois"
                }
            ]
        }
    ]);

    const onPlayerListUpdate = (): void => {
        // TODO
    };

    useEffect(() => {
        gameContext.registerEventHandler("", onPlayerListUpdate);
    }, []);

    return (
        <Container display={"flex"} flexDirection={"row"} flexWrap={"wrap"} style={{ gap: 10 }} width={"100%"} justifyContent={"space-around"} maxWidth={530}>
            {players.map((player) => (
                <PlayerCard key={player.username} player={player} />
            ))}
        </Container>
    );
}
