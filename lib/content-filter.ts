import { Filter } from "bad-words";

const filter = new Filter();

// You can add your "unofficial words" here
const customBadWords: string[] = [
  // Examples:
  // "slang1",
  // "slang2"
];

// Add custom words to the filter
if (customBadWords.length > 0) {
  filter.addWords(...customBadWords);
}

/**
 * Validates text to ensure it does not contain restricted words.
 * @param text The string to check
 * @returns { isValid: boolean, cleanText: string }
 */
export function validateContent(text: string): { isValid: boolean; cleanText: string } {
  if (!text) return { isValid: true, cleanText: "" };
  
  const isProfane = filter.isProfane(text);
  const cleanText = filter.clean(text);
  
  return {
    isValid: !isProfane,
    cleanText
  };
}
