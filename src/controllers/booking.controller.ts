import { Request, Response } from "express";
import { ListHostBookingsQuery } from "../dtos/booking.dto.js";
import {
    cancelBooking,
    createBookingOptimistically,
    createBookingPessimistically,
    listHostBookings as listHostBookingsService,
} from "../services/booking.service.js";
import { sendSuccess } from "../utils/api-response.js";

export async function create(req: Request, res: Response) {
    const result = await createBookingPessimistically(req.userId, req.body);
    sendSuccess(res, result, 201, "Booking created successfully");
}

export async function list(req: Request, res: Response) {
    const result = await listHostBookingsService(req.userId, req.query as ListHostBookingsQuery);
    sendSuccess(res, result);
}

export async function cancel(req: Request, res: Response) {
    
    const {bookingId} = req.params
    
    await cancelBooking(req.userId,Number(bookingId))

    sendSuccess(res,"Booking cancelled successfully");
}