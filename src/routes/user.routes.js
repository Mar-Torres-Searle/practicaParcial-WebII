import { Router } from 'express';
import authMiddleware from '../middlewares/auth.middleware.js';
import checkRol from '../middlewares/role.middleware.js';
import {validate} from '../middlewares/validate.middleware.js';
import { registerUser, validateUser, loginUser, refreshTokenUser, logoutUser, registerDataUser } from '../controllers/user.controller.js';
import { registerSchema, validationSchema, loginSchema, refreshSchema, registerDataSchema } from '../validators/user.validator.js';


const userRouter = Router();


userRouter.post('/register', validate(registerSchema), registerUser);
userRouter.put('/validation', authMiddleware, validate(validationSchema), validateUser);
userRouter.post('/login', validate(loginSchema), loginUser);
userRouter.post('/refresh', validate(refreshSchema), refreshTokenUser);
userRouter.post('/logout', authMiddleware, logoutUser);
userRouter.put('/register', authMiddleware, validate(registerDataSchema), registerDataUser);


export default userRouter;