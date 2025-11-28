# VENTURR - AI-Powered Operating System for Trade Businesses

![VENTURR Logo](./client/public/logo.svg)

> Transform your roofing business with AI-powered site measurement, smart quoting, and compliance automation.

## 🚀 Features

### Core Platform
- **AI Site Measurement** - Measure roofs from satellite imagery using Mapbox
- **Smart Takeoff Calculator** - Auto-calculate materials, labor, and plant with AI
- **Professional Quote Generator** - Generate branded PDF quotes in seconds
- **Client CRM** - Manage clients, projects, and communication history
- **Project Management** - Track projects from measurement to completion
- **Compliance Documentation** - Australian standards (AS 1562.1, AS/NZS 1170.2, AS 3959, NCC 2022)
- **Materials Library** - Manage materials, pricing, and inventory
- **Subscription Management** - Stripe integration for billing

### World-Class UI/UX
- **Enhanced Landing Page** - Immersive design with psychological triggers
- **Delightful Authentication** - Smooth sign-in with progress indicators
- **Performance-Optimized Dashboard** - Real-time stats and quick actions
- **Comprehensive Animation System** - 20+ smooth animations and transitions
- **Mobile-First Design** - Touch-friendly, responsive on all devices
- **Glassmorphism Effects** - Modern visual design with depth

## 🛠️ Tech Stack

### Frontend
- **React 19** - Latest React with hooks and concurrent features
- **TypeScript** - Type-safe development
- **Tailwind CSS 4** - Utility-first styling
- **Vite 7** - Lightning-fast build tool
- **tRPC 11** - End-to-end type-safe APIs
- **Lucide React** - Beautiful icons
- **Shadcn/ui** - Accessible component library

### Backend
- **Express 4** - Lightweight Node.js server
- **tRPC** - Type-safe RPC framework
- **Drizzle ORM** - Modern SQL ORM
- **MySQL/TiDB** - Relational database
- **Stripe** - Payment processing
- **Mapbox** - Satellite imagery and mapping

### Infrastructure
- **Netlify** - Serverless deployment
- **S3** - File storage
- **JWT** - Session management
- **OAuth 2.0** - Authentication

## 📦 Project Structure

```
VENTURR/
├── client/                 # React frontend
│   ├── src/
│   │   ├── pages/         # Page components (Home, Login, Dashboard, etc.)
│   │   ├── components/    # Reusable UI components
│   │   ├── lib/           # Utilities (animations, trpc, performance)
│   │   ├── styles/        # CSS (animations, mobile, print)
│   │   ├── contexts/      # React contexts
│   │   ├── hooks/         # Custom hooks
│   │   ├── App.tsx        # Main app component
│   │   └── main.tsx       # Entry point
│   └── public/            # Static assets
│
├── server/                # Express + tRPC backend
│   ├── _core/            # Core infrastructure
│   │   ├── index.ts      # Server entry point
│   │   ├── trpc.ts       # tRPC setup
│   │   ├── context.ts    # Request context
│   │   ├── auth.ts       # Authentication
│   │   └── env.ts        # Environment variables
│   ├── routers/          # API routers
│   │   ├── projects.ts
│   │   ├── quotes.ts
│   │   ├── clients.ts
│   │   └── ...
│   ├── db.ts             # Database queries
│   └── storage.ts        # S3 storage helpers
│
├── drizzle/              # Database schema
│   ├── schema.ts         # Table definitions
│   └── migrations/       # Migration files
│
├── shared/               # Shared types and constants
│   ├── const.ts
│   └── types.ts
│
├── netlify.toml          # Netlify deployment config
├── vite.config.ts        # Vite build config
├── tsconfig.json         # TypeScript config
├── package.json          # Dependencies
└── README.md             # This file
```

## 🚀 Quick Start

