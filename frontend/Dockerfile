# Dockerfile для frontend

FROM node:18-bullseye

WORKDIR /app

COPY frontend/ /app/

RUN npm install

# Запуск frontend
CMD ["npm", "start"]
