FROM node:20

WORKDIR /app

COPY gateway/package*.json ./

RUN npm install

RUN npm install -g typescript ts-node

COPY . .

EXPOSE 3000

CMD ["npm", "run", "dev"]
