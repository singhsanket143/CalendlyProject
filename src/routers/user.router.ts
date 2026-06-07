import { Router } from "express";
import { createUser, deleteUser, findAllUsers, findById, updateUser } from "../controllers/user.controller.js";

export const userRouter: Router = Router(); // we will see the router after /users

userRouter.get('/', findAllUsers); // if there is nothing after /api/users and it is a GET request, findAllUsers will be called
userRouter.get('/:id', findById);
userRouter.post('/', createUser);
userRouter.delete('/:id', deleteUser);
userRouter.put('/:id', updateUser);