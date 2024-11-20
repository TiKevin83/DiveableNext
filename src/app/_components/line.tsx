"use client";

import { api } from "~/trpc/react";

export function SingleLine(props: { lineId: number }) {
  const line = api.line.get.useQuery(props.lineId).data;

  if (!line) return <div>Loading...</div>;

  return (
    <div>
      <p>{line.stanza.chapter.book.name}</p>
      <h1 className="text-5xl font-extrabold tracking-tight sm:text-[5rem]">
        Chapter: {line.stanza.chapter.name} - Stanza: {line.stanza.number} -
        Line: {line.number}
      </h1>
      <div className="flex flex-row gap-4">
        {line.words.map((word) => {
          return (
            <div
              key={word.id}
              className="flex min-w-48 max-w-48 flex-col items-center justify-center rounded-lg border border-solid border-white text-center"
            >
              {word.layers.map((layer) => {
                return (
                  <div
                    key={layer.id}
                    className="flex min-w-48 max-w-48 flex-col items-center justify-center rounded-lg border border-solid border-white text-center"
                  >
                    {layer.text}
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
