import Link from "next/link";

import { LatestBook } from "~/app/_components/latestBook";
import { auth } from "~/server/auth";
import { api, HydrateClient } from "~/trpc/server";

export default async function Home() {
  const session = await auth();

  if (session?.user) {
    void api.book.getLatest.prefetch();
  }

  return (
    <HydrateClient>
      <main className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-[#2e026d] to-[#15162c] text-white">
        <div className="container flex flex-col items-center justify-center gap-12 px-4 py-16">
          <h1 className="text-5xl font-extrabold tracking-tight sm:text-[5rem]">
            Dive<span className="text-[hsl(280,100%,70%)]">able</span>
          </h1>
          <h2 className="text-2xl font-bold">Stories you can dive into</h2>
          {session?.user && <LatestBook />}
          {session?.user && (
            <Link href={"/books"} className="text-2xl font-bold">
              Your Books
            </Link>
          )}
          {session?.user && (
            <Link href={"/languages"} className="text-2xl font-bold">
              Your Languages
            </Link>
          )}
          <div className="flex flex-col items-center gap-2">
            <div className="flex flex-col items-center justify-center gap-4"></div>
          </div>
        </div>
      </main>
    </HydrateClient>
  );
}
