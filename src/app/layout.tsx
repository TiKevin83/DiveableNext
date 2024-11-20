import "~/styles/globals.css";

import { GeistSans } from "geist/font/sans";
import { type Metadata } from "next";

import { TRPCReactProvider } from "~/trpc/react";
import Link from "next/link";
import { auth } from "~/server/auth";

export const metadata: Metadata = {
  title: "Diveable",
  description: "Visualize layers of meaning in stories",
  icons: [{ rel: "icon", url: "/favicon.ico" }],
};

export default async function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const session = await auth();

  return (
    <html lang="en" className={`${GeistSans.variable}`}>
      <body>
        <nav className="border-gray-200 bg-white dark:bg-gray-900">
          <div className="mx-auto flex max-w-screen-xl flex-wrap items-center justify-between p-4">
            <Link href="/" className="dark:text-white">
              Diveable
            </Link>
            <p className="text-center text-xl text-white">
              {session && <span>Logged in as {session.user?.name}</span>}
            </p>
            <Link
              href={session ? "/api/auth/signout" : "/api/auth/signin"}
              className="rounded-full bg-white/10 px-10 py-3 font-semibold text-white no-underline transition hover:bg-white/20"
            >
              {session ? "Sign out" : "Sign in"}
            </Link>
          </div>
        </nav>
        <TRPCReactProvider>{children}</TRPCReactProvider>
      </body>
    </html>
  );
}
