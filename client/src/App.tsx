import { useState, useEffect } from "react";
import axios from "axios";

interface Todo {
  id: number;
  title: string;
  completed: boolean;
}

const App = () => {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [title, setTitle] = useState<string>("");
  const [userId, setUserId] = useState<number>(1);

  const API_BASE_URL =
    import.meta.env.VITE_API_BASE_URL || "http://localhost:3000";

  console.log(API_BASE_URL);

  // Fetch todos whenever userId changes
  useEffect(() => {
    axios.get<Todo[]>(`${API_BASE_URL}/todos/${userId}`).then((response) => {
      console.log(response.data);

      setTodos(response.data);
    });
  }, [userId]);

  // Add a new todo
  const addTodo = () => {
    if (title.trim()) {
      axios
        .post<Todo>(`${API_BASE_URL}/todos`, { userId, title })
        .then((response) => {
          setTodos((prevTodos) => [...prevTodos, response.data]);
          setTitle("");
        });
    }
  };

  // Mark todo as completed
  const completeTodo = (id: number) => {
    axios.put(`${API_BASE_URL}/todos/${id}/complete`).then((response) => {
      const updatedTodo = response.data;
      setTodos((prevTodos) =>
        prevTodos.map((todo) =>
          todo.id === updatedTodo.id ? updatedTodo : todo
        )
      );
    });
  };

  return (
    <div className="bg-gray-100 min-h-screen flex items-center justify-center">
      <div className="bg-white p-8 rounded-lg shadow-lg max-w-lg w-full">
        <h1 className="text-3xl font-bold text-center text-indigo-600 mb-6">
          Todo App
        </h1>
        <div className="flex justify-between mb-4">
          <input
            type="number"
            value={userId}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              setUserId(parseInt(e.target.value))
            }
            placeholder="User ID"
            className="border-2 border-gray-300 rounded-lg p-2 w-24 text-center"
          />
          <input
            type="text"
            value={title}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              setTitle(e.target.value)
            }
            placeholder="New Todo"
            className="border-2 border-gray-300 rounded-lg p-2 w-64"
          />
          <button
            onClick={addTodo}
            className="bg-indigo-600 text-white px-4 py-2 rounded-lg ml-2 hover:bg-indigo-700 transition-colors"
          >
            Add Todo
          </button>
        </div>
        <ul className="space-y-4">
          {todos.map((todo) => (
            <li
              key={todo.id}
              className={`flex justify-between items-center p-4 border-2 border-gray-300 rounded-lg shadow-sm ${
                todo.completed ? "bg-green-100" : "bg-white"
              }`}
            >
              <span
                className={`text-lg ${
                  todo.completed ? "line-through text-gray-400" : ""
                }`}
              >
                {todo.title}
              </span>
              <input
                type="checkbox"
                checked={todo.completed}
                onChange={() => completeTodo(todo.id)} // Mark as completed
                className="cursor-pointer"
              />
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default App;
