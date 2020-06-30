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
  View,
} from "react-native";
import styled from "styled-components/native";
import { SafeAreaView } from "react-native-safe-area-context";
import { RootStackParamList } from "../App";
import { StackNavigationProp } from "@react-navigation/stack";
import { AntDesign } from "@expo/vector-icons";
import { Address } from "./Scan";
import { defineMessages, useIntl } from "react-intl";

const ScreenView = styled(SafeAreaView)`
  flex: 1;
  background-color: #fff;
`;

const ListView = styled.View`
  flex: 1;
  padding: 28px;
`;

const ListEntry = styled.View`
  flex: 1;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  padding: 8px 0;
`;

const ListTexts = styled.View`
  flex: 1 2;
  flex-direction: column;
  justify-content: center;
  align-items: flex-start;
  width: 90%;
`;
const TimeText = styled.View`
  flex: 1;
  flex-direction: row;
  justify-content: flex-start;
  align-items: center;
  padding-bottom: 4px;
`;

const ListText = styled.Text`
  padding-right: 16px;
`;

const Seperator = styled.View`
  background-color: #ccc;
  height: 0.5px;
`;

type AddressesNavigationProp = StackNavigationProp<
  RootStackParamList,
  "Addresses"
>;

const messages = defineMessages({
  exportEntries: {
    id: "Addresses.exportEntries",
    defaultMessage: "Export Entries",
  },
  deleteEntries: {
    id: "Addresses.deleteEntries",
    defaultMessage: "Delete Entries",
  },
  dismiss: {
    id: "Addresses.dismiss",
    defaultMessage: "Dismiss",
  },
  call: {
    id: "Addresses.call",
    defaultMessage: "Call",
  },
  firstName: {
    id: "Addresses.firstName",
    defaultMessage: "First name",
  },
  lastName: {
    id: "Addresses.lastName",
    defaultMessage: "Last name",
  },
  street: {
    id: "Addresses.street",
    defaultMessage: "Street",
  },
  postalCode: {
    id: "Addresses.postalCode",
    defaultMessage: "Postal code",
  },
  city: {
    id: "Addresses.city",
    defaultMessage: "City",
  },
  phoneNumber: {
    id: "Addresses.phoneNumber",
    defaultMessage: "Phone number",
  },
});

const Addresses: FunctionComponent<{
  navigation: AddressesNavigationProp;
}> = ({ navigation }) => {
  const intl = useIntl();
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
        throw new Error(e);
        setRefreshing(false);
      });
  };

  useEffect(() => {
    return navigation.addListener("focus", updateAddresses);
  }, [navigation]);

  const deleteEntries = () => {
    AsyncStorage.setItem("addresses", "[]");
    setAddresses([]);
  };

  const deleteEntry = (index: number) => {
    addresses.splice(index, 1);
    AsyncStorage.setItem("addresses", JSON.stringify(addresses));
    setAddresses(addresses);
  };

  const exportEntries = async () => {
    const now = new Date();
    const f = `corona-contact-data-export-${now.getFullYear()}-${
      now.getMonth() + 1
    }-${now.getDate()}`;
    await FileSystem.writeAsStringAsync(
      `${FileSystem.cacheDirectory}/${f}.csv`,
      '"' +
        [
          intl.formatMessage(messages.firstName),
          intl.formatMessage(messages.lastName),
          intl.formatMessage(messages.street),
          intl.formatMessage(messages.postalCode),
          intl.formatMessage(messages.city),
          intl.formatMessage(messages.phoneNumber),
        ].join('","') +
        '"\n' +
        addresses
          .map(
            (address) =>
              '"' +
              [
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
        <FlatList
          data={addresses}
          ItemSeparatorComponent={Seperator}
          keyExtractor={(item, index) => item.timestamp.toString()}
          refreshing={refreshing}
          onRefresh={updateAddresses}
          renderItem={({ item, index }) => {
            const d = new Date(item.timestamp);

            return (
              <ListEntry>
                <TouchableOpacity
                  onPress={() =>
                    Alert.alert(
                      item.firstName + " " + item.lastName,
                      `${item.street}, ${item.postalCode} ${item.city} ${item.phoneNumber}`,
                      [
                        {
                          text: intl.formatMessage(messages.dismiss),
                          onPress: () => {},
                          style: "cancel",
                        },
                        {
                          text: intl.formatMessage(messages.call),
                          onPress: () =>
                            Linking.openURL(`tel:${item.phoneNumber}`),
                        },
                      ]
                    )
                  }
                >
                  <ListTexts>
                    <TimeText>
                      <ListText>{`${
                        d.getHours() >= 10 ? d.getHours() : "0" + d.getHours()
                      }:${
                        d.getMinutes() >= 10
                          ? d.getMinutes()
                          : "0" + d.getMinutes()
                      }`}</ListText>
                      <ListText>{d.toLocaleDateString()}</ListText>
                    </TimeText>
                    <ListText numberOfLines={1}>
                      {item.firstName + " " + item.lastName}
                    </ListText>
                  </ListTexts>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => deleteEntry(index)}>
                  <AntDesign name="delete" size={20} color="#f00" />
                </TouchableOpacity>
              </ListEntry>
            );
          }}
        ></FlatList>
        <Button
          title={intl.formatMessage(messages.exportEntries)}
          onPress={exportEntries}
        />
        <Button
          title={intl.formatMessage(messages.deleteEntries)}
          onPress={deleteEntries}
          color="#f00"
        />
      </ListView>
    </ScreenView>
  );
};

export default Addresses;
