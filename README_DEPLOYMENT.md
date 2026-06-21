# AI Course Tracker - Production Deployment

A comprehensive learning platform for AI/ML education with progress tracking, powered by Next.js and Supabase.

## 🚀 Quick Deploy to Production

**Takes 5 minutes total:**

1. **Set up Supabase** (5 min) - Follow [`SUPABASE_QUICK_START.md`](./SUPABASE_QUICK_START.md)
2. **Push to GitHub** - Code is ready to deploy
3. **Vercel auto-deploys** - Just wait 2 minutes

That's it! Your app will be live with persistent user data.

---

## ✨ Features

### Learning Content
- **7 Complete Learning Phases:**
  - Phase 0: Programming Fundamentals (Python, C, Data Structures)
  - Phase 1: Mathematical Foundations (Linear Algebra, Calculus, Probability)
  - Phase 2: Python for ML/AI (NumPy, Pandas, Matplotlib)
  - Phase 3: Classical Machine Learning (Regression, Trees, Ensembles)
  - Phase 4: Deep Learning Fundamentals (Neural Networks, Backprop, CNNs)
  - Phase 5: Advanced Architectures (Transformers, Diffusion, GNNs)
  - Phase 6: Research Methodology (Reading Papers, Writing, Publishing)

- **200+ Free Resources:** Curated courses, textbooks, papers, videos
- **Books & Papers Section:** Seminal papers and free university textbooks
- **Weekly Schedule:** Structured 12-week learning plan

### Progress Tracking
- ✅ **Resource Completion Tracking** - Mark courses/resources as done
- 📊 **Phase Progress Visualization** - See completion % for each phase
- 📈 **Analytics Dashboard** - Charts showing learning velocity and trends
- 🔥 **Streak Tracking** - Daily learning streaks (coming soon)
- 📅 **Schedule Management** - Track daily learning activities

### UI/UX
- 🎨 **Modern Dark Theme** - Easy on the eyes for long study sessions
- 📱 **Mobile Responsive** - Bottom nav bar, slide-up drawers on mobile
- ⚡ **Fast & Smooth** - Framer Motion animations, optimized performance
- 🔐 **Simple Auth** - Password-based login (no complex OAuth needed)

### Data Persistence
- 💾 **Supabase Backend** - PostgreSQL database for reliable storage
- ☁️ **Cloud Sync** - Data persists across devices
- 🔄 **Real-time Ready** - Can add real-time updates later
- 📦 **Automatic Backups** - Supabase handles backups

---

## 🛠 Tech Stack

- **Framework:** Next.js 14 (App Router, React Server Components)
- **Language:** TypeScript
- **Database:** Supabase (PostgreSQL)
- **Hosting:** Vercel
- **Styling:** CSS-in-JS (styled components)
- **Animations:** Framer Motion
- **Charts:** Recharts

---

## 📋 Prerequisites

- Node.js 18+ and npm
- Git
- GitHub account
- Vercel account (free)
- Supabase account (free)

---

## 🏃 Local Development

```bash
# 1. Clone the repo
git clone <your-repo-url>
cd course-main

# 2. Install dependencies
npm install

# 3. Set up environment variables
cp .env.example .env.local
# Edit .env.local with your Supabase credentials

# 4. Run development server
npm run dev

# 5. Open http://localhost:3000
```

---

## 🌐 Deploy to Production

### Option 1: Quick Deploy (Recommended)
Follow the **[Deployment Checklist](./DEPLOYMENT_CHECKLIST.md)** - everything is already configured.

### Option 2: Manual Setup

1. **Create Supabase Project:**
   - Follow [`SUPABASE_SETUP.md`](./SUPABASE_SETUP.md)
   - Run `supabase-schema.sql` in SQL Editor
   - Copy your API keys

2. **Configure Vercel:**
   - Connect your GitHub repo to Vercel
   - Add environment variables (see below)
   - Deploy!

3. **Environment Variables (Vercel):**
   ```
   NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
   SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
   USER_ADMIN_PASSWORD=your-admin-password
   USER_sambhog_PASSWORD=your-password
   ```

---

## 📁 Project Structure