### Prerequisites
- Node.js 22.13.0+
- pnpm 9.0+
- MySQL 8.0+
- Mapbox account
- Stripe account (optional)

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/VentrLegandaryOne/VENTURR.git
   cd VENTURR
   ```

2. **Install dependencies:**
   ```bash
   pnpm install
   ```

3. **Set up environment variables:**
   ```bash
   cp .env.example .env.local
   ```
   
   Edit `.env.local` with your values:
   ```env
   # Database
   DATABASE_URL=mysql://user:password@localhost:3306/venturr
   
   # Authentication
   JWT_SECRET=your-secret-key
   OAUTH_SERVER_URL=https://api.manus.im
   VITE_OAUTH_PORTAL_URL=https://portal.manus.im
   
   # Mapbox
   VITE_MAPBOX_TOKEN=your-mapbox-token
   
   # Stripe
   STRIPE_SECRET_KEY=sk_test_...
   STRIPE_STARTER_PRICE_ID=price_...
   STRIPE_PRO_PRICE_ID=price_...
   STRIPE_GROWTH_PRICE_ID=price_...
   STRIPE_ENTERPRISE_PRICE_ID=price_...
   
   # App
   VITE_APP_ID=venturr
   VITE_APP_TITLE=Venturr
   VITE_APP_LOGO=/logo.svg
   ```

4. **Set up database:**
   ```bash
   pnpm db:push
   ```

5. **Start development server:**
   ```bash
   pnpm dev
   ```

6. **Open browser:**
   ```
   http://localhost:3001
   ```

## 📖 Documentation

### User Guides
- [Getting Started](./docs/GETTING_STARTED.md)
- [Site Measurement Guide](./docs/SITE_MEASUREMENT.md)
- [Quote Generation](./docs/QUOTE_GENERATION.md)
- [Compliance Documentation](./docs/COMPLIANCE.md)

### Developer Guides
- [Architecture Overview](./docs/ARCHITECTURE.md)
- [API Documentation](./docs/API.md)
- [Database Schema](./docs/DATABASE.md)
- [Deployment Guide](./NETLIFY_DEPLOYMENT_GUIDE.md)

### Enhancement Documentation
- [UI/UX Enhancements](./ENHANCEMENTS_APPLIED.md)
- [Animation System](./client/src/lib/animations.ts)

## 🎨 UI/UX Enhancements

This project includes world-class UI/UX enhancements:

### Enhanced Pages
- **HomeEnhanced.tsx** - Immersive landing with psychological design
- **LoginEnhanced.tsx** - Delightful authentication experience
- **DashboardEnhanced.tsx** - Performance-optimized dashboard

### Animation System
- **animations.css** - 20+ keyframe animations
- **animations.ts** - Programmatic animation utilities
- **EnhancedButton.tsx** - Micro-interactions component

See [ENHANCEMENTS_APPLIED.md](./ENHANCEMENTS_APPLIED.md) for complete details.

## 🔐 Security

- JWT-based authentication
- Role-based access control (RBAC)
- Input validation and sanitization
- SQL injection protection (Drizzle ORM)
- CORS enabled
- Security headers configured
- Environment variables for sensitive data

## 📊 Performance

- Lazy-loaded routes
- Code splitting
- Optimized animations (GPU acceleration)
- Query caching
- Image optimization
- Minified production builds

## 🧪 Testing

Run tests:
```bash
pnpm test
```

Run specific test file:
```bash
pnpm test -- specific-test.test.ts
```

## 🚢 Deployment

### Netlify (Recommended)
```bash
# Install Netlify CLI
npm install -g netlify-cli

# Deploy
netlify deploy --prod
```

See [NETLIFY_DEPLOYMENT_GUIDE.md](./NETLIFY_DEPLOYMENT_GUIDE.md) for detailed instructions.

### Docker
```bash
docker build -t venturr .
docker run -p 3001:3001 venturr
```

## 📝 Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `DATABASE_URL` | MySQL connection string | ✅ |
| `JWT_SECRET` | Session signing secret | ✅ |
| `VITE_MAPBOX_TOKEN` | Mapbox API token | ✅ |
| `STRIPE_SECRET_KEY` | Stripe secret key | ⚠️ |
| `VITE_APP_TITLE` | App title | ❌ |
| `VITE_APP_LOGO` | App logo URL | ❌ |

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](./LICENSE) file for details.

## 🙋 Support

For support, email support@venturr.app or open an issue on GitHub.

## 🎯 Roadmap

- [ ] Mobile app (React Native)
- [ ] Advanced analytics dashboard
- [ ] Team collaboration features
- [ ] Weather integration
- [ ] Crew scheduling
- [ ] Financial reporting
- [ ] Integration marketplace

## 👨‍💻 Authors

- **Venturr Team** - Initial development and world-class enhancements

## 🙏 Acknowledgments

- Mapbox for satellite imagery
- Stripe for payment processing
- Tailwind CSS for styling
- React community for amazing tools

---

**Built with ❤️ for Australian trade businesses**

[Website](https://venturr.app) • [Documentation](./docs) • [Issues](https://github.com/VentrLegandaryOne/VENTURR/issues) • [Discussions](https://github.com/VentrLegandaryOne/VENTURR/discussions)
