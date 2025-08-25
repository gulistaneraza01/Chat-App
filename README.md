# ChatAppJs

A microservices-based real-time chat application with a React (Vite + Tailwind) client and Node.js services for user management, chat/messaging (with Socket.IO), and email notifications. Local infra includes RabbitMQ (for future use) and MailHog for catching emails. Kafka is used between services for mail events.

## Monorepo structure

```
ChatAppJs/
  client/           # React app (Vite)
  server/
    chat/          # Chat service (REST + Socket.IO)
    user/          # User service (Auth + Profiles)
    mail/          # Mail consumer service (Nodemailer + Kafka)
    docker-compose.yml  # RabbitMQ + MailHog
```

## Prerequisites

- Node.js 18+
- pnpm (recommended for server services) or npm
- MongoDB running locally
- Redis running locally
- Kafka + Zookeeper running locally (for mail events)
- Docker (optional, to run RabbitMQ and MailHog via docker-compose)

## Environment variables

Create `.env` files for each service with the following variables.

### server/user (.env)

```
PORT=3000
MONGO_URI=mongodb://localhost:27017
REDIS_URI=redis://localhost:6379
JWT_SECRET_KEY=replace-with-strong-secret
```

### server/chat (.env)

```
PORT=3002
MONGO_URI=mongodb://localhost:27017
JWT_SECRET_KEY=replace-with-strong-secret
USER_SERVICE=http://localhost:3000
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_SECRET_KEY=your_secret
```

### server/mail (.env)

```
PORT=3003
MAIL_USER=optional-if-using-smtp
MAIL_PASS=optional-if-using-smtp
```

Note: By default Mail service uses MailHog at host=localhost, port=1025 (no auth). If switching to a real SMTP (e.g., Gmail), uncomment auth in `server/mail/src/config/connectNodemailer.js` and set `MAIL_USER`, `MAIL_PASS` accordingly.

### client (.env)

Create `client/.env` with:

```
VITE_USER_SERVERURL=http://localhost:3000
VITE_CHAT_SERVERURL=http://localhost:3002
```

## Installing dependencies

- Client (npm):

```
cd client
npm install
```

- Server services (pnpm recommended):

```
cd server/user && pnpm install
cd ../chat && pnpm install
cd ../mail && pnpm install
```

## Running infrastructure (optional but recommended)

Use Docker to run RabbitMQ and MailHog:

```
cd server
docker compose up -d
```

This exposes:

- RabbitMQ: `5672` (AMQP), management UI at `http://localhost:15672` (admin/admin123)
- MailHog: SMTP on `1025`, UI at `http://localhost:8025`

You must also have the following running locally (outside docker):

- MongoDB: `mongodb://localhost:27017`
- Redis: `redis://localhost:6379`
- Kafka (and Zookeeper): brokers on `localhost:9092`

## Start the services

In separate terminals:

- User service:

```
cd server/user
pnpm dev
```

Serves on `http://localhost:3000` with routes under `/api/v1` (e.g., `POST /api/v1/login`, `GET /api/v1/me`).

- Chat service:

```
cd server/chat
pnpm dev
```

Serves on `http://localhost:3002` with routes under `/api/v1` (e.g., `GET /api/v1/chat/all`, `POST /api/v1/message`). Socket.IO shares the same port.

- Mail service:

```
cd server/mail
pnpm dev
```

Consumes Kafka events and exposes a basic express server on `http://localhost:3003`.

- Client (Vite):

```
cd client
npm run dev
```

Vite dev server will print its URL (typically `http://localhost:5173`).

## Notable endpoints

- User service (`/api/v1`):

  - `POST /login` → initiate login (OTP flow)
  - `POST /verifylogin` → verify login
  - `GET /me` (auth) → get profile
  - `GET /user/all` (auth) → list users
  - `GET /user/:id` → get user by id
  - `POST /updateName` (auth) → update display name

- Chat service (`/api/v1`):
  - `POST /chat/new` (auth)
  - `GET /chat/all` (auth)
  - `POST /message` (auth, multipart with `image`)
  - `GET /message/:chatId` (auth)

## Socket.IO events (chat)

- Client connects with query `userId`
- Rooms: join via `jionChat` (note the spelling), leave via `leaveChat`
- Typing indicators: `typing`, `stopTyping` → emits `userTyping`, `userStoppedTyping`
- Online users broadcast: `getOnlineUser`

## Development tips

- Ensure all `.env` values are set and MongoDB/Redis/Kafka are reachable before starting services.
- The client reads server URLs from Vite envs `VITE_USER_SERVERURL` and `VITE_CHAT_SERVERURL`.
- For image uploads, configure Cloudinary credentials in the chat service.
- Emails are visible at MailHog UI: `http://localhost:8025`.

## Scripts

- Client: `npm run dev | build | preview | lint`
- server/chat: `pnpm dev`
- server/user: `pnpm dev`
- server/mail: `pnpm dev`
