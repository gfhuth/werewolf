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

    return (
        <Background>
            <NavigationUI allowBack={false} />
            <Button onPress={createGame} title="Create game" />
        </Background>
    );
}
