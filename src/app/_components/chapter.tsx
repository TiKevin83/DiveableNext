"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
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

  const [languageDepth, setLanguageDepth] = useState(-1);

  useEffect(() => {
    const firstLanguageDepthId = chapter?.book.languageDepths[0]?.id;
    if (languageDepth === -1 && firstLanguageDepthId) {
      setLanguageDepth(firstLanguageDepthId);
    }
  }, [languageDepth, chapter?.book]);

  if (!chapter) return <div>Loading...</div>;

  return (
    <div>
      <p>{chapter?.book.name}</p>
      <h1 className="my-4 text-3xl font-extrabold tracking-tight sm:text-[3rem]">
        {chapter?.name}
      </h1>
      <div className="flex flex-row flex-wrap gap-4">
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
                Edit Stanza {stanza.number}
              </Link>
            </div>
          ))}
        <div className="flex flex-col">
          <button
            type={"submit"}
            className="rounded-full bg-white/10 px-10 py-3 font-semibold transition hover:bg-white/20"
            onClick={(e) => {
              e.preventDefault();
              const stanzaToDelete =
                chapter.stanzas[chapter.stanzas?.length - 1];
              if (!stanzaToDelete) return;
              deleteStanza.mutate(stanzaToDelete.id);
            }}
          >
            <FaMinus />
          </button>
          <button
            type={"submit"}
            className="mt-2 rounded-full bg-white/10 px-10 py-3 font-semibold transition hover:bg-white/20"
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
      <select
        value={languageDepth}
        onChange={(e) => {
          setLanguageDepth(parseInt(e.target.value));
        }}
        className="mt-4 text-black"
      >
        {chapter.book.languageDepths.map((languageDepth) => {
          return (
            <option key={languageDepth.id} value={languageDepth.id}>
              {languageDepth.name}
            </option>
          );
        })}
      </select>
      <div className="mt-2 flex flex-col">
        {chapter.stanzas.map((stanza) => {
          return (
            <div key={stanza.id}>
              {stanza.lines.map((line) => {
                return (
                  <div key={line.id}>
                    <p>
                      {line.words
                        .flatMap((word) => word.layers)
                        .filter(
                          (layer) => layer.languageDepthId === languageDepth,
                        )
                        .sort((a, b) => {
                          return a.order - b.order;
                        })
                        .map((layer) => {
                          return layer.text;
                        })
                        .join(" ")}
                    </p>
                  </div>
                );
              })}
            </div>
          );
        })}
      </div>
    </div>
  );
}
