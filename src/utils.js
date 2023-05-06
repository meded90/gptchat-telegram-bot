import * as fs from "fs/promises";


export function removeFile(path) {
  return fs.unlink(path).catch(() => {
    console.log(`Error removing file ${ path }`);
  });
}
