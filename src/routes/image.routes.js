import { Router } from 'express';
import { returnPdf } from '../controllers/image.controller.js';

const imageRouter = Router();

imageRouter.get('/pdf', returnPdf);

export default imageRouter;