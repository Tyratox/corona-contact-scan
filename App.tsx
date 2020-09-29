import React, { FunctionComponent, ReactNode } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { AntDesign } from "@expo/vector-icons";
import { FontAwesome5 } from "@expo/vector-icons";
import { Entypo } from "@expo/vector-icons";
import Scan from "./screens/Scan";
import Address from "./screens/Addresses";
import * as Localization from "expo-localization";
import Link from "./screens/Link";
import i18n from "i18n-js";

import en from "./i18n/en.json";
import de from "./i18n/de.json";
import fr from "./i18n/fr.json";
import it from "./i18n/it.json";
import Archive from "./screens/Archive";

i18n.translations = {
  en,
  de,
  fr,
  it,
};

let locale = Localization.locale;
if (locale.includes("-") && !(locale in i18n.translations)) {
  locale = locale.split("-")[0];
}

i18n.locale = locale;
i18n.defaultLocale = "en";
i18n.fallbacks = true;
const Tab = createBottomTabNavigator();

export type RootStackParamList = {
  Scan: undefined;
  Link: undefined;
  Addresses: undefined;
  Archive: undefined;
};

const App: FunctionComponent<{}> = () => {
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
            } else if (route.name === "Link") {
              return <AntDesign name="link" size={size} color={color} />;
            } else if (route.name === "Archive") {
              return <Entypo name="archive" size={size} color={color} />;
            }
          },
        })}
        tabBarOptions={{
          activeTintColor: "#000",
          inactiveTintColor: "gray",
        }}
      >
        <Tab.Screen
          name="Scan"
          component={Scan}
          options={{ title: i18n.t("scan") }}
        />
        <Tab.Screen
          name="Link"
          component={Link}
          options={{
            title: i18n.t("link"),
          }}
        />
        <Tab.Screen
          name="Addresses"
          component={Address}
          options={{
            title: i18n.t("addresses"),
          }}
        />
        <Tab.Screen
          name="Archive"
          component={Archive}
          options={{
            title: i18n.t("archive"),
          }}
        />
      </Tab.Navigator>
    </NavigationContainer>
  );
};
export default App;
