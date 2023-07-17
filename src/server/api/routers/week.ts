import { z } from "zod";

import { createTRPCRouter, protectedProcedure } from "../trpc";

export const weekRouter = createTRPCRouter({
  getAll: protectedProcedure.query(({ ctx }) => {
    return ctx.prisma.week.findMany({
      where: {
        userId: ctx.session.user.id,
      },
    });
  }),

  create: protectedProcedure
    .input(z.object({ weekNumber: z.number() }))
    .mutation(({ ctx, input }) => {
      return ctx.prisma.week.create({
        data: {
          weekNumber: input.weekNumber,
          userId: ctx.session.user.id,
        },
      });
    }),
});
