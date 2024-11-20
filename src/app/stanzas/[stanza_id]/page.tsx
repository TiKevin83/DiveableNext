import { SingleStanza } from "~/app/_components/stanza";
import { HydrateClient } from "~/trpc/server";

export default async function Stanza({
  params,
}: {
  params: Promise<{ stanza_id: string }>;
}) {
  return (
    <HydrateClient>
      <main className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-[#2e026d] to-[#15162c] text-white">
        <div className="container flex flex-col items-center justify-center gap-12 px-4 py-16">
          <SingleStanza stanzaId={parseInt((await params).stanza_id)} />
        </div>
      </main>
    </HydrateClient>
  );
}
