import { v2 } from '@google-cloud/translate';

const translate = new v2.Translate({
  projectId: process.env.GOOGLE_CLOUD_PROJECT,
});

export async function transate(
  texts: string[],
  targetLanguage: string,
): Promise<string[]> {
  const [translations] = await translate.translate(texts, {
    from: 'en',
    to: targetLanguage,
  });

  return translations;
}
