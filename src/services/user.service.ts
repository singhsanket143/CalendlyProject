import { create, getAll, getById, deleteUserWithId, updateUserWithId } from "../repositories/user.repository.js";

export async function findAllUsers() {
    const users = await getAll();
    return users;
}

export async function findById(id: number) {
    const user = await getById(id);
    if(!user) {
        throw new Error('User not found');
    }

    return user;
}

export async function createUser(userData: {name: string, email: string}) {
    const user = await create(userData);
    return user;
}

export async function deleteUser(id: number) {
    const user = await deleteUserWithId(id);
    return user;
}

export async function updateUser(id: number, userData: {name: string, email: string}) {
    const user = await updateUserWithId(id, userData);
    return user;
}