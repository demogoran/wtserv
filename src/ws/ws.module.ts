import { Module } from '@nestjs/common';
import { AppService } from 'src/app/app.service';
import { WsGateway } from './ws.gateway';

@Module({
  providers: [WsGateway, AppService],
})
export class WsModule {}
