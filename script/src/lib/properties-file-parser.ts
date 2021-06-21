import { createReadStream, ReadStream } from 'fs';
import { createInterface } from 'readline';

const SEPARATOR = '=';

function parseLine(line: string): { key: string; value: string } {
  const index = line.indexOf(SEPARATOR);

  return {
    key: line.substr(0, index),
    value: line.substr(index + 1),
  };
}

export function serializeProperty(key: string, value: string): string {
  return `${key}${SEPARATOR}${value}`;
}

export async function parseFile(
  filePath: string,
  onLine: (property: Property) => Promise<void>,
): Promise<void> {
  const fileStream: ReadStream = createReadStream(filePath);

  const rl = createInterface({
    input: fileStream,
    crlfDelay: Infinity,
  });

  for await (const line of rl) {
    const property = parseLine(line);

    if (process.env.DEBUG_LINES) {
      console.log({
        line,
        property,
      });
    }

    await onLine(property);
  }
}

export interface Property {
  key: string;
  value: string;
}
