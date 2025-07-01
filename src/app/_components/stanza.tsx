"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { FaChevronDown, FaChevronUp, FaMinus, FaPlus } from "react-icons/fa6";
import { api } from "~/trpc/react";
import useTypewriter from "./useTypewriter";

export function SingleStanza(props: { stanzaId: number }) {
  const utils = api.useUtils();
  const stanzaQuery = api.stanza.get.useQuery(props.stanzaId);
  const stanza = stanzaQuery.data;
  const [focusLanguageDepthId, setFocusLanguageDepthId] = useState<
    number | null
  >(null);
  const [focusLanguageDepthIdLoaded, setFocusLanguageDepthIdLoaded] =
    useState<boolean>(false);

  const [prompt, setPrompt] = useState("");

  const [activeAnalysisWordLayerId, setActiveAnalysisWordLayerId] = useState<
    number | null
  >();
  const [activeAnalysisWordId, setActiveAnalysisWordId] = useState<
    number | null
  >(null);
  const activeAnalysis = api.openai.get.useQuery({
    wordLayerId: activeAnalysisWordLayerId ?? 0,
    prompt,
  }).data;

  useEffect(() => {
    if (!stanzaQuery.isLoading && !focusLanguageDepthIdLoaded) {
      setFocusLanguageDepthId(
        stanza?.chapter.book.languageDepths[0]?.id ?? null,
      );
      setFocusLanguageDepthIdLoaded(true);
    }
  }, [focusLanguageDepthIdLoaded, stanza, stanzaQuery.isLoading]);

  const createLine = api.line.create.useMutation({
    onSuccess: async () => {
      await utils.stanza.invalidate();
    },
  });

  const deleteLine = api.line.delete.useMutation({
    onSuccess: async () => {
      await utils.stanza.invalidate();
    },
  });

  const displayText = useTypewriter(activeAnalysis ?? "", 20);

  if (!stanza) return <div>Loading...</div>;

  return (
    <div>
      <p>{stanza.chapter.book.name}</p>
      <h1 className="my-2 text-2xl font-extrabold tracking-tight sm:text-[2rem]">
        Chapter:{" "}
        <Link href={`/chapters/${stanza.chapterId}`}>
          {stanza?.chapter.name}
        </Link>{" "}
        - Stanza: {stanza.number}
      </h1>
      <div className="flex flex-row flex-wrap gap-4 text-xs">
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
                Edit Line {line.number}
              </Link>
            </div>
          ))}
        <div className="flex flex-col">
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
            className="mt-2 rounded-full bg-white/10 px-10 py-3 font-semibold transition hover:bg-white/20"
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
      <div className="flex flex-row flex-wrap text-xs sm:flex-nowrap">
        <div className="m-2 flex w-full flex-col items-center justify-center rounded-lg border border-solid border-white text-center sm:w-2/3">
          <p>Tap a word for live ChatGPT AI analysis</p>
          <p>{displayText}</p>
        </div>
        <div className="m-2 flex w-full flex-col items-center justify-center rounded-lg border border-solid border-white text-center sm:w-1/3">
          <p>Focused Word</p>
          <table>
            <thead>
              <tr>
                <th>Layer</th>
                <th>Analysis</th>
              </tr>
            </thead>
            <tbody>
              {stanza.lines
                .flatMap((line) => line.words)
                .find((word) => word.id === activeAnalysisWordId)
                ?.layers.sort((a, b) => {
                  return a.languageDepth.depth - b.languageDepth.depth;
                })
                .map((layer) => {
                  return (
                    <tr key={layer.id}>
                      <th>{layer.languageDepth.name}:</th>
                      <th>{layer.text}</th>
                    </tr>
                  );
                })}
            </tbody>
          </table>
        </div>
      </div>
      <div className="flex flex-row">
        <div className="flex flex-col">
          {stanza.chapter.book.languageDepths
            .sort((a, b) => {
              return a.depth - b.depth;
            })
            .map((languageDepth) => {
              const languageDepthCount =
                stanza.chapter.book.languageDepths.length;
              const focusLanguageDepth =
                stanza.chapter.book.languageDepths.find(
                  (languageDepth) => languageDepth.id === focusLanguageDepthId,
                )?.depth ?? 0;
              const scale =
                1 -
                Math.abs(languageDepth.depth - focusLanguageDepth) /
                  languageDepthCount;
              return (
                <div
                  key={languageDepth.id}
                  className="m-2 flex flex-col items-center justify-center rounded-lg border border-solid border-white text-center"
                  style={{
                    transform: `scale(${scale})`,
                    opacity: scale,
                    transition: "all .3s",
                  }}
                >
                  <p>{languageDepth.name}</p>
                  {
                    <div>
                      {stanza.lines.map((line) => {
                        return (
                          <p key={line.id}>
                            {line.words
                              .flatMap((word) => word.layers)
                              .filter(
                                (word) =>
                                  word.languageDepthId === languageDepth.id,
                              )
                              .sort((a, b) => a.order - b.order)
                              .map((wordLayer) => (
                                <span
                                  key={wordLayer.id}
                                  onClick={() => {
                                    const analysisWordId = wordLayer.wordId;
                                    const word = stanza.lines
                                      .flatMap((line) => line.words)
                                      ?.find(
                                        (word) => word.id === analysisWordId,
                                      );
                                    const topLayerDepth = word?.layers.sort(
                                      (a, b) =>
                                        a.languageDepth.depth -
                                        b.languageDepth.depth,
                                    )[0]?.languageDepth.depth;
                                    const topWordLayer = word?.layers.find(
                                      (layer) =>
                                        layer.languageDepth.depth ===
                                        topLayerDepth,
                                    );

                                    // Get context sentences for each language layer
                                    const allLayerContexts = word?.layers
                                      .sort(
                                        (a, b) =>
                                          a.languageDepth.depth -
                                          b.languageDepth.depth,
                                      )
                                      .map((layer) => {
                                        const layerDepth =
                                          layer.languageDepth.depth;
                                        const sentence = stanza.lines
                                          .find(
                                            (line) => line.id === word?.lineId,
                                          )
                                          ?.words.map((w) => {
                                            const wordLayer = w.layers.find(
                                              (searchLayer) =>
                                                searchLayer.languageDepth
                                                  .depth === layerDepth,
                                            );
                                            return wordLayer?.text ?? "";
                                          })
                                          .join(" ");

                                        return `${layer.languageDepth.name}: "${sentence}"`;
                                      })
                                      .join("; ");
                                    const layerContext = word?.layers
                                      .map(
                                        (layer) =>
                                          `${layer.languageDepth.name} is ${layer.text}`,
                                      )
                                      .join("; ");
                                    const prompt = `the word ${topWordLayer?.text ?? ""} in the context of the sentence layers ${allLayerContexts ?? ""}, with the specific word's layers analyzed as ${layerContext ?? ""}.`;
                                    setPrompt(prompt);
                                    setActiveAnalysisWordId(analysisWordId);
                                    setActiveAnalysisWordLayerId(
                                      topWordLayer?.id,
                                    );
                                  }}
                                >
                                  {wordLayer.text}{" "}
                                </span>
                              ))}
                          </p>
                        );
                      })}
                    </div>
                  }
                </div>
              );
            })}
        </div>
        <div className="flex flex-col">
          <button
            className="rounded-full bg-white/10 px-10 py-3 font-semibold transition hover:bg-white/20"
            onClick={() => {
              const topLanguageDepth =
                stanza.chapter.book.languageDepths.sort(
                  (a, b) => a.depth - b.depth,
                )[0]?.depth ?? 0;
              const currentDepth =
                stanza.chapter.book.languageDepths.find(
                  (languageDepth) => languageDepth.id === focusLanguageDepthId,
                )?.depth ?? topLanguageDepth;
              const newDepthId = stanza.chapter.book.languageDepths.find(
                (languageDepth) =>
                  languageDepth.depth ===
                  (currentDepth - 1 > topLanguageDepth
                    ? currentDepth - 1
                    : topLanguageDepth),
              )?.id;
              setFocusLanguageDepthId(newDepthId ?? null);
            }}
          >
            <FaChevronUp />
          </button>
          <button
            onClick={() => {
              const topLanguageDepth =
                stanza.chapter.book.languageDepths.sort(
                  (a, b) => a.depth - b.depth,
                )[0]?.depth ?? 0;
              const bottomLanguageDepth =
                stanza.chapter.book.languageDepths.sort(
                  (a, b) => b.depth - a.depth,
                )[0]?.depth ?? 0;
              const currentDepth =
                stanza.chapter.book.languageDepths.find(
                  (languageDepth) => languageDepth.id === focusLanguageDepthId,
                )?.depth ?? topLanguageDepth;
              const newDepthId = stanza.chapter.book.languageDepths.find(
                (languageDepth) =>
                  languageDepth.depth ===
                  (currentDepth + 1 < bottomLanguageDepth
                    ? currentDepth + 1
                    : bottomLanguageDepth),
              )?.id;
              setFocusLanguageDepthId(newDepthId ?? null);
            }}
            className="mt-2 rounded-full bg-white/10 px-10 py-3 font-semibold transition hover:bg-white/20"
          >
            <FaChevronDown />
          </button>
        </div>
      </div>
    </div>
  );
}
