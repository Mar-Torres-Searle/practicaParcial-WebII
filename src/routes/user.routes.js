import { Router } from 'express';
import authMiddleware from '../middlewares/auth.middleware.js';
import checkRol from '../middlewares/role.middleware.js';
import {validate} from '../middlewares/validate.middleware.js';
import { registerUser, validateUser, loginUser, refreshTokenUser, logoutUser, registerDataUser, companyDataUser, uploadLogo, getUser, inviteUser, deleteUser, changePassword } from '../controllers/user.controller.js';
import { registerSchema, validationSchema, loginSchema, refreshSchema, registerDataSchema, companyDataSchema, inviteSchema, passwordSchema } from '../validators/user.validator.js';
import { upload } from '../middlewares/upload.middleware.js';


const userRouter = Router();


userRouter.post('/register', validate(registerSchema), registerUser);
userRouter.put('/validation', authMiddleware, validate(validationSchema), validateUser);
userRouter.post('/login', validate(loginSchema), loginUser);
userRouter.post('/refresh', validate(refreshSchema), refreshTokenUser);
userRouter.post('/logout', authMiddleware, logoutUser);
userRouter.put('/register', authMiddleware, validate(registerDataSchema), registerDataUser);
userRouter.patch('/company', authMiddleware, validate(companyDataSchema), companyDataUser);
userRouter.patch('/logo', authMiddleware, upload.single('logo'), uploadLogo);
userRouter.get('/', authMiddleware, getUser);
userRouter.post('/invite', authMiddleware, checkRol(['admin']), validate(inviteSchema), inviteUser);
userRouter.delete('/', authMiddleware, deleteUser);
userRouter.put('/password', authMiddleware, validate(passwordSchema), changePassword);

export default userRouter;