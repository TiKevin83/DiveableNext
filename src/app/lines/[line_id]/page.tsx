import { SingleLine } from "~/app/_components/line";
import { HydrateClient } from "~/trpc/server";

export default async function Line({
  params,
}: {
  params: Promise<{ line_id: string }>;
}) {
  return (
    <HydrateClient>
      <main className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-[#2e026d] to-[#15162c] text-white">
        <div className="container flex flex-col items-center justify-center gap-12 px-4 py-16">
          <SingleLine lineId={parseInt((await params).line_id)} />
        </div>
      </main>
    </HydrateClient>
  );
}
