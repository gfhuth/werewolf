import { NavigationContainer, NavigationProp } from "@react-navigation/native";
import Home from "./screens/Home";
import Connection from "./screens/Connection";
import { createStackNavigator } from "@react-navigation/stack";
import { UserProvider } from "./context/UserContext";
import { SettingsProvider } from "./context/SettingsContext";
import { useFonts } from "expo-font";
import Settings from "./screens/Settings";

export type StackParamList = {
    Home: undefined;
    Connection: undefined;
    Settings: undefined;
};
export type StackNavigation = NavigationProp<StackParamList>;

const Stack = createStackNavigator();
function MyStack() {
    return (
        <Stack.Navigator initialRouteName="Login">
            <Stack.Screen name="Home" component={Home} options={{ headerShown: false }} />
            <Stack.Screen name="Login" component={Connection} options={{ headerShown: false, title: "Connection" }} />
            <Stack.Screen name="Settings" component={Settings} options={{ headerShown: false }} />
        </Stack.Navigator>
    );
}

export default function App() {
    useFonts({
        pixel: require("./assets/fonts/depixel.ttf")
    });

    return (
        <SettingsProvider>
            <UserProvider>
                <NavigationContainer>
                    <MyStack />
                </NavigationContainer>
            </UserProvider>
        </SettingsProvider>
    );
}
