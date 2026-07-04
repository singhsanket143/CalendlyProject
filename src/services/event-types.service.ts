import slug from "slug";
import { CreateEventTypeDto, UpdateEventTypeDto } from "../dtos/event-type.dto.js";
import { create, findActiveByHostIdAndEventSlug, findByHostId, getById, remove, slugExistsForHost, update } from "../repositories/event-type.repository.js";
import { conflict, forbidden, notFound } from "../utils/api-error.js";
import { getById as getUserById } from "../repositories/user.repository.js";
import { findActiveRulesByUser, findExceptionsByUser } from "../repositories/availability.repository.js";
import { findBookedSlotsByHostInRange } from "../repositories/slot.repository.js";
import moment from "moment";


export async function listEventTypes(hostId: number) {
    const eventTypes = await findByHostId(hostId);
    return eventTypes;
}

export async function createEventType(hostId: number, data: CreateEventTypeDto) {
    const slugPassed = data.slug ?? slug(data.title, { lower: true });

    if(!slugPassed) {
        throw conflict('Could not generate a slug for the event type');
    }

    const isSlugTaken = await slugExistsForHost(hostId, slugPassed);
    if(isSlugTaken) {
        throw conflict('A event type with this slug already exists, please use a different slug');
    }

    return create(hostId, {...data, slug: slugPassed});
}

export async function updateEventType(hostId: number, id: number, data: UpdateEventTypeDto) {
    const eventType = await getById(id);
    if(!eventType) {
        throw notFound('Event type not found');
    }
    if(eventType.hostId !== hostId) {
        throw forbidden('You are not authorized to update this event type');
    }

    if(data.slug && data.slug !== eventType.slug) {
        const isSlugTaken = await slugExistsForHost(hostId, data.slug);
        if(isSlugTaken) {
            throw conflict('A event type with this slug already exists, please use a different slug');
        }
    }

    return update(id, data);
}

export async function removeEventType(hostId: number, id: number) {
    const eventType = await getById(id);
    if(!eventType) {
        throw notFound('Event type not found');
    }
    if(eventType.hostId !== hostId) {
        throw forbidden('You are not authorized to delete this event type');
    }
    return remove(id);
}

export async function getEventTypeById(id: number, hostId: number) {
    const eventType = await getById(id);
    if(!eventType) {
        throw notFound('Event type not found');
    }
    if(eventType.hostId !== hostId) {
        throw forbidden('You are not authorized to view this event type');
    }
    return eventType;
}

export async function getEventTypePublic(hostId: number, eventSlug: string) {
    const eventType = await findActiveByHostIdAndEventSlug(hostId, eventSlug);

    if(!eventType) {
        throw notFound('Event type not found');
    }

    const host = await getUserById(hostId);
    if(!host) {
        throw notFound('Host not found');
    }
    
    return {
        eventType: {
            id: eventType.id,
            title: eventType.title,
            description: eventType.description,
            durationMinutes: eventType.durationMinutes,
            locationType: eventType.locationType,
        },
        host: {
            name: host.name,
            email: host.email,
        }
    }
}

export async function getUserSlots(userId: number, eventTypeId: number, from: string, to: string) {
    const eventType = await getById(eventTypeId);
    if(!eventType) {
        throw notFound('Event type not found');
    }
    if(eventType.hostId !== userId) {
        throw forbidden('You are not authorized to view slots for this event type');
    }

    const duration = eventType.durationMinutes;

    const rangeStart = moment(from).startOf('day');
    const rangeEnd = moment(to).startOf('day');
    const totalDays = rangeEnd.diff(rangeStart, 'days');

    const rules = await findActiveRulesByUser(userId);
    const exceptions = await findExceptionsByUser(userId);
    const bookedSlots = await findBookedSlotsByHostInRange(
        userId,
        rangeStart.toDate(),
        rangeEnd.clone().endOf('day').toDate()
    );

    const ans = [];

    for(let i = 0; i <= totalDays; i++) {
        const thatDate = rangeStart.clone().add(i, 'days');
        const dateKey = thatDate.format('YYYY-MM-DD');

        const exception = exceptions.find((e) => moment(e.date).format('YYYY-MM-DD') === dateKey);

        if(exception?.type === 'BLOCK_FULL_DAY') {
            continue;
        }

        const dayRules = rules.filter((r) => r.weekday === thatDate.day());

        for(const rule of dayRules) {
            const dayStart = moment(`${dateKey} ${rule.startTime}`, 'YYYY-MM-DD HH:mm');
            const dayEnd = moment(`${dateKey} ${rule.endTime}`, 'YYYY-MM-DD HH:mm');

            const current = dayStart.clone();

            while(current.clone().add(duration, 'minutes').isSameOrBefore(dayEnd)) {
                const slotStart = current.clone();
                const slotEnd = slotStart.clone().add(duration, 'minutes');

                const blockedByException = exception?.type === 'BLOCK_PARTIAL'
                    && slotStart.isBefore(moment(`${dateKey} ${exception.endTime}`, 'YYYY-MM-DD HH:mm'))
                    && slotEnd.isAfter(moment(`${dateKey} ${exception.startTime}`, 'YYYY-MM-DD HH:mm'));

                const blockedByBooking = bookedSlots.some((b) =>
                    slotStart.isBefore(moment(b.endAt)) && slotEnd.isAfter(moment(b.startAt))
                );

                if(!blockedByException && !blockedByBooking) {
                    ans.push({
                        start: slotStart.format('YYYY-MM-DD HH:mm'),
                        end: slotEnd.format('YYYY-MM-DD HH:mm'),
                    });
                }

                current.add(duration, 'minutes');
            }
        }
    }

    return ans;
}