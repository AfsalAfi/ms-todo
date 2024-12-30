import "module-alias/register";
import express, { Request, Response } from "express";
import * as grpc from "@grpc/grpc-js";
import * as protoLoader from "@grpc/proto-loader";
import path from "path";
import cors from "cors";

type ServiceError = grpc.ServiceError;

// Define gRPC message and service types for TodoService
interface Todo {
  id: string;
  title: string;
  completed: boolean;
  userId: number;
}

interface GetTodosRequest {
  userId: number;
}

interface GetTodosResponse {
  todos: Todo[];
}

interface CompleteTodoRequest {
  id: string;
}

interface CompleteTodoResponse {
  todo: Todo;
}

interface CreateTodoRequest {
  userId: number;
  title: string;
}

interface CreateTodoResponse {
  todo: Todo;
}

interface TodoServiceClient extends grpc.Client {
  GetTodos(
    request: GetTodosRequest,
    callback: (error: ServiceError | null, response: GetTodosResponse) => void
  ): void;
  CreateTodo(
    request: CreateTodoRequest,
    callback: (error: ServiceError | null, response: CreateTodoResponse) => void
  ): void;
  CompleteTodo(
    request: CompleteTodoRequest,
    callback: (
      error: ServiceError | null,
      response: CompleteTodoResponse
    ) => void
  ): void;
}

// Define gRPC message and service types for UserService
interface UserServiceClient extends grpc.Client {
  GetUser(
    request: { id: number },
    callback: (
      error: ServiceError | null,
      response: { id: number; name: string }
    ) => void
  ): void;
}

// Define paths for Protobuf files
const todoProtoPath = path.resolve(__dirname, "../../proto/todo.proto");
const userProtoPath = path.resolve(__dirname, "../../proto/user.proto");

// Load Protobuf definitions for TodoService and UserService
const todoPackageDef = protoLoader.loadSync(todoProtoPath, {
  keepCase: true,
  longs: String,
  enums: String,
  defaults: true,
  oneofs: true,
});

const userPackageDef = protoLoader.loadSync(userProtoPath, {
  keepCase: true,
  longs: String,
  enums: String,
  defaults: true,
  oneofs: true,
});

// Load gRPC package definitions
const todoProto = grpc.loadPackageDefinition(todoPackageDef) as any;
const userProto = grpc.loadPackageDefinition(userPackageDef) as any;

console.log(`${process.env.USER_SERVICE_HOST}:${process.env.USER_SERVICE_PORT}`,"$$$",
`${process.env.TODO_SERVICE_HOST}:${process.env.TODO_SERVICE_PORT}`);


// Initialize gRPC clients for TodoService and UserService
const userServiceAddress = `${process.env.USER_SERVICE_HOST}:${process.env.USER_SERVICE_PORT}`;
const todoServiceAddress = `${process.env.TODO_SERVICE_HOST}:${process.env.TODO_SERVICE_PORT}`;

const todoClient = new todoProto.TodoService(
  todoServiceAddress,
  grpc.credentials.createInsecure()
) as TodoServiceClient;

const userClient = new userProto.user.UserService(
  userServiceAddress,
  grpc.credentials.createInsecure()
) as UserServiceClient;

// Create Express app
const app = express();

// Enable CORS for all origins
app.use(cors());
app.use(express.json());

// Fetch Todos by userId
app.get("/todos/:userId", (req: Request, res: Response) => {
  const userId: number = parseInt(req.params.userId, 10);

  console.log("Request to fetch todos for user:", userId);

  // Call gRPC GetTodos method
  todoClient.GetTodos({ userId }, (err, response) => {
    if (err) {
      console.error("Error fetching todos:", err.message);
      return res.status(500).json({ error: err.message });
    }
    console.log(response.todos);

    return res.status(200).json(response.todos);
  });
});

// Create a new Todo
app.post("/todos", (req: Request, res: Response) => {
  const { userId, title }: { userId: number; title: string } = req.body;

  console.log("Request to create a new todo:", req.body);

  // Validate input
  // if (!userId || !title) {
  //   return res.status(400).json({ error: "User ID and title are required" });
  // }

  // Verify user existence via UserService
  userClient.GetUser({ id: userId }, (err: ServiceError | null, user: any) => {
    if (err) {
      console.error("Error fetching user:", err.message);
      return res.status(404).json({ error: "User not found" });
    }

    // Call gRPC CreateTodo method
    todoClient.CreateTodo({ userId, title }, (err, response) => {
      if (err) {
        console.error("Error creating todo:", err.message);
        return res.status(500).json({ error: err.message });
      }
      return res.status(201).json(response.todo);
    });
  });
});

// Mark a Todo as completed
app.put("/todos/:id/complete", (req: Request, res: Response) => {
  const todoId: string = req.params.id;

  console.log("Request to mark todo as completed:", todoId);

  // Call gRPC CompleteTodo method
  todoClient.CompleteTodo({ id: todoId }, (err, response) => {
    if (err) {
      console.error("Error completing todo:", err.message);
      return res.status(500).json({ error: err.message });
    }
    return res.status(200).json(response.todo);
  });
});

// Handle invalid routes
app.use((req, res) => {
  res.status(404).json({ error: "Route not found" });
});

// Start the server
const port = 3000;
app.listen(port, () => {
  console.log(`API Gateway running on port ${port}`);
});
