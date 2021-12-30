import { MiddlewareFn } from 'type-graphql';
import { Context } from '../Context';
import { verify } from 'jsonwebtoken';

export const isAuth: MiddlewareFn<Context> = ({ context }, next) => {
  const authorization = context.req.headers['authorization'];

  console.log(context.req.headers);

  if (!authorization) {
    throw new Error('No Auth Token');
  }

  try {
    const token = authorization.split(' ')[1];

    const payload = verify(token, process.env.ACCESS_TOKEN_SECRET);
    context.payload = payload as any;
  } catch (error) {
    console.log(error);
    throw new Error('User not authenticated');
  }

  return next();
};
