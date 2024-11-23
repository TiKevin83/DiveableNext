import { Language } from "~/app/_components/language";
import { api } from "~/trpc/server";

export default async function SingleLanguage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = await params;
  const language = await api.language.get(parseInt(resolvedParams.id));

  if (!language) {
    return <div>Language not found</div>;
  }

  const allLanguageDepths = language.languageDepths.flatMap(
    (languageDepth) => languageDepth.book,
  );

  const uniqueBooks = allLanguageDepths.filter(
    (book, index, self) => index === self.findIndex((t) => t.id === book.id),
  );

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-[#2e026d] to-[#15162c] text-white">
      <div className="container flex flex-col items-center justify-center gap-12 px-4 py-16">
        <Language
          id={language.id}
          name={language.name}
          beginYearBP={language.beginYearBP}
          endYearBP={language.endYearBP}
          books={uniqueBooks}
        ></Language>
      </div>
    </main>
  );
}
