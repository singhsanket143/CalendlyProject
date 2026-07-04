import { Router } from "express";
import { getPublicEventType,getPublicUserSlots } from "../controllers/event-type.controller.js";

export const publicEventRouter: Router = Router();

publicEventRouter.get('/users/:userId/event-types/:slug', getPublicEventType);
publicEventRouter.get('/users/:userId/slots', getPublicUserSlots);
