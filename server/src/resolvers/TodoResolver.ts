import {
  Arg,
  Field,
  InputType,
  Int,
  Mutation,
  Query,
  Resolver,
  UseMiddleware,
} from 'type-graphql';
import { IsString } from 'class-validator';
import { Todo } from '../entity/Todo';
import { isAuth } from '../middleware/isAuth';

@InputType()
class TodoUpdateInput {
  @Field(() => String, { nullable: true })
  @IsString()
  title?: string;

  @Field(() => String, { nullable: true })
  @IsString()
  description?: string;
}

@Resolver()
export class TodoResolver {
  @Mutation(() => Todo)
  @UseMiddleware(isAuth)
  async createTodo(
    @Arg('title') title: string,
    @Arg('description') description: string,
  ) {
    const newTodo = await Todo.create({ title, description }).save();
    return newTodo;
  }

  @Mutation(() => Boolean)
  @UseMiddleware(isAuth)
  async updateTodo(
    @Arg('id', () => Int) id: number,
    @Arg('title') title: string,
    @Arg('description') description: string,
  ) {
    await Todo.update({ id }, { title, description });
    return true;
  }

  @Mutation(() => Boolean)
  @UseMiddleware(isAuth)
  async deleteTodo(@Arg('id', () => Int) id: number) {
    await Todo.delete({ id });
    return true;
  }

  @Query(() => [Todo])
  @UseMiddleware(isAuth)
  async todos() {
    return await Todo.find();
  }
}
