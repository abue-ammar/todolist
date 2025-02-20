// screens/SettingsScreen.js
import { Feather, MaterialCommunityIcons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as DocumentPicker from "expo-document-picker";
import * as FileSystem from "expo-file-system";
import * as Sharing from "expo-sharing";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const SettingsScreen = ({ navigation }) => {
  const handleExport = async () => {
    try {
      const todos = await AsyncStorage.getItem("todos");
      const fileUri = FileSystem.documentDirectory + "todos.json";

      await FileSystem.writeAsStringAsync(fileUri, todos);
      await Sharing.shareAsync(fileUri, {
        mimeType: "application/json",
        dialogTitle: "Export Todos",
      });
    } catch (error) {
      alert("Error exporting todos");
    }
  };

  const handleImport = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: "application/json",
      });
      const fileContent = await FileSystem.readAsStringAsync(result.uri);
      console.log(fileContent);
      if (result.type === "success") {
        const fileContent = await FileSystem.readAsStringAsync(result.uri);
        const importedTodos = JSON.parse(fileContent);
        if (Array.isArray(importedTodos)) {
          await AsyncStorage.setItem("todos", JSON.stringify(importedTodos));
          alert("Todos imported successfully!");
          navigation.navigate("Todo");
        } else {
          alert("Invalid file format");
        }
      }
    } catch (error) {
      console.log(error);
      alert("Error importing todos");
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.headerContainer}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Feather name="chevron-left" size={28} color="black" />
          </TouchableOpacity>
          <Text style={styles.header}>Settings</Text>
          <View style={{ width: 28 }} />
        </View>

        <View style={styles.settingsContainer}>
          <TouchableOpacity style={styles.optionButton} onPress={handleExport}>
            <MaterialCommunityIcons name="export" size={24} color="black" />
            <Text style={styles.optionText}>Export Todos</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.optionButton} onPress={handleImport}>
            <MaterialCommunityIcons name="import" size={24} color="black" />
            <Text style={styles.optionText}>Import Todos</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "white",
  },
  container: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 30,
  },
  headerContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 30,
  },
  header: {
    fontSize: 32,
    fontWeight: "800",
  },
  settingsContainer: {
    paddingHorizontal: 10,
  },
  optionButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  optionText: {
    fontSize: 18,
    fontWeight: "600",
    marginLeft: 15,
  },
});

export default SettingsScreen;
