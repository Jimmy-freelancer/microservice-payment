FROM node:18
WORKDIR /payment
COPY package*.json ./
RUN npm install
COPY . .
EXPOSE 3006
CMD ["node", "server.js"]
