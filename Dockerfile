FROM node:22-alpine

# Установка зависимостей
WORKDIR /app
COPY package*.json ./
RUN npm install

# Копирование исходников и сборка
COPY . .
RUN npm run build

# Удаление dev-зависимостей
RUN npm prune --production

# Открываем порт
EXPOSE 3000

# Запуск приложения
CMD ["node", "dist/main"]
