import { Request, Response } from "express";
import {
    createEventType as createEventTypeService,
    getEventTypeById as getEventTypeByIdService,
    getEventTypePublic as getEventTypePublicService,
    listEventTypes as listEventTypesService,
    removeEventType as removeEventTypeService,
    updateEventType as updateEventTypeService,
    getUserSlots,
} from "../services/event-types.service.js";
import { sendSuccess } from "../utils/api-response.js";

export async function list(req: Request, res: Response) {
    const eventTypes = await listEventTypesService(req.userId);
    sendSuccess(res, eventTypes);
}

export async function getById(req: Request, res: Response) {
    const { id } = req.params;
    const eventType = await getEventTypeByIdService(Number(id), req.userId);
    sendSuccess(res, eventType);
}

export async function create(req: Request, res: Response) {
    const eventType = await createEventTypeService(req.userId, req.body);
    sendSuccess(res, eventType, 201, 'Event type created successfully');
}

export async function update(req: Request, res: Response) {
    const { id } = req.params;
    const eventType = await updateEventTypeService(req.userId, Number(id), req.body);
    sendSuccess(res, eventType, 200, 'Event type updated successfully');
}

export async function remove(req: Request, res: Response) {
    const { id } = req.params;
    await removeEventTypeService(req.userId, Number(id));
    sendSuccess(res, null, 200, 'Event type deleted successfully');
}

export async function getPublicEventType(req: Request, res: Response) {
    const { userId, slug } = req.params;
    const eventType = await getEventTypePublicService(Number(userId), String(slug));
    sendSuccess(res, eventType);
}

export async function getPublicUserSlots(req: Request, res: Response) {
    const { userId } = req.params;
    const { eventTypeId, from, to } = req.query;
    const slots = await getUserSlots(Number(userId), Number(eventTypeId), String(from), String(to));
    sendSuccess(res, slots);
}
