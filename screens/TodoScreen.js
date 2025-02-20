import Feather from "@expo/vector-icons/Feather";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import BottomSheet, {
  BottomSheetBackdrop,
  BottomSheetView,
} from "@gorhom/bottom-sheet";
import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  FlatList,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
const TodoScreen = () => {
  const [todos, setTodos] = useState([]);
  const [todoText, setTodoText] = useState("");
  const bottomSheetRef = useRef(null);
  const snapPoints = ["20%", "40%"];

  // Load todos from storage when component mounts
  useEffect(() => {
    loadTodos();
  }, []);

  // Save todos to storage whenever they change
  useEffect(() => {
    saveTodos();
  }, [todos]);

  const loadTodos = async () => {
    try {
      const storedTodos = await AsyncStorage.getItem("todos");
      if (storedTodos) {
        setTodos(JSON.parse(storedTodos));
      }
    } catch (error) {
      console.error("Failed to load todos:", error);
    }
  };

  const saveTodos = async (todosToSave = todos) => {
    try {
      await AsyncStorage.setItem("todos", JSON.stringify(todosToSave));
    } catch (error) {
      console.error("Failed to save todos:", error);
    }
  };

  const addTodo = () => {
    if (todoText.trim()) {
      const newTodo = {
        id: Date.now().toString(),
        title: todoText,
        completed: false,
      };
      setTodos([...todos, newTodo]);
      setTodoText("");
      bottomSheetRef.current?.close();
    }
  };

  const toggleTodo = (id) => {
    setTodos(
      todos.map((todo) =>
        todo.id === id ? { ...todo, completed: !todo.completed } : todo
      )
    );
  };

  const renderItem = ({ item, index }) => (
    <TouchableOpacity
      style={[
        styles.todoItem,
        index === todos.length - 1 && styles.lastTodoItem,
      ]}
      onPress={() => toggleTodo(item.id)}
    >
      <View style={[styles.checkbox, item.completed && styles.filledCheckbox]}>
        {item.completed && <View style={styles.innerCircle} />}
      </View>
      <Text style={[styles.todoText, item.completed && styles.completedText]}>
        {item.title}
      </Text>
    </TouchableOpacity>
  );

  const getCurrentDate = () => {
    const date = new Date();
    const day = date.getDate();
    const month = date.toLocaleString("default", { month: "short" });
    return (
      <View style={styles.dateContainer}>
        <Text style={styles.dateText}>{day}</Text>
        <Text style={styles.monthText}>{month}</Text>
      </View>
    );
  };

  const renderBackdrop = useCallback(
    (props) => (
      <BottomSheetBackdrop
        {...props}
        disappearsOnIndex={-1}
        appearsOnIndex={0}
      />
    ),
    []
  );
  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.settingsIcon}>
          <TouchableOpacity onPress={() => navigation.navigate("Settings")}>
            <MaterialCommunityIcons
              name="dots-horizontal"
              size={28}
              color="black"
            />
          </TouchableOpacity>
        </View>
        <View style={styles.headerContainer}>
          <Text style={styles.header}>Today</Text>
          {getCurrentDate()}
        </View>
        <FlatList
          data={todos}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
          ListEmptyComponent={
            <Text style={styles.emptyText}>No tasks yet!</Text>
          }
        />
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => bottomSheetRef.current?.expand()}
        >
          <Feather name="plus" size={40} color="white" />
        </TouchableOpacity>
        {/* Bottom Sheet */}
        <BottomSheet
          ref={bottomSheetRef}
          index={-1}
          snapPoints={snapPoints}
          enablePanDownToClose
          backdropComponent={renderBackdrop}
          keyboardBehavior="extend"
          handleStyle={styles.handle} // Add handle styling
          backgroundStyle={styles.background}
          handleIndicatorStyle={styles.handleIndicator}
        >
          <BottomSheetView style={styles.bottomSheetContent}>
            <Text style={styles.bottomSheetTitle}>New Task</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter new todo..."
              value={todoText}
              onChangeText={setTodoText}
              autoFocus
            />
            <TouchableOpacity
              style={styles.bottomSheetButton}
              onPress={addTodo}
            >
              <Text style={styles.bottomSheetButtonText}>Add Task</Text>
            </TouchableOpacity>
          </BottomSheetView>
        </BottomSheet>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  dateText: {
    fontSize: 28,
    fontWeight: "800",
  },
  monthText: {
    color: "gray",
    fontSize: 16,
    fontWeight: "600",
  },
  dateContainer: {
    flexDirection: "column",
    justifyContent: "center",
    alignContent: "center",
  },
  settingsIcon: {
    flexDirection: "row",
    justifyContent: "flex-end",
    marginBottom: 10,
  },
  safeArea: {
    flex: 1,
    backgroundColor: "white",
  },
  container: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 30,
    backgroundColor: "white",
  },
  headerContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 15, // More spacing
  },
  header: {
    fontSize: 36,
    fontWeight: "800",
  },

  todoItem: {
    flexDirection: "row",
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
    alignItems: "center",
  },
  lastTodoItem: {
    borderBottomWidth: 0, // Remove border for last item
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: "black",
    marginRight: 10,
    justifyContent: "center",
    alignItems: "center",
  },
  filledCheckbox: {
    backgroundColor: "black",
  },
  innerCircle: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: "white",
  },
  todoText: {
    fontSize: 20,
    fontWeight: "600",
  },
  completedText: {
    textDecorationLine: "line-through",
    color: "gray",
  },
  addButton: {
    position: "absolute",
    bottom: 30,
    right: 20,
    width: 70, // Increased size
    height: 70, // Increased size
    backgroundColor: "black",
    borderRadius: 35,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  emptyText: {
    fontSize: 16,
    color: "gray",
    textAlign: "center",
    marginTop: 20,
  },
  bottomSheetContent: {
    flex: 1,
    padding: 20,
  },
  bottomSheetTitle: {
    fontSize: 24,
    fontWeight: "800",
    marginBottom: 12,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    fontSize: 16,
  },
  bottomSheetButton: {
    backgroundColor: "black",
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
  },
  bottomSheetButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
  handle: {
    backgroundColor: "white",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
  },
  background: {
    backgroundColor: "white",
    borderRadius: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 10,
  },
  handleIndicator: {
    backgroundColor: "#ddd",
    width: 80,
    height: 8,
  },
});

export default TodoScreen;
