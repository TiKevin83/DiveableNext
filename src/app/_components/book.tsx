"use client";

import { api } from "~/trpc/react";
import { FaPlus, FaSave } from "react-icons/fa";
import { useState } from "react";
import Link from "next/link";
import { FaTrashCan } from "react-icons/fa6";

interface BookProps {
  id: number;
}

export function SingleBook(props: BookProps) {
  const utils = api.useUtils();
  const bookQuery = api.book.get.useQuery(props.id);
  const book = bookQuery?.data;
  const languages = api.language.list.useQuery().data;
  const createChapter = api.chapter.create.useMutation({
    onSuccess: async () => {
      await utils.book.invalidate();
    },
  });
  const deleteChapter = api.chapter.delete.useMutation({
    onSuccess: async () => {
      await utils.book.invalidate();
    },
  });
  const createWordLayer = api.line.createWordLayer.useMutation({});
  const deleteWordLayer = api.line.deleteWordLayer.useMutation({});
  const createLanguageDepth = api.book.createLanguageDepth.useMutation({
    onSuccess: async (data) => {
      book?.chapters
        .flatMap((chapter) => chapter.stanzas)
        .flatMap((stanza) => stanza.lines)
        .flatMap((line) => line.words)
        .forEach((word) => {
          createWordLayer.mutate({
            text: "",
            languageDepthId: data.id,
            wordId: word.id,
          });
        });
      await utils.book.invalidate();
    },
  });
  const deleteLanguageDepth = api.book.deleteLanguageDepth.useMutation({
    onSuccess: async () => {
      await utils.book.invalidate();
    },
  });
  const updateAuthorizedEditors = api.book.updateAuthorizedEditors.useMutation({
    onSuccess: async () => {
      await utils.book.invalidate();
    },
  });
  const [newLanguageId, setNewLanguageId] = useState(languages?.[0]?.id ?? 0);
  const [newLanguageDepth, setNewLanguageDepth] = useState(0);
  const [newLanguageDepthName, setNewLanguageDepthName] = useState("");
  const [newChapterName, setNewChapterName] = useState("");
  const [newChapterNumber, setNewChapterNumber] = useState("");
  const [newAuthorizedEditors, setNewAuthorizedEditors] = useState("");
  if (!book) return <div>Loading...</div>;

  return (
    <div className="container flex flex-col items-center justify-center gap-12 px-4 py-16">
      <h1 className="text-4xl font-extrabold tracking-tight sm:text-[4rem]">
        {book?.name}
      </h1>
      <h2 className="text-1.5xl font-extrabold tracking-tight sm:text-[1.5rem]">
        Chapter Editor
      </h2>
      <div className="flex flex-row gap-2">
        {book.chapters
          .sort((a, b) => {
            return a.number - b.number;
          })
          .map((chapter) => (
            <div
              key={chapter.id}
              className="flex min-w-48 max-w-48 flex-col items-center justify-center rounded-lg border border-solid border-white p-8 text-center"
            >
              <Link href={`/chapters/${chapter.id}`}>
                Chapter {chapter.number} - {chapter.name}
              </Link>
              <button
                onClick={(e) => {
                  e.preventDefault();
                  deleteChapter.mutate(chapter.id);
                }}
                className="py-3"
              >
                <FaTrashCan />
              </button>
            </div>
          ))}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            createChapter.mutate({
              name: newChapterName,
              number: parseInt(newChapterNumber),
              bookId: props.id,
            });
          }}
          className="flex flex-col gap-2"
        >
          <label htmlFor="chapterName">
            Add a new chapter by name and number
          </label>
          <input
            id={"chapterName"}
            type="text"
            value={newChapterName}
            placeholder="chapter name"
            onChange={(e) => {
              e.preventDefault();
              setNewChapterName(e.target.value);
            }}
            className="w-full rounded-full px-4 py-2 text-black"
          ></input>
          <input
            type="number"
            value={newChapterNumber}
            placeholder="1"
            onChange={(e) => {
              setNewChapterNumber(e.target.value);
            }}
            className="w-full rounded-full px-4 py-2 text-black"
          ></input>
          <button
            type={"submit"}
            className="rounded-full bg-white/10 px-10 py-3 font-semibold transition hover:bg-white/20"
          >
            <FaPlus />
          </button>
        </form>
      </div>
      <h2 className="text-1.5xl font-extrabold tracking-tight sm:text-[1.5rem]">
        Analysis Layers
      </h2>
      <div className="flex flex-row flex-wrap gap-2 pb-2">
        {book.languageDepths
          .sort((a, b) => {
            return a.depth - b.depth;
          })
          .map((languageDepth) => {
            const languageBeginYear = Math.abs(
              1950 - languageDepth.language.beginYearBP,
            );
            const languageBeginYearEra =
              1950 - languageDepth.language.beginYearBP < 0 ? "BC" : "AD";
            const languageEndYear = Math.abs(
              1950 - languageDepth.language.endYearBP,
            );
            const languageEndYearEra =
              1950 - languageDepth.language.endYearBP < 0 ? "BC" : "AD";
            return (
              <div
                key={languageDepth.id}
                className="flex min-w-48 max-w-48 flex-col items-center justify-center rounded-lg border border-solid border-white text-center"
              >
                <Link
                  href={`/languages/${languageDepth.languageId}`}
                  className="inline-block p-8"
                >
                  language: {languageDepth.language.name}
                </Link>
                <p>
                  active: {languageBeginYear} {languageBeginYearEra} to{" "}
                  {languageEndYear} {languageEndYearEra}{" "}
                </p>
                <p>Layer Depth: {languageDepth.depth}</p>
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    book?.chapters
                      .flatMap((chapter) => chapter.stanzas)
                      .flatMap((stanza) => stanza.lines)
                      .flatMap((line) => line.words)
                      .flatMap((word) => word.layers)
                      .filter(
                        (wordLayer) =>
                          wordLayer.languageDepthId === languageDepth.id,
                      )
                      .forEach((wordLayer) => {
                        deleteWordLayer.mutate(wordLayer.id);
                      });
                    deleteLanguageDepth.mutate(languageDepth.id);
                  }}
                  className="py-3"
                >
                  <FaTrashCan />
                </button>
              </div>
            );
          })}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            createLanguageDepth.mutate({
              bookId: props.id,
              languageId: newLanguageId,
              depth: newLanguageDepth,
              name: newLanguageDepthName,
            });
          }}
          className="flex flex-col gap-2"
        >
          <label htmlFor="newLanguageDepthName">
            Add a new layer of depth to the book
          </label>
          <select
            className="text-black"
            value={newLanguageId}
            onChange={(e) => {
              e.preventDefault();
              setNewLanguageId(parseInt(e.target.value));
            }}
          >
            {languages?.map((language) => (
              <option key={language.id} value={language.id}>
                {language.name}
              </option>
            ))}
          </select>
          <input
            type="text"
            value={newLanguageDepthName}
            placeholder="layer name"
            onChange={(e) => {
              e.preventDefault();
              setNewLanguageDepthName(e.target.value);
            }}
            className="w-full rounded-full px-4 py-2 text-black"
          ></input>
          <input
            type="number"
            value={newLanguageDepth}
            placeholder="1"
            onChange={(e) => {
              setNewLanguageDepth(parseInt(e.target.value));
            }}
            className="w-full rounded-full px-4 py-2 text-black"
          ></input>
          <button
            type={"submit"}
            className="rounded-full bg-white/10 px-10 py-3 font-semibold transition hover:bg-white/20"
          >
            <FaPlus />
          </button>
        </form>
      </div>
      <div className="flex flex-col flex-wrap gap-2 pb-2">
        <h2 className="text-1.5xl font-extrabold tracking-tight sm:text-[1.5rem]">
          Set Authorized Editors
        </h2>
        <p>Use comma separated email addresses of discord users</p>
        <input
          type="text"
          value={newAuthorizedEditors}
          onChange={(e) => {
            setNewAuthorizedEditors(e.target.value);
          }}
          className="w-full rounded-full px-4 py-2 text-black"
        />
        <button
          type="submit"
          className="flex items-center justify-center rounded-full bg-white/10 px-10 py-3 font-semibold transition hover:bg-white/20"
          onClick={(e) => {
            e.preventDefault();
            updateAuthorizedEditors.mutate({
              id: props.id,
              authorizedEditors: newAuthorizedEditors.split(","),
            });
          }}
        >
          <FaSave />
        </button>
      </div>
    </div>
  );
}
