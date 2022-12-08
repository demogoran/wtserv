import {
  Body,
  Controller,
  Get,
  Headers,
  Param,
  Post,
  Request,
  Response,
  StreamableFile,
} from '@nestjs/common';
import { Readable } from 'stream';
import { getMimeType } from 'stream-mime-type';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get('/files')
  getFilesList(magnetURI: string): Promise<any> {
    return this.appService.getFilesList(magnetURI);
  }

  @Get('/file/:id')
  async downloadFile(
    @Param('id') id,
    @Headers('range') rangeStr,
    @Request() req,
  ): Promise<StreamableFile> {
    const { res } = req;
    const file = this.appService.downloadFile(id);
    const range = rangeStr?.replace('bytes=', '').split('-');
    console.log('range', range);

    let streamRange = {};
    let length = file.length;
    if (range) {
      const start = parseInt(range[0], 10);
      const end = parseInt(range[1], 10) || file.length - 1;
      streamRange = { start, end };
      res.set({
        'Accept-Ranges': 'bytes',
        'Content-Range': `bytes ${start}-${end ? end : length - 1}/${
          file.length
        }`,
      });
      res.statusCode = 206;
      length = (end ? end : file.length) - start;
    } else {
      res.set({
        'Accept-Ranges': 'bytes',
      });
    }

    console.log(streamRange);
    const { stream, mime } = await getMimeType(
      file.createReadStream(streamRange),
    );

    const strFile = new StreamableFile(stream as unknown as Readable, {
      length,
      type: mime,
    });

    return strFile;
  }
}
