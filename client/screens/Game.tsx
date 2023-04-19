import { GameProvider } from "../context/GameContext";
import Jeux from "./Jeux";

export default function GameScreen(props: { route: { params: { gameId: number } } }): React.ReactElement {
    return (
        <GameProvider gameId={props.route.params.gameId}>
            <Jeux />
        </GameProvider>
    );
}
