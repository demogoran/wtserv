import { Controller, Get, Param, StreamableFile } from '@nestjs/common';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get('/files')
  getFilesList(): Promise<any> {
    return this.appService.getFilesList();
  }

  @Get('/file/:torrId/:fileId')
  downloadFile(
    @Param('torrId') torrId,
    @Param('fileId') fileId,
  ): StreamableFile {
    const stream = this.appService.downloadFile(torrId, fileId);
    return new StreamableFile(stream);
  }
}
