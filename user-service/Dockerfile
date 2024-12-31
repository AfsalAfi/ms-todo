FROM node:20-alpine

WORKDIR /app

COPY user-service/package*.json ./

RUN npm install

RUN npm install -g typescript ts-node

COPY ./proto /proto

COPY ./user-service/ .

EXPOSE 50051

CMD ["npm", "run", "dev"]
