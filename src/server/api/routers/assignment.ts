import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "../trpc";

export const assignmentRouter = createTRPCRouter({
  getAll: protectedProcedure
    .input(z.object({ weekId: z.string() }))
    .query(({ ctx, input }) => {
      return ctx.prisma.assignment.findMany({
        where: {
          weekId: input.weekId,
        },
      });
    }),

  createWithFile: protectedProcedure
    .input(
      z.object({
        title: z.string(),
        content: z.string(),
        weekId: z.string(),
        file: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      return await ctx.prisma.assignment.create({
        data: {
          title: input.title,
          content: input.content,
          weekId: input.weekId,
          fileURL: input.file,
        },
      });
    }),

  deleteAll: protectedProcedure.mutation(({ ctx }) => {
    return ctx.prisma.assignment.deleteMany({});
  }),
});
