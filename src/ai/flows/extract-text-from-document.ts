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
  prompt: `You are an expert document processing AI. Your task is to extract all readable text content from the provided document.
The document is supplied as a data URI.
Prioritize accuracy and completeness of the textual content. Preserve paragraph structure and line breaks if possible, but focus on extracting the raw text.

Document: {{media url=documentDataUri}}

Return ONLY the extracted text. If the document is empty or contains no readable text, return an empty string for extractedText.`,
  // It's good practice to configure safety settings, especially if documents could contain varied content.
  // For text extraction, we might want to be less restrictive, but this depends on application policy.
  // For now, default safety settings from genkit.ts will apply. Consider adjusting if needed.
});

const extractTextFromDocumentFlow = ai.defineFlow(
  {
    name: 'extractTextFromDocumentFlow',
    inputSchema: ExtractTextFromDocumentInputSchema,
    outputSchema: ExtractTextFromDocumentOutputSchema,
  },
  async input => {
    // Using a model that's good with multimodal inputs / document understanding is key here.
    // gemini-2.0-flash might be sufficient for simpler documents.
    // For more complex documents, a model like gemini-1.5-pro might be better if available and configured.
    const {output} = await prompt(input);
    
    if (!output) {
      // This case should ideally be handled by Genkit if the model fails to produce schema-compliant output.
      // However, an explicit check is good for robustness.
      throw new Error("Failed to extract text from the document. The model did not return the expected output structure.");
    }
    // The schema ensures extractedText is a string, so if output is non-null, extractedText should exist.
    // An empty string is a valid output if the document has no text.
    return output; 
  }
);
