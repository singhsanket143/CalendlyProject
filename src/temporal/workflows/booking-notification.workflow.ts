import { proxyActivities } from "@temporalio/workflow";

import type * as activities from "../activites/index.js";



// Create the proxy activites

const { sendBookingConfirmationEmailActivity, sendCancelBookingNotificationActivity } = proxyActivities<typeof activities>({
    retry: { maximumAttempts: 3},
    startToCloseTimeout: '10 minutes',
})

export async function sendBookingConfirmationEmailWorkflow(bookingId: number) {
    await sendBookingConfirmationEmailActivity(bookingId);
}

export async function sendCancelledBookingNotificationWorkflow(bookingId: number) {
  await sendCancelBookingNotificationActivity(bookingId);
}
