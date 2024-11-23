import { z } from "zod";

import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import analyzeWord from "../analyzeWord";

export const openaiRouter = createTRPCRouter({
  get: protectedProcedure
    .input(z.object({ wordLayerId: z.number(), prompt: z.string() }))
    .query(async ({ ctx, input }) => {
      if (input.prompt === "") {
        return "";
      }
      const existingAnalysis = await ctx.db.wordLayer.findUnique({
        where: { id: input.wordLayerId },
      });
      if (
        existingAnalysis?.cachedAnalysis &&
        existingAnalysis.cachedAnalysis !== ""
      ) {
        return existingAnalysis.cachedAnalysis;
      }
      const analysis = await analyzeWord(input.prompt);
      console.log(analysis);
      await ctx.db.wordLayer.update({
        where: { id: input.wordLayerId },
        data: { cachedAnalysis: analysis },
      });
      return analysis;
    }),
});
