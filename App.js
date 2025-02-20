import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import AddTodoScreen from "./screens/AddTodoScreen";
import TodoScreen from "./screens/TodoScreen";

const Stack = createStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
          cardStyle: { backgroundColor: "white" },
          cardStyleInterpolator: ({ current, next, layouts }) => {
            return {
              cardStyle: {
                transform: [
                  {
                    translateX: current.progress.interpolate({
                      inputRange: [0, 1],
                      outputRange: [layouts.screen.width, 0],
                    }),
                  },
                ],
              },
            };
          },
        }}
      >
        <Stack.Screen name="Todo" component={TodoScreen} />
        <Stack.Screen name="AddTodo" component={AddTodoScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
