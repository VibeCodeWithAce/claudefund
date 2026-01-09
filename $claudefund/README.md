# ClaudeFund

A crowdfunding platform where Claude AI vets project submissions and the community votes on ideas. The top 3 most-liked ideas every 24 hours win Claude Pro funding.

## Features

- **Landing Page**: Hero section with project description and CTAs
- **Submit Page**: Form with Claude AI vetting for idea validation
- **Leaderboard**: Live countdown timer + ranked ideas with like buttons
- **Funded Builders**: List of winners with funding badges
- **Automated Winner Selection**: Vercel cron job runs daily at UTC midnight

## Tech Stack

- Next.js 14 (App Router, TypeScript)
- Tailwind CSS
- Prisma with SQLite (development) / PostgreSQL (production)
- Anthropic API (Claude AI)
- React Hot Toast (notifications)
- Vercel (deployment + cron jobs)

## Setup

### 1. Clone the repository

```bash
cd $claudefund
```

### 2. Install dependencies

```bash
npm install
```

### 3. Set up environment variables

Copy `.env.example` to `.env` and fill in your values:

```bash
# Database
DATABASE_URL="file:./dev.db"

# Anthropic API (get from https://console.anthropic.com/)
ANTHROPIC_API_KEY="your-api-key-here"

# Admin (choose a strong password)
ADMIN_PASSWORD="your-secure-password-here"

# Cron Security (generate a random secret)
CRON_SECRET="your-random-secret-here"

# App
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

### 4. Run Prisma migrations

```bash
npx prisma migrate dev
```

### 5. Start the development server

```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000)

## Usage

### Submit an Idea

1. Navigate to `/submit`
2. Fill in your email, title (5-100 chars), and description (50-500 chars)
3. Click "Submit for AI Vetting"
4. Claude AI will review your idea
5. If approved, it appears on the leaderboard immediately

### Vote on Ideas

1. Go to `/leaderboard`
2. See the countdown timer to next winner selection
3. Click the heart button to like ideas (1 vote per visitor per idea)
4. Votes are stored in localStorage

## Deployment to Vercel

### 1. Push to GitHub

```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin <your-repo-url>
git push -u origin master
```

### 2. Connect to Vercel

1. Go to [vercel.com](https://vercel.com)
2. Import your GitHub repository
3. Vercel will auto-detect Next.js

### 3. Configure Environment Variables

In Vercel dashboard, add these environment variables:

- `ANTHROPIC_API_KEY`
- `ADMIN_PASSWORD`
- `CRON_SECRET`
- `NEXT_PUBLIC_APP_URL` (your production URL)
- `DATABASE_URL` (see production database section)

### 4. Production Database

For production, switch from SQLite to PostgreSQL:

**Option A: Vercel Postgres**

```bash
vercel postgres create
```

Update `DATABASE_URL` in Vercel environment variables with the connection string.

**Option B: PlanetScale/Supabase**

1. Create a database on your preferred platform
2. Get the connection string
3. Update `DATABASE_URL` in Vercel

### 5. Run Migrations in Production

```bash
npx prisma migrate deploy
```

### 6. Verify Cron Job

The `vercel.json` file configures the cron job to run daily at UTC midnight. Vercel will automatically set this up on deployment.

To test manually:

```bash
curl -H "Authorization: Bearer YOUR_CRON_SECRET" https://your-app.vercel.app/api/cron/select-winners
```

## Database Schema

### Idea

- `id`: String (CUID)
- `email`: String
- `title`: String
- `description`: String
- `likes`: Int (default 0)
- `status`: String (active | funded | rejected)
- `fundedAt`: DateTime (nullable)
- `createdAt`: DateTime

### Settings

- `id`: Int (always 1)
- `submissionsPaused`: Boolean
- `winnerSelectionPaused`: Boolean
- `lastWinnerSelection`: DateTime (nullable)

## Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npx prisma studio` - Open Prisma Studio (database GUI)
- `npx prisma migrate dev` - Create and apply migrations
- `npx prisma generate` - Regenerate Prisma Client

## Winner Selection Process

### Automatic (Daily at UTC Midnight)

Vercel cron calls `/api/cron/select-winners`:

1. Checks if winner selection is paused
2. Gets top 3 active ideas by likes
3. Marks them as "funded" with fundedAt timestamp
4. Resets all remaining active ideas' likes to 0
5. Updates lastWinnerSelection timestamp

## Security

- Cron endpoint secured with `CRON_SECRET`
- Environment variables never exposed to client
- Email addresses masked on public pages

## Troubleshooting

### "ANTHROPIC_API_KEY not found"

Make sure you've added your Anthropic API key to `.env`:

```
ANTHROPIC_API_KEY="sk-ant-..."
```

### "Submissions are currently paused"

An admin has paused submissions. Contact the site administrator.

### Prisma errors

Try regenerating the Prisma client:

```bash
npx prisma generate
```

### Cron job not running

1. Verify `vercel.json` is in the root directory
2. Check Vercel dashboard → Settings → Cron Jobs
3. Ensure `CRON_SECRET` is set in environment variables

## Contributing

This is a demo project. Feel free to fork and modify for your needs!

## License

MIT
