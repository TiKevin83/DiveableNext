"use client";

import Link from "next/link";
import { FaMinus, FaPlus } from "react-icons/fa6";
import { api } from "~/trpc/react";

export function SingleChapter(props: { chapterId: number }) {
  const utils = api.useUtils();
  const chapter = api.chapter.get.useQuery(props.chapterId).data;

  const createStanza = api.stanza.create.useMutation({
    onSuccess: async () => {
      await utils.chapter.invalidate();
    },
  });

  const deleteStanza = api.stanza.delete.useMutation({
    onSuccess: async () => {
      await utils.chapter.invalidate();
    },
  });

  if (!chapter) return <div>Loading...</div>;

  return (
    <div>
      <p>{chapter?.book.name}</p>
      <h1 className="text-5xl font-extrabold tracking-tight sm:text-[5rem]">
        {chapter?.name}
      </h1>
      <div className="flex flex-row gap-4">
        {chapter.stanzas
          .sort((a, b) => {
            return a.number - b.number;
          })
          .map((stanza) => (
            <div
              key={stanza.id}
              className="flex min-w-48 max-w-48 flex-col items-center justify-center rounded-lg border border-solid border-white text-center"
            >
              <Link href={`/stanzas/${stanza.id}`} className="inline-block p-8">
                {stanza.number}
              </Link>
            </div>
          ))}
        <button
          type={"submit"}
          className="rounded-full bg-white/10 px-10 py-3 font-semibold transition hover:bg-white/20"
          onClick={(e) => {
            e.preventDefault();
            const stanzaToDelete = chapter.stanzas[chapter.stanzas?.length - 1];
            if (!stanzaToDelete) return;
            deleteStanza.mutate(stanzaToDelete.id);
          }}
        >
          <FaMinus />
        </button>
        <button
          type={"submit"}
          className="rounded-full bg-white/10 px-10 py-3 font-semibold transition hover:bg-white/20"
          onClick={(e) => {
            e.preventDefault();
            createStanza.mutate({
              number: chapter.stanzas.length + 1,
              chapterId: chapter.id,
            });
          }}
        >
          <FaPlus />
        </button>
      </div>
    </div>
  );
}
