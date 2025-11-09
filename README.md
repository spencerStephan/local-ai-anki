<div align="center">

# AI Anki

Flashcard app that generates questions from notes using local AI models.

[![Svelte](https://img.shields.io/badge/Svelte-5.43.5-FF3E00?logo=svelte&logoColor=white)](https://svelte.dev)
[![SvelteKit](https://img.shields.io/badge/SvelteKit-2.48.4-FF3E00?logo=svelte&logoColor=white)](https://kit.svelte.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9.3-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org)
[![Drizzle ORM](https://img.shields.io/badge/Drizzle-0.44.7-292929?logo=drizzle&logoColor=white)](https://orm.drizzle.team)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-4.1.17-38B2AC?logo=tailwind-css&logoColor=white)](https://tailwindcss.com)

</div>

## Overview

AI Anki generates flashcards from uploaded notes using local AI models. It includes spaced repetition scheduling and a dashboard for tracking review progress.

## Features

- Generate flashcards from notes using local AI (LM Studio)
- Upload and manage notes
- Multiple question types (multiple choice, etc.)
- Spaced repetition review scheduling
- Dashboard for tracking reviews

## Tech Stack

- **Svelte 5 w/Sveltekit** - Framework
- **Drizzle** - Database ORM
- **Turso** - SQLite database
- **Tailwind CSS** - Styling
- **Shadcn-svelte** - Component Library
- **TypeScript** - Type safety

## Prerequisites

- Bun (or Node.js 18+)
- LM Studio or compatible local AI server
- Turso account (or local SQLite)

## Setup

### Installation

```sh
git clone <repository-url>
cd "AI Anki"
bun install
```

### Environment Variables

Create a `.env` file:

```env
DATABASE_URL=your_turso_database_url
DATABASE_AUTH_TOKEN=your_turso_auth_token
LOCAL_AI_HTTP_URL=http://localhost:1234
MODEL_NAME=your_model_name
```

For local SQLite development, update `drizzle.config.ts` to use the SQLite dialect.

### Database

```sh
bun run db:push
```

Or use migrations:

```sh
bun run db:generate
bun run db:migrate
```

### Development

```sh
bun run dev
```

## Scripts

| Command               | Description              |
| --------------------- | ------------------------ |
| `bun run dev`         | Start dev server         |
| `bun run build`       | Production build         |
| `bun run preview`     | Preview production build |
| `bun run check`       | Type checking            |
| `bun run lint`        | Lint and format check    |
| `bun run format`      | Format code              |
| `bun run db:push`     | Push schema to database  |
| `bun run db:generate` | Generate migrations      |
| `bun run db:migrate`  | Run migrations           |
| `bun run db:studio`   | Open Drizzle Studio      |
| `bun run db:clear`    | Clear database           |

## Project Structure

```
src/
├── lib/
│   ├── components/     # UI components
│   ├── hooks/         # UI Hooks for shadcn-svelte
│   ├── remote/        # Remote functions
│   └── server/
│       ├── ai/        # AI integration
│       └── db/        # Database schema and connection
└── routes/            # SvelteKit routes
```

## Database Schema

- `note` - Uploaded notes
- `card` - Flashcard questions
- `review` - Review scheduling
- `score` - Performance tracking

## Deployment

Should be used locally.
