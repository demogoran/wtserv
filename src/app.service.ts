import { Injectable } from '@nestjs/common';
import * as WebTorrent from 'webtorrent';
import { v4 } from 'uuid';

const client = new WebTorrent();

const magnetURI =
  'magnet:?xt=urn:btih:42D4C21288C04F50B21D29BFB74E8198A2F4A699&tr=http%3A%2F%2Fbt2.t-ru.org%2Fann%3Fmagnet&dn=(Progressive%20Rock)%20%5BWEB%5D%20Arc%20Of%20Life%20-%20Don%27t%20Look%20Down%20-%202022%2C%20FLAC%20(tracks)%2C%20lossless';
const torrentsList = {};

@Injectable()
export class AppService {
  getFilesList(): Promise<any> {
    return new Promise((resolve) => {
      client.add(magnetURI, function (torrent) {
        torrent.deselect(0, torrent.pieces.length - 1, false);

        const torrId = v4();
        resolve([
          torrent.files.map((x) => x.name),
          torrId,
          `http://localhost:3000/file/${torrId}/${torrent.files[0].name}`,
        ]);

        torrentsList[torrId] = torrent;

        console.log('Client is downloading:', torrent.numPeers);
        torrent.on('wire', function (wire, addr) {
          console.log(
            'connected to peer with address ' + addr,
            torrent.downloadSpeed,
            torrent.downloaded,
          );
        });
      });
    });
  }

  downloadFile(torrId, fileId) {
    console.log(torrentsList);
    console.log(torrId, fileId);
    const torrent = torrentsList[torrId];

    const file = torrent.files.find((x) => x.name === fileId);
    return file.createReadStream();
  }
}
