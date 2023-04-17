import { GameProvider } from "../context/GameContext";
import Jeux from "./Jeux";

export default function GameScreen(): React.ReactElement {
    return (
        <GameProvider gameId={1}>
            <Jeux />
        </GameProvider>
    );
}
