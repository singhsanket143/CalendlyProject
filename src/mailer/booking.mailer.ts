import { sendEmail } from "../config/nodemailer.js";
import { findBookingById } from "../repositories/booking.repository.js";

export async function sendBookingConfirmationEmail(bookingId: number) {
    const booking = await findBookingById(bookingId);
    if(!booking || booking.status !== 'CONFIRMED') return;

    const when = booking.slot.startAt.toUTCString();

    await sendEmail(booking.inviteeEmail,`Booking Confirmation : ${bookingId}`, `
        <p>Hello ${booking.inviteeName},</p>
        <p>Your booking for ${booking.eventType.title} on ${when} has been confirmed.</p>
        <p>Thank you for booking with us.</p>
    `);
}

export async function sendCancelBookingConfirmationEmail(bookingId: number) {
    
    const booking = await findBookingById(bookingId);

    if(!booking || booking.status!=="CANCELLED") return;

    await sendEmail(booking.inviteeEmail,`Cancel Booking Confirmation : ${bookingId}`, `
        <p>Hello ${booking.inviteeName},</p>
        <p>Your booking for ${booking.eventType.title} on ${booking.slot.startAt.toUTCString()} has been cancelled.</p>
        <p>Thank you for booking with us.</p>
    `);
}