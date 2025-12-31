import "~/styles/globals.css";

import { Macondo } from "next/font/google";
import { meta } from "~/constants/game";

const primary = Macondo({
  subsets: ["latin"],
  variable: "--font-family",
  weight: ["400"],
});

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <meta
          name="viewport"
          content="width=device-width, height=device-height, initial-scale=1.0, maximum-scale=1.0, user-scalable=no"
        />
        <meta charSet="utf-8" />
        <meta httpEquiv="X-UA-Compatible" content="ie=edge" />
        <link rel="icon" href="/favicon.svg" />
        <title>{meta.name}</title>
        <meta name="description" content={meta.description} />
      </head>
      <body
        style={{ fontFamily: primary.style.fontFamily }}
        className={`relative min-h-dvh w-full overflow-x-hidden bg-gradient-to-br from-indigo-900 via-purple-900 to-slate-900 text-white antialiased`}
      >
        <div className="pointer-events-none fixed inset-0 z-0 bg-[url('/grid.svg')] opacity-20 mix-blend-overlay"></div>
        <div className="pointer-events-none fixed left-0 right-0 top-0 z-0 h-full bg-[radial-gradient(circle_at_50%_0%,_rgba(255,255,255,0.1),_transparent_70%)]"></div>
        <div className="relative z-10 flex h-full min-h-dvh w-full flex-col">
          {children}
        </div>
      </body>
    </html>
  );
}
