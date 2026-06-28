# Komo React

Komo is a Pomodoro-style focus app with ambient YouTube atmosphere discovery.

## Structure

- `komo-client/` — React 19 + Vite client
- `server/` — Express API that searches YouTube and serves atmosphere results

## Prerequisites

- Node.js 20+
- npm

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

## Development

Run both the API and client from the project root:

```sh
npm run dev
```

Or run them separately:

```sh
npm run dev:server
npm run dev:client
```

The server defaults to `http://localhost:5001`. The Vite client defaults to its usual development URL and uses `VITE_API_BASE_URL` when set.

## Validation

```sh
npm run lint
npm run build
```
