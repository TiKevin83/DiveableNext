import { get } from "http";
import { z } from "zod";

import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";

export const stanzaRouter = createTRPCRouter({
  create: protectedProcedure
    .input(
      z.object({
        number: z.number().min(1),
        chapterId: z.number(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      return ctx.db.stanza.create({
        data: {
          number: input.number,
          chapter: { connect: { id: input.chapterId } },
        },
      });
    }),

  delete: protectedProcedure
    .input(z.number())
    .mutation(async ({ ctx, input }) => {
      return ctx.db.stanza.delete({
        where: { id: input },
      });
    }),

  get: protectedProcedure.input(z.number()).query(async ({ ctx, input }) => {
    return ctx.db.stanza.findUnique({
      where: { id: input },
      include: { lines: true, chapter: { include: { book: true } } },
    });
  }),
});
