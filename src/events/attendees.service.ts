import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { Attendee } from './attendee.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateAttendeeDto } from './input/create-attendee.dto';

@Injectable()
export class AttendeesService {
  constructor(
    @InjectRepository(Attendee)
    private readonly attendeesRepository: Repository<Attendee>,
  ) {}

  public async findByEventId(eventId: number): Promise<Attendee[]> {
    return await this.attendeesRepository.findBy({
      eventId,
    });
  }

  public async findOneByEventIdAndUserId(
    eventId: number,
    userId: number,
  ): Promise<Attendee | undefined> {
    return await this.attendeesRepository.findOneBy([
      {
        eventId,
        userId,
      },
    ]);
  }

  public async createOrUpdate(
    input: CreateAttendeeDto,
    eventId: number,
    userId: number,
  ): Promise<Attendee> {
    const attendee = await this.findOneByEventIdAndUserId(eventId, userId);
    if (attendee) {
      return await this.attendeesRepository.save({
        ...attendee,
        ...input,
      });
    }
    return await this.attendeesRepository.save({
      ...input,
      eventId,
      userId,
    });
  }
}
