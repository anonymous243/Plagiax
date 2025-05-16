'use server';

/**
 * @fileOverview A plagiarism detection AI agent.
 *
 * - generatePlagiarismReport - A function that handles the plagiarism detection process.
 * - GeneratePlagiarismReportInput - The input type for the generatePlagiarismReport function.
 * - GeneratePlagiarismReportOutput - The return type for the generatePlagiarismReport function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GeneratePlagiarismReportInputSchema = z.object({
  documentText: z
    .string()
    .describe('The text content of the document to be checked for plagiarism.'),
});
export type GeneratePlagiarismReportInput = z.infer<typeof GeneratePlagiarismReportInputSchema>;

const PlagiarizedSegmentSchema = z.object({
  snippetFromDocument: z
    .string()
    .describe(
      'The exact text snippet from the submitted document identified as potentially plagiarized.'
    ),
  sourceURL: z
    .string()
    .optional()
    .describe('The URL of the identified source, if available.'),
  sourceSnippet: z
    .string()
    .optional()
    .describe(
      'The text snippet from the source material that matches the document snippet.'
    ),
  similarityScore: z
    .number()
    .optional()
    .describe(
      'A percentage score (0-100) indicating the similarity of this specific snippet to the source.'
    ),
    // For heatmap, we'd ideally need start/end indices, but this is hard for LLMs to provide reliably.
    // startIndex: z.number().optional().describe("The starting character index of the snippet in the original document."),
    // endIndex: z.number().optional().describe("The ending character index of the snippet in the original document."),
});

const GeneratePlagiarismReportOutputSchema = z.object({
  plagiarismPercentage: z
    .number()
    .min(0).max(100)
    .describe('The overall percentage of the document that is plagiarized (0-100).'),
  findings: z
    .array(PlagiarizedSegmentSchema)
    .describe(
      'A detailed list of plagiarized snippets, their potential sources, and similarity scores. If no plagiarism is detected, this should be an empty array.'
    ),
});
export type GeneratePlagiarismReportOutput = z.infer<typeof GeneratePlagiarismReportOutputSchema>;

export async function generatePlagiarismReport(
  input: GeneratePlagiarismReportInput
): Promise<GeneratePlagiarismReportOutput> {
  return generatePlagiarismReportFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generatePlagiarismReportPrompt',
  input: {schema: GeneratePlagiarismReportInputSchema},
  output: {schema: GeneratePlagiarismReportOutputSchema},
  prompt: `You are a plagiarism detection expert with advanced multi-language capabilities. You will receive the text content of a document.
Your task is to:
1.  Determine the overall plagiarism percentage (0-100) for the entire document.
2.  Identify specific segments within the document that appear to be plagiarized. This includes direct copies, as well as cleverly paraphrased content or AI-modified text that attempts to evade simple string-matching. Pay special attention to rephrased sentences, synonym swaps, and structural changes that maintain the original meaning but alter the wording.
3.  For each plagiarized segment (including paraphrased ones), provide:
    a.  The exact 'snippetFromDocument' from the submitted text.
    b.  The 'sourceURL' from which the content was likely taken, if identifiable.
    c.  The 'sourceSnippet' from the identified source that matches the document's snippet, if available.
    d.  A 'similarityScore' (0-100) for that specific segment, indicating how similar it is to the source, considering both lexical and semantic similarity.

Your analysis should include:
-   Comprehensive plagiarism checking across 50+ languages.
-   Intelligent translation and cross-linguistic similarity detection where applicable.
-   Preservation of linguistic nuances and context during analysis.
-   Advanced detection of paraphrasing, including AI-assisted modifications.

Return your findings as a structured list. If no plagiarism is detected, the 'plagiarismPercentage' should be 0 and the 'findings' array should be empty.
Do not invent sources or similarity scores if they cannot be reasonably determined.

Document Text: {{{documentText}}}`,
});

const generatePlagiarismReportFlow = ai.defineFlow(
  {
    name: 'generatePlagiarismReportFlow',
    inputSchema: GeneratePlagiarismReportInputSchema,
    outputSchema: GeneratePlagiarismReportOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    if (!output) {
      // Fallback if the model fails to produce structured output
      console.error("Plagiarism report generation failed to produce structured output.");
      return {
        plagiarismPercentage: 0,
        findings: [],
      };
    }
    // Ensure findings is always an array, even if the model returns null/undefined for it.
    return {
      plagiarismPercentage: output.plagiarismPercentage ?? 0,
      findings: output.findings ?? [],
    };
  }
);
