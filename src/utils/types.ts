interface UIDMapItem {
  magnetURI: string;
  fileName: string;
}

interface FileListItem {
  magnetURI: string;
  fileName: string;
  uid: string;
}

export type { UIDMapItem, FileListItem };
