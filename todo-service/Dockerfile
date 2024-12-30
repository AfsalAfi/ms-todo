FROM node:20

WORKDIR /app

COPY todo-service/package*.json ./

RUN npm install

RUN npm install -g typescript ts-node

COPY . .

EXPOSE 50052

CMD ["npm", "run", "dev"]
