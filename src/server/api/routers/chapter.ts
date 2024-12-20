import { z } from "zod";

import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";

export const chapterRouter = createTRPCRouter({
  create: protectedProcedure
    .input(
      z.object({
        name: z.string().min(1),
        number: z.number().min(1),
        bookId: z.number(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      return ctx.db.chapter.create({
        data: {
          name: input.name,
          number: input.number,
          book: { connect: { id: input.bookId } },
        },
      });
    }),

  delete: protectedProcedure
    .input(z.number())
    .mutation(async ({ ctx, input }) => {
      return ctx.db.chapter.delete({
        where: { id: input },
      });
    }),

  get: protectedProcedure.input(z.number()).query(async ({ ctx, input }) => {
    return ctx.db.chapter.findUnique({
      where: { id: input },
      include: {
        stanzas: {
          include: {
            lines: { include: { words: { include: { layers: true } } } },
          },
        },
        book: { include: { languageDepths: true } },
      },
    });
  }),
});
