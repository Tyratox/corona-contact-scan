import React, { FunctionComponent } from "react";
import { Dimensions } from "react-native";
import { StackNavigationProp } from "@react-navigation/stack";
import styled from "styled-components/native";
import { SafeAreaView } from "react-native-safe-area-context";
import QR from "react-native-qrcode-svg";
import { RootStackParamList } from "../App";
import i18n from "i18n-js";

const ScreenView = styled(SafeAreaView)`
  flex: 1;
  background-color: #fff;
  align-items: center;
  justify-content: center;
`;

const PaddedText = styled.Text`
  padding-top: 16px;
  width: 75%;
`;

type LinkNavigationProp = StackNavigationProp<RootStackParamList, "Link">;

const Link: FunctionComponent<{
  navigation: LinkNavigationProp;
}> = ({ navigation }) => {
  const windowWidth = Dimensions.get("window").width;

  return (
    <ScreenView>
      <>
        <QR
          value="https://ciao.feuerschutz.ch"
          size={(3 / 4) * windowWidth}
          color={"#000"}
        />
        <PaddedText>{i18n.t("showLinkToCustomers")}</PaddedText>
      </>
    </ScreenView>
  );
};

export default Link;
