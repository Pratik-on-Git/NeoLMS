
import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { prisma } from "./db";
import { env } from "./env";
import { emailOTP } from "better-auth/plugins";
import { admin } from "better-auth/plugins"

export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: false,
    minPasswordLength: 8,
    maxPasswordLength: 128,
  },
  socialProviders: {
    github: {
      clientId: env.AUTH_GITHUB_CLIENT_ID,
      clientSecret: env.AUTH_GITHUB_SECRET,
    },
  },
  plugins: [
    emailOTP({
      async sendVerificationOTP({ email, otp }) {
        // Lazy-load mailer only on server
        const { sendEmail, emailTemplates } = await import("./nodemailer");
        const template = emailTemplates.otp(otp);
        const result = await sendEmail(email, template);

        if (!result.success) {
          throw new Error("Failed to send verification email");
        }
      },
      sendVerificationOnSignUp: false,
      otpLength: 6,
      expiresIn: 600, // 10 minutes
    }),
    admin(),
  ],
  trustedOrigins: [
    "http://localhost:3000",
    env.BETTER_AUTH_URL,
  ],
});
