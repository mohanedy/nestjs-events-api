import {
  ClassSerializerInterceptor,
  Controller,
  Get,
  Inject,
  Param,
  ParseIntPipe,
  Query,
  UseInterceptors,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { EventsService } from './events.service';
import { ListEvents } from './input/list.events';

@Controller('users/:userId/events')
export class EventsOrganizedByUserController {
  constructor(
    @Inject(EventsService)
    private readonly eventsService: EventsService,
  ) {}

  @Get()
  @UsePipes(new ValidationPipe({ transform: true }))
  @UseInterceptors(ClassSerializerInterceptor)
  async findAll(
    @Param('userId', ParseIntPipe) userId: number,
    @Query() filter: ListEvents,
  ) {
    return await this.eventsService.getEventsByOrganizerIdPaginated(userId, {
      total: true,
      limit: filter.limit,
      currentPage: filter.page,
    });
  }
}
