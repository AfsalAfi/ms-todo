FROM node:20-alpine

WORKDIR /app

COPY todo-service/package*.json ./

RUN npm install

RUN npm install -g typescript ts-node

COPY ./proto /proto

COPY ./todo-service/ .

EXPOSE 50052

CMD ["npm", "run", "dev"]
