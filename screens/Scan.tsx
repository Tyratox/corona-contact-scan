import React, {
  FunctionComponent,
  useState,
  useEffect,
  useCallback,
} from "react";
import { Alert, Text, Button, AsyncStorage, StyleSheet } from "react-native";
import { StackNavigationProp } from "@react-navigation/stack";
import styled from "styled-components/native";
import { SafeAreaView } from "react-native-safe-area-context";
import { BarCodeScanner, BarCodeScannedCallback } from "expo-barcode-scanner";
import { RootStackParamList } from "../App";

const ScreenView = styled(SafeAreaView)`
  flex: 1;
  background-color: #fff;
  align-items: center;
  justify-content: center;
`;

const REQUIRED_KEYS = [
  "firstName",
  "lastName",
  "street",
  "postalCode",
  "city",
  "phoneNumber",
];

export interface Address {
  firstName: string;
  lastName: string;
  street: string;
  postalCode: string;
  city: string;
  phoneNumber: string;
  timestamp: number;
}

type ScanNavigationProp = StackNavigationProp<RootStackParamList, "Scan">;

const Scan: FunctionComponent<{
  navigation: ScanNavigationProp;
}> = ({ navigation }) => {
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [hasPermission, setHasPermission] = useState<null | boolean>(null);
  const [enabled, setEnabled] = useState(true);

  useEffect(() => {
    BarCodeScanner.requestPermissionsAsync().then(({ status }) => {
      setHasPermission(status === "granted");
    });
  }, []);

  useEffect(() => {
    const unsubscribe1 = navigation.addListener("focus", () => {
      setEnabled(true);
      AsyncStorage.getItem("addresses")
        .then((value) => {
          if (value) {
            try {
              setAddresses(JSON.parse(value));
            } catch (e) {
              AsyncStorage.setItem("addresses", "[]");
            }
          }
        })
        .catch((e) => {
          throw new Error(e);
        });
    });

    const unsubscribe2 = navigation.addListener("blur", () =>
      setEnabled(false)
    );

    return () => {
      unsubscribe1();
      unsubscribe2();
    };
  }, [navigation]);

  const handleBarCodeScanned: BarCodeScannedCallback = ({
    type,
    data: rawData,
  }) => {
    if (!enabled) {
      return;
    }

    let data: { [key: string]: string };
    try {
      data = JSON.parse(rawData);
    } catch (e) {
      Alert.alert("Fehler", "Entählt nicht korrekt formatierte Daten!");
      return;
    }

    for (const key of REQUIRED_KEYS) {
      if (!(key in data) || data[key].length === 0) {
        Alert.alert(
          "Fehler",
          `Die eingelesenen Daten sind nicht vollständig oder inkorrekt.`
        );
        break;
      }
    }

    setEnabled(false);

    //@ts-ignore
    const a: Address[] = [...addresses, { ...data, timestamp: Date.now() }];

    a.sort((a, b) => b.timestamp - a.timestamp);

    setAddresses(a);

    Alert.alert("Erfolg", "Kontaktdaten eingelesen", [
      { text: "OK", onPress: () => setEnabled(true) },
    ]);
    AsyncStorage.setItem("addresses", JSON.stringify(a));
  };

  if (hasPermission === null) {
    return <Text>Frage nach Kameraberechtigung</Text>;
  }
  if (hasPermission === false) {
    return <Text>Keinen Zugriff auf die Kamera</Text>;
  }

  return (
    <ScreenView>
      {enabled && (
        <BarCodeScanner
          onBarCodeScanned={handleBarCodeScanned}
          style={StyleSheet.absoluteFillObject}
        />
      )}
    </ScreenView>
  );
};

export default Scan;
