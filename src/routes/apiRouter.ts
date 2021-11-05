import { NextFunction, Request, Response } from "express";
import { TokenExpiredError } from "jsonwebtoken";
import { HttpException } from "../utils/HttpException";
import projectsRouter from "./projectsRouter";
import userRouter from "./userRouter";
import Router from "express-promise-router";

const apiRouter = Router();

const errorHandler = (err: Error, req: Request, res: Response, next: NextFunction) => {
    if (err instanceof HttpException) {
        if (err.message) {
            res.status(err.status).json({ error: err.message })
        }
        else {
            res.status(err.status).end();
        }
    }
    else if (err instanceof TokenExpiredError) {
        res.status(401).json({ error: "Your login token has expired. Log in again." })
    }
    else {
        res.status(500).json({ error: err.message })
    }
}

apiRouter.use("/user", userRouter)
apiRouter.use("/projects", projectsRouter)

apiRouter.use(errorHandler)

export default apiRouter;