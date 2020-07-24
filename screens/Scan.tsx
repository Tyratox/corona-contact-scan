import React, {
  FunctionComponent,
  useState,
  useEffect,
  useCallback,
} from "react";
import {
  Alert,
  Text,
  Button,
  AsyncStorage,
  StyleSheet,
  Linking,
} from "react-native";
import { StackNavigationProp } from "@react-navigation/stack";
import styled from "styled-components/native";
import { SafeAreaView } from "react-native-safe-area-context";
import { FontAwesome5 } from "@expo/vector-icons";
import { BarCodeScanner, BarCodeScannedCallback } from "expo-barcode-scanner";
import { RootStackParamList } from "../App";
import i18n from "i18n-js";
import SegmentedControlTab from "react-native-segmented-control-tab";

enum ScanMode {
  CHECK_IN,
  CHECK_OUT,
}

const ScreenView = styled(SafeAreaView)`
  position: relative;
  flex: 1;
  background-color: #fff;
  align-items: center;
  justify-content: center;
`;

const SwitchView = styled.View`
  position: absolute;
  bottom: 32px;
  left: 16px;
  right: 16px;
`;
const Icon = styled.View`
  margin-right: 8px;
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
  checkout?: number;
}

type ScanNavigationProp = StackNavigationProp<RootStackParamList, "Scan">;

const Scan: FunctionComponent<{
  navigation: ScanNavigationProp;
}> = ({ navigation }) => {
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [hasPermission, setHasPermission] = useState<null | boolean>(null);
  const [enabled, setEnabled] = useState(true);
  const [scanMode, setScanMode] = useState<ScanMode>(ScanMode.CHECK_IN);

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
      Alert.alert(i18n.t("error"), i18n.t("invalidFormat"));
      return;
    }

    for (const key of REQUIRED_KEYS) {
      if (!(key in data) || data[key].length === 0) {
        Alert.alert(i18n.t("error"), i18n.t("dataIncompleteInvalid"));
        break;
      }
    }

    setEnabled(false);

    if (scanMode === ScanMode.CHECK_IN) {
      //@ts-ignore
      const a: Address[] = [...addresses, { ...data, timestamp: Date.now() }];

      a.sort((a, b) => b.timestamp - a.timestamp);

      setAddresses(a);

      Alert.alert(
        i18n.t("success"),
        i18n.t("dataRead") +
          "\n" +
          `${data.firstName} ${data.lastName}, ${data.street} ${data.postalCode} ${data.city}` +
          "\n" +
          data.phoneNumber,
        [
          {
            text: `${i18n.t("testcall")}`,
            onPress: () => {
              Linking.openURL(`tel:${data.phoneNumber}`).then(() =>
                setEnabled(true)
              );
            },
          },
          {
            text: i18n.t("ok"),
            onPress: () => setEnabled(true),
          },
        ]
      );
      AsyncStorage.setItem("addresses", JSON.stringify(a));
    } else {
      const a = [...addresses.sort((a, b) => b.timestamp - a.timestamp)];
      const addr = a.find(
        (a) => a.phoneNumber.trim() === data.phoneNumber.trim()
      );

      if (!addr) {
        Alert.alert(i18n.t("error"), i18n.t("noMatchingCheckIn"));
        return;
      }

      addr.checkout = Date.now();
      setAddresses(a);

      Alert.alert(i18n.t("checkout-success"), undefined, [
        {
          text: i18n.t("ok"),
          onPress: () => setEnabled(true),
        },
      ]);
      AsyncStorage.setItem("addresses", JSON.stringify(a));
    }
  };

  if (hasPermission === null) {
    return (
      <ScreenView>
        <Text>{i18n.t("askingPermissions")}</Text>
      </ScreenView>
    );
  }
  if (hasPermission === false) {
    return (
      <ScreenView>
        <Text>{i18n.t("noPermissions")}</Text>
      </ScreenView>
    );
  }

  return (
    <ScreenView>
      {enabled && (
        <>
          <BarCodeScanner
            onBarCodeScanned={handleBarCodeScanned}
            style={StyleSheet.absoluteFillObject}
          />
          <SwitchView>
            <SegmentedControlTab
              selectedIndex={scanMode}
              values={[i18n.t("check-in"), i18n.t("check-out")]}
              onTabPress={setScanMode}
              tabTextStyle={{ color: "#000" }}
              activeTabTextStyle={{ color: "#000" }}
              activeTabStyle={{ backgroundColor: "#FFEA2A" }}
              tabStyle={{ borderColor: "#000" }}
            />
          </SwitchView>
        </>
      )}
    </ScreenView>
  );
};

export default Scan;
