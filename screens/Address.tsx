import React, {
  useState,
  useEffect,
  FunctionComponent,
  useCallback,
} from "react";
import { useForm, Controller } from "react-hook-form";
import {
  KeyboardAvoidingView,
  AsyncStorage,
  Button,
  Text,
  Alert,
  Platform,
} from "react-native";
import styled from "styled-components/native";
import { SafeAreaView } from "react-native-safe-area-context";
import { RootStackParamList } from "../App";
import { StackNavigationProp } from "@react-navigation/stack";

const ScreenView = styled(SafeAreaView)`
  flex: 1;
  background-color: #fff;
  padding-left: 28px;
  padding-right: 28px;
`;

const StyledKeyboardAvoidingView = styled(KeyboardAvoidingView)`
  flex: 1;
`;

const Form = styled.View`
  flex: 1;
  flex-direction: column;
  justify-content: center;
`;

const Table = styled.View`
  flex: 1;
  align-items: center;
  justify-content: center;
`;

const Row = styled.View`
  flex: 1;
  flex-direction: row;
`;

const Col = styled.View`
  flex: 1;
  align-self: stretch;
`;

const Label = styled.Text`
  font-size: 16px;
`;
const StyledTextInput = styled.TextInput`
  font-size: 16px;
`;

type AddressNavigationProp = StackNavigationProp<RootStackParamList, "Address">;

const Address: FunctionComponent<{
  navigation: AddressNavigationProp;
}> = ({ navigation }) => {
  const { control, handleSubmit, setValue, reset, errors } = useForm({
    mode: "onSubmit",
    defaultValues: {
      firstName: "",
      lastName: "",
      street: "",
      postalCode: "",
      city: "",
      phoneNumber: "",
    },
  }); // initialise the hook
  const onSubmit = async (data: { [key: string]: string }) => {
    try {
      await AsyncStorage.setItem("address", JSON.stringify(data));
    } catch (error) {
      // Error saving data
      throw error;
    }
  };

  const deleteData = async () => {
    try {
      reset();
      await AsyncStorage.removeItem("address");
    } catch (error) {
      // Error saving data
      throw error;
    }
  };

  useEffect(() => {
    const unsubscribe = navigation.addListener("focus", () => {
      AsyncStorage.getItem("address")
        .then((value) => {
          if (value) {
            const obj = JSON.parse(value);
            Object.keys(obj).forEach((key) => {
              setValue(key, obj[key], false);
            });
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
      <StyledKeyboardAvoidingView
        behavior={Platform.OS == "ios" ? "padding" : "height"}
      >
        <Form>
          <Table>
            <Row />
            <Row>
              <Col>
                <Label>Vorname</Label>
              </Col>
              <Col>
                <Controller
                  as={StyledTextInput}
                  control={control}
                  name="firstName"
                  onChange={(args) => args[0].nativeEvent.text}
                  rules={{ required: true, minLength: 1 }}
                  placeholder="Max"
                />
                {errors.firstName && <Text>Wird benötigt.</Text>}
              </Col>
            </Row>
            <Row>
              <Col>
                <Label>Nachname</Label>
              </Col>
              <Col>
                <Controller
                  as={StyledTextInput}
                  control={control}
                  name="lastName"
                  onChange={(args) => args[0].nativeEvent.text}
                  rules={{ required: true, minLength: 1 }}
                  placeholder="Mustermann"
                />
                {errors.lastName && <Text>Wird benötigt.</Text>}
              </Col>
            </Row>
            <Row>
              <Col>
                <Label>Strasse</Label>
              </Col>
              <Col>
                <Controller
                  as={StyledTextInput}
                  control={control}
                  name="street"
                  onChange={(args) => args[0].nativeEvent.text}
                  rules={{ required: true, minLength: 1 }}
                  placeholder="Musterstrasse 42"
                />
                {errors.street && <Text>Wird benötigt.</Text>}
              </Col>
            </Row>
            <Row>
              <Col>
                <Label>Postleitzahl</Label>
              </Col>
              <Col>
                <Controller
                  as={StyledTextInput}
                  control={control}
                  name="postalCode"
                  onChange={(args) => args[0].nativeEvent.text}
                  rules={{ required: true, minLength: 1 }}
                  placeholder="5000"
                />
                {errors.postalCode && <Text>Wird benötigt.</Text>}
              </Col>
            </Row>
            <Row>
              <Col>
                <Label>Ort</Label>
              </Col>
              <Col>
                <Controller
                  as={StyledTextInput}
                  control={control}
                  name="city"
                  onChange={(args) => args[0].nativeEvent.text}
                  rules={{ required: true, minLength: 1 }}
                  placeholder="Aarau"
                />
                {errors.city && <Text>Wird benötigt.</Text>}
              </Col>
            </Row>
            <Row>
              <Col>
                <Label>Telefonnummer</Label>
              </Col>
              <Col>
                <Controller
                  as={StyledTextInput}
                  control={control}
                  name="phoneNumber"
                  onChange={(args) => args[0].nativeEvent.text}
                  rules={{ required: true, minLength: 10 }}
                  placeholder="062 000 00 00"
                />
                {errors.phoneNumber && <Text>Wird benötigt.</Text>}
              </Col>
            </Row>
            <Row>
              <Col>
                <Button title="Speichern" onPress={handleSubmit(onSubmit)} />
              </Col>
            </Row>
            <Row>
              <Col>
                <Button
                  title="Daten Löschen"
                  color="#f00"
                  onPress={deleteData}
                />
              </Col>
            </Row>
          </Table>
        </Form>
      </StyledKeyboardAvoidingView>
    </ScreenView>
  );
};

export default Address;
