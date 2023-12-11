import {
  Body,
  ClassSerializerInterceptor,
  Controller,
  Delete,
  ForbiddenException,
  Get,
  HttpCode,
  Inject,
  NotFoundException,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  SerializeOptions,
  UseGuards,
  UseInterceptors,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { CreateEventDto } from './input/create-event.dto';

import { EventsService } from './events.service';
import { ListEvents } from './input/list.events';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser } from '../auth/current-user.decorator';
import { User } from '../auth/user.entity';

@Controller('/events')
@SerializeOptions({ strategy: 'excludeAll' })
export class EventsController {
  constructor(
    @Inject(EventsService)
    private readonly eventsService: EventsService,
  ) {}

  @Get()
  @UsePipes(new ValidationPipe({ transform: true }))
  @UseInterceptors(ClassSerializerInterceptor)
  async findAll(@Query() filter: ListEvents) {
    return await this.eventsService.getEventsWithAttendeeCountFilteredAndPaginated(
      filter,
      {
        total: true,
        limit: filter.limit,
        currentPage: filter.page,
      },
    );
  }

  @Get(':id')
  @UseInterceptors(ClassSerializerInterceptor)
  async findOne(@Param('id', ParseIntPipe) id: number) {
    const event = await this.eventsService.getEvent(id);
    if (!event) throw new NotFoundException();
    return event;
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  async create(@CurrentUser() user: User, @Body() input: CreateEventDto) {
    return this.eventsService.createEvent(input, user);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() input: Partial<CreateEventDto>,
    @CurrentUser() user: User,
  ) {
    const event = await this.checkEventOwnership(id, user);

    if (!event) throw new NotFoundException();

    if (event.organizerId !== user.id)
      throw new ForbiddenException(
        null,
        'You are not allowed to modify this event',
      );

    return await this.eventsService.updateEvent(input);
  }

  @Delete(':id')
  @HttpCode(204)
  @UseGuards(JwtAuthGuard)
  async remove(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: User,
  ) {
    await this.checkEventOwnership(id, user);

    await this.eventsService.deleteEvent(id);
  }

  private async checkEventOwnership(id: number, user: User) {
    const event = await this.eventsService.getEvent(id);
    if (!event) throw new NotFoundException();
    if (event.organizerId !== user.id)
      throw new ForbiddenException(
        null,
        'You are not allowed to modify this event',
      );
    return event;
  }
}
