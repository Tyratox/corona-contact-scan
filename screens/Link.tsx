import React, { FunctionComponent } from "react";
import { Dimensions } from "react-native";
import { StackNavigationProp } from "@react-navigation/stack";
import styled from "styled-components/native";
import { SafeAreaView } from "react-native-safe-area-context";
import QR from "react-native-qrcode-svg";
import { RootStackParamList } from "../App";

const ScreenView = styled(SafeAreaView)`
  flex: 1;
  background-color: #fff;
  align-items: center;
  justify-content: center;
`;

type LinkNavigationProp = StackNavigationProp<RootStackParamList, "Link">;

const Link: FunctionComponent<{
  navigation: LinkNavigationProp;
}> = ({ navigation }) => {
  const windowWidth = Dimensions.get("window").width;

  return (
    <ScreenView>
      <QR
        value="https://ciao.feuerschutz.ch"
        size={(3 / 4) * windowWidth}
        color={"#000"}
      />
    </ScreenView>
  );
};

export default Link;
