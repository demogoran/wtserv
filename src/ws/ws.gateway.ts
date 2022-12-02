import {
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
  WsResponse,
} from '@nestjs/websockets';
import { from, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { AppService } from 'src/app/app.service';
import { FileListItem } from 'src/utils/types';
import { getMimeType } from 'stream-mime-type';
import { Server } from 'ws';

@WebSocketGateway(8080)
export class WsGateway {
  @WebSocketServer() server: Server;

  constructor(private readonly appService: AppService) {}

  @SubscribeMessage('getFileList')
  async getFileList(): Promise<WsResponse<FileListItem[]>> {
    return {
      event: 'FileList',
      data: await this.appService.getFilesList(),
    };
  }

  @SubscribeMessage('getFileData')
  async getFileInit(
    client: any,
    data: any,
  ): Promise<Observable<WsResponse<unknown>>> {
    const file = await this.appService.downloadFile(data.id);

    const { stream, mime } = await getMimeType(file.createReadStream());

    return new Observable((observer) => {
      stream.on('data', (chunk) => {
        observer.next({
          event: 'FileData',
          data: {
            uid: data.id,
            fileName: file.name,
            length: file.length,
            mime,
            chunk,
          },
        });
      });

      stream.on('end', () => {
        console.log(
          'Finished',
          observer.next({
            event: 'FileData',
            data: {
              uid: data.id,
              status: 'done',
            },
          }),
        );
      });
    });
  }
}
