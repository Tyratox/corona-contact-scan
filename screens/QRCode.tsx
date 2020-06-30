import React, {
  FunctionComponent,
  useState,
  useEffect,
  useCallback,
} from "react";
import { Alert, Text, Button, AsyncStorage } from "react-native";
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

type QRCodeNavigationProp = StackNavigationProp<RootStackParamList, "QRCode">;

const QRCode: FunctionComponent<{
  navigation: QRCodeNavigationProp;
}> = ({ navigation }) => {
  const [address, setAddress] = useState<undefined | null | string>(undefined);

  useEffect(() => {
    const unsubscribe = navigation.addListener("focus", () => {
      AsyncStorage.getItem("address")
        .then((value) => {
          if (value) {
            setAddress(value);
          } else {
            setAddress(null);
          }
        })
        .catch((e) => {
          throw new Error(e);
        });
    });

    return unsubscribe;
  }, [navigation]);

  return (
    <ScreenView>
      {address === undefined ? (
        <></>
      ) : address === null ? (
        <>
          <Text>Es wurde noch keine Adresse hinterlegt.</Text>
          <Button
            title="Adresse hinterlegen"
            onPress={() => navigation.navigate("Address")}
          />
        </>
      ) : (
        <>
          <QR value={address} size={250} />
        </>
      )}
    </ScreenView>
  );
};

export default QRCode;
