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
        }
    ]);

    const onPlayerListUpdate = (): void => {
        // TODO
    };

    useEffect(() => {
        gameContext.registerEventHandler("", onPlayerListUpdate);
    }, []);

    return (
        <Container>
            {players.map((player) => (
                <PlayerCard key={player.username} player={player} />
            ))}
        </Container>
    );
}
