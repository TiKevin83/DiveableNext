import { z } from "zod";

import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";

export const languageRouter = createTRPCRouter({
  create: protectedProcedure
    .input(
      z.object({
        name: z.string().min(1),
        beginYearBP: z.number(),
        endYearBP: z.number(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      return ctx.db.language.create({
        data: { ...input },
      });
    }),

  update: protectedProcedure
    .input(
      z.object({
        id: z.number(),
        name: z.string().min(1),
        beginYearBP: z.number(),
        endYearBP: z.number(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      return ctx.db.language.update({
        data: { ...input },
        where: { id: input.id },
      });
    }),

  delete: protectedProcedure
    .input(z.number())
    .mutation(async ({ ctx, input }) => {
      return ctx.db.language.delete({
        where: { id: input },
      });
    }),

  get: protectedProcedure.input(z.number()).query(async ({ ctx, input }) => {
    return ctx.db.language.findUnique({
      where: { id: input },
      include: { languageDepths: { include: { book: true } } },
    });
  }),

  list: protectedProcedure.query(async ({ ctx }) => {
    return ctx.db.language.findMany();
  }),
});
