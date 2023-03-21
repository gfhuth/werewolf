import { NavigationContainer, NavigationProp } from "@react-navigation/native";
import Home from "./screens/Home";
import Login from "./screens/Login";
import { createStackNavigator } from "@react-navigation/stack";
import { UserProvider } from "./context/UserContext";
import { SettingsProvider } from "./context/SettingsContext";

export type StackParamList = {
    Home: undefined;
    Login: undefined;
};
export type StackNavigation = NavigationProp<StackParamList>;

const Stack = createStackNavigator();
function MyStack() {
    return (
        <Stack.Navigator initialRouteName="Login">
            <Stack.Screen name="Home" component={Home} />
            <Stack.Screen name="Login" component={Login} />
        </Stack.Navigator>
    );
}

export default function App() {
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
