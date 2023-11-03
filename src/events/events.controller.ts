import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Logger,
  NotFoundException,
  Param,
  ParseIntPipe,
  Patch,
  Post,
} from '@nestjs/common';
import { CreateEventDto } from './create-event.dto';
import { updateEventDto } from './update-event.dto';
import { Event } from './event.entity';
import { Like, MoreThan, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Attendee } from './attendee.entity';
import { EventsService } from './events.service';

@Controller('/events')
export class EventController {
  private readonly logger = new Logger(EventController.name);

  constructor(
    @InjectRepository(Event)
    private readonly repository: Repository<Event>,
    @InjectRepository(Attendee)
    private readonly AttendeeRepository: Repository<Attendee>,
    private readonly eventsService: EventsService,
  ) {}

  @Get()
  async findAll() {
    this.logger.log(`Hit the findAll route`);
    const events = await this.repository.find();
    this.logger.debug(`Found ${events.length} events`);
    return events;
  }

  @Get('/practice')
  async practice() {
    return await this.repository.find({
      select: ['id', 'when'],
      where: [
        {
          id: MoreThan(3),
          when: MoreThan(new Date('2021-02-12T13:00:00')),
        },
        {
          description: Like('%meet%'),
        },
      ],
      take: 2,
      order: {
        id: 'DESC',
      },
    });
  }

  @Get('/practice2')
  async practice2() {
    // return await this.repository.findOne({
    //   where: { id: 1 },
    //   relations: ['attendees'],
    // });
    // const event = await this.repository.findOne({
    //   where: { id: 1 },
    //   relations: ['attendees'],
    // });
    // // const event = new Event();
    // // event.id = 1;
    // const attendee = new Attendee();
    // attendee.name = 'Using cascade';
    // // attendee.event = event;
    // // event.attendees = [];
    // event.attendees.push(attendee);
    // // await this.AttendeeRepository.save(attendee);
    // await this.repository.save(event);
    // return event;

    return await this.repository
      .createQueryBuilder('e')
      .select(['e.id', 'e.name'])
      .orderBy('e.id', 'ASC')
      .take(3)
      .getMany();
  }

  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number) {
    // console.log(typeof id);
    const event = await this.eventsService.getEvent(id);

    if (!event) {
      throw new NotFoundException();
    }

    return event;
  }

  // You can also use the @UsePipes decorator to enable pipes.
  // It can be done per method, or for every method when you
  // add it at the controller level.
  @Post()
  async create(@Body() input: CreateEventDto) {
    await this.repository.save({
      ...input,
      when: new Date(input.when),
    });
  }

  // Create new ValidationPipe to specify validation group inside @Body
  // new ValidationPipe({ groups: ['update'] })
  @Patch(':id')
  async update(@Param('id') id, @Body() input: updateEventDto) {
    const event = await this.repository.findOneBy({ id });
    return await this.repository.save({
      ...event,
      ...input,
      when: input.when ? new Date(input.when) : event.when,
    });
  }
  @Delete(':id')
  @HttpCode(204)
  async remove(@Param('id') id) {
    const event = await this.repository.findOneBy({ id });

    if (!event) {
      throw new NotFoundException();
    }

    await this.repository.remove(event);
  }
}
