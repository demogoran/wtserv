import { Module } from '@nestjs/common';
import { WsModule } from 'src/ws/ws.module';
import { AppController } from './app.controller';
import { AppService } from './app.service';

@Module({
  imports: [WsModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
