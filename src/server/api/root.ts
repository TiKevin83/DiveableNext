import { bookRouter } from "~/server/api/routers/book";
import { createCallerFactory, createTRPCRouter } from "~/server/api/trpc";
import { chapterRouter } from "./routers/chapter";
import { stanzaRouter } from "./routers/stanza";
import { lineRouter } from "./routers/line";
import { languageRouter } from "./routers/language";

/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here.
 */
export const appRouter = createTRPCRouter({
  book: bookRouter,
  chapter: chapterRouter,
  stanza: stanzaRouter,
  line: lineRouter,
  language: languageRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;

/**
 * Create a server-side caller for the tRPC API.
 * @example
 * const trpc = createCaller(createContext);
 * const res = await trpc.post.all();
 *       ^? Post[]
 */
export const createCaller = createCallerFactory(appRouter);
