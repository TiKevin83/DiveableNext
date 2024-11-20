"use client";

import Link from "next/link";
import { useState } from "react";

import { api } from "~/trpc/react";

const UserBooks = () => {
  const utils = api.useUtils();
  const [name, setName] = useState("");
  const createBook = api.book.create.useMutation({
    onSuccess: async () => {
      await utils.book.invalidate();
      setName("");
    },
  });

  const books = api.book.list.useQuery();

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-[#2e026d] to-[#15162c] text-white">
      <div className="container flex flex-col items-center justify-center gap-12 px-4 py-16">
        <h2 className="text-2xl font-bold">Your Diveable Books</h2>
        <ul>
          {books.data?.map((book) => (
            <li key={book.id}>
              <div>
                <Link href={`/books/${encodeURIComponent(book.id)}`}>
                  {book.name}
                </Link>
              </div>
            </li>
          ))}
        </ul>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            createBook.mutate({ name });
          }}
          className="flex flex-col gap-2"
        >
          <h3>Start a New Book</h3>
          <input
            type="text"
            placeholder="Title"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full rounded-full px-4 py-2 text-black"
          />
          <button
            type="submit"
            className="rounded-full bg-white/10 px-10 py-3 font-semibold transition hover:bg-white/20"
            disabled={createBook.isPending}
          >
            {createBook.isPending ? "Submitting..." : "Submit"}
          </button>
        </form>
      </div>
    </main>
  );
};

export default UserBooks;
