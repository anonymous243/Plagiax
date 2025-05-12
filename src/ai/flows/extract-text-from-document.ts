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
  extractedText: z.string().describe('The extracted text content from the document body.'),
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
  prompt: `You are an advanced document processing AI. Your primary task is to meticulously extract readable text content ONLY from the main body of the provided document (DOCX or PDF). The document is supplied as a data URI.

Crucially, you MUST EXCLUDE any text found in headers and footers.

Your extraction should focus on:
- Main body text content.
- Text within tables located in the main body (preserving cell content as plain text).
- Text within text boxes and callouts that are part of the main document body.
- Captions for images or diagrams if they are within the main body flow.
- Text within lists found in the main body.

Preserve paragraph structure and line breaks from the main body content as much as possible, but ONLY if it does not compromise the completeness of the extracted main body text. If there's a conflict, extracting ALL main body text is more important than perfectly preserving structure. Ensure no content from the main body is omitted.

There is NO LIMIT on the length of the text to be extracted from the main body. Ensure the entire document's main body textual content is captured.

Execute this extraction with maximum speed and efficiency. The extracted text will be used for further analysis, so a clean, complete, and direct extraction of the main body content is crucial.

Document: {{media url=documentDataUri}}

Return ONLY the extracted text from the document's main body. If the document's main body is empty or contains no readable text, return an empty string for extractedText. Do not add any commentary, preamble, or explanation other than the extracted main body text itself. The output must be solely the content of the 'extractedText' field.`,
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
    // Ensure extractedText is always a string, even if the model somehow misses it.
    return { extractedText: output.extractedText || "" }; 
  }
);
