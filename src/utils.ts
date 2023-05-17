import * as fs from 'node:fs/promises';


export function removeFile(path:string ) {
  return fs.unlink(path).catch(() => {
    console.log(`Error removing file ${ path }`);
  });
}
