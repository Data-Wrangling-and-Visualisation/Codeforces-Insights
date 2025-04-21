# Dockerfile для backend

FROM python:3.9-slim

WORKDIR /app

COPY backend/ /app/

RUN pip install --upgrade pip
RUN pip install -r requirements.txt

# Устанавливаем переменные окружения
ENV DB_NAME=codeforces \
    DB_USER=student \
    DB_PASSWORD=xa2i0YXzr9ApPjODEIMwFxEYPNy2ZL3B \
    DB_HOST=dpg-cvjffn3ipnbc73fm95bg-a.singapore-postgres.render.com \
    DB_PORT=5432

# Запуск приложения
CMD ["uvicorn", "app:app", "--host", "0.0.0.0", "--port", "8000", "--reload"]
