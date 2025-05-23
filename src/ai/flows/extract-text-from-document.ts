
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
      "The PDF document file as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:application/pdf;base64,<encoded_data>'."
    ),
});
// Internal type alias
type _ExtractTextFromDocumentInput = z.infer<typeof ExtractTextFromDocumentInputSchema>;

const ExtractTextFromDocumentOutputSchema = z.object({
  extractedText: z.string().describe('The extracted text content from the PDF document body.'),
});
// Internal type alias
type _ExtractTextFromDocumentOutput = z.infer<typeof ExtractTextFromDocumentOutputSchema>;

export async function extractTextFromDocument(
  input: _ExtractTextFromDocumentInput
): Promise<_ExtractTextFromDocumentOutput> {
  try {
    // console.log(`[extractTextFromDocument] Received input for documentDataUri starting with: ${input.documentDataUri.substring(0,100)}`);
    const result = await extractTextFromDocumentFlow(input);
    // console.log(`[extractTextFromDocument] Flow returned result. Extracted text length: ${result.extractedText.length}`);
    return result;
  } catch (error: any) {
    console.error(`[extractTextFromDocument] Error during flow execution:`, error);
    // Re-throw a standard error with a message to ensure client gets something useful
    throw new Error(`Text extraction failed: ${error.message || 'An unknown error occurred in the extraction flow.'}`);
  }
}

const prompt = ai.definePrompt({
  name: 'extractTextFromDocumentPrompt',
  input: {schema: ExtractTextFromDocumentInputSchema},
  output: {schema: ExtractTextFromDocumentOutputSchema},
  prompt: `You are an advanced document processing AI. Your primary task is to meticulously extract readable text content ONLY from the main body of the provided PDF document. The document is supplied as a data URI.

Crucially, you MUST EXCLUDE any text found in headers and footers. Do not extract page numbers, document titles from headers, or any running footers.

Your extraction should focus on:
- Main body text content, including paragraphs, headings that are part of the main flow.
- Text within tables located in the main body (preserving cell content as plain text, linearly if possible).
- Text within text boxes and callouts that are part of the main document body (not template elements).
- Captions for images or diagrams if they are embedded within the main body flow.
- Text within lists (bulleted, numbered) found in the main body.

Preserve paragraph structure and line breaks from the main body content as much as possible, but ONLY if it does not compromise the completeness of the extracted main body text. If there's a conflict, extracting ALL main body text is more important than perfectly preserving structure. Ensure no content from the main body is omitted.

There is NO LIMIT on the length of the text to be extracted from the main body. Ensure the entire PDF document's main body textual content is captured comprehensively.

Handle PDF files robustly. Accurately parse text, respecting reading order where possible.

IMPORTANT: If the PDF document is unprocessable due to its format, corruption, or if no main body text can be definitively identified and extracted (while strictly excluding headers/footers as instructed), you MUST still return the specified JSON output with an empty string for the 'extractedText' field. Do not return error messages or commentary within the 'extractedText' field itself; the JSON structure with an empty 'extractedText' is the required output for unprocessable or empty-body documents.

Document: {{media url=documentDataUri}}

Return ONLY the extracted text from the PDF document's main body. If the document's main body is empty or contains no readable text (after successfully processing the file), return an empty string for the 'extractedText' field. Do not add any commentary, preamble, or explanation other than the extracted main body text itself. The output must be solely the content of the 'extractedText' field in the JSON format specified. Example: {"extractedText": "This is the extracted content..."}
`,
});

const extractTextFromDocumentFlow = ai.defineFlow(
  {
    name: 'extractTextFromDocumentFlow',
    inputSchema: ExtractTextFromDocumentInputSchema,
    outputSchema: ExtractTextFromDocumentOutputSchema,
  },
  async input => {
    // console.log(`[extractTextFromDocumentFlow] Starting prompt for documentDataUri starting with: ${input.documentDataUri.substring(0,100)}`);
    const {output, usage} = await prompt(input);
    // console.log(`[extractTextFromDocumentFlow] Prompt finished. Usage:`, usage);
    // console.log('[extractTextFromDocumentFlow] Raw output from model:', JSON.stringify(output)); // For debugging
    
    if (!output) {
      // console.error("[extractTextFromDocumentFlow] Model did not return output.");
      throw new Error("Failed to extract text from the document. The model did not return the expected output structure.");
    }
    if (typeof output.extractedText !== 'string') {
      // console.error("[extractTextFromDocumentFlow] Model output.extractedText is not a string. Type:", typeof output.extractedText, "Value:", output.extractedText);
       throw new Error("Failed to extract text. The model returned an invalid format for extractedText.");
    }
    // console.log(`[extractTextFromDocumentFlow] Successfully extracted text. Length: ${output.extractedText.length}`);
    return { extractedText: output.extractedText }; 
  }
);

// Explicit type-only exports
export type { _ExtractTextFromDocumentInput as ExtractTextFromDocumentInput };
export type { _ExtractTextFromDocumentOutput as ExtractTextFromDocumentOutput };

