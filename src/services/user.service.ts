import slug from "slug";
import { CreateUserDto, UpdateUserDto } from "../dtos/user.dto.js";
import { create, findByEmail, getAll, getById, remove, slugExistsForUser, update } from "../repositories/user.repository.js";
import { conflict, notFound } from "../utils/api-error.js";

export async function findAllUsers() {
    const users = await getAll();
    return users;
}

export async function findById(id: number) {
    console.log("Inside service");
    const user = await getById(id);
    if(!user) {
        throw notFound('User not found');
    }

    return user;
}

export async function createUser(data: CreateUserDto) {
    // Check if the user already exists or not 
    const existingUser = await findByEmail(data.email);
    if(existingUser) {
        throw conflict('User already exists');
    }

    const slugPassed = data.slug ?? slug(data.name, { lower: true, trim: true, replacement: '-' });
    if(!slugPassed) {
        throw conflict('Could not generate a slug for the user');
    }

    const isSlugTaken = await slugExistsForUser(slugPassed);
    if(isSlugTaken) {
        throw conflict('A user with this slug already exists, please use a different slug');
    }

    return create({...data, slug: slugPassed});
}

export async function updateUser(id: number, data: UpdateUserDto) {
    const user = await getById(id);
    if (!user) {
        throw notFound('User not found');
    }

    if (data.email && data.email !== user.email) {
        const existingUser = await findByEmail(data.email);
        if (existingUser) {
            throw conflict('User already exists');
        }
    }

    if(data.slug && data.slug !== user.slug) {
        const isSlugTaken = await slugExistsForUser(data.slug);
        if(isSlugTaken) {
            throw conflict('A user with this slug already exists, please use a different slug');
        }
    }

    return update(id, data);
}

export async function deleteUser(id: number) {
    const user = await getById(id);
    if (!user) {
        throw notFound('User not found');
    }

    return remove(id);
}