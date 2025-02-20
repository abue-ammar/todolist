import Feather from "@expo/vector-icons/Feather";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import BottomSheet, {
  BottomSheetBackdrop,
  BottomSheetView,
} from "@gorhom/bottom-sheet";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Haptics from "expo-haptics";
import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  FlatList,
  Keyboard,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { RectButton } from "react-native-gesture-handler";
import Swipeable from "react-native-gesture-handler/ReanimatedSwipeable";
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
      Keyboard.dismiss();
    }
  };

  const toggleTodo = (id) => {
    setTodos(
      todos.map((todo) =>
        todo.id === id ? { ...todo, completed: !todo.completed } : todo
      )
    );
  };
  const deleteTodo = (id) => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setTodos(todos.filter((todo) => todo.id !== id));
  };

  const renderItem = ({ item, index }) => {
    const renderRightActions = (progress, dragX) => (
      <View style={styles.rightActionContainer}>
        <RectButton
          style={styles.deleteButton}
          onPress={() => deleteTodo(item.id)}
        >
          <Feather name="trash-2" size={24} color="#ff3b30" />
        </RectButton>
      </View>
    );

    return (
      <Swipeable
        friction={1}
        rightThreshold={100}
        renderRightActions={renderRightActions}
        onSwipeableWillOpen={() => {
          deleteTodo(item.id);
        }}
      >
        <TouchableOpacity
          style={[
            styles.todoItem,
            index === todos.length - 1 && styles.lastTodoItem,
          ]}
          onPress={() => toggleTodo(item.id)}
        >
          <View
            style={[styles.checkbox, item.completed && styles.filledCheckbox]}
          >
            {item.completed && <Feather name="check" size={16} color="white" />}
          </View>
          <Text
            style={[styles.todoText, item.completed && styles.completedText]}
          >
            {item.title}
          </Text>
        </TouchableOpacity>
      </Swipeable>
    );
  };

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
  const handleSheetChange = (index) => {
    if (index === -1) {
      Keyboard.dismiss();
    }
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
            <View style={styles.emptyContainer}>
              <Feather
                name="check-circle"
                size={64}
                color="#ddd"
                style={styles.emptyIcon}
              />
              <Text style={styles.emptyText}>No tasks yet!</Text>
              <Text style={[styles.emptyText, { fontSize: 14 }]}>
                Swipe left on tasks to delete them
              </Text>
            </View>
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
          onChange={handleSheetChange}
          snapPoints={snapPoints}
          enablePanDownToClose
          backdropComponent={renderBackdrop}
          keyboardBlurBehavior="restore" // Restores position when keyboard dismisses
          keyboardBehavior="interactive"
          handleStyle={styles.handle} // Add handle styling
          backgroundStyle={styles.background}
          handleIndicatorStyle={styles.handleIndicator}
        >
          <BottomSheetView style={styles.bottomSheetContent}>
            <Text style={styles.bottomSheetTitle}>New Task</Text>
            <View style={styles.inputContainer}>
              <TextInput
                style={styles.input}
                placeholder="Enter new todo..."
                value={todoText}
                onChangeText={setTodoText}
                maxLength={36}
                multiline
              />
              <Text style={styles.charCounter}>{todoText.length}/36</Text>
            </View>
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

  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 60,
  },
  emptyIcon: {
    opacity: 0.3,
    marginBottom: 16,
  },
  inputContainer: {
    marginBottom: 16,
  },
  charCounter: {
    textAlign: "right",
    color: "#888",
    fontSize: 12,
    marginTop: 4,
  },
  rightActionContainer: {
    justifyContent: "center",
  },

  deleteButton: {
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
  },
});

export default TodoScreen;
