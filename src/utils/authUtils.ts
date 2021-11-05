import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import User from "../data/User";
import { LogInAgainError, UnauthorizedError } from "./errors";

export interface TokenUser {
    email: string;
    id: string;
}

export interface UserRequest extends Request {
    user?: TokenUser
}

export const optionalAuthentication = (req: UserRequest, res: Response, next: NextFunction) => {
    const authToken = req.header("Authorization")
    if (authToken) {
        const token = authToken.startsWith("Bearer ") ? authToken.substring(7) : authToken;
        const decodedUser = <TokenUser>jwt.verify(token, String(process.env.SECRET))
        req.user = decodedUser
    }
    next();
}

export const requireAuthentication = async (req: UserRequest, res: Response, next: NextFunction) => {
    const authToken = req.header("Authorization")
    if (authToken) {
        const token = authToken.startsWith("Bearer ") ? authToken.substring(7) : authToken;
        const decodedUser = <TokenUser>jwt.verify(token, String(process.env.SECRET))

        if (await User.exists({ _id: decodedUser.id })) {
            req.user = decodedUser
        }
        else {
            // This happens if the user is deleted while its token is still active
            throw LogInAgainError;
        }
    }
    else {
        throw UnauthorizedError;
    }
    next();
}