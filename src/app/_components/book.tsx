"use client";

import { useState } from "react";

import { api } from "~/trpc/react";

export function LatestBook() {
  const [latestBook] = api.book.getLatest.useSuspenseQuery();

  const utils = api.useUtils();
  const [name, setName] = useState("");
  const createBook = api.book.create.useMutation({
    onSuccess: async () => {
      await utils.book.invalidate();
      setName("");
    },
  });

  return (
    <div className="w-full max-w-xs">
      {latestBook ? (
        <p className="truncate">Your most recent book: {latestBook.name}</p>
      ) : (
        <p>You have no books yet.</p>
      )}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          createBook.mutate({ name });
        }}
        className="flex flex-col gap-2"
      >
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
  );
}
