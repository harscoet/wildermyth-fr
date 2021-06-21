import fetch from 'node-fetch';

export async function translate(
  texts: string[],
  targetLanguage: string,
): Promise<string[]> {
  const responses = await Promise.all(
    texts.map((text) =>
      fetch(
        'https://api.pons.com/text-translation-web/v4/translate?locale=en',
        {
          headers: {
            'content-type': 'application/json',
          },
          body: JSON.stringify({
            sourceLanguage: 'en',
            targetLanguage: targetLanguage,
            text,
          }),
          method: 'POST',
        },
      ),
    ),
  );

  const jsons: JsonResponse[] = await Promise.all(
    responses.map((x) => x.json()),
  );

  return jsons.map((x) => x.text);
}

interface JsonResponse {
  requestId: string;
  sourceLanguage: string;
  targetLanguage: string;
  serviceMessage: string;
  text: string;
  links: Record<string, string>;
}
