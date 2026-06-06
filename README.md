# Zero to AI Architect - Learning Tracker

A comprehensive AI learning pathway tracker with interactive analytics, mobile-responsive design, and progress tracking. Built with Next.js, React, and Vercel.

![Version](https://img.shields.io/badge/version-0.1.0-blue)
![License](https://img.shields.io/badge/license-MIT-green)
![Node](https://img.shields.io/badge/node-20.x-green)
![Next.js](https://img.shields.io/badge/Next.js-16.2.5-black)

---

## 📚 Features

### 🎓 Learning Content
- **5 Learning Phases**: Math → Python → ML → Deep Learning → Architectures
- **190+ Resources**: Curated courses, books, and papers
- **University-Grade Material**: MIT, Stanford, Imperial College courses
- **Free Content**: All resources are 100% free

### 📊 Analytics & Tracking
- **Overview Dashboard** with interactive charts:
  - Progress trend line chart
  - Skills assessment radar chart
  - Phase breakdown bar chart
  - Resource distribution pie chart
- **Learning Velocity**: Automatic pace calculation
- **Progress Tracking**: Mark resources as complete
- **Real-time Updates**: Live progress indicators

### 📱 Mobile-First Design
- **Bottom Navigation**: 3-button mobile nav bar
- **Slide-up Drawers**: Sections and resources slide from bottom
- **Touch Optimized**: Thumb-friendly interaction zones
- **Responsive Charts**: Adapt to any screen size
- **Full Desktop Support**: Traditional sidebar on desktop

### 🔐 Authentication
- **Simple Login**: Username and password
- **Secure Cookies**: HttpOnly, SameSite protection
- **Session Management**: 30-day persistent sessions
- **User Profiles**: Personalized progress tracking

### 💾 Data Storage
- **Local Development**: Filesystem-based storage
- **Production**: Optional Vercel KV (Redis) integration
- **Auto-Persistence**: User data saved automatically
- **Sync**: Data syncs across devices

---

## 🚀 Quick Start

### Local Development

1. **Clone and Install**
```bash
git clone <repository-url>
cd course-main
npm install
```

2. **Set Environment Variables**
```bash
cp .env.example .env.local
```

Edit `.env.local` with your credentials:
```
USER_ADMIN_PASSWORD="your_password"
USER_SAMBHOG_PASSWORD="your_password"
```

3. **Start Development Server**
```bash
npm run dev
```

4. **Open in Browser**
```
http://localhost:3000
```

5. **Login**
- Username: `admin` or `sambhog`
- Password: What you set in `.env.local`

---

## 📦 Technology Stack

### Frontend
- **React 19.2.4** - UI library
- **Next.js 16.2.5** - React framework
- **Framer Motion 12.38.0** - Animations
- **Recharts 3.8.1** - Data visualization
- **Tailwind CSS 4** - Styling

### Backend
- **Next.js API Routes** - Serverless functions
- **Vercel KV (Optional)** - Redis for production
- **Node.js 20.x** - Runtime

### Infrastructure
- **Vercel** - Deployment and hosting
- **Git** - Version control
- **TypeScript** - Type safety

---

## 📂 Project Structure

```
course-main/
├── app/
│   ├── api/
│   │   ├── auth/route.ts          # Login endpoint
│   │   └── user/route.ts          # User data CRUD
│   ├── components/
│   │   ├── AppShell.tsx           # Main layout with mobile nav
│   │   ├── OverviewPage.tsx       # Charts and analytics
│   │   ├── MathPage.tsx           # Math section
│   │   ├── PythonPage.tsx         # Python section
│   │   ├── MLPage.tsx             # ML section
│   │   ├── DeepLearningPage.tsx   # Deep Learning section
│   │   ├── ArchitecturesPage.tsx  # Architectures section
│   │   ├── BooksPage.tsx          # Books & Papers
│   │   ├── SchedulePage.tsx       # Learning timeline
│   │   ├── ResourceCard.tsx       # Resource card with drawer
│   │   └── LoginPage.tsx          # Authentication
│   ├── types/
│   │   └── index.ts               # TypeScript definitions
│   ├── globals.css                # Global styles
│   ├── layout.tsx                 # Root layout
│   └── page.tsx                   # Home page
├── public/
│   └── data.json                  # Learning content database
├── package.json                   # Dependencies
├── tsconfig.json                  # TypeScript config
├── next.config.ts                 # Next.js config
├── vercel.json                    # Vercel deployment config
├── .env.example                   # Environment template
└── README.md                      # This file
```

---

## 🎯 Learning Path

### Phase 1: Mathematical Foundations (10-14 weeks)
- Linear Algebra
- Multivariable Calculus
- Probability & Statistics
- Optimization Theory
- Information Theory
- Discrete Math

### Phase 2: Python for AI (3-4 weeks)
- NumPy, Pandas, Matplotlib
- Vectorized thinking
- Scientific computing

### Phase 3: Classical ML (6-8 weeks)
- Regression & Classification
- Decision Trees & Ensembles
- Kernels & SVMs
- Feature Engineering

### Phase 4: Deep Learning (8-10 weeks)
- Neural Networks from Scratch
- Backpropagation
- CNNs, RNNs, Attention
- Optimization & Regularization

### Phase 5: Advanced Architectures (12+ weeks)
- Transformers
- Diffusion Models
- Graph Neural Networks
- State Space Models
- Mixture of Experts

---

## 💻 API Reference

### Authentication

**POST** `/api/auth`
```json
{
  "userId": "admin",
  "password": "your_password"
}
```

Response:
```json
{
  "ok": true,
  "userId": "admin"
}
```

Sets secure cookies: `ai-tracker-session`, `ai-tracker-user`

### User Data

**GET** `/api/user?userId=admin`

Returns user profile with completion status.

**POST** `/api/user`
```json
{
  "userId": "admin",
  "data": {
    "completedResources": ["resource-1", "resource-2"],
    "schedule": { ... }
  }
}
```

---

## 🌐 Deployment

### Vercel (Recommended)

See [QUICK_DEPLOY.md](./QUICK_DEPLOY.md) for 5-minute setup!

Or detailed guide: [VERCEL_DEPLOYMENT.md](./VERCEL_DEPLOYMENT.md)

**Key Features:**
- ✅ Automatic deployments on git push
- ✅ Preview deployments for PRs
- ✅ Automatic HTTPS/SSL
- ✅ Optional Redis KV storage
- ✅ Free tier available
- ✅ Custom domain support

### Environment Variables (Production)

```
USER_ADMIN_PASSWORD=your_secure_password
USER_SAMBHOG_PASSWORD=your_secure_password
KV_REST_API_URL=https://your-kv.upstash.io     (optional)
KV_REST_API_TOKEN=your_kv_token                (optional)
```

---

## 📊 Analytics & Monitoring

### Built-in Metrics
- Overall progress percentage
- Phase-by-phase completion
- Learning velocity (items/week)
- Estimated completion time
- Resource distribution

### Vercel Monitoring
- Web Vitals (LCP, FID, CLS)
- API performance
- Build analytics
- Error tracking
- Real-time logs

---

## 🛠️ Development

### Available Scripts

```bash
npm run dev      # Start development server
npm run build    # Build for production
npm start        # Start production server
npm run lint     # Run ESLint
```

### Code Quality
- **TypeScript** for type safety
- **ESLint** for code style
- **Next.js** best practices
- **Accessible components**

### Testing
```bash
npm run lint     # Check code quality
```

---

## 📱 Mobile Experience

### Bottom Navigation Bar
- 3 primary buttons: Overview, Sections, Schedule
- Touch-optimized sizing
- Clear visual feedback
- Fast navigation

### Section Drawer
- Swipes up from bottom
- All learning sections
- Real-time progress bars
- Quick access to phase-specific content

### Resource Drawer
- Swipes from bottom (mobile) or right (desktop)
- Full resource details
- One-tap to mark complete
- Direct link to resource

---

## 🔒 Security

### Authentication
- HttpOnly cookies (JS cannot access)
- SameSite protection against CSRF
- Server-side password validation
- 30-day session persistence

### Data Protection
- HTTPS-only communication
- Secure headers configured
- No sensitive data in localStorage
- Environment variables never exposed

### Deployment
- Vercel's enterprise-grade infrastructure
- Automatic security updates
- DDoS protection
- 99.95% uptime SLA

---

## 📈 Performance

### Optimization
- Image optimization (AVIF, WebP)
- Code splitting and bundling
- Tree-shaking for dependencies
- Production source maps disabled
- Compression enabled

### Metrics
- **First Contentful Paint (FCP)**: <1.5s
- **Largest Contentful Paint (LCP)**: <2.5s
- **Cumulative Layout Shift (CLS)**: <0.1
- **Time to Interactive**: <3.5s

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push to branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

---

## 📝 Documentation

- [VERCEL_DEPLOYMENT.md](./VERCEL_DEPLOYMENT.md) - Detailed Vercel guide
- [QUICK_DEPLOY.md](./QUICK_DEPLOY.md) - 5-minute deployment
- [MOBILE_RESPONSIVE.md](./MOBILE_RESPONSIVE.md) - Mobile design details
- [OVERVIEW_ENHANCEMENTS.md](./OVERVIEW_ENHANCEMENTS.md) - Analytics features

---

## 🐛 Troubleshooting

### Cannot Login
- Check username/password match `.env.local`
- Ensure environment variables are loaded
- Clear browser cookies and try again

### Data Not Saving
- Check browser console for errors
- Ensure API routes are working
- For production: Configure KV storage

### Charts Not Rendering
- Verify recharts is installed: `npm list recharts`
- Check browser console for errors
- Ensure data is loading correctly

See [VERCEL_DEPLOYMENT.md](./VERCEL_DEPLOYMENT.md#troubleshooting) for more help.

---

## 📞 Support

- **Issues**: Create GitHub issue
- **Discussions**: Start GitHub discussion
- **Documentation**: Read guides above
- **Vercel Help**: https://vercel.com/support

---

## 📜 License

MIT License - see LICENSE file for details

---

## 🎉 Credits

### Content Sources
- MIT OpenCourseWare
- Stanford Engineering
- Imperial College London
- Harvard University
- 3Blue1Brown

### Technology
- [Next.js](https://nextjs.org/)
- [React](https://react.dev/)
- [Vercel](https://vercel.com/)
- [Framer Motion](https://www.framer.com/motion/)
- [Recharts](https://recharts.org/)
- [Tailwind CSS](https://tailwindcss.com/)

---

## 🚀 Getting Help

1. **Documentation**: Check README and guides
2. **GitHub Issues**: Search existing issues
3. **Vercel Status**: Check https://www.vercelstatus.com/
4. **Community**: Stack Overflow, Dev.to

---

**Start learning AI today! 🤖📚**

```
18-24 months
University-grade
Entirely Free
```

Visit: [https://course-main.vercel.app](https://course-main.vercel.app)
