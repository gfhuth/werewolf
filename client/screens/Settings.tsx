import Background from "../components/Background";
import NavigationUI from "../components/NavigationUI";

export default function Settings(): React.ReactElement {
    return (
        <Background>
            <NavigationUI allowBack />
        </Background>
    );
}
