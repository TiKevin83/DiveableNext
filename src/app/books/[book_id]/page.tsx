import { SingleBook } from "~/app/_components/book";
import { api, HydrateClient } from "~/trpc/server";

export default async function Book({
  params,
}: {
  params: Promise<{ book_id: string }>;
}) {
  const book = await api.book.get(parseInt((await params).book_id));

  return (
    <HydrateClient>
      <main className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-[#2e026d] to-[#15162c] text-white">
        <div className="container flex flex-col items-center justify-center gap-12 px-4 py-16">
          <h1 className="text-5xl font-extrabold tracking-tight sm:text-[5rem]">
            {book?.name}
          </h1>
          <SingleBook id={parseInt((await params).book_id)} />
        </div>
      </main>
    </HydrateClient>
  );
}
