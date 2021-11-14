import { Request, Response } from "express";
import { body } from "express-validator";
import User from "../data/User";
import bcrypt from "bcrypt"
import jwt from "jsonwebtoken"
import { DuplicateUserError, InvalidLoginCredentialsError, UnauthorizedError } from "../utils/errors";
import { requireAuthentication, TokenUser, UserRequest } from "../utils/authUtils";
import Router from "express-promise-router";
import { handleErrors } from "../utils/handleErrorsMiddleware";

const userRouter = Router();

userRouter.get("/",
    requireAuthentication,
    async (req: UserRequest, res) => {
        if (!req.user) throw UnauthorizedError;
        res.json(await User.findById(req.user._id))
    })

userRouter.post("/register",
    body("email").isEmail(),
    body("password").isLength({ min: 8, max: 64 }),
    handleErrors,
    async (req: Request, res: Response) => {
        if (await User.exists({ email: req.body.email })) throw DuplicateUserError;

        const saltRounds = 10
        const passwordHash = await bcrypt.hash(req.body.password, saltRounds);
        const newUser = await User.create({
            email: req.body.email,
            passwordHash
        })

        res.json(newUser);
    })

userRouter.post("/login",
    body("email").exists(),
    body("password").exists(),
    handleErrors,
    async (req: Request, res: Response) => {
        const user = await User.findOne({ email: req.body.email }).select("+passwordHash");
        const passwordCorrect = user && await bcrypt.compare(req.body.password, user.passwordHash)
        if (!passwordCorrect) throw InvalidLoginCredentialsError;

        const userForToken: TokenUser = {
            email: user.email,
            _id: user._id
        }

        const token = jwt.sign(
            userForToken,
            String(process.env.SECRET),
            { expiresIn: 4 * 60 * 60 });

        res.json({ token, ...userForToken })
    })

export default userRouter;