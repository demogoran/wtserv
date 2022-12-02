import { Injectable } from '@nestjs/common';
import * as WebTorrent from 'webtorrent';
import * as fs from 'fs';
import { v4 } from 'uuid';
import { FileListItem, UIDMapItem } from 'src/utils/types';

const client = new WebTorrent();

const magnetURI = fs.readFileSync('./fast-magnet', 'utf-8');

const torrentsList = {};
const uidMap = {};

const retTransform = (result): FileListItem[] => result;

@Injectable()
export class AppService {
  getFilesList(): Promise<FileListItem[]> {
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
      client.add(magnetURI, (torrent) => {
        torrent.deselect(0, torrent.pieces.length - 1, false);

        torrentsList[magnetURI] = torrent;
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
      });
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