```
course-main/
├── app/
│   ├── api/
│   │   ├── auth/route.ts          # Login authentication
│   │   └── user/route.ts          # User data CRUD with Supabase
│   ├── components/
│   │   ├── AppShell.tsx           # Main app layout & routing
│   │   ├── OverviewPage.tsx       # Dashboard with charts
│   │   ├── ProgrammingPage.tsx    # Phase 0 resources
│   │   ├── MathPage.tsx           # Phase 1 resources
│   │   ├── PythonPage.tsx         # Phase 2 resources
│   │   ├── MLPage.tsx             # Phase 3 resources
│   │   ├── DeepLearningPage.tsx   # Phase 4 resources
│   │   ├── ArchitecturesPage.tsx  # Phase 5 resources
│   │   ├── ResearchPage.tsx       # Phase 6 resources
│   │   ├── BooksPage.tsx          # Books & papers
│   │   ├── SchedulePage.tsx       # Weekly schedule
│   │   └── ResourceCard.tsx       # Reusable resource component
│   ├── lib/
│   │   ├── supabase.ts            # Supabase client
│   │   └── userDataUtils.ts       # User data helpers
│   ├── types/
│   │   └── index.ts               # TypeScript interfaces
│   ├── layout.tsx                 # Root layout
│   ├── page.tsx                   # Home page
│   └── globals.css                # Global styles
├── data/
│   └── users/                     # Local user data (dev only)
├── public/
│   └── data.json                  # Course content (200+ resources)
├── supabase-schema.sql            # Database schema
├── SUPABASE_QUICK_START.md        # 5-min setup guide
├── SUPABASE_SETUP.md              # Detailed setup guide
├── DEPLOYMENT_CHECKLIST.md        # Pre-deploy checklist
└── package.json                   # Dependencies
```

---

## 🗄 Database Schema

### Table: `user_profiles`

```sql
CREATE TABLE user_profiles (
  user_id TEXT PRIMARY KEY,
  data JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

The `data` JSONB column stores:
- User profile (name, email, created date)
- Overall progress statistics
- Per-phase progress (0-6)
- Completed resource IDs
- Schedule state
- Learning velocity metrics
- Achievements

---

## 📊 Data Flow

```
User marks resource complete
    ↓
AppShell updates local state
    ↓
POST /api/user with updated data
    ↓
API merges with existing profile
    ↓
Calculates phase progress
    ↓
Saves to Supabase (upsert)
    ↓
Returns updated profile
    ↓
UI updates with new progress
```

---

## 🔧 Configuration Files

- **`.env.local`** - Local development environment variables
- **`.env.example`** - Template for environment variables
- **`vercel.json`** - Vercel deployment config
- **`next.config.ts`** - Next.js configuration
- **`tsconfig.json`** - TypeScript configuration

---

## 🧪 Testing

```bash
# Type checking
npm run build

# Local dev server
npm run dev

# Test checklist:
# ✅ Login works
# ✅ All 7 phases render
# ✅ Mark resource complete
# ✅ Progress persists after refresh
# ✅ Charts update correctly
# ✅ Mobile responsive (use DevTools)
```

---

## 🐛 Troubleshooting

### Data not persisting
- Check Supabase environment variables in Vercel
- Verify table was created: Supabase → Table Editor
- Check logs: Vercel → Deployment → Logs

### "Missing Supabase environment variables" error
- Restart dev server after adding to `.env.local`
- For Vercel: Check Settings → Environment Variables
- Must have all 3: URL, ANON_KEY, SERVICE_ROLE_KEY

### Build errors
- Run `npm run build` locally first
- Check TypeScript errors
- Verify all imports are correct

---

## 📚 Documentation

- **[SUPABASE_QUICK_START.md](./SUPABASE_QUICK_START.md)** - Setup in 5 minutes
- **[SUPABASE_SETUP.md](./SUPABASE_SETUP.md)** - Detailed guide with troubleshooting
- **[DEPLOYMENT_CHECKLIST.md](./DEPLOYMENT_CHECKLIST.md)** - What to do before deploying
- **[PHASE_0_6_IMPLEMENTATION.md](./PHASE_0_6_IMPLEMENTATION.md)** - Technical details of new phases
- **[USER_DATA_FIX.md](./USER_DATA_FIX.md)** - User data and tracking fixes

---

## 🎯 Roadmap

- [ ] User registration (currently password-based for specific users)
- [ ] Email notifications for weekly progress
- [ ] Export progress data (JSON/CSV)
- [ ] Social features (compare with friends)
- [ ] AI-powered resource recommendations
- [ ] Mobile app (React Native)
- [ ] Real-time collaboration
- [ ] Spaced repetition system

---

## 🤝 Contributing

This is a personal learning tracker, but feel free to fork and customize for your own use!

---

## 📄 License

MIT License - Feel free to use this for your own learning journey!

---

## 🎓 About

This project is a comprehensive self-study roadmap for AI/ML, starting from programming fundamentals through advanced research methodology. All resources are free and university-grade quality.

Built with ❤️ for self-learners who want to master AI without formal education.

---

**Ready to deploy? Start with [SUPABASE_QUICK_START.md](./SUPABASE_QUICK_START.md)! 🚀**
