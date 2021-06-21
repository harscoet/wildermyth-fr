import path from 'path';
import { once } from 'events';
import { createWriteStream, WriteStream } from 'fs';
import { parseFile, serializeProperty } from './lib/properties-file-parser';
import { deepReadAllFiles, isFileExists } from './lib/path-reader';
import { translate } from './lib/translator-pons';

const SOURCE_PATH = process.env.SRC;
const ROOT_DIR = process.env.ROOT_DIR ?? 'text';
const TARGET_DIR_PATH = path.resolve(__dirname, '../../mod/assets/text');
const TARGET_LANGUAGE = process.env.TARGET_LANGUAGE ?? 'fr';

if (!SOURCE_PATH) {
  throw new Error('Process env SRC needs to be defined');
}

async function main() {
  const texts: string[] = [];
  let nbCharacters: number = 0;

  await deepReadAllFiles(SOURCE_PATH, async (filePath) => {
    if (filePath.endsWith('_zh_CN.properties')) {
      return;
    }

    const relativeFilePath = filePath.substr(
      filePath.indexOf(ROOT_DIR) + ROOT_DIR.length + 1,
    );

    const targetFilePath = path
      .join(TARGET_DIR_PATH, relativeFilePath)
      .replace('.properties', `_${TARGET_LANGUAGE}.properties`);

    console.log({
      read: filePath,
      write: targetFilePath
    });

    if (await isFileExists(targetFilePath)) {
      return;
    }

    const ws: WriteStream = createWriteStream(targetFilePath);

    await parseFile(filePath, async (property) => {
      if (property.value.startsWith('#')) {
        return;
      }

      texts.push(property.value);
      nbCharacters += property.value.length;

      const [translation] = await translate([property.value], TARGET_LANGUAGE);
      ws.write(serializeProperty(property.key, translation) + '\r\n');
    });

    ws.end();

    await once(ws, 'finish');
  });

  console.log('DONE', {
    nbTexts: texts.length,
    nbCharacters,
  });
}

main().catch(console.dir);
