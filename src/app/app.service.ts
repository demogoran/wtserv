import { Injectable } from '@nestjs/common';
import * as WebTorrent from 'webtorrent';
import * as fs from 'fs';
import { v4 } from 'uuid';
import { FileListItem, UIDMapItem } from 'src/utils/types';

const client = new WebTorrent({
  torrentPort: 5511,
});

const torrentsList = {};
const uidMap = {};

const retTransform = (result): FileListItem[] => result;

@Injectable()
export class AppService {
  getFilesList(magnetURI: string): Promise<FileListItem[]> {
    const fileList = Object.entries(uidMap)
      .filter(
        (entry: [string, UIDMapItem]) => entry[1]?.magnetURI === magnetURI,
      )
      .reduce((acc, item: [string, UIDMapItem]) => {
        const [key, obj] = item;
        acc.push({ ...obj, uid: key });
        return acc;
      }, []);

    console.log(magnetURI, torrentsList[magnetURI]);
    if (Object.keys(fileList).length || torrentsList[magnetURI]) {
      return new Promise((resolve) => {
        resolve(retTransform(fileList));
      });
    }

    return new Promise((resolve) => {
      console.log('Init add files');
      const torr = client
        .add(magnetURI, (torrent) => {
          console.log('Client added');

          torrent.deselect(0, torrent.pieces.length - 1, false);

          const result = torrent.files.map((file) => {
            const uid = v4();
            const fileData = {
              magnetURI,
              fileName: file.name,
              uid,
            };
            uidMap[uid] = fileData;
            return fileData;
          });
          resolve(retTransform(result));

          console.log('Client is downloading:', torrent.numPeers);
          torrent.on('wire', (wire, addr) => {
            console.log(
              'connected to peer with address ' + addr,
              torrent.downloadSpeed,
              torrent.downloaded,
            );
          });
        })
        .on('error', (err) => {
          console.error('TORRENT ERROR', err);
        });
      torrentsList[magnetURI] = torr;
    });
  }

  downloadFile(id) {
    console.log(torrentsList);
    const { magnetURI, fileName } = uidMap[id];
    console.log(magnetURI, fileName);
    const torrent = torrentsList[magnetURI];

    const file = torrent.files.find((x) => x.name === fileName);
    console.log(file);
    return file;
  }
}
