import React, { useState, useEffect } from "react";
import axios from "axios";

type Todo = {
  id: number;
  text: string;
  isEditing: boolean;
};

const API_URL = "http://localhost:3001/todos";

const App: React.FC = () => {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [input, setInput] = useState("");


  useEffect(() => {
    axios.get<Todo[]>(API_URL).then((response) => {
      setTodos(response.data);
    });
  }, []);

  const addTodo = async () => {
    if (input.trim() === "") return;

    const newTodo = {
      text: input.trim(),
      isEditing: false,
    };

    const response = await axios.post<Todo>(API_URL, newTodo);
    setTodos([...todos, response.data]);
    setInput("");
  };

  const deleteTodo = async (id: number) => {
    await axios.delete(`${API_URL}/${id}`);
    setTodos(todos.filter((todo) => todo.id !== id));
  };

  const deleteAll = async () => {
    await Promise.all(todos.map((todo) => axios.delete(`${API_URL}/${todo.id}`)));
    setTodos([]);
  };

  const toggleEdit = (id: number) => {
    setTodos(
      todos.map((todo) =>
        todo.id === id ? { ...todo, isEditing: !todo.isEditing } : todo
      )
    );
  };

  const updateTodoText = async (id: number, newText: string) => {
    const todoToUpdate = todos.find((todo) => todo.id === id);
    if (!todoToUpdate) return;

    const updatedTodo = {
      ...todoToUpdate,
      text: newText,
      isEditing: false,
    };

    await axios.put(`${API_URL}/${id}`, updatedTodo);

    setTodos(todos.map((todo) => (todo.id === id ? updatedTodo : todo)));
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
                  value={todo.text}
                  onChange={(e) => updateTodoText(todo.id, e.target.value)}
                />
                <button
                  onClick={() => updateTodoText(todo.id, todo.text)}
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
