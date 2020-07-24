import React, {
  useState,
  useEffect,
  FunctionComponent,
  useCallback,
} from "react";
import * as Sharing from "expo-sharing";
import * as FileSystem from "expo-file-system";
import {
  AsyncStorage,
  Text,
  FlatList,
  Button,
  TouchableOpacity,
  Alert,
  Linking,
  ActivityIndicator,
  View,
} from "react-native";
import styled from "styled-components/native";
import { SafeAreaView } from "react-native-safe-area-context";
import { RootStackParamList } from "../App";
import { StackNavigationProp } from "@react-navigation/stack";
import { Address } from "./Scan";
import i18n from "i18n-js";

const ScreenView = styled(SafeAreaView)`
  flex: 1;
  background-color: #fff;
`;

const ListView = styled.View`
  flex: 1;
  padding: 28px;
`;

const ListEntry = styled.View`
  padding: 8px 0;
`;

const TimeText = styled.View`
  padding-bottom: 4px;
`;

const Seperator = styled.View`
  background-color: #ccc;
  height: 0.5px;
`;

const Spacer = styled.View`
  margin-bottom: 16px;
`;

type AddressesNavigationProp = StackNavigationProp<
  RootStackParamList,
  "Addresses"
>;

const Addresses: FunctionComponent<{
  navigation: AddressesNavigationProp;
}> = ({ navigation }) => {
  const [refreshing, setRefreshing] = useState(false);
  const [addresses, setAddresses] = useState<Address[]>([]);

  const updateAddresses = () => {
    setRefreshing(true);
    AsyncStorage.getItem("addresses")
      .then((value) => {
        if (value) {
          try {
            setAddresses(JSON.parse(value));
          } catch (e) {
            AsyncStorage.setItem("addresses", "[]");
          }
        }

        setRefreshing(false);
      })
      .catch((e) => {
        setRefreshing(false);
        throw new Error(e);
      });
  };

  useEffect(() => {
    const removeListener1 = navigation.addListener("focus", updateAddresses);
    const removeListener2 = navigation.addListener("blur", () =>
      setAddresses([])
    );
    return () => {
      removeListener1();
      removeListener2();
    };
  }, [navigation]);

  const deleteEntries = () => {
    AsyncStorage.setItem("addresses", "[]");
    setAddresses([]);
  };

  const deleteEntry = (index: number) => {
    const newAddresses = addresses.filter((_, i) => i !== index);
    AsyncStorage.setItem("addresses", JSON.stringify(newAddresses));
    setAddresses(newAddresses);
  };

  const exportEntries = async () => {
    const now = new Date();
    const f = `ciao-data-export-${now.getFullYear()}-${
      now.getMonth() + 1
    }-${now.getDate()}`;
    await FileSystem.writeAsStringAsync(
      `${FileSystem.cacheDirectory}/${f}.csv`,
      '"' +
        [
          i18n.t("check-in"),
          i18n.t("check-out"),
          i18n.t("firstName"),
          i18n.t("lastName"),
          i18n.t("street"),
          i18n.t("postalCode"),
          i18n.t("city"),
          i18n.t("phoneNumber"),
        ].join('","') +
        '"\n' +
        addresses
          .map(
            (address) =>
              '"' +
              [
                new Date(address.timestamp).toLocaleString(),
                address.checkout
                  ? new Date(address.checkout).toLocaleString()
                  : "",
                address.firstName,
                address.lastName,
                address.street,
                address.postalCode,
                address.city,
                address.phoneNumber,
              ].join('","') +
              '"'
          )
          .join("\n")
    );
    await Sharing.shareAsync(`${FileSystem.cacheDirectory}/${f}.csv`);
    await FileSystem.deleteAsync(`${FileSystem.cacheDirectory}/${f}.csv`);
  };

  return (
    <ScreenView>
      <ListView>
        {refreshing && addresses.length === 0 && (
          <ActivityIndicator size="large" color="#000" />
        )}
        {!refreshing && addresses.length === 0 && (
          <Text>{i18n.t("noEntriesYet")}</Text>
        )}
        <FlatList
          data={addresses}
          ItemSeparatorComponent={Seperator}
          keyExtractor={(item, index) => item.timestamp.toString()}
          refreshing={refreshing}
          onRefresh={updateAddresses}
          renderItem={({ item, index }) => {
            const d1 = new Date(item.timestamp);
            const d2 = item.checkout ? new Date(item.checkout) : undefined;

            return (
              <ListEntry>
                <TouchableOpacity
                  onPress={() =>
                    Alert.alert(
                      item.firstName + " " + item.lastName,
                      `${item.street}, ${item.postalCode} ${item.city} ${item.phoneNumber}`,
                      [
                        {
                          text: i18n.t("dismiss"),
                          onPress: () => {},
                          style: "cancel",
                        },
                        {
                          text: i18n.t("call"),
                          onPress: () =>
                            Linking.openURL(`tel:${item.phoneNumber}`),
                        },
                        {
                          text: i18n.t("deleteEntry"),
                          onPress: () => deleteEntry(index),
                          style: "destructive",
                        },
                      ]
                    )
                  }
                >
                  <TimeText>
                    <Text>
                      {`${
                        d1.getHours() >= 10
                          ? d1.getHours()
                          : "0" + d1.getHours()
                      }:${
                        d1.getMinutes() >= 10
                          ? d1.getMinutes()
                          : "0" + d1.getMinutes()
                      }  ${d1.toLocaleDateString()} ${
                        d2
                          ? `- ${
                              d2.getHours() >= 10
                                ? d2.getHours()
                                : "0" + d2.getHours()
                            }:${
                              d2.getMinutes() >= 10
                                ? d2.getMinutes()
                                : "0" + d2.getMinutes()
                            }  ${d2.toLocaleDateString()}`
                          : ""
                      }`}
                    </Text>
                  </TimeText>
                  <Text numberOfLines={1}>
                    {item.firstName + " " + item.lastName}
                  </Text>
                </TouchableOpacity>
              </ListEntry>
            );
          }}
        ></FlatList>
        <Button title={i18n.t("exportEntries")} onPress={exportEntries} />
        <Spacer />
        <Button
          title={i18n.t("deleteEntries")}
          onPress={deleteEntries}
          color="#f00"
        />
      </ListView>
    </ScreenView>
  );
};

export default Addresses;
