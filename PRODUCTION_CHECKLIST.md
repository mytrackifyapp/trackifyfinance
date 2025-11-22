# Production Deployment Checklist

## ✅ Build Status
- [x] Application builds successfully without errors
- [x] Fixed React unescaped entities errors
- [x] All ESLint warnings are non-critical (unused vars, image optimizations)

## 🔐 Required Environment Variables

### Core Database & Authentication
- [ ] `DATABASE_URL` - PostgreSQL connection string (with pgbouncer)
- [ ] `DIRECT_URL` - Direct PostgreSQL connection (without pgbouncer) for migrations
- [ ] `NEXT_PUBLIC_CLERK_FRONTEND_API` - Clerk authentication frontend API key
- [ ] `CLERK_SECRET_KEY` - Clerk authentication secret key

### API Keys & Services
- [ ] `GOOGLE_GEMINI_API_KEY` or `GEMINI_API_KEY` - Google Generative AI API key (for Finna AI)
- [ ] `GOOGLE_GEMINI_MODEL` or `GEMINI_MODEL` - Optional, defaults to "gemini-2.5-flash"
- [ ] `UPLOADTHING_SECRET` - UploadThing secret key (for media uploads)
- [ ] `UPLOADTHING_APP_ID` - UploadThing app ID
- [ ] `RESEND_API_KEY` - Resend API key (for email sending)
- [ ] `ARCJET_KEY` - Arcjet API key (for security/protection)

### Optional/Third-party Services
- [ ] `NEXT_PUBLIC_THIRDWEB_CLIENT_ID` - Thirdweb client ID (if using Web3 features)
- [ ] `NEXT_PUBLIC_MAIN_DOMAIN` - Main domain for subdomain routing (defaults to "mytrackify.com")
- [ ] `INNGEST_SIGNING_KEY` - Inngest signing key (for background jobs)
- [ ] `INNGEST_EVENT_KEY` - Inngest event key (optional)

## 🗄️ Database

### Prisma Setup
- [x] Schema updated with onboarding fields (`onboardingCompleted`, `onboardingPreferences`)
- [x] Migration created: `20251122073541_add_onboarding_fields`
- [ ] Run migrations in production: `npx prisma migrate deploy`
- [ ] Generate Prisma Client: `npx prisma generate` (should run automatically via `postinstall` script)

### Database Models Verified
- ✅ User (with onboarding fields)
- ✅ Account
- ✅ Transaction
- ✅ Budget

## 📦 Dependencies & Build

### Package Manager
- Using: `pnpm@10.17.1` (as specified in package.json)

### Key Dependencies
- ✅ Next.js 15.4.4
- ✅ React 19.0.0-rc
- ✅ Prisma 6.12.0
- ✅ Clerk 6.33.2
- ✅ All dependencies installed

### Build Scripts
- ✅ `npm run build` - Production build
- ✅ `npm run start` - Production server
- ✅ `postinstall` - Automatically runs `prisma generate`

## 🔒 Security Checklist

- [ ] All environment variables are set in production environment
- [ ] `.env*` files are in `.gitignore` (already verified)
- [ ] Clerk authentication properly configured
- [ ] Middleware protects routes correctly
- [ ] UploadThing file upload limits configured
- [ ] Arcjet protection enabled in production mode

## 🌐 Configuration Files

### Next.js Config (`next.config.mjs`)
- ✅ Image domains configured (Clerk, UploadThing, utfs.io)
- ✅ Server action body size limit: 5mb
- ✅ Remote image patterns configured

### Middleware (`middleware.js`)
- ✅ Protected routes defined: `/dashboard(.*)`, `/account(.*)`, `/transaction(.*)`
- ✅ Subdomain routing configured for products
- ✅ Clerk authentication middleware active

## 🚀 Deployment Checklist

### Pre-Deployment
- [ ] All environment variables configured in production platform (Vercel/Netlify/etc.)
- [ ] Database migrations ready to run
- [ ] Build completes successfully locally
- [ ] No critical errors in build output

### During Deployment
- [ ] Database migrations run: `npx prisma migrate deploy`
- [ ] Prisma Client generated automatically (via postinstall)
- [ ] Environment variables loaded correctly
- [ ] Build succeeds on production platform

### Post-Deployment
- [ ] Application loads without errors
- [ ] Authentication works (Clerk)
- [ ] Database connections work
- [ ] File uploads work (UploadThing)
- [ ] AI chat works (Finna)
- [ ] All dashboard pages load correctly
- [ ] Onboarding flow works
- [ ] Subdomain routing works (if using product subdomains)

## 🔍 Testing Checklist

### Core Features
- [ ] User sign-up/sign-in
- [ ] Onboarding flow completion
- [ ] Dashboard page loads
- [ ] Accounting page works
- [ ] Finna AI chat responds
- [ ] Invoice creation works
- [ ] Product listing (Seller Dashboard)
- [ ] Transaction creation
- [ ] Account management

### Edge Cases
- [ ] Redirects work correctly
- [ ] Protected routes redirect to sign-in
- [ ] Error pages display properly
- [ ] Loading states work
- [ ] Form validations work

## 📝 Notes

### Known Non-Critical Issues (Warnings)
1. Some unused imports (MessageSquare, ExternalLink, etc.) - Doesn't affect functionality
2. Image optimization suggestions - Can be improved later
3. React Hook dependency warnings - Non-critical, doesn't break functionality

### Migration Command
```bash
npx prisma migrate deploy
```

### Production Build Command
```bash
npm run build
npm run start
```

### Environment Variable Template
Create a `.env.production` or set these in your hosting platform:
```
DATABASE_URL=your_production_db_url
DIRECT_URL=your_production_direct_db_url
NEXT_PUBLIC_CLERK_FRONTEND_API=your_clerk_key
CLERK_SECRET_KEY=your_clerk_secret
GOOGLE_GEMINI_API_KEY=your_gemini_key
UPLOADTHING_SECRET=your_uploadthing_secret
UPLOADTHING_APP_ID=your_uploadthing_app_id
RESEND_API_KEY=your_resend_key
ARCJET_KEY=your_arcjet_key
NEXT_PUBLIC_MAIN_DOMAIN=mytrackify.com
```

## 🐛 Potential Issues to Watch

1. **Database Connection**: Ensure `DATABASE_URL` and `DIRECT_URL` are correct for production
2. **Clerk Keys**: Verify Clerk keys match production environment
3. **Image Domains**: Add any custom image domains to `next.config.mjs` if needed
4. **Subdomain Routing**: Verify `NEXT_PUBLIC_MAIN_DOMAIN` is set correctly
5. **File Uploads**: Ensure UploadThing domain is whitelisted in Next.js config

---

**Last Updated**: Before production deployment
**Status**: ✅ Ready for deployment (pending environment variable setup)

