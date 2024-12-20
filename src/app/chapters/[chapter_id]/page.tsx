import Link from "next/link";
import { SingleChapter } from "~/app/_components/chapter";
import { auth } from "~/server/auth";
import { api, HydrateClient } from "~/trpc/server";

export default async function Book({
  params,
}: {
  params: Promise<{ chapter_id: string }>;
}) {
  const chapterId = parseInt((await params).chapter_id);
  const chapter = await api.chapter.get(chapterId);
  const session = await auth();
  if (!chapter) {
    return (
      <HydrateClient>
        <main className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-[#2e026d] to-[#15162c] text-white">
          <p>Chapter not found.</p>
        </main>
      </HydrateClient>
    );
  }
  if (
    chapter.book.createdById !== session?.user.id &&
    !chapter.book.authorizedEditors.includes(session?.user.email ?? "")
  ) {
    return (
      <HydrateClient>
        <main className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-[#2e026d] to-[#15162c] text-white">
          <p>You are not authorized to edit this book.</p>
          <Link href={`/chapters/${chapter?.book?.id}/view`}>
            Click here for viewing only
          </Link>
        </main>
      </HydrateClient>
    );
  }
  return (
    <HydrateClient>
      <main className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-[#2e026d] to-[#15162c] text-white">
        <div className="container flex flex-col items-center justify-center gap-12 px-4 py-16">
          <SingleChapter chapterId={parseInt((await params).chapter_id)} />
        </div>
      </main>
    </HydrateClient>
  );
}
