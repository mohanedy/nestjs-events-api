import { InjectRepository } from '@nestjs/typeorm';
import { Event, PaginatedEvents } from './event.entity';
import { DeleteResult, Repository, SelectQueryBuilder } from 'typeorm';
import { Injectable, Logger } from '@nestjs/common';
import { AttendeeAnswerEnum } from './attendee.entity';
import { ListEvents, WhenEventFilter } from './input/list.events';
import {
  paginate,
  PaginateOptions,
  PaginationResult,
} from '../pagination/paginator';
import { CreateEventDto } from './input/create-event.dto';
import { User } from '../auth/user.entity';
import { UpdateEventDto } from './input/update-event.dto';

@Injectable()
export class EventsService {
  private readonly logger = new Logger('EventsService');

  constructor(
    @InjectRepository(Event)
    private readonly eventsRepo: Repository<Event>,
  ) {}

  private getEventsBaseQuery(): SelectQueryBuilder<Event> {
    return this.eventsRepo.createQueryBuilder('e').orderBy('e.id', 'DESC');
  }

  public getEventsAttendeeCountQuery(): SelectQueryBuilder<Event> {
    return this.getEventsBaseQuery()
      .loadRelationCountAndMap('e.attendeeCount', 'e.attendees')
      .loadRelationCountAndMap(
        'e.attendeeAccepted',
        'e.attendees',
        'attendee',
        (qb) =>
          qb.where('attendee.answer = :answer', {
            answer: AttendeeAnswerEnum.Accepted,
          }),
      )
      .loadRelationCountAndMap(
        'e.attendeeMaybe',
        'e.attendees',
        'attendee',
        (qb) =>
          qb.where('attendee.answer = :answer', {
            answer: AttendeeAnswerEnum.Maybe,
          }),
      )
      .loadRelationCountAndMap(
        'e.attendeeRejected',
        'e.attendees',
        'attendee',
        (qb) =>
          qb.where('attendee.answer = :answer', {
            answer: AttendeeAnswerEnum.Rejected,
          }),
      );
  }

  private getEventsWithAttendeeCountFilteredQuery(
    filter?: ListEvents,
  ): SelectQueryBuilder<Event> {
    const query = this.getEventsAttendeeCountQuery();
    if (!filter) return query;

    const whenFilter = {
      [WhenEventFilter.All]: '',
      [WhenEventFilter.Today]:
        'e.when >= CURRENT_DATE AND e.when <= CURRENT_DATE + 1',
      [WhenEventFilter.Tomorrow]:
        'e.when >= CURRENT_DATE + 1 AND e.when <= CURRENT_DATE + 2',
      [WhenEventFilter.ThisWeek]:
        'e.when >= CURRENT_DATE AND e.when <= CURRENT_DATE + 7',
      [WhenEventFilter.NextWeek]:
        'e.when >= CURRENT_DATE + 7 AND e.when <= CURRENT_DATE + 14',
    };

    if (filter.when) {
      query.andWhere(whenFilter[filter.when]);
    }

    this.logger.debug(query.getSql());

    return query;
  }

  public async getEventsWithAttendeeCountFilteredAndPaginated(
    filter?: ListEvents,
    paginationOptions?: PaginateOptions,
  ): Promise<PaginatedEvents> {
    const qb = this.getEventsWithAttendeeCountFilteredQuery(filter);
    return await paginate(qb, paginationOptions);
  }

  public async getEventWithAttendeeCount(
    id: number,
  ): Promise<Event | undefined> {
    const query = this.getEventsAttendeeCountQuery().andWhere('e.id = :id', {
      id,
    });

    this.logger.debug(query.getSql());

    return await query.getOne();
  }

  public async findOne(id: number): Promise<Event | undefined> {
    return await this.eventsRepo.findOneBy({
      id,
    });
  }

  public async createEvent(
    eventDto: CreateEventDto,
    currentUser: User,
  ): Promise<Event> {
    return await this.eventsRepo.save({
      ...eventDto,
      when: new Date(eventDto.when),
      organizerId: currentUser.id,
    });
  }

  public async updateEvent(eventDto: UpdateEventDto): Promise<Event> {
    return await this.eventsRepo.save({
      ...eventDto,
      when: eventDto.when ? new Date(eventDto.when) : eventDto.when,
    });
  }

  public async deleteEvent(id: number): Promise<DeleteResult> {
    return await this.eventsRepo
      .createQueryBuilder('e')
      .delete()
      .where('id = :id', { id })
      .execute();
  }

  public async getEventsByOrganizerIdPaginated(
    userId: number,
    paginateOptions: PaginateOptions,
  ): Promise<PaginatedEvents> {
    return await paginate<Event>(
      this.getEventsOrganizedByUserIdQuery(userId),
      paginateOptions,
    );
  }

  private getEventsOrganizedByUserIdQuery(
    userId: number,
  ): SelectQueryBuilder<Event> {
    return this.getEventsBaseQuery().where('e.organizerId = :userId', {
      userId,
    });
  }

  public async getEventsAttendedByUserIdPaginated(
    userId: number,
    paginateOptions: PaginateOptions,
  ): Promise<PaginatedEvents> {
    return await paginate<Event>(
      this.getEventsAttendedByUserIdPaginatedQuery(userId),
      paginateOptions,
    );
  }

  private getEventsAttendedByUserIdPaginatedQuery(
    userId: number,
  ): SelectQueryBuilder<Event> {
    return this.getEventsBaseQuery()
      .leftJoinAndSelect('e.attendees', 'a')
      .where('a.userId = :userId', { userId });
  }
}
