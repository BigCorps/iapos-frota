import { systemRouter } from "./_core/systemRouter";
import { router } from "./_core/trpc";
import { authRouter } from "./routers/auth";
import { profileRouter } from "./routers/profile";
import { gasStationRouter } from "./routers/gasStation";
import { fleetRouter } from "./routers/fleet";
import { familyRouter } from "./routers/family";

export const appRouter = router({
  // if you need to use socket.io, read and register route in server/_core/index.ts, all api should start with '/api/' so that the gateway can route correctly
  system: systemRouter,
  auth: authRouter,
  profile: profileRouter,
  gasStation: gasStationRouter,
  fleet: fleetRouter,
  family: familyRouter,

  // TODO: add feature routers here, e.g.
  // todo: router({
  //   list: protectedProcedure.query(({ ctx }) =>
  //     db.getUserTodos(ctx.user.id)
  //   ),
  // }),
});

export type AppRouter = typeof appRouter;
