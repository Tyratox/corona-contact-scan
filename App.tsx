import React, { FunctionComponent, ReactNode } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { AntDesign } from "@expo/vector-icons";
import { FontAwesome5 } from "@expo/vector-icons";
import Scan from "./screens/Scan";
import Address from "./screens/Addresses";
import * as Localization from "expo-localization";
import { IntlProvider, defineMessages, useIntl } from "react-intl";

import en from "./i18n/en.json";
import de from "./i18n/de.json";

const i18nMessages: {
  [locale: string]: any;
} = {
  en,
  de,
};

const Tab = createBottomTabNavigator();

export type RootStackParamList = {
  Scan: undefined;
  Addresses: undefined;
};

const messages = defineMessages({
  scan: {
    id: "App.navigation.scan",
    defaultMessage: "Scan",
  },
  addresses: {
    id: "App.navigation.addresses",
    defaultMessage: "Addresses",
  },
});

const AppWrapper: FunctionComponent<{ children: ReactNode }> = ({
  children,
}) => {
  let locale = Localization.locale;
  if (locale.includes("-") && !(locale in i18nMessages)) {
    locale = locale.split("-")[0];
  }

  return (
    <IntlProvider
      locale={locale}
      messages={locale in i18nMessages ? i18nMessages[locale] : i18nMessages.en}
    >
      {children}
    </IntlProvider>
  );
};

const InnerApp: FunctionComponent<{}> = () => {
  const intl = useIntl();
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
        <Tab.Screen
          name="Scan"
          component={Scan}
          options={{ title: intl.formatMessage(messages.scan) }}
        />
        <Tab.Screen
          name="Addresses"
          component={Address}
          options={{
            title: intl.formatMessage(messages.addresses),
          }}
        />
      </Tab.Navigator>
    </NavigationContainer>
  );
};

const App = () => (
  <AppWrapper>
    <InnerApp />
  </AppWrapper>
);

export default App;
