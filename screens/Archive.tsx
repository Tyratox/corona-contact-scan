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

const FileName = styled.View`
  padding-bottom: 4px;
`;
const Title = styled.Text`
  font-size: 30px;
  font-weight: bold;
  margin-bottom: 16px;
`;

const Seperator = styled.View`
  background-color: #ccc;
  height: 0.5px;
`;

const getFilenameFromPath = (path: string) => path.replace(/^.*[\\\/]/, "");

type ArchiveNavigationProp = StackNavigationProp<RootStackParamList, "Archive">;
const getFilesInDir = async (directory: string) => {
  const dirInfo = await FileSystem.getInfoAsync(directory);
  if (!dirInfo.exists) {
    return [];
  }

  return FileSystem.readDirectoryAsync(directory).then((entries) =>
    Promise.all(
      entries.map((e) => FileSystem.getInfoAsync(`${directory}${e}`))
    ).then((entries) => entries.filter((e) => !e.isDirectory))
  );
};

const Archive: FunctionComponent<{
  navigation: ArchiveNavigationProp;
}> = ({ navigation }) => {
  const [refreshing, setRefreshing] = useState(false);
  const [files, setFiles] = useState<FileSystem.FileInfo[]>([]);

  const updateFiles = () => {
    setRefreshing(true);
    getFilesInDir(`${FileSystem.documentDirectory}archive/`)
      .then((entries) => {
        setFiles(
          entries.sort(
            (a, b) => (b.modificationTime || 0) - (a.modificationTime || 0)
          )
        );
        setRefreshing(false);
      })
      .catch((e) => {
        setRefreshing(false);
        throw new Error(e);
      });
  };

  return (
    <ScreenView>
      <ListView>
        <Title>{i18n.t("archive")}</Title>
        {refreshing && files.length === 0 && (
          <ActivityIndicator size="large" color="#000" />
        )}
        {!refreshing && files.length === 0 && (
          <Text>{i18n.t("noArchivedEntriesYet")}</Text>
        )}
        <FlatList
          data={files}
          ItemSeparatorComponent={Seperator}
          keyExtractor={(item, index) =>
            item.modificationTime?.toString() || index.toString()
          }
          refreshing={refreshing}
          onRefresh={updateFiles}
          renderItem={({ item, index }) => {
            const name = getFilenameFromPath(item.uri);

            return (
              <ListEntry>
                <TouchableOpacity
                  onPress={() =>
                    Alert.alert(name, undefined, [
                      {
                        text: i18n.t("dismiss"),
                        onPress: () => {},
                        style: "cancel",
                      },
                      {
                        text: i18n.t("exportEntries"),
                        onPress: async () => {
                          await Sharing.shareAsync(item.uri);
                        },
                      },
                      {
                        text: i18n.t("deleteBackup"),
                        onPress: () => {
                          FileSystem.deleteAsync(item.uri).then(() => {
                            setFiles(files.filter((_, i) => i !== index));
                          });
                        },
                        style: "destructive",
                      },
                    ])
                  }
                >
                  <FileName>
                    <Text>{name}</Text>
                  </FileName>
                </TouchableOpacity>
              </ListEntry>
            );
          }}
        ></FlatList>
      </ListView>
    </ScreenView>
  );
};

export default Archive;
