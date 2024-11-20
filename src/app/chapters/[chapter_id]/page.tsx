import { SingleChapter } from "~/app/_components/chapter";
import { HydrateClient } from "~/trpc/server";

export default async function Book({
  params,
}: {
  params: Promise<{ chapter_id: string }>;
}) {
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
