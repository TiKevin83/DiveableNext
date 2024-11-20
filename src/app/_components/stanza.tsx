"use client";

import Link from "next/link";
import { FaMinus, FaPlus } from "react-icons/fa6";
import { api } from "~/trpc/react";

export function SingleStanza(props: { stanzaId: number }) {
  const utils = api.useUtils();
  const stanza = api.stanza.get.useQuery(props.stanzaId).data;

  const createLine = api.line.create.useMutation({
    onSuccess: async () => {
      await utils.stanza.invalidate();
    },
  });

  const deleteLine = api.line.delete.useMutation({
    onSuccess: async () => {
      await utils.line.invalidate();
    },
  });

  if (!stanza) return <div>Loading...</div>;

  return (
    <div>
      <p>{stanza.chapter.book.name}</p>
      <h1 className="text-5xl font-extrabold tracking-tight sm:text-[5rem]">
        Chapter: {stanza?.chapter.name} - Stanza: {stanza.number}
      </h1>
      <div className="flex flex-row gap-4">
        {stanza.lines
          .sort((a, b) => {
            return a.number - b.number;
          })
          .map((line) => (
            <div
              key={line.id}
              className="flex min-w-48 max-w-48 flex-col items-center justify-center rounded-lg border border-solid border-white text-center"
            >
              <Link href={`/lines/${line.id}`} className="inline-block p-8">
                {line.number}
              </Link>
            </div>
          ))}
        <button
          type={"submit"}
          className="rounded-full bg-white/10 px-10 py-3 font-semibold transition hover:bg-white/20"
          onClick={(e) => {
            e.preventDefault();
            const lineToDelete = stanza.lines[stanza.lines?.length - 1];
            if (!lineToDelete) return;
            deleteLine.mutate(lineToDelete.id);
          }}
        >
          <FaMinus />
        </button>
        <button
          type={"submit"}
          className="rounded-full bg-white/10 px-10 py-3 font-semibold transition hover:bg-white/20"
          onClick={(e) => {
            e.preventDefault();
            createLine.mutate({
              number: stanza.lines.length + 1,
              stanzaId: stanza.id,
            });
          }}
        >
          <FaPlus />
        </button>
      </div>
    </div>
  );
}
