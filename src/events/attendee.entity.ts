import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Event } from './event.entity';
import { Expose } from 'class-transformer';
import { User } from '../auth/user.entity';

export enum AttendeeAnswerEnum {
  Accepted = 1,
  Maybe,
  Rejected,
}

@Entity()
export class Attendee {
  @PrimaryGeneratedColumn()
  @Expose()
  id: number;

  @ManyToOne(() => User, (user) => user.attendedEvents, {
    nullable: false,
  })
  @JoinColumn({ name: 'userId' })
  @Expose()
  user: User;

  @Column()
  userId: number;

  @ManyToOne(() => Event, (event) => event.attendees, {
    nullable: false,
  })
  @JoinColumn({ name: 'eventId' })
  @Expose()
  event: Event;

  @Column()
  eventId: number;

  @Column('enum', {
    enum: AttendeeAnswerEnum,
    default: AttendeeAnswerEnum.Maybe,
  })
  @Expose()
  answer: AttendeeAnswerEnum;
}
