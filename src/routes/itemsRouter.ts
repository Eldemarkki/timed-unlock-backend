import { Response } from "express";
import { body, query } from "express-validator";
import { createNewItem, getAllItems, getUnlockedItems } from "../logic/projects";
import { handleErrors } from "../utils/handleErrorsMiddleware";
import { ProjectRequest } from "./singleProjectRouter";
import Router from "express-promise-router";
import { optionalAuthentication, requireAuthentication } from "../utils/authUtils";
import { UnauthorizedError } from "../utils/errors";

const itemsRouter = Router({ mergeParams: true });
itemsRouter.use(handleErrors)

itemsRouter.get("/",
    optionalAuthentication, // Auth is not mandatory here, because this path should be public. Auth should only be required if includeLocked==true
    query("includeLocked").optional().isBoolean().toBoolean(),
    handleErrors,
    async (req: ProjectRequest, res: Response) => {
        const projectId = req.project!.id;
        if (req.query.includeLocked) {
            if (!req.user) throw UnauthorizedError
            res.json(await getAllItems(req.project!, req.user.id))
        }
        else {
            res.json(await getUnlockedItems(projectId));
        }
    })

itemsRouter.post("/",
    requireAuthentication,
    body("data").exists(),
    body("unlockDate").isISO8601().toDate(),
    handleErrors,
    async (req: ProjectRequest, res: Response) => {
        res.json(await createNewItem(req.body.data, req.body.unlockDate, req.user!.id, req.project!));
    })

export default itemsRouter;