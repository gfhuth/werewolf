import Background from "../components/Background";
import NavigationUI from "../components/NavigationUI";

export default function Home(): React.ReactElement {
    return (
        <Background>
            <NavigationUI allowBack={false} />
        </Background>
    );
}
