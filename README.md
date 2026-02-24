# English Daily Challenges

A gamified English learning platform where teachers create daily challenges and students earn rewards for completing them.

## Features

- 🎯 **Daily Challenges**: Teachers create grammar, vocabulary, and preposition exercises
- 👨‍🏫 **Teacher Review**: Personalized feedback and approval system
- 🪙 **Gamification**: Earn coins and points for approved submissions
- 🏆 **Leaderboard**: Compete with other learners
- 🔐 **Authentication**: Secure login with Supabase Auth
- 🎨 **Modern UI**: Beautiful, responsive interface with TailwindCSS and shadcn/ui

## Tech Stack

- **Frontend**: Next.js 14 (App Router), React 18, TypeScript
- **Styling**: TailwindCSS, shadcn/ui components
- **Backend**: Supabase (PostgreSQL + Auth + RLS)
- **Validation**: Zod + React Hook Form
- **Deployment**: Vercel

## Prerequisites

- Node.js 18+ and npm
- A Supabase account (free tier works)
- A Vercel account (for deployment, optional)

## Local Development Setup

### 1. Clone the Repository

```bash
cd "c:\Users\Administrator\Documents\Challenges KAE"
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Set Up Supabase

1. Go to [https://supabase.com](https://supabase.com) and create a new project
2. Wait for the project to be ready (takes ~2 minutes)
3. Go to **Project Settings** → **API**
4. Copy your:
   - `Project URL` (NEXT_PUBLIC_SUPABASE_URL)
   - `anon public` key (NEXT_PUBLIC_SUPABASE_ANON_KEY)

### 4. Configure Environment Variables

Create a `.env.local` file in the project root:

```bash
NEXT_PUBLIC_SUPABASE_URL=your_project_url_here
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
```

### 5. Set Up Database Schema

1. In your Supabase project, go to **SQL Editor**
2. Open the file `supabase/schema.sql` from this project
3. Copy and paste the entire SQL content into the Supabase SQL Editor
4. Click **Run** to execute all commands
5. This will create:
   - All necessary tables (profiles, challenges, submissions, transactions)
   - RLS policies for security
   - Indexes for performance
   - Triggers for automation

### 6. Create Your First Teacher Account

1. Start the development server (see step 7)
2. Register a new account at `http://localhost:3000/login`
3. Go back to Supabase → **SQL Editor**
4. Run this query to promote your user to teacher:

```sql
UPDATE profiles 
SET role = 'teacher' 
WHERE user_id = (SELECT id FROM auth.users WHERE email = 'your-email@example.com');
```

### 7. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
src/
├── app/
│   ├── actions/           # Server Actions
│   │   ├── challenges.ts  # Challenge CRUD operations
│   │   └── submissions.ts # Submission review logic
│   ├── challenge/[id]/    # Challenge detail page
│   ├── dashboard/         # Student dashboard
│   ├── leaderboard/       # Global leaderboard
│   ├── login/             # Authentication page
│   ├── teacher/           # Teacher dashboard and pages
│   │   ├── create-challenge/  # Challenge creation form
│   │   └── submission/[id]/   # Submission review page
│   ├── layout.tsx         # Root layout with Toaster
│   ├── page.tsx           # Landing page
│   └── globals.css        # Global styles
├── components/
│   ├── challenges/        # Challenge renderers
│   │   └── fill-blanks-renderer.tsx
│   ├── ui/                # shadcn/ui components
│   └── nav-bar.tsx        # Navigation component
├── lib/
│   ├── supabase/          # Supabase clients
│   │   ├── client.ts      # Browser client
│   │   ├── server.ts      # Server client
│   │   └── middleware.ts  # Auth middleware
│   ├── validations/       # Zod schemas
│   └── utils.ts           # Utility functions
└── types/
    └── supabase.ts        # Database types

