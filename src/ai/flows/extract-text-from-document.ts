'use server';
/**
 * @fileOverview An AI agent for extracting text from documents.
 *
 * - extractTextFromDocument - A function that handles document text extraction.
 * - ExtractTextFromDocumentInput - The input type for the extractTextFromDocument function.
 * - ExtractTextFromDocumentOutput - The return type for the extractTextFromDocument function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ExtractTextFromDocumentInputSchema = z.object({
  documentDataUri: z
    .string()
    .describe(
      "The document file (e.g., DOCX or PDF) as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
});
export type ExtractTextFromDocumentInput = z.infer<typeof ExtractTextFromDocumentInputSchema>;

const ExtractTextFromDocumentOutputSchema = z.object({
  extractedText: z.string().describe('The extracted text content from the document.'),
});
export type ExtractTextFromDocumentOutput = z.infer<typeof ExtractTextFromDocumentOutputSchema>;

export async function extractTextFromDocument(
  input: ExtractTextFromDocumentInput
): Promise<ExtractTextFromDocumentOutput> {
  return extractTextFromDocumentFlow(input);
}

const prompt = ai.definePrompt({
  name: 'extractTextFromDocumentPrompt',
  input: {schema: ExtractTextFromDocumentInputSchema},
  output: {schema: ExtractTextFromDocumentOutputSchema},
  prompt: `You are an advanced document processing AI. Your primary task is to meticulously extract ALL readable text content from the provided document (DOCX or PDF). The document is supplied as a data URI.

Prioritize absolute completeness and accuracy of the textual content. This includes:
- Main body text
- Text within tables (preserving cell content as plain text)
- Headers and footers
- Footnotes and endnotes
- Text boxes and callouts
- Captions for images or diagrams
- Text within lists

Preserve paragraph structure and line breaks as much as possible, but ONLY if it does not compromise the completeness of the extracted text. If there's a conflict, extracting ALL text is more important than perfectly preserving structure.

There is NO LIMIT on the length of the text to be extracted. Ensure the entire document's textual content is captured.

Document: {{media url=documentDataUri}}

Return ONLY the extracted text. If the document is empty or contains no readable text, return an empty string for extractedText. Do not add any commentary, preamble, or explanation other than the extracted text itself. The output must be solely the content of the 'extractedText' field.`,
});

const extractTextFromDocumentFlow = ai.defineFlow(
  {
    name: 'extractTextFromDocumentFlow',
    inputSchema: ExtractTextFromDocumentInputSchema,
    outputSchema: ExtractTextFromDocumentOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    
    if (!output) {
      throw new Error("Failed to extract text from the document. The model did not return the expected output structure.");
    }
    return output; 
  }
);
