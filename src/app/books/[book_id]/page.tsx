import Link from "next/link";
import { SingleBook } from "~/app/_components/book";
import { auth } from "~/server/auth";
import { api, HydrateClient } from "~/trpc/server";

export default async function Book({
  params,
}: {
  params: Promise<{ book_id: string }>;
}) {
  const resolvedParams = await params;
  const book = await api.book.get(parseInt(resolvedParams.book_id));
  const session = await auth();
  if (!book) {
    return (
      <HydrateClient>
        <main className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-[#2e026d] to-[#15162c] text-white">
          <p>Book not found.</p>
        </main>
      </HydrateClient>
    );
  }
  if (
    book.createdById !== session?.user.id &&
    !book.authorizedEditors.includes(session?.user.email ?? "")
  ) {
    return (
      <HydrateClient>
        <main className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-[#2e026d] to-[#15162c] text-white">
          <p>You are not authorized to edit this book.</p>
          <Link href={`/books/${book?.id}/view`}>
            Click here for viewing only
          </Link>
        </main>
      </HydrateClient>
    );
  }
  return (
    <HydrateClient>
      <main className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-[#2e026d] to-[#15162c] text-white">
        <SingleBook id={parseInt((await params).book_id)} />
      </main>
    </HydrateClient>
  );
}
