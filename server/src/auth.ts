import { sign } from 'jsonwebtoken';
import { User } from './entity/User';

export const genrateAccessToken = (user: User) => {
  return sign({ userId: user.id }, process.env.ACCESS_TOKEN_SECRET, {
    expiresIn: '1d',
  });
};

export const generateRefreshToken = (user: User) => {
  return sign(
    { userId: user.id, tokenVersion: user.tokenVersion },
    process.env.REFRESH_TOKEN_SECRET,
    {
      expiresIn: '10d',
    },
  );
};
