import { Router } from 'express';
import authMiddleware from '../middlewares/auth.middleware.js';
import checkRol from '../middlewares/role.middleware.js';
import {validate} from '../middlewares/validate.middleware.js';
import { registerUser, validateUser, loginUser } from '../controllers/user.controller.js';
import { registerSchema, validationSchema, loginSchema } from '../validators/user.validator.js';


const userRouter = Router();


userRouter.post('/register', validate(registerSchema), registerUser);
userRouter.put('/validation', authMiddleware, validate(validationSchema), validateUser);
userRouter.post('/login', validate(loginSchema), loginUser);

export default userRouter;