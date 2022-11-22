const WebTorrent = require("webtorrent");

const client = new WebTorrent();
const magnetURI =
  "magnet:?xt=urn:btih:35A8C74C1CCAD1BAE7685D3363058731176D14F9&tr=http%3A%2F%2Fbt2.t-ru.org%2Fann%3Fmagnet&dn=Evil%20West%20%5BP%5D%20%5BRUS%20%2B%20ENG%20%2B%2010%20%2F%20ENG%5D%20(2022)%20(1.0.3%20%2B%201%20DLC)%20%5BPortable%5D";

client.add(magnetURI, function (torrent) {
  // Got torrent metadata!
  console.log("Client is downloading:", torrent.numPeers);
  torrent.on("wire", function (wire, addr) {
    console.log(
      "connected to peer with address " + addr,
      torrent.downloadSpeed,
      torrent.downloaded
    );
  });
});
