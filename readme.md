# URL Checker

Приложение для запуска заданий на проверку списка URL. Состоит из:

- `backend` - NestJS API;
- `frontend` - React + Vite интерфейс;
- `docker-compose.yml` - запуск фронта и бэка в контейнерах.

## Запуск через Docker

Требуется установленный и запущенный Docker.

Из корня проекта:

```bash
docker compose up --build
```

После запуска приложение доступно по адресу:

```text
http://localhost:8080
```

Frontend отдается nginx-контейнером. Запросы `/api/...` проксируются во внутренний backend-контейнер на порт `3000`.

Остановить приложение:

```bash
docker compose down
```

Запустить в фоне:

```bash
docker compose up --build -d
```

Посмотреть логи:

```bash
docker compose logs -f
```

## Локальный запуск без Docker

Установить зависимости отдельно для backend и frontend:

```bash
cd backend
npm install
```

```bash
cd ../frontend
npm install
```

Запустить backend:

```bash
cd backend
npm run start:dev
```

Backend будет доступен на:

```text
http://localhost:3000
```

Запустить frontend в отдельном терминале:

```bash
cd frontend
npm run dev
```

Frontend будет доступен на:

```text
http://localhost:5173
```

В dev-режиме Vite проксирует `/api` на `http://localhost:3000`.

## Проверка

Frontend:

```bash
cd frontend
npm run lint
npm run build
```

Backend:

```bash
cd backend
npm run build
npm run test
```

## API

Основные endpoints:

- `POST /api/jobs` - создать задание;
- `GET /api/jobs` - получить список последних заданий;
- `GET /api/jobs/:id` - получить детали задания;
- `DELETE /api/jobs/:id` - отменить задание.
