FROM node:20-alpine

WORKDIR /app

COPY gateway/package*.json ./

RUN npm install && npm install -g typescript ts-node

COPY ./proto /proto

COPY gateway/ ./

EXPOSE 3000

CMD ["npm", "run", "dev"]
