import {
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
  WsResponse,
} from '@nestjs/websockets';
import { from, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { AppService } from 'src/app/app.service';
import { Server } from 'ws';

@WebSocketGateway(8080)
export class WsGateway {
  @WebSocketServer() server: Server;

  constructor(private readonly appService: AppService) {}

  @SubscribeMessage('events')
  onEvent(client: any, data: any): Observable<WsResponse<number>> {
    console.log('EVENT', client, data);
    return from([1, 2, 3]).pipe(
      map((item) => ({ event: 'FileList', data: item })),
    );
  }

  @SubscribeMessage('getFileList')
  async getFileList(client: any, data: any): Promise<any> {
    console.log('EVENT', client, data);
    return this.appService.getFilesList();
  }
}
