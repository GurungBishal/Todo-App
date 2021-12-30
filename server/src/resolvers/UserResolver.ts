import {
  Arg,
  Ctx,
  Field,
  Int,
  Mutation,
  ObjectType,
  Query,
  Resolver,
  UseMiddleware,
} from 'type-graphql';
import { hash, compare } from 'bcryptjs';
import { User } from '../entity/User';
import { Context } from '../Context';
import { generateRefreshToken, genrateAccessToken } from '../auth';
import { isAuth } from '../middleware/isAuth';
import { sendRefreshToken } from '../sendRefreshToken';
import { getConnection } from 'typeorm';
import { verify } from 'jsonwebtoken';

@ObjectType()
class LoginResponse {
  @Field()
  accessToken: string;

  @Field(() => User)
  user: User;
}

@Resolver()
export class UserResolver {
  @Query(() => [User])
  users() {
    return User.find();
  }

  @Mutation(() => Boolean)
  async logout(@Ctx() { res }: Context) {
    res.clearCookie;
    return true;
  }

  @Mutation(() => Boolean)
  async revokeRefreshTokensforUser(@Arg('userId', () => Int) userId: number) {
    const f = await getConnection()
      .getRepository(User)
      .increment({ id: userId }, 'tokenVersion', 1);
    return true;
  }

  @Query(() => User, { nullable: true })
  me(@Ctx() context: Context) {
    const authorization = context.req.headers['authorization'];

    if (!authorization) {
      return null;
    }

    try {
      const token = authorization.split(' ')[1];

      const payload: any = verify(token, process.env.ACCESS_TOKEN_SECRET);
      context.payload = payload as any;
      return User.findOne(payload.userId);
    } catch (error) {
      console.log(error);
      return null;
    }
  }

  @Mutation(() => LoginResponse)
  async login(
    @Arg('email') email: string,
    @Arg('password') password: string,
    @Ctx() { res }: Context,
  ): Promise<LoginResponse> {
    const user = await User.findOne({ where: { email } });

    if (!user) throw new Error('User doesnot exist');

    const isValid = await compare(password, user.password);

    if (!isValid) throw new Error('Password doesnot match');

    sendRefreshToken(res, generateRefreshToken(user));

    return {
      accessToken: genrateAccessToken(user),
      user,
    };
  }

  @Mutation(() => Boolean)
  async register(
    @Arg('email') email: string,
    @Arg('password') password: string,
  ) {
    const hashedPassword = await hash(password, 12);

    try {
      await User.create({
        email,
        password: hashedPassword,
      }).save();
    } catch (error) {
      console.log(error);
      return false;
    }
    return true;
  }
}
