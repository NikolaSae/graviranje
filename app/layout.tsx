import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Graviranje na čašama | Personalizovani pokloni",
  description:
    "Kreirajte savršen personalizovani poklon — graviranje vašeg teksta ili slike na staklenim čašama. Poručite u jednom koraku.",
  openGraph: {
    title: "Graviranje na čašama",
    description: "Personalizujte vašu čašu — tekst ili slika, u par sekundi.",
    type: "website",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="sr">
      <body>
        <div id="aura" aria-hidden="true" />
        <div id="progress" aria-hidden="true" />
        {children}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              const aura = document.getElementById('aura');
              if(aura && window.matchMedia('(pointer:fine)').matches){
                document.addEventListener('mousemove', e => {
                  aura.style.left = e.clientX + 'px';
                  aura.style.top  = e.clientY + 'px';
                });
              }
            `,
          }}
        />
      </body>
    </html>
  );
}
