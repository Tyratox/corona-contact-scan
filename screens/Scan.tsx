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
import { BarCodeScanner, BarCodeScannedCallback } from "expo-barcode-scanner";
import { RootStackParamList } from "../App";
import { useIntl, defineMessages } from "react-intl";

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

const messages = defineMessages({
  error: {
    id: "Scan.error",
    defaultMessage: "Error",
  },
  errorInvalidFormat: {
    id: "Scan.error.invalidFormat",
    defaultMessage: "The scanned data isn't formatted correctly",
  },
  errorDataIncompleteInvalid: {
    id: "Scan.error.dataIncompleteWrong",
    defaultMessage: "The scanned data is incomplete or invalid",
  },
  success: {
    id: "Scan.success",
    defaultMessage: "Success",
  },
  dataRead: {
    id: "Scan.success.dataRead",
    defaultMessage: "Contact data successfully read",
  },
  testcall: {
    id: "Scan.success.testcall",
    defaultMessage: "Testcall",
  },
  ok: {
    id: "Scan.success.ok",
    defaultMessage: "OK",
  },
  askingPermissions: {
    id: "Scan.askingPermissions",
    defaultMessage: "Asking for access to the camera",
  },
  noPermissions: {
    id: "Scan.noPermissions",
    defaultMessage:
      "No permissions to access the camera. You can change this in the privacy settings.",
  },
});

const Scan: FunctionComponent<{
  navigation: ScanNavigationProp;
}> = ({ navigation }) => {
  const intl = useIntl();
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
      Alert.alert(
        intl.formatMessage(messages.error),
        intl.formatMessage(messages.errorInvalidFormat)
      );
      return;
    }

    for (const key of REQUIRED_KEYS) {
      if (!(key in data) || data[key].length === 0) {
        Alert.alert(
          intl.formatMessage(messages.error),
          intl.formatMessage(messages.errorDataIncompleteInvalid)
        );
        break;
      }
    }

    setEnabled(false);

    //@ts-ignore
    const a: Address[] = [...addresses, { ...data, timestamp: Date.now() }];

    a.sort((a, b) => b.timestamp - a.timestamp);

    setAddresses(a);

    Alert.alert(
      intl.formatMessage(messages.success),
      intl.formatMessage(messages.dataRead) +
        "\n" +
        `${data.firstName} ${data.lastName}, ${data.street} ${data.postalCode} ${data.city}` +
        "\n" +
        data.phoneNumber,
      [
        {
          text: `${intl.formatMessage(messages.testcall)}`,
          onPress: () => Linking.openURL(`tel:${data.phoneNumber}`),
        },
        {
          text: intl.formatMessage(messages.ok),
          onPress: () => setEnabled(true),
        },
      ]
    );
    AsyncStorage.setItem("addresses", JSON.stringify(a));
  };

  if (hasPermission === null) {
    return <Text>{intl.formatMessage(messages.askingPermissions)}</Text>;
  }
  if (hasPermission === false) {
    return <Text>{intl.formatMessage(messages.noPermissions)}</Text>;
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
