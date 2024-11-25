import { SingleBook } from "~/app/_components/book";
import { api, HydrateClient } from "~/trpc/server";

export default async function Book({
  params,
}: {
  params: Promise<{ book_id: string }>;
}) {
  return (
    <HydrateClient>
      <main className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-[#2e026d] to-[#15162c] text-white">
        <SingleBook id={parseInt((await params).book_id)} />
      </main>
    </HydrateClient>
  );
}
