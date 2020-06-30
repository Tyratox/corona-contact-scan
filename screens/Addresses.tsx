import React, {
  useState,
  useEffect,
  FunctionComponent,
  useCallback,
} from "react";
import { useForm, Controller } from "react-hook-form";
import {
  AsyncStorage,
  Text,
  FlatList,
  Button,
  TouchableOpacity,
  Alert,
} from "react-native";
import styled from "styled-components/native";
import { SafeAreaView } from "react-native-safe-area-context";
import { RootStackParamList } from "../App";
import { StackNavigationProp } from "@react-navigation/stack";
import { AntDesign } from "@expo/vector-icons";
import { Address } from "./Scan";

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
  justify-content: flex-start;
  align-items: center;
  padding: 8px 0;
`;

const ListTexts = styled.View`
  flex: 1;
  flex-direction: row;
  justify-content: flex-start;
  align-items: center;
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

const Addresses: FunctionComponent<{
  navigation: AddressesNavigationProp;
}> = ({ navigation }) => {
  const [refreshing, setRefreshing] = useState<>(false);
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
                      `${item.street}, ${item.postalCode} ${item.city} ${item.phoneNumber}`
                    )
                  }
                >
                  <ListTexts>
                    <ListText>{`${d.getHours()}:${
                      d.getMinutes() >= 10
                        ? d.getMinutes()
                        : "0" + d.getMinutes()
                    }`}</ListText>
                    <ListText>{d.toLocaleDateString()}</ListText>
                    <ListText>{item.firstName + " " + item.lastName}</ListText>
                  </ListTexts>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => deleteEntry(index)}>
                  <AntDesign name="delete" size={20} color="#f00" />
                </TouchableOpacity>
              </ListEntry>
            );
          }}
        ></FlatList>
        <Button title="Lösche Einträge" onPress={deleteEntries} color="#f00" />
      </ListView>
    </ScreenView>
  );
};

export default Addresses;
