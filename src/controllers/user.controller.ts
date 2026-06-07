import { Request, Response } from "express";
import { createUser as createUserService, deleteUser as deleteUserService, findAllUsers as findAllUsersService, findById as findByIdService, updateUser as updateUserService } from "../services/user.service.js";

export async function findAllUsers(_req: Request, res: Response) {
    const response = await findAllUsersService();
    res.json(response);
}

export async function findById(req: Request, res: Response) {
    const { id } = req.params;
    const response = await findByIdService(Number(id));
    res.json(response);
}

export async function createUser(req: Request, res: Response) {
    const user = await createUserService(req.body);
    res.json(user);
}

export async function deleteUser(req: Request, res: Response) {
    const { id } = req.params;
    const user = await deleteUserService(Number(id));
    res.json({
        msg: "Successfully deleted user",
        user
    });
}

export async function updateUser(req: Request, res: Response) {
    const { id } = req.params;
    const user = await updateUserService(Number(id), req.body);
    res.json(user);
}