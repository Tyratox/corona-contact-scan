import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { AntDesign } from "@expo/vector-icons";
import { FontAwesome5 } from "@expo/vector-icons";
import Scan from "./screens/Scan";
import Address from "./screens/Addresses";

const Tab = createBottomTabNavigator();

export type RootStackParamList = {
  Scan: undefined;
  Addresses: undefined;
};

const App = () => {
  return (
    <NavigationContainer>
      <Tab.Navigator
        initialRouteName="Scan"
        screenOptions={({ route }) => ({
          tabBarIcon: ({ focused, color, size }) => {
            if (route.name === "Scan") {
              return <AntDesign name="qrcode" size={size} color={color} />;
            } else if (route.name === "Addresses") {
              return (
                <FontAwesome5 name="address-card" size={size} color={color} />
              );
            }
          },
        })}
        tabBarOptions={{
          activeTintColor: "tomato",
          inactiveTintColor: "gray",
        }}
      >
        <Tab.Screen name="Scan" component={Scan} options={{ title: "Scan" }} />
        <Tab.Screen
          name="Addresses"
          component={Address}
          options={{ title: "Adressen" }}
        />
      </Tab.Navigator>
    </NavigationContainer>
  );
};

export default App;
