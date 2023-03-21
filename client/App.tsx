import { NavigationContainer, NavigationProp } from "@react-navigation/native";
import Home from "./screens/Home";
import Login from "./screens/Login";
import { createStackNavigator } from "@react-navigation/stack";

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
            <Stack.Screen name="Login" component={Login} options={{headerShown: false}}/>
        </Stack.Navigator>
    );
}

export default function App() {
    return (
        <NavigationContainer>
            <MyStack />
        </NavigationContainer>
    );
}
