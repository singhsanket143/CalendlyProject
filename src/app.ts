// Configures the setting for the express app object

import express, { Express } from 'express';
import { availabilityRouter } from './routers/availability.router.js';
import { bookingRouter } from './routers/booking.router.js';
import { eventTypeRouter } from './routers/event-type.router.js';
import { publicEventRouter } from './routers/public-event.router.js';
import { userRouter } from './routers/user.router.js';
import { errorHandler } from './middlewares/error-handler.js';
import { routeNotFound } from './middlewares/route-not-found.js';
import { googleIntegrationRouter } from './routers/google.router.js';

const app: Express = express();

app.use(express.json()); // this will help express to deserialize the request body (JSON) into a JavaScript object
app.use(express.text());
app.use(express.urlencoded());

// Custom routes
app.get('/health', (_req, res) => {
    console.log("Executed health route");
    res.json({
        status: 'ok!',
        timestamp: new Date().toISOString()
    })

});


// Express router based routes
app.use('/api/users', userRouter); // if the route starts with /users, userRouter will handle it
app.use('/api/availability', availabilityRouter);
app.use('/api/bookings', bookingRouter);
app.use('/api/event-types', eventTypeRouter);
app.use('/api/public', publicEventRouter);
app.use('/api/integrations/google', googleIntegrationRouter);

app.use(routeNotFound);
// at the last we mention our error handling middleware
app.use(errorHandler);
export { app };