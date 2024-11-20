"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
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
  const languageBeginYear = Math.abs(1950 + beginYearBP);
  const languageBeginYearEra = 1950 + beginYearBP < 0 ? "BC" : "AD";
  const languageEndYear = Math.abs(1950 + endYearBP);
  const languageEndYearEra = 1950 + endYearBP < 0 ? "BC" : "AD";

  const deleteLanguage = api.language.delete.useMutation({
    onSuccess: async () => {
      await utils.language.invalidate();
      router.back();
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
        Active from {languageBeginYear} {languageBeginYearEra} to{" "}
        {languageEndYear} {languageEndYearEra}
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
