import { sendBookingConfirmationEmail, sendCancelBookingConfirmationEmail } from "../../mailer/booking.mailer.js";
import { updateBookingCalendarDetails } from "../../repositories/booking.repository.js";
import {
    createGoogleCalendarEvent,
    isProjectCalendarConfigured,
} from "../../services/google-calender.service.js";
import { RegenerateHostSlotsInput, regenerateHostSlots as runSlotGeneration } from "../../services/slot.service.js";


export async function regenerateHostSlotsActivity(input: RegenerateHostSlotsInput) {
    await runSlotGeneration(input); // here actually the service function is called
}

export async function sendBookingConfirmationEmailActivity(bookingId: number) {
    await sendBookingConfirmationEmail(bookingId);
}

export async function sendCancelBookingNotificationActivity(bookingId: number) {
    await sendCancelBookingConfirmationEmail(bookingId);
}


export async function createGoogleCalendarEventActivity(bookingId: number) {
    if (!isProjectCalendarConfigured()) {
        console.warn("[temporal] Google Calendar not configured, skipping event creation");
        return;
    }

    const result = await createGoogleCalendarEvent(bookingId);

    await updateBookingCalendarDetails(bookingId, {
        meetLink: result.meetLink,
        calendarEventId: result.calendarEventId,
    });
}