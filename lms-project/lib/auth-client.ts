import { emailOTPClient } from "better-auth/client/plugins";
import { createAuthClient } from "better-auth/react"
import { adminClient } from "better-auth/client/plugins"
import { env } from "./env";

export const authClient = createAuthClient({
  baseURL: env.BETTER_AUTH_URL || "http://localhost:3000",
  plugins: [
    emailOTPClient(),
    adminClient(),
  ],
});

export const { signIn, signOut, signUp, useSession } = authClient;