import { Request, Response } from "express";
import {
    createBookingOptimistically as createBookingOptimisticallyService,
    createBookingPessimistically as createBookingPessimisticallyService,
} from "../services/booking.service.js";
import { sendSuccess } from "../utils/api-response.js";

export async function createOptimistic(req: Request, res: Response) {
    const booking = await createBookingOptimisticallyService(req.userId, req.body);
    sendSuccess(res, booking, 201, "Booking created successfully");
}

export async function createPessimistic(req: Request, res: Response) {
    const booking = await createBookingPessimisticallyService(req.userId, req.body);
    sendSuccess(res, booking, 201, "Booking created successfully");
}
