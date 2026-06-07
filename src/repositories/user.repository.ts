import { prisma } from "../config/database.js";

export async function getAll() {
    const users = await prisma.user.findMany();
    return users;
}

export async function getById(id: number) {
    const user = await prisma.user.findUnique({
        where: {
            id
        }
    });
    return user;
}

export async function create(userData: {name: string, email: string}) {
    const user = await prisma.user.create({
       data: {
        name: userData.name,
        email: userData.email
       }
    });
    return user;
}