"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { FaTrashCan } from "react-icons/fa6";
import { api } from "~/trpc/react";

interface LanguageParams {
  name: string;
  id: number;
  beginYearBP: number;
  endYearBP: number;
  books: {
    id: number;
    name: string;
  }[];
}

export function Language(props: LanguageParams) {
  const utils = api.useUtils();
  const router = useRouter();
  const { name, id, beginYearBP, endYearBP, books } = props;
  const [beginYear, setBeginYear] = useState(Math.abs(1950 - beginYearBP));
  const [beginYearEra, setBeginYearEra] = useState(
    1950 - beginYearBP < 0 ? "BC" : "AD",
  );
  const [endYear, setEndYear] = useState(Math.abs(1950 - endYearBP));
  const [endYearEra, setEndYearEra] = useState(
    1950 - endYearBP < 0 ? "BC" : "AD",
  );

  const deleteLanguage = api.language.delete.useMutation({
    onSuccess: async () => {
      await utils.language.invalidate();
      router.back();
    },
  });

  const updateLanguage = api.language.update.useMutation({
    onSuccess: async () => {
      await utils.language.invalidate();
    },
  });

  return (
    <div>
      <div>
        <Link
          href={`/languages/${encodeURIComponent(id)}`}
          className="text-5xl font-extrabold tracking-tight sm:text-[5rem]"
        >
          {name}:{" "}
        </Link>
        Active from{" "}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            const newBeginYearBP =
              beginYearEra === "AD" ? 1950 - beginYear : 1950 + beginYear;
            const newEndYearBP =
              endYearEra === "AD" ? 1950 - endYear : 1950 + endYear;
            updateLanguage.mutate({
              id,
              name,
              beginYearBP: newBeginYearBP,
              endYearBP: newEndYearBP,
            });
          }}
          className="flex flex-col gap-2"
        >
          <label htmlFor="beginYear">Approximate Starting Year</label>
          <input
            id={"beginYear"}
            type="number"
            placeholder="0"
            value={beginYear}
            onChange={(e) => {
              const value = parseInt(e.target.value);
              if (value > 0) {
                setBeginYear(value);
              }
            }}
            className="w-full rounded-full px-4 py-2 text-black"
          />
          <select
            value={beginYearEra}
            onChange={(e) => setBeginYearEra(e.target.value)}
            className="w-full rounded-full px-4 py-2 text-black"
          >
            <option value="BC">BC</option>
            <option value="AD">AD</option>
          </select>
          <label htmlFor="endYear">Approximate Ending Year</label>
          <input
            id={"endYear"}
            type="number"
            placeholder="0"
            value={endYear}
            onChange={(e) => {
              const value = parseInt(e.target.value);
              if (value > 0) {
                setEndYear(value);
              }
            }}
            className="w-full rounded-full px-4 py-2 text-black"
          />
          <select
            value={endYearEra}
            onChange={(e) => setEndYearEra(e.target.value)}
            className="w-full rounded-full px-4 py-2 text-black"
          >
            <option value="BC">BC</option>
            <option value="AD">AD</option>
          </select>
          <button
            type="submit"
            className="rounded-full bg-white/10 px-10 py-3 font-semibold transition hover:bg-white/20"
            disabled={updateLanguage.isPending}
          >
            {updateLanguage.isPending ? "Submitting..." : "Submit"}
          </button>
        </form>
        <button
          className="rounded-full bg-white/10 px-10 py-3 font-semibold transition hover:bg-white/20"
          disabled={deleteLanguage.isPending}
          onClick={(e) => {
            e.preventDefault();
            deleteLanguage.mutate(id);
          }}
        >
          {deleteLanguage.isPending ? "Deleting..." : <FaTrashCan />}
        </button>
      </div>
      <div>
        <h2>Books that can dive into this language</h2>
        <ul>
          {books.map((book) => {
            return (
              <li key={book.id}>
                <Link
                  href={`/books/${encodeURIComponent(book.id)}`}
                  className="text-5xl font-extrabold tracking-tight sm:text-[5rem]"
                >
                  {book.name}
                </Link>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}
