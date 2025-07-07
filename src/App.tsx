import React, { useState, useEffect } from "react";
import axios from "axios";

type Todo = {
  id: number;
  text: string;
  isEditing?: boolean; // Optional since it's not stored in DB
};

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3001/todos";


const App: React.FC = () => {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [input, setInput] = useState("");
  const [editingText, setEditingText] = useState("");

  // Fetch todos from backend
  useEffect(() => {
    axios.get<Todo[]>(API_URL)
      .then((response) => {
        const todosWithEditing = response.data.map(todo => ({ ...todo, isEditing: false }));
        setTodos(todosWithEditing);
      })
      .catch((error) => {
        console.error("Error fetching todos", error);
      });
  }, []);

  // Add new todo
  const addTodo = async () => {
    if (input.trim() === "") return;

    const newTodo = {
      text: input.trim(),
    };

    try {
      const response = await axios.post<Todo>(API_URL, newTodo);
      const addedTodo = { ...response.data, isEditing: false };
      setTodos((prev) => [...prev, addedTodo]);
      setInput("");
    } catch (error) {
      console.error("Failed to add todo", error);
    }
  };

  // Delete single todo
  const deleteTodo = async (id: number) => {
    const prevTodos = [...todos];
    setTodos(prevTodos.filter((todo) => todo.id !== id));

    try {
      await axios.delete(`${API_URL}/${id}`);
    } catch (error) {
      console.error("Failed to delete todo", error);
      setTodos(prevTodos);
    }
  };

  // Delete all todos
  const deleteAll = async () => {
    const prevTodos = [...todos];
    setTodos([]);

    try {
      await Promise.all(prevTodos.map((todo) => axios.delete(`${API_URL}/${todo.id}`)));
    } catch (error) {
      console.error("Failed to delete all todos", error);
      setTodos(prevTodos);
    }
  };

  // Toggle edit mode
  const toggleEdit = (id: number) => {
    setTodos((prev) =>
      prev.map((todo) =>
        todo.id === id ? { ...todo, isEditing: !todo.isEditing } : todo
      )
    );
    const todo = todos.find((t) => t.id === id);
    if (todo) setEditingText(todo.text);
  };

  // Update todo text
  const updateTodoText = async (id: number, newText: string) => {
    const todoToUpdate = todos.find((todo) => todo.id === id);
    if (!todoToUpdate) return;

    const updatedTodo = { ...todoToUpdate, text: newText };

    try {
      await axios.put(`${API_URL}/${id}`, updatedTodo);
      setTodos((prev) =>
        prev.map((todo) =>
          todo.id === id ? { ...updatedTodo, isEditing: false } : todo
        )
      );
    } catch (error) {
      console.error("Failed to update todo", error);
    }
  };

  // Handle enter key while editing
  const handleKeyDown = (e: React.KeyboardEvent, id: number) => {
    if (e.key === "Enter") {
      updateTodoText(id, editingText);
    }
  };

  return (
    <div className="max-w-lg mx-auto mt-10 p-6 bg-white rounded-lg shadow-lg">
      <h1 className="text-3xl font-bold mb-6 text-center">📝 To-Do List</h1>

      <div className="flex mb-4 space-x-2">
        <input
          className="flex-grow border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && addTodo()}
          placeholder="Enter task..."
        />
        <button
          onClick={addTodo}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
        >
          Add
        </button>
        <button
          onClick={deleteAll}
          disabled={todos.length === 0}
          className="bg-red-600 text-white px-4 py-2 rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-red-700 transition"
        >
          Delete All
        </button>
      </div>

      <ul>
        {todos.map((todo) => (
          <li
            key={todo.id}
            className="flex items-center space-x-3 mb-3 p-3 border rounded shadow-sm"
          >
            {todo.isEditing ? (
              <>
                <input
                  className="flex-grow border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-green-500"
                  value={editingText}
                  onChange={(e) => setEditingText(e.target.value)}
                  onKeyDown={(e) => handleKeyDown(e, todo.id)}
                />
                <button
                  onClick={() => updateTodoText(todo.id, editingText)}
                  className="bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600 transition"
                >
                  Save
                </button>
              </>
            ) : (
              <>
                <span className="flex-grow break-words">{todo.text}</span>
                <button
                  onClick={() => toggleEdit(todo.id)}
                  className="bg-yellow-400 px-3 py-1 rounded hover:bg-yellow-500 transition"
                >
                  Edit
                </button>
              </>
            )}
            <button
              onClick={() => deleteTodo(todo.id)}
              className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600 transition"
            >
              Delete
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default App;
