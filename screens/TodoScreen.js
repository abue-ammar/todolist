import Feather from "@expo/vector-icons/Feather";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNavigation } from "@react-navigation/native";
import React, { useEffect, useState } from "react";
import {
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
const TodoScreen = () => {
  const [todos, setTodos] = useState([]);
  const navigation = useNavigation();

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

  const addTodo = (newTodoTitle) => {
    if (newTodoTitle.trim()) {
      const newTodo = {
        id: Date.now().toString(),
        title: newTodoTitle,
        completed: false,
      };
      setTodos([...todos, newTodo]);
    }
  };

  const toggleTodo = (id) => {
    setTodos(
      todos.map((todo) =>
        todo.id === id ? { ...todo, completed: !todo.completed } : todo
      )
    );
  };

  const renderItem = ({ item , index}) => (
    <TouchableOpacity
      style={[
        styles.todoItem,
        index === todos.length - 1 && styles.lastTodoItem, // Remove border for last item
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
    // return `${day} ${month}`;
    return (
      <View style={styles.dateContainer}>
        <Text style={styles.dateText}>{day}</Text>
        <Text style={styles.monthText}>{month}</Text>
      </View>
    );
  };

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
          onPress={() => navigation.navigate("AddTodo", { addTodo })}
        >
          <Feather name="plus" size={32} color="white" />
        </TouchableOpacity>
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
    paddingTop: 30, // Increased padding for better spacing
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
    width: 60, // Increased size
    height: 60, // Increased size
    backgroundColor: "black",
    borderRadius: 30,
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
});

export default TodoScreen;
