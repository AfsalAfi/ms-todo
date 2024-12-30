import * as grpc from "@grpc/grpc-js";
import * as protoLoader from "@grpc/proto-loader";
import path from "path";

// Define types for user
interface User {
  id: number;
  name: string;
}

// Define the request and response types
interface GetUserRequest {
  id: number;
}

interface GetUserResponse {
  id: number;
  name: string;
}

// Define the implementation type for the service
interface UserServiceImplementation {
  GetUser: grpc.handleUnaryCall<GetUserRequest, GetUserResponse>;
}

// Define the expected loaded proto definition (interface with ServiceDefinition)
interface UserProtoDefinition {
  UserService: grpc.ServiceDefinition<UserServiceImplementation>;
}

// const userProtoPath = path.resolve(__dirname, "../../proto/user.proto");
const userProtoPath = path.resolve(process.env.PROTO_PATH || __dirname, "../../proto/user.proto");
console.log("Proto file path:", userProtoPath);

// Load Protobuf definition and create a gRPC client
const packageDef = protoLoader.loadSync(userProtoPath, {
  keepCase: true,
  longs: String,
  enums: String,
  defaults: true,
  oneofs: true,
});

const grpcObject: any = grpc.loadPackageDefinition(packageDef);
console.log('Loaded gRPC Object:', grpcObject);

// Access UserService correctly from the loaded grpcObject
const userService = grpcObject.user.UserService;
if (!userService) {
  console.error("UserService not found in loaded proto definition");
  process.exit(1);
}

// Mock users data
const users: User[] = [
  { id: 1, name: "John Doe" },
  { id: 2, name: "Jane Doe" },
];

// Create gRPC server
const server = new grpc.Server();

// Add service to the server
server.addService(userService.service, {
  // Implement GetUser method
  GetUser: (
    call: grpc.ServerUnaryCall<GetUserRequest, GetUserResponse>,
    callback: grpc.sendUnaryData<GetUserResponse>
  ) => {
    const user = users.find((u) => u.id === call.request.id);

    if (user) {
      // Successfully found user
      callback(null, user);
    } else {
      // If user is not found, return a specific error
      callback({
        code: grpc.status.NOT_FOUND,
        details: "User not found",
      });
    }
  },
});

// Start the server
server.bindAsync("0.0.0.0:50051", grpc.ServerCredentials.createInsecure(), () => {
  console.log("User service running on port 50051");
  server.start();
});
