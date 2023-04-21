import { GameProvider } from "../context/GameContext";
import Jeux from "./Jeux";
import { StackScreenProps } from "@react-navigation/stack";
import { StackParamList } from "../App";

export default function GameScreen({ route, navigation }: StackScreenProps<StackParamList, "Game">): React.ReactElement {
    return (
        <GameProvider gameId={route.params.gameId}>
            <Jeux />
        </GameProvider>
    );
}
