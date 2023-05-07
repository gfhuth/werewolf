import { useContext, useEffect, useState } from "react";
import { GameContext } from "../../context/GameContext";
import PlayerCard, { Player } from "./PlayerCard";
import { Container, Text } from "native-base";
import { UserContext } from "../../context/UserContext";

export default function PlayersList(props: {}): React.ReactElement {
    const gameContext = useContext(GameContext);
    const userContext = useContext(UserContext);

    const [players, setPlayers] = useState<Array<Player>>([]);

    const onPlayerListUpdate = (data: { players: Array<{ user: string; alive: boolean }> }): void => {
        setPlayers(
            data.players.map((player) => ({
                username: player.user,
                roles: player.user === userContext.username ? [gameContext.me.role] : [],
                powers: player.user === userContext.username ? [gameContext.me.power] : [],
                alive: player.alive
            }))
        );
        // Update myself
        const me = data.players.find((player) => player.user === userContext.username);
        if (me) gameContext.me.setIsAlive(me.alive);
    };

    useEffect(() => {
        gameContext.registerEventHandler("LIST_PLAYERS", onPlayerListUpdate);
    }, []);

    return (
        <Container display={"flex"} flexDirection={"row"} flexWrap={"wrap"} style={{ gap: 10 }} width={"100%"} justifyContent={"space-around"} maxWidth={530}>
            {players.map((player) => (
                <PlayerCard key={player.username} player={player} />
            ))}
        </Container>
    );
}
