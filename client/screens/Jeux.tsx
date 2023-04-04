import Background from "../components/Background";
import NavigationUI from "../components/NavigationUI";
import useWebSocket from 'react-use-websocket';
import { WS } from "@env";

export default function Jeux(): React.ReactElement {
    const {
        sendMessage,
        sendJsonMessage,
        lastMessage,
        lastJsonMessage,
        readyState,
        getWebSocket
    } = useWebSocket(WS, {
        onOpen: () => console.log('opened'),
        //Will attempt to reconnect on all close events, such as server shutting down
        shouldReconnect: (closeEvent) => true
    });


    return (
        <Background>
            <NavigationUI allowBack={false} />
        </Background>
    );
}
