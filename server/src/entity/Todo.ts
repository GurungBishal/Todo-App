import { Field, Int, ObjectType } from 'type-graphql';
import { Entity, PrimaryGeneratedColumn, Column, BaseEntity } from 'typeorm';

@ObjectType()
@Entity('todos')
export class Todo extends BaseEntity {
  @Field(() => Int)
  @PrimaryGeneratedColumn()
  id: number;

  @Field()
  @Column()
  title: string;

  @Field()
  @Column()
  description: string;
}
