# Komo React

Komo is a Pomodoro focus app with a focus on being an addition to minimalist workflows.
Our backgrounds are exclusively youtube videos.
- Paste your own links for playback
- Video discovery feature (ambient focused)

## Structure

```text
.
├── komo-client/          # React 19 + Vite client
├── server/               # Express API server
│   ├── index.js          # App setup, middleware, static serving, route mounting
│   ├── session/          # Cookie session middleware/service
│   ├── videos/           # Video routes/controllers/services/constants
│   └── videoDiscovery/   # YouTube search/discovery logic
├── Dockerfile            # Production image: builds client, runs server
└── docker-compose.yml    # Single-container deployment example
```

## Current API

```text
GET  /api/videos
POST /api/videos/refresh
```

The server uses a `komo_sid` HTTP-only cookie so each user gets their own session video list. Refreshes are rate-limited to 7 per minute per session/IP.

## Prerequisites

- Node.js 20+
- npm
- Docker + Docker Compose, if deploying with Docker

## Setup

Install dependencies for both parts:

```sh
npm --prefix komo-client install
npm --prefix server install
```

Optional environment configuration:

```sh
cp .env.example .env
```

## Development: run together

From the project root:

```sh
npm run dev
```

This starts both:

- API server: `http://localhost:5001`
- Vite client: Vite's default dev URL, usually `http://localhost:5173`

If the client needs to call the API directly during local development, set:

```sh
VITE_API_BASE_URL=http://localhost:5001
```

Note: production cookies use `secure: true`, so persistent cookie sessions require HTTPS.

## Development: run separately

Terminal 1, API server:

```sh
npm run dev:server
```

Terminal 2, client:

```sh
npm run dev:client
```

Or run from each package directly:

```sh
npm --prefix server run dev
npm --prefix komo-client run dev
```

## Production build without Docker

Build the client:

```sh
npm run build
```

Copy or serve the built client from the server's `public` directory if needed, then start the server:

```sh
npm start
```

The server defaults to port `5001`:

```sh
PORT=5001 npm start
```

## Docker build tutorial

### 1. Create/update `.env`

The compose file loads `.env` from the project root:

```sh
cp .env.example .env
```

If `.env.example` does not exist, create `.env` manually as needed. At minimum, the compose file already provides:

```env
NODE_ENV=production
PORT=5001
```

### 2. Build the Docker image

From the project root:

```sh
sudo docker compose build
```

Or build with plain Docker:

```sh
sudo docker build -t komo-react .
```

### 3. Start with Docker Compose

```sh
sudo docker compose up -d
```

The compose file binds the app to localhost on the VPS, modify to run it locally

## Validation

```sh
npm run lint
npm run build
```

Server syntax checks can be run with:

```sh
cd server
node --check index.js
node --check videos/video.routes.js
node --check videos/video.controller.js
node --check videos/video.service.js
node --check session/session.service.js
node --check session/session.middleware.js
node --check videoDiscovery/videoDiscovery.service.js
```
