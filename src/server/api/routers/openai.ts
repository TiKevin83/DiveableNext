import { z } from "zod";

import { env } from "~/env";
import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import openaiAnalysisEngine from "../openaiAnalysisEngine";

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

      if (ctx.session.user.email !== env.ADMIN_EMAIL) {
        return "You are not authorized to use this feature.";
      }
      const analysis = await openaiAnalysisEngine(input.prompt);
      await ctx.db.wordLayer.update({
        where: { id: input.wordLayerId },
        data: { cachedAnalysis: analysis },
      });
      return analysis;
    }),
});
