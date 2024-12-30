"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("module-alias/register");
const express_1 = __importDefault(require("express"));
const grpc_js_1 = __importDefault(require("@grpc/grpc-js"));
const proto_loader_1 = __importDefault(require("@grpc/proto-loader"));
console.log(proto_loader_1.default);
console.log(grpc_js_1.default);
// console.log(require('@grpc/grpc-js')); // Check if grpc is being loaded
// console.log(require('@grpc/proto-loader')); // Check if proto-loader is being loaded
// // Define gRPC message and service types
// interface Todo {
//   id: number;
//   title: string;
//   completed: boolean;
// }
// interface GetTodosRequest {
//   userId: number;
// }
// interface GetTodosResponse {
//   todos: Todo[];
// }
// interface TodoServiceClient extends grpc.Client {
//   GetTodos(
//     request: GetTodosRequest,
//     callback: (error: ServiceError | null, response: GetTodosResponse) => void
//   ): void;
// }
// const path = require("path");
// const todoProtoPath = path.resolve(__dirname, "../../proto/todo.proto");
// console.log(todoProtoPath);
// // Load Protobuf definition for TodoService
// // const todoProtoPath = "./proto/todo.proto";
// const todoPackageDef = protoLoader.loadSync(todoProtoPath, {
//   keepCase: true,
//   longs: String,
//   enums: String,
//   defaults: true,
//   oneofs: true,
// });
// const todoProto = grpc.loadPackageDefinition(todoPackageDef) as any;
// // Initialize gRPC client for Todo Service
// const todoServiceAddress = "todo-service:50052"; // Replace with actual service address if needed
// const todoClient = new todoProto.TodoService(
//   todoServiceAddress,
//   grpc.credentials.createInsecure()
// ) as TodoServiceClient;
// Create Express app
const app = (0, express_1.default)();
app.use(express_1.default.json());
// Fetch todos by userId
app.get("/todos/:userId", (req, res) => {
    const userId = parseInt(req.params.userId, 10);
    console.log("Request arrived at the gateway");
    // Call gRPC GetTodos method
    // todoClient.GetTodos({ userId }, (err, response) => {
    //   if (err) {
    //     console.error("Error fetching todos:", err.message);
    //     return res.status(500).json({ error: err.message });
    //   }
    //   return res.status(200).json(response.todos);
    // });
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
