# RKS HIREIQ

RKS HIREIQ is a full-stack AI career coach and recruitment intelligence platform. It brings resume analysis, resume building, mock interviews, AI roadmaps, skills practice, portfolio building, company insights, networking research, profile management, and admin CRM tools into one polished career operating system.

## Highlights

- AI resume analysis with ATS scoring, strengths, gaps, missing keywords, and improvement guidance.
- Resume maker with professional templates and preview components.
- Mock interview preparation with saved interview history.
- Career path planning, skills lab, subject lab, and AI roadmap generation.
- Portfolio builder for turning projects and achievements into a professional profile.
- Company insights with live market trend parsing and cached hiring signals.
- Networking research with verified public leader profiles and outreach drafting support.
- User profile controls for editable email, preferred AI model, compressed profile photo upload, and password updates.
- Admin dashboard for stats, users, leads, contacts, email campaigns, templates, replies, and platform settings.
- Full-stack Express server with MongoDB Atlas, JWT auth, bcrypt password hashing, and Vite middleware.

## Tech Stack

- Frontend: React 19, Vite, TypeScript, Tailwind CSS, Framer Motion
- Backend: Node.js, Express, MongoDB, Mongoose
- AI: Google Gemini via `@google/genai`
- Auth: JWT and bcrypt
- State: Zustand
- UI: Lucide React icons, Recharts, custom CSS motion system

## Project Structure

```text
src/
  components/        Shared layouts, UI helpers, modals, resume templates
  lib/               API client, file parser, utilities
  models/            Mongoose models
  pages/
    admin/           Admin dashboard, users, leads, contacts, email center, settings
    auth/            Login, register, forgot password, reset password
    public/          Home, about, pricing, contact, privacy
    user/            Dashboard, resume tools, interview, roadmap, portfolio, insights, networking
  services/          Gemini AI service and model fallback logic
  store/             Zustand user/session and resume pipeline stores
server.ts            Express API, MongoDB connection, auth, admin/user routes, Vite dev middleware
```

## Getting Started

Install dependencies:

```bash
npm install
```

Create your local environment file:

```bash
cp .env.example .env
```

Fill `.env` with your own keys:

```env
GEMINI_API_KEY="your_gemini_api_key_here"
APP_URL="http://localhost:3000"
MONGODB_URI="your_mongodb_atlas_connection_string"
JWT_SECRET="replace_with_a_long_random_secret"
INITIAL_ADMIN_EMAIL="admin@example.com"
INITIAL_ADMIN_PASSWORD="replace_with_a_strong_password"
```

Run the development server:

```bash
npm run dev
```

Open:

```text
http://localhost:3000
```

## Scripts

```bash
npm run dev      # Start Express + Vite dev server
npm run build    # Build frontend for production
npm run preview  # Preview production build
npm run lint     # TypeScript check
```

## Security Notes

- `.env` is ignored by Git and must never be committed.
- `.env.example` contains placeholders only.
- Rotate any API keys or database passwords that were ever committed, pasted publicly, or shared.
- Use a strong `JWT_SECRET` in production.
- Use restricted MongoDB Atlas network access and a least-privilege database user.

## Deployment

This project is configured for deployment on both Vercel (frontend) and Render (backend).

### Architecture

- **Frontend**: Deployed on Vercel as a static site
- **Backend**: Deployed on Render as a Node.js web service
- **Database**: MongoDB Atlas (cloud)
- **AI**: Google Gemini API

### 1. Deploy Backend on Render

1. Create a new Render account at https://render.com
2. Connect your GitHub repository
3. Create a new **Web Service** from your repository
4. Configure the service:
   - **Name**: `rks-hire-iq-backend`
   - **Runtime**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
5. Set environment variables in Render dashboard:
   - `NODE_ENV=production`
   - `MONGODB_URI=<your-mongodb-atlas-connection-string>`
   - `JWT_SECRET=<long-random-secret>`
   - `INITIAL_ADMIN_EMAIL=<admin-email>`
   - `INITIAL_ADMIN_PASSWORD=<admin-password>`
   - `GEMINI_API_KEY=<your-gemini-api-key>`
   - `APP_URL=<your-render-service-url>` (will be auto-generated)
6. Deploy the service

### 2. Deploy Frontend on Vercel

1. Create a Vercel account at https://vercel.com
2. Connect your GitHub repository
3. Import the project
4. Configure the project:
   - **Framework Preset**: `Other`
   - **Root Directory**: `./` (project root)
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
5. Set environment variables in Vercel dashboard:
   - `VITE_API_URL=<your-render-backend-url>`
6. Update `vercel.json`:
   - Replace `https://your-render-service.onrender.com` with your actual Render service URL
7. Deploy the frontend

### 3. Update CORS (if needed)

If you encounter CORS issues, update the backend CORS configuration in `server.ts`:

```typescript
app.use(cors({
  origin: ['https://your-vercel-app.vercel.app', 'http://localhost:3000'],
  credentials: true
}));
```

### Environment Variables Summary

**Backend (Render)**:
- `NODE_ENV=production`
- `MONGODB_URI=<mongodb-connection-string>`
- `JWT_SECRET=<random-secret>`
- `INITIAL_ADMIN_EMAIL=<admin-email>`
- `INITIAL_ADMIN_PASSWORD=<admin-password>`
- `GEMINI_API_KEY=<gemini-api-key>`
- `APP_URL=<render-service-url>`

**Frontend (Vercel)**:
- `VITE_API_URL=<render-backend-url>`

### Security Notes

- Never commit `.env` files to Git
- Use strong, unique secrets for JWT and database
- Rotate API keys regularly
- Use restricted MongoDB Atlas network access
- Enable Render's auto-deploys for seamless updates

## License

Private project for RKS HIREIQ unless a license is added.
