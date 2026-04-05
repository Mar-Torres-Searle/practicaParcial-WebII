import { Router } from 'express';

const userRouter = Router();

userRouter.get('/test', (req, res) => {
  res.json({
    ok: true,
    message: 'User routes working'
  });
});

export default userRouter;