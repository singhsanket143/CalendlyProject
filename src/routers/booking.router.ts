import { Router } from "express";
import { createOptimistic, createPessimistic } from "../controllers/booking.controller.js";
import { createBookingSchema } from "../dtos/booking.dto.js";
import { requireUserId } from "../middlewares/require-user-id.js";
import { validate } from "../middlewares/validate.js";

export const bookingRouter: Router = Router();

bookingRouter.use(requireUserId);

bookingRouter.post("/optimistic", validate(createBookingSchema), createOptimistic);
bookingRouter.post("/pessimistic", validate(createBookingSchema), createPessimistic);
