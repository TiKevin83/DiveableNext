"use client";

import { type WordLayer, type Word, type LanguageDepth } from "@prisma/client";
import { useEffect, useState } from "react";
import { FaMinus, FaPlus } from "react-icons/fa6";
import { FaSave, FaSpinner } from "react-icons/fa";
import { api } from "~/trpc/react";
import Link from "next/link";

export function SingleLine(props: { lineId: number }) {
  const utils = api.useUtils();
  const lineQuery = api.line.get.useQuery(props.lineId);
  const line = lineQuery.data;
  const [editingWordsLoaded, setEditingWordsLoaded] = useState(false);
  const [editingWordsSaving, setEditingWordsSaving] = useState(false);

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
        {editingWords
          .sort((a, b) => a.number - b.number)
          .map((word, wordIndex) => {
            return (
              <div
                key={`${word.id}-${wordIndex}`}
                className="flex min-w-64 max-w-64 flex-col items-center justify-center text-center"
              >
                {word.layers
                  .sort((a, b) => a.languageDepth.depth - b.languageDepth.depth)
                  .map((wordLayer, index) => {
                    return (
                      <div
                        key={`${wordLayer.id}-${index}`}
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
                                        editingWordLayer.languageDepthId ===
                                        wordLayer.languageDepthId
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
            const wordToDelete = editingWords[editingWords.length - 1];

            if (!wordToDelete) return;

            setEditingWords((prevWords) =>
              prevWords.filter((word) => word.id !== wordToDelete.id),
            );

            if (wordToDelete.id === 0) return; // If the word is new and not saved yet, skip deletion

            // Delete the word from the database
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
            const newWordNumber = editingWords.length + 1;

            // Add a new word to the editingWords state
            setEditingWords([
              ...editingWords,
              {
                id: 0, // Temporary ID for the new word
                number: newWordNumber,
                lineId: line.id,
                layers: line.stanza.chapter.book.languageDepths.map(
                  (languageDepth) => ({
                    id: 0, // Temporary ID for the layer
                    wordId: 0, // Temporary ID for the word
                    languageDepthId: languageDepth.id,
                    languageDepth,
                    text: "",
                    order: newWordNumber,
                    createdAt: new Date(),
                    updatedAt: new Date(),
                    cachedAnalysis: null,
                  }),
                ),
                createdAt: new Date(),
                updatedAt: new Date(),
              },
            ]);
          }}
        >
          <FaPlus />
        </button>
      </div>
      <button
        className="m-2 rounded-full bg-white/10 p-3 font-semibold transition hover:bg-white/20"
        onClick={async (e) => {
          e.preventDefault();
          setEditingWordsSaving(true);

          // Save all words
          for (const editingWord of editingWords) {
            let currentWords = line.words;
            if (editingWord.id === 0) {
              // New word: Call createWord
              await createWord.mutateAsync({
                number: editingWord.number,
                lineId: editingWord.lineId,
              });
              const wordsFromDb = await lineQuery.refetch();
              currentWords = wordsFromDb.data?.words ?? line.words;
            }

            const uneditedWord = currentWords.find(
              (word) => word.number === editingWord.number,
            );
            // Existing word: Update layers if necessary
            for (const layer of editingWord.layers) {
              const uneditedLayer = uneditedWord?.layers.find(
                (wordLayer) =>
                  wordLayer.languageDepthId === layer.languageDepthId,
              );
              if (
                uneditedLayer &&
                (layer.text !== uneditedLayer?.text ||
                  layer.order !== uneditedLayer?.order)
              ) {
                const topLanguageDepth =
                  line.stanza.chapter.book.languageDepths.sort(
                    (a, b) => a.depth - b.depth,
                  )[0];
                const depthZeroId = currentWords
                  .find((word) => word.id === layer.wordId)
                  ?.layers.find(
                    (layer) =>
                      layer.languageDepth.depth === topLanguageDepth?.depth,
                  )?.id;
                if (!depthZeroId) break;

                await updateWordLayer.mutateAsync({
                  id: uneditedLayer.id,
                  text: layer.text,
                  order: layer.order,
                  depthZeroId,
                });
              }
            }
          }
          setEditingWordsSaving(false);
          setEditingWordsLoaded(false);
          await utils.line.invalidate();
        }}
      >
        {editingWordsSaving ? (
          <FaSpinner className="animate-spin" />
        ) : (
          <FaSave />
        )}
      </button>
    </div>
  );
}