supabase/
└── schema.sql             # Complete database schema + RLS policies
```

## User Roles

### Student (Default)
- View and complete published challenges
- Submit answers
- View their own submissions and feedback
- See their coins and points balance
- View the leaderboard

### Teacher
- All student permissions
- Create, edit, and publish challenges
- Review student submissions
- Approve/reject submissions with feedback
- Approved submissions automatically credit rewards

### Admin
- All teacher permissions
- Review submissions from any teacher's challenges
- Promote users to teacher role (via SQL)

## Challenge Types

Currently supported:
- **fill_blanks_prepositions**: Fill-in-the-blank exercises with multiple choice options (at/on/in)

The system is designed to easily add new challenge types:
1. Define the schema in `lib/validations/challenge.ts`
2. Create a renderer component in `components/challenges/`
3. Update the challenge form to support the new type

## Deployment to Vercel

### 1. Push Code to GitHub

```bash
git init
git add .
git commit -m "Initial commit: English Daily Challenges"
git branch -M main
git remote add origin https://github.com/your-username/english-daily-challenges.git
git push -u origin main
```

### 2. Deploy to Vercel

1. Go to [https://vercel.com](https://vercel.com)
2. Click **Import Project**
3. Import your GitHub repository
4. Add environment variables:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
5. Click **Deploy**

Your app will be live at `https://your-project.vercel.app`

### 3. Update Supabase Authentication Settings

1. In Supabase Dashboard → **Authentication** → **URL Configuration**
2. Add your Vercel domain to **Site URL** and **Redirect URLs**:
   - Site URL: `https://your-project.vercel.app`
   - Redirect URLs: `https://your-project.vercel.app/**`

## Database Security

The application uses Supabase Row Level Security (RLS) to protect data:

- **Profiles**: Users can read all profiles (for leaderboard), update only their own
- **Challenges**: Published challenges visible to all; drafts only to creator/admin
- **Submissions**: Users see only their own; teachers see submissions for their challenges
- **Transactions**: Users see only their own transaction history

All policies are defined in `supabase/schema.sql`.

## Available Scripts

```bash
# Development
npm run dev          # Start development server on http://localhost:3000

# Production
npm run build        # Build for production
npm run start        # Start production server

# Code Quality
npm run lint         # Run ESLint
```

## Common Tasks

### Promote a User to Teacher

```sql
UPDATE profiles 
SET role = 'teacher' 
WHERE user_id = 'user-uuid-here';
```

### View All Pending Submissions

```sql
SELECT 
  s.id,
  c.title as challenge,
  p.full_name as student,
  s.submitted_at
FROM submissions s
JOIN challenges c ON s.challenge_id = c.id
JOIN profiles p ON s.user_id = p.id
WHERE s.status = 'pending'
ORDER BY s.submitted_at ASC;
```

### Manually Credit Coins/Points

```sql
-- Add transaction
INSERT INTO transactions (user_id, type, amount_coins, amount_points)
VALUES ('user-profile-id', 'manual_adjustment', 100, 50);

-- Update profile totals
UPDATE profiles 
SET coins_total = coins_total + 100,
    points_total = points_total + 50
WHERE id = 'user-profile-id';
```

## Troubleshooting

### Error: "Invalid API key"
- Check your `.env.local` file has the correct Supabase credentials
- Restart the development server after changing environment variables

### Error: "Cannot read properties of null"
- Make sure you've run the `supabase/schema.sql` in your Supabase project
- Verify the user profile was created (check `profiles` table in Supabase)

### Submissions not appearing
- Check RLS policies are enabled and correctly configured
- Verify the challenge status is 'published'
- Check browser console for errors

### Can't create challenges
- Make sure your user's role is 'teacher' or 'admin' in the `profiles` table
- Check you're logged in with the correct account

## Future Enhancements

Potential features to add:
- [ ] More challenge types (vocabulary, listening, reading comprehension)
- [ ] Student progress analytics
- [ ] Teacher dashboard with statistics
- [ ] Email notifications for reviews
- [ ] Challenge scheduling
- [ ] Badges and achievements
- [ ] Daily streaks
- [ ] Social features (comments, likes)
- [ ] Mobile app version

## License

MIT

## Support

For issues or questions:
1. Check the troubleshooting section above
2. Review the Supabase documentation: https://supabase.com/docs
3. Review the Next.js documentation: https://nextjs.org/docs

---

Built with ❤️ using Next.js, Supabase, and shadcn/ui
