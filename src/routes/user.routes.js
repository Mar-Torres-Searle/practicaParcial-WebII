import { Router } from 'express';
import authMiddleware from '../middlewares/auth.middleware.js';
import checkRol from '../middlewares/role.middleware.js';
import {validate} from '../middlewares/validate.middleware.js';
import { registerUser } from '../controllers/user.controller.js';
import { registerSchema } from '../validators/user.validator.js';


const userRouter = Router();


userRouter.post('/register', validate(registerSchema), registerUser);

export default userRouter;