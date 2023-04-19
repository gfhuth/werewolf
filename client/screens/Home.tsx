import { useNavigation } from "@react-navigation/native";
import { Button } from "react-native";
import { StackNavigation } from "../App";
import Background from "../components/Background";
import NavigationUI from "../components/NavigationUI";
import ListeDesParties from "../components/ListeDesParties";
import { Fab, Icon } from "native-base";
import { AntDesign } from "@expo/vector-icons";


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

            <ListeDesParties></ListeDesParties>

            <Fab onPress={createGame} renderInPortal={false} shadow={2} size="sm" icon={<Icon color="white" as={AntDesign} name="plus" size="sm" />} />
        </Background>
    );
}
