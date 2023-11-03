import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Event } from './event.entity';
import { EventController } from './events.controller';
import { Attendee } from './attendee.entity';
import { EventsService } from './events.service';

@Module({
  imports: [TypeOrmModule.forFeature([Event, Attendee])],
  controllers: [EventController],
  providers: [EventsService],
})
export class EventsModule {}
