import { useNavigation } from "@react-navigation/native";
import { Button } from "react-native";
import { StackNavigation } from "../App";
import Background from "../components/Background";
import NavigationUI from "../components/NavigationUI";

export default function Home(): React.ReactElement {
    const navigation = useNavigation<StackNavigation>();

    const createGame = (): void => {
        navigation.navigate("CreateGame");
    };
    const goToGame = (): void => {
        navigation.navigate("Jeux");
    };

    return (
        <Background>
            <NavigationUI allowBack={false} />
            <Button onPress={createGame} title="Create game" />
            <Button onPress={goToGame} title="Go to game" />
        </Background>
    );
}
