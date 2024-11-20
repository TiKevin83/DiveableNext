"use client";

import Link from "next/link";

import { api } from "~/trpc/react";

export function LatestBook() {
  const [latestBook] = api.book.getLatest.useSuspenseQuery();

  return (
    <div className="w-full max-w-xs">
      {latestBook ? (
        <p className="truncate text-center">
          Your most recent book:{" "}
          <Link href={`/books/${latestBook.id}`}>{latestBook.name}</Link>
        </p>
      ) : (
        <p>You have no books yet.</p>
      )}
    </div>
  );
}
