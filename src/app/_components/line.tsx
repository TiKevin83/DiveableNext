"use client";

import { type WordLayer, type Word, type LanguageDepth } from "@prisma/client";
import { useEffect, useState } from "react";
import { FaMinus, FaPlus } from "react-icons/fa6";
import { FaSave } from "react-icons/fa";
import { api } from "~/trpc/react";
import Link from "next/link";

export function SingleLine(props: { lineId: number }) {
  const utils = api.useUtils();
  const lineQuery = api.line.get.useQuery(props.lineId);
  const line = lineQuery.data;
  const [editingWordsLoaded, setEditingWordsLoaded] = useState(false);

  const [editingWords, setEditingWords] = useState<
    (Word & { layers: (WordLayer & { languageDepth: LanguageDepth })[] })[]
  >(line?.words ?? []);

  useEffect(() => {
    if (!lineQuery.isLoading && !editingWordsLoaded) {
      const initializedWords = line?.words.map((word) => {
        return {
          ...word,
          layers: word.layers.map((layer) => {
            return {
              ...layer,
              order: layer.order === 0 ? word.number : layer.order,
            };
          }),
        };
      });
      setEditingWords(initializedWords ?? []);
      setEditingWordsLoaded(true);
    }
  }, [editingWordsLoaded, line, lineQuery.isLoading]);

  const createWord = api.line.createWord.useMutation({
    onSuccess: async () => {
      await utils.line.invalidate();
      setEditingWordsLoaded(false);
    },
  });

  const updateWordLayer = api.line.updateWordLayer.useMutation({
    onSuccess: async () => {
      await utils.line.invalidate();
    },
  });

  const deleteWord = api.line.deleteWord.useMutation({
    onSuccess: async () => {
      await utils.line.invalidate();
    },
  });

  if (!line) return <div>Loading...</div>;

  return (
    <div>
      <p>{line.stanza.chapter.book.name}</p>
      <h1 className="my-2 text-2xl font-extrabold tracking-tight sm:text-[2rem]">
        Chapter: {line.stanza.chapter.name} -{" "}
        <Link href={`/stanzas/${line.stanzaId}`}>
          Stanza: {line.stanza.number}
        </Link>{" "}
        - Line: {line.number}
      </h1>
      <div className="flex flex-row flex-wrap gap-4">
        <div className="flex flex-col items-center justify-center text-center">
          {line.stanza.chapter.book.languageDepths.map((languageDepth) => {
            return (
              <div
                key={languageDepth.id}
                className="flex min-w-48 max-w-48 flex-col items-center justify-center rounded-lg border border-solid border-white text-center"
              >
                <p>{languageDepth.name}</p>
              </div>
            );
          })}
        </div>
        {line.words
          .sort((a, b) => a.number - b.number)
          .map((word) => {
            return (
              <div
                key={word.id}
                className="flex min-w-64 max-w-64 flex-col items-center justify-center text-center"
              >
                {editingWords
                  .find((editingWord) => editingWord.id === word.id)
                  ?.layers.sort(
                    (a, b) => a.languageDepth.depth - b.languageDepth.depth,
                  )
                  .map((wordLayer) => {
                    return (
                      <div
                        key={wordLayer.id}
                        className="flex min-w-64 max-w-64 flex-row items-center justify-center rounded-lg border border-solid border-white text-center"
                      >
                        <input
                          type="text"
                          className={"m-2 max-w-40 text-black"}
                          value={wordLayer.text}
                          onChange={(e) => {
                            e.preventDefault();
                            setEditingWords(
                              editingWords.map((editingWord) => {
                                if (editingWord.id !== word.id) {
                                  return editingWord;
                                }

                                return {
                                  ...editingWord,
                                  layers: editingWord.layers.map(
                                    (editingWordLayer) => {
                                      if (
                                        editingWordLayer.id === wordLayer.id
                                      ) {
                                        return {
                                          ...editingWordLayer,
                                          text: e.target.value,
                                        };
                                      }
                                      return editingWordLayer;
                                    },
                                  ),
                                };
                              }),
                            );
                          }}
                        />
                        <input
                          className="m-2 max-w-12 text-black"
                          type="number"
                          value={wordLayer.order}
                          onChange={(e) => {
                            e.preventDefault();
                            setEditingWords(
                              editingWords.map((editingWord) => {
                                if (editingWord.id !== word.id) {
                                  return editingWord;
                                }

                                return {
                                  ...editingWord,
                                  layers: editingWord.layers.map(
                                    (editingWordLayer) => {
                                      if (
                                        editingWordLayer.id === wordLayer.id
                                      ) {
                                        return {
                                          ...editingWordLayer,
                                          order: parseInt(e.target.value),
                                        };
                                      }
                                      return editingWordLayer;
                                    },
                                  ),
                                };
                              }),
                            );
                          }}
                        />
                      </div>
                    );
                  })}
              </div>
            );
          })}
        <button
          type={"submit"}
          className="rounded-full bg-white/10 px-10 py-3 font-semibold transition hover:bg-white/20"
          onClick={(e) => {
            e.preventDefault();
            const wordToDelete = line.words[line.words.length - 1];
            if (!wordToDelete) return;
            deleteWord.mutate(wordToDelete.id);
          }}
        >
          <FaMinus />
        </button>
        <button
          type={"submit"}
          className="rounded-full bg-white/10 px-10 py-3 font-semibold transition hover:bg-white/20"
          onClick={(e) => {
            e.preventDefault();
            createWord.mutate({
              number: line.words.length + 1,
              lineId: line.id,
            });
          }}
        >
          <FaPlus />
        </button>
      </div>
      <button
        className="m-2 rounded-full bg-white/10 p-3 font-semibold transition hover:bg-white/20"
        onClick={async (e) => {
          e.preventDefault();
          editingWords
            .flatMap((editingWord) => editingWord.layers)
            .forEach((editingWordLayer) => {
              const uneditedWord = line.words
                .flatMap((word) => word.layers)
                .find((wordLayer) => wordLayer.id === editingWordLayer.id);

              if (
                editingWordLayer.text !== uneditedWord?.text ||
                editingWordLayer.order !== uneditedWord?.order
              ) {
                const topLanguageDepth = line.stanza.chapter.book.languageDepths
                  .sort((a, b) => a.depth - b.depth)[0];
                const depthZeroId = line.words
                  .find((word) => word.id === editingWordLayer.wordId)
                  ?.layers.find((layer) => layer.languageDepth.depth === topLanguageDepth?.depth)?.id;
                if (!depthZeroId) return;
                updateWordLayer.mutate({
                  depthZeroId,
                  id: editingWordLayer.id,
                  text: editingWordLayer.text,
                  order: editingWordLayer.order,
                });
              }
            });
          await utils.line.invalidate();
        }}
      >
        <FaSave />
      </button>
    </div>
  );
}
