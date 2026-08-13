import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { magicLink } from "better-auth/plugins";
import { Resend } from "resend";
import { prisma } from "./prisma";

const resend = new Resend(process.env.RESEND_API_KEY);

export const auth = betterAuth({
  baseURL: process.env.BETTER_AUTH_URL ?? "http://localhost:3000",
  secret: process.env.BETTER_AUTH_SECRET!,
  database: prismaAdapter(prisma, { provider: "postgresql" }),
  plugins: [
    magicLink({
      sendMagicLink: async ({ email, url }) => {
        await resend.emails.send({
          from: process.env.FROM_EMAIL ?? "noreply@example.com",
          to: email,
          subject: "🥂 Potvrdite vašu porudžbinu — Graviranje na čašama",
          html: `
            <div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:32px;background:#0f111a;color:#e8e8f0;border-radius:16px;">
              <h1 style="font-size:1.5rem;margin-bottom:8px;color:#87ceeb;">Jedan klik do vaše porudžbine</h1>
              <p style="color:#9090b0;margin-bottom:32px;">Kliknite na dugme ispod da potvrdite email i završite porudžbinu.</p>
              <a href="${url}" style="display:inline-block;background:#87ceeb;color:#0f111a;padding:14px 28px;border-radius:999px;font-weight:700;text-decoration:none;letter-spacing:0.05em;">
                POTVRDITE PORUDŽBINU →
              </a>
              <p style="margin-top:32px;font-size:0.75rem;color:#555577;">Link važi 10 minuta. Ako niste vi, ignorišite ovaj email.</p>
            </div>
          `,
        });
      },
    }),
  ],
});

export type Session = typeof auth.$Infer.Session;
