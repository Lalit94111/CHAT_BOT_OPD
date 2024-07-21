import { StyleSheet, SafeAreaView } from "react-native";
import ChatScreen from "./Screens/ChatScreen";
import Finish from "./Screens/Finish";
import Questions from "./Screens/Questions";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator>
      <Stack.Screen
        name="Questions"
        component={Questions}
        options={{ headerShown: false }}
      />
        <Stack.Screen
          name="ChatScreen"
          component={ChatScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="Finish"
          component={Finish}
          options={{ headerShown: false }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
