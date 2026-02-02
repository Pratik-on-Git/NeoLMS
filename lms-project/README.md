# NeoLMS

Learning Management System built with Next.js 16 (App Router), Prisma, Better Auth, Stripe, Arcjet, and S3-compatible storage.

## Requirements

- Node.js 20+
- pnpm 9+
- PostgreSQL database
- S3-compatible storage (AWS S3, Tigris, Cloudflare R2, etc.)
- Stripe account (payments + webhooks)
- Arcjet account (bot/rate protection)
- Email SMTP provider (for OTP emails)
- GitHub OAuth App (for social login)

## Quick Start (Local)

1. Install dependencies

```bash
pnpm install
```

2. Create .env.local with the variables below

3. Prepare the database

```bash
pnpm prisma db push
```

4. Run the dev server

```bash
pnpm dev
```

Open http://localhost:3000

## Environment Variables

Create a .env.local file in the project root. All variables below are required by the app.

```bash
# Database
DATABASE_URL=postgresql://USER:PASSWORD@HOST:PORT/DB_NAME

# Better Auth
BETTER_AUTH_SECRET=your-long-random-secret
BETTER_AUTH_URL=http://localhost:3000

# GitHub OAuth
AUTH_GITHUB_CLIENT_ID=your-github-client-id
AUTH_GITHUB_SECRET=your-github-client-secret

# Email (SMTP)
EMAIL_HOST=smtp.example.com
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_USER=your-email@example.com
EMAIL_PASSWORD=your-email-password
EMAIL_FROM="NeoLMS" <your-email@example.com>

# Email provider (required by env validation)
RESEND_API_KEY=your-resend-api-key

# Arcjet
ARCJET_KEY=your-arcjet-key

# S3 / Storage
AWS_ACCESS_KEY_ID=your-access-key
AWS_SECRET_ACCESS_KEY=your-secret-key
AWS_ENDPOINT_URL_S3=https://s3.your-provider.com
AWS_ENDPOINT_URL_IAM=https://iam.your-provider.com
AWS_REGION=us-east-1
NEXT_PUBLIC_S3_BUCKET_NAME_IMAGES=your-bucket-name

# Stripe
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
```

## Stripe Webhooks (Local)

Use Stripe CLI to forward events to the webhook route:

```bash
stripe listen --forward-to localhost:3000/api/webhooks/stripe
```

Then set STRIPE_WEBHOOK_SECRET to the generated signing secret.

## Create an Admin User (Local)

After you sign in with any account, promote that user to admin via Prisma Studio:

```bash
pnpm prisma studio
```

In the Prisma Studio UI, open the user table and set the role field to admin for your account. Save the change. You will then have access to the admin panel and admin features.

Admin URLs: /admin, /admin/dashboard, /admin/courses

## Notes

- Auth handlers live in app/api/auth/[...all]/route.ts and are protected by Arcjet.
- File uploads use S3 presigned URLs (app/api/s3/upload).
- Edge middleware has been migrated to proxy.ts as per Next.js 16.

## Build

```bash
pnpm build
pnpm start
```
