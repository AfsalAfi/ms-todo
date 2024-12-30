FROM node:20

WORKDIR /app

COPY user-service/package*.json ./

RUN npm install

RUN npm install -g typescript ts-node

COPY . .

EXPOSE 50051

CMD ["npm", "run", "dev"]
