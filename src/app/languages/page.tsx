"use client";

import Link from "next/link";
import { useState } from "react";

import { api } from "~/trpc/react";

const Languages = () => {
  const utils = api.useUtils();
  const [name, setName] = useState("");
  const [beginYear, setBeginYear] = useState(0);
  const [beginYearEra, setBeginYearEra] = useState("BC");
  const [endYear, setEndYear] = useState(0);
  const [endYearEra, setEndYearEra] = useState("BC");
  const createLanguage = api.language.create.useMutation({
    onSuccess: async () => {
      await utils.language.invalidate();
      setName("");
      setBeginYear(0);
      setEndYear(0);
    },
  });

  const languages = api.language.list.useQuery();

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-[#2e026d] to-[#15162c] text-white">
      <div className="container flex flex-col items-center justify-center gap-12 px-4 py-16">
        <h2 className="text-2xl font-bold">Diveable Languages</h2>
        <ul>
          {languages.data?.map((language) => {
            const languageBeginYear = Math.abs(1950 + language.beginYearBP);
            const languageBeginYearEra =
              1950 + language.beginYearBP < 0 ? "BC" : "AD";
            const languageEndYear = Math.abs(1950 + language.endYearBP);
            const languageEndYearEra =
              1950 + language.endYearBP < 0 ? "BC" : "AD";

            return (
              <li key={language.id}>
                <div>
                  <Link href={`/languages/${encodeURIComponent(language.id)}`}>
                    {language.name}:{" "}
                  </Link>
                  Active from {languageBeginYear} {languageBeginYearEra} to{" "}
                  {languageEndYear} {languageEndYearEra}
                </div>
              </li>
            );
          })}
        </ul>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            const beginYearBP =
              beginYearEra === "AD" ? 1950 - beginYear : -1950 - beginYear;
            const endYearBP =
              endYearEra === "AD" ? 1950 - endYear : -1950 - endYear;
            createLanguage.mutate({ name, beginYearBP, endYearBP });
          }}
          className="flex flex-col gap-2"
        >
          <h3>Enter a new language</h3>
          <input
            type="text"
            placeholder="Title"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full rounded-full px-4 py-2 text-black"
          />
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
            onChange={(e) => setBeginYearEra(e.target.value)}
            className="w-full rounded-full px-4 py-2 text-black"
          >
            <option>BC</option>
            <option>AD</option>
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
            onChange={(e) => setEndYearEra(e.target.value)}
            className="w-full rounded-full px-4 py-2 text-black"
          >
            <option>BC</option>
            <option>AD</option>
          </select>
          <button
            type="submit"
            className="rounded-full bg-white/10 px-10 py-3 font-semibold transition hover:bg-white/20"
            disabled={createLanguage.isPending}
          >
            {createLanguage.isPending ? "Submitting..." : "Submit"}
          </button>
        </form>
      </div>
    </main>
  );
};

export default Languages;
