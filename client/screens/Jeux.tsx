import Background from "../components/Background";
import NavigationUI from "../components/NavigationUI";
import useWebSocket from 'react-use-websocket';
import { WS } from "@env";

export default function Jeux(): React.ReactElement {
    useWebSocket(WS, {
        onOpen: () => {
          console.log('WebSocket connection established.');
        }
      });


    return (
        <Background>
            <NavigationUI allowBack={false} />
        </Background>
    );
}
