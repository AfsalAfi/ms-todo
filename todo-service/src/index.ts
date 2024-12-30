import 'module-alias/register';
import * as grpc from '@grpc/grpc-js';
import * as protoLoader from '@grpc/proto-loader';
import path from 'path';

// Types for gRPC service definitions
type ServiceError = grpc.ServiceError;
type ServerUnaryCall<TRequest, TResponse> = grpc.ServerUnaryCall<TRequest, TResponse>;
type sendUnaryData<TResponse> = grpc.sendUnaryData<TResponse>;

// Load Protobuf definitions
const todoProtoPath = path.resolve(__dirname, "../../proto/todo.proto");
const userProtoPath = path.resolve(__dirname, "../../proto/user.proto");

console.log('User Proto Path:', userProtoPath);
console.log('Todo Proto Path:', todoProtoPath);


// Load protobuf files with options
const userPackageDef = protoLoader.loadSync(userProtoPath, {
  keepCase: true,
  longs: String,
  enums: String,
  defaults: true,
  oneofs: true,
});

const todoPackageDef = protoLoader.loadSync(todoProtoPath, {
  keepCase: true,
  longs: String,
  enums: String,
  defaults: true,
  oneofs: true,
});



// Load the package definitions into the grpc object
const userProto: any = grpc.loadPackageDefinition(userPackageDef) as any;
const todoProto: any = grpc.loadPackageDefinition(todoPackageDef).TodoService;

// console.log('Loaded userProto:', userProto);
console.log('Loaded todoProto:', todoProto);

// const userProto = grpc.loadPackageDefinition(userPackageDef) as any;
// const userService = userProto.user.UserService; 


// Mock data for Todos
const todos = [
  { id: "1", title: 'Learn gRPC', completed: false, userId: 1 },
  { id: "2", title: 'Implement microservices', completed: false, userId: 2 },
];


// Initialize gRPC client for User Service
const userService = userProto.user.UserService;  // Access UserService constructor
const userClient = new userService(
  `${process.env.USER_SERVICE_HOST}:${process.env.USER_SERVICE_PORT}`, // Update to the actual address of your User Service
  grpc.credentials.createInsecure()
);

// Type for Todo object
interface Todo {
  id: string;
  title: string;
  completed: boolean;
  userId: number;
}

// Type for GetTodos response
interface GetTodosResponse {
  todos: Todo[];
}

// Type for CreateTodo request
interface CreateTodoRequest {
  userId: number;
  title: string;
}

// Create gRPC server
const server = new grpc.Server();

// Add Todo Service methods
server.addService(todoProto.service, {
  // Fetch todos by userId
  GetTodos: (
    call: ServerUnaryCall<{ userId: number }, GetTodosResponse>, // Define the request and response types
    callback: sendUnaryData<GetTodosResponse> // Define the callback type
  ) => {
    const { userId } = call.request;

    // Validate request
    if (!userId) {
      return callback({
        code: grpc.status.INVALID_ARGUMENT,
        message: 'User ID is required',
      });
    }

    // Filter todos for the given user
    const userTodos = todos.filter((todo) => todo.userId === userId);

    console.log(typeof userTodos[0].id);
    

    // Return response
    callback(null, { todos: userTodos });
  },

  // Create a new todo
  CreateTodo: (
    call: ServerUnaryCall<CreateTodoRequest, { todo: Todo }>, // Define the request and response types
    callback: sendUnaryData<{ todo: Todo }> // Define the callback type
  ) => {
    const { userId, title } = call.request;

    console.log("userId, title");
    console.log(userId, title);
    

    // Validate request
    if (!userId || !title) {
      return callback({
        code: grpc.status.INVALID_ARGUMENT,
        message: 'User ID and title are required',
      });
    }

    // Verify user existence via User Service
    userClient.GetUser({ id: userId }, (err: ServiceError | null, response: any) => {
      if (err) {
        console.error('Error fetching user:', err.message);
        return callback({
          code: grpc.status.NOT_FOUND,
          message: 'User not found',
        });
      }

      // Create a new todo
      const todo: Todo = {
        id: Date.now().toString(),
        title,
        completed: false,
        userId,
      };

      // Add todo to the list
      todos.push(todo);

      // Return the created todo
      callback(null, { todo });
    });
  },

  // Mark a todo as completed
  CompleteTodo: (
    call: ServerUnaryCall<{ id: string }, { todo: Todo }>, // Define the request and response types
    callback: sendUnaryData<{ todo: Todo }> // Define the callback type
  ) => {
    
    const { id } = call.request;
    
    // Validate request
    if (!id) {
      return callback({
        code: grpc.status.INVALID_ARGUMENT,
        message: 'Todo ID is required',
      });
    }
    
    // Find the todo and mark it as completed
    const todo = todos.find((t) => t.id === id);
    if (!todo) {
      return callback({
        code: grpc.status.NOT_FOUND,
        message: 'Todo not found',
      });
    }
    
    todo.completed = true;
    
    callback(null, { todo });
  },
});

// Start the server
const port = '0.0.0.0:50052';
server.bindAsync(port, grpc.ServerCredentials.createInsecure(), () => {
  console.log(`Todo Service running on ${port}`);
  server.start();
});
