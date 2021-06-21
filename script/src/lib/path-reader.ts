import { promises as fsPromises } from 'fs';
import path from 'path';

const ERROR_ENOENT_CODE = 'ENOENT';

async function readDirPath(
  dirPath: string,
  fn: (filePath: string) => Promise<void>,
) {
  const dirNames = await fsPromises.readdir(dirPath);

  return Promise.all(
    dirNames.map((dirName) => {
      if (dirName.startsWith('.')) {
        return;
      }

      return deepReadAllFiles(path.join(dirPath, dirName), fn);
    }),
  );
}

export async function deepReadAllFiles(
  dirOrFilepath: string,
  fn: (filePath: string) => Promise<void>,
) {
  const stats = await fsPromises.stat(dirOrFilepath);

  return stats.isDirectory()
    ? readDirPath(dirOrFilepath, fn)
    : fn(dirOrFilepath);
}

export async function isFileExists(filePath: string): Promise<boolean> {
  try {
    await fsPromises.access(filePath);
    return true;
  } catch (err) {
    if (err.code !== ERROR_ENOENT_CODE) {
      throw err;
    }

    return false;
  }
}
