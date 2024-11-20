import { z } from "zod";

import {
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
} from "~/server/api/trpc";

export const lineRouter = createTRPCRouter({
  createWord: protectedProcedure
    .input(
      z.object({
        lineId: z.number(),
        number: z.number().min(0),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      return ctx.db.word.create({
        data: {
          number: input.number,
          line: { connect: { id: input.lineId } },
        },
      });
    }),

  createWordLayer: protectedProcedure
    .input(
      z.object({
        wordId: z.number(),
        text: z.string(),
        languageDepthId: z.number(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      return ctx.db.wordLayer.create({
        data: {
          text: input.text,
          word: { connect: { id: input.wordId } },
          languageDepth: { connect: { id: input.languageDepthId } },
        },
      });
    }),

  create: protectedProcedure
    .input(
      z.object({
        number: z.number().min(1),
        stanzaId: z.number(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      return ctx.db.line.create({
        data: {
          number: input.number,
          stanza: { connect: { id: input.stanzaId } },
        },
      });
    }),

  delete: protectedProcedure
    .input(z.number())
    .mutation(async ({ ctx, input }) => {
      return ctx.db.line.delete({
        where: { id: input },
      });
    }),

  get: publicProcedure.input(z.number()).query(async ({ ctx, input }) => {
    return ctx.db.line.findUnique({
      where: { id: input },
      include: {
        words: {
          include: {
            layers: {
              include: { languageDepth: { include: { language: true } } },
            },
          },
        },
        stanza: { include: { chapter: { include: { book: true } } } },
      },
    });
  }),
});
