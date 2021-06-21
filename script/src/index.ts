import path from 'path';
import { parseFile, Property } from './lib/properties-file-parser';
import { deepReadAllFiles, isFileExists } from './lib/path-reader';
import { translate } from './lib/translator-pons';

const sourcePath = process.env.SRC;
const rootDir = process.env.ROOT_DIR ?? 'text';
const targetDirPath = path.resolve(__dirname, '../../mod/assets/text');
const targetLanguage = process.env.TARGET_LANGUAGE ?? 'fr';

if (!sourcePath) {
  throw new Error('Process env SRC needs to be defined');
}

async function main() {
  const texts: string[] = [];
  let nbCharacters: number = 0;

  async function handleProperty(property: Property) {
    if (property.value.startsWith('#')) {
      return;
    }

    texts.push(property.value);
    nbCharacters += property.value.length;

    const res = await translate([property.value], targetLanguage);
    console.log(res);
  }

  await deepReadAllFiles(sourcePath, async (filePath) => {
    if (filePath.endsWith('_zh_CN.properties')) {
      return;
    }

    const relativeFilePath = filePath.substr(
      filePath.indexOf(rootDir) + rootDir.length + 1,
    );

    const targetFilePath = path
      .join(targetDirPath, relativeFilePath)
      .replace('.properties', `_${targetLanguage}.properties`);

    if (await isFileExists(targetFilePath)) {
      return;
    }

    await parseFile(filePath, handleProperty);
  });

  console.log('DONE', texts.length, nbCharacters);
}

main().catch(console.dir);
