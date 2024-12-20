import { z } from "zod";

import {
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
} from "~/server/api/trpc";

export const bookRouter = createTRPCRouter({
  create: protectedProcedure
    .input(z.object({ name: z.string().min(1) }))
    .mutation(async ({ ctx, input }) => {
      return ctx.db.book.create({
        data: {
          name: input.name,
          createdBy: { connect: { id: ctx.session.user.id } },
        },
      });
    }),

  updateAuthorizedEditors: protectedProcedure
    .input(
      z.object({
        id: z.number(),
        authorizedEditors: z.array(z.string()),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      return await ctx.db.book.update({
        where: { id: input.id },
        data: { authorizedEditors: input.authorizedEditors },
      });
    }),

  createLanguageDepth: protectedProcedure
    .input(
      z.object({
        bookId: z.number(),
        languageId: z.number(),
        depth: z.number(),
        name: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      return ctx.db.languageDepth.create({
        data: {
          book: { connect: { id: input.bookId } },
          language: { connect: { id: input.languageId } },
          depth: input.depth,
          name: input.name,
        },
      });
    }),

  updateLanguageDepth: protectedProcedure
    .input(
      z.object({
        id: z.number(),
        depth: z.number(),
        name: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      return ctx.db.languageDepth.update({
        where: { id: input.id },
        data: { depth: input.depth, name: input.name },
      });
    }),

  deleteLanguageDepth: protectedProcedure
    .input(z.number())
    .mutation(async ({ ctx, input }) => {
      return ctx.db.languageDepth.delete({
        where: { id: input },
      });
    }),

  getLatest: protectedProcedure.query(async ({ ctx }) => {
    const book = await ctx.db.book.findFirst({
      orderBy: { createdAt: "desc" },
      where: { createdBy: { id: ctx.session.user.id } },
    });

    return book ?? null;
  }),

  list: protectedProcedure.query(async ({ ctx }) => {
    const books = await ctx.db.book.findMany({
      orderBy: { createdAt: "desc" },
      where: { createdBy: { id: ctx.session.user.id } },
    });
    return books ?? [];
  }),

  get: publicProcedure.input(z.number()).query(async ({ ctx, input }) => {
    const book = await ctx.db.book.findFirst({
      where: { id: input },
      include: {
        chapters: {
          include: {
            stanzas: {
              include: {
                lines: { include: { words: { include: { layers: true } } } },
              },
            },
          },
        },
        languageDepths: {
          include: { language: true },
        },
      },
    });

    return book ?? null;
  }),
});
