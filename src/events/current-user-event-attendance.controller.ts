import {
  Body,
  ClassSerializerInterceptor,
  Controller,
  Get,
  Inject,
  NotFoundException,
  Param,
  ParseIntPipe,
  Post,
  Query,
  SerializeOptions,
  UseGuards,
  UseInterceptors,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { EventsService } from './events.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser } from '../auth/current-user.decorator';
import { User } from '../auth/user.entity';
import { ListEvents } from './input/list.events';
import { AttendeesService } from './attendees.service';
import { CreateAttendeeDto } from './input/create-attendee.dto';

@Controller('events-attendance')
@SerializeOptions({ strategy: 'excludeAll' })
export class CurrentUserEventAttendanceController {
  constructor(
    @Inject(EventsService)
    private readonly eventsService: EventsService,
    @Inject(AttendeesService)
    private readonly attendeesService: AttendeesService,
  ) {}

  /**
   * Get all events attended by the current user (from JWT) paginated and filtered.
   *
   * @param user - Current user (from JWT)
   * @param filter - Pagination filter
   * @returns Paginated list of events
   * @memberof CurrentUserEventAttendanceController
   **/
  @Get()
  @UsePipes(new ValidationPipe({ transform: true }))
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(ClassSerializerInterceptor)
  async findAll(@CurrentUser() user: User, @Query() filter: ListEvents) {
    return await this.eventsService.getEventsAttendedByUserIdPaginated(
      user.id,
      {
        total: true,
        limit: filter.limit,
        currentPage: filter.page,
      },
    );
  }

  @Get(':eventId')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(ClassSerializerInterceptor)
  async findOne(
    @CurrentUser() user: User,
    @Param('eventId', ParseIntPipe) eventId: number,
  ) {
    const attendee = await this.attendeesService.findOneByEventIdAndUserId(
      eventId,
      user.id,
    );
    if (!attendee)
      throw new NotFoundException(
        null,
        'This user is not attending this event',
      );
    return attendee;
  }

  @Post(':eventId')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(ClassSerializerInterceptor)
  async createOrUpdate(
    @CurrentUser() user: User,
    @Param('eventId', ParseIntPipe) eventId: number,
    @Body() input: CreateAttendeeDto,
  ) {
    return await this.attendeesService.createOrUpdate(input, eventId, user.id);
  }
}
