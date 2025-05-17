
'use server';
/**
 * @fileOverview AI flow for generating plagiarism reports.
 * It uses the CORE API to fetch academic articles for comparison.
 * - generatePlagiarismReport - Main function to call the flow.
 * - GeneratePlagiarismReportInput - Input schema for the flow.
 * - GeneratePlagiarismReportOutput - Output schema for the flow.
 */
import { ai } from '../genkit';
import { z } from 'genkit';
import fetch from 'node-fetch'; // Using node-fetch v2 for CommonJS compatibility if needed

const GeneratePlagiarismReportInputSchema = z.object({
  documentText: z
    .string()
    .describe('The text content of the document to be checked for plagiarism.'),
  coreMetadata: z
    .string()
    .optional()
    .describe('Pre-fetched metadata from the CORE API (if available, otherwise fetched in flow).'),
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
  input: { schema: GeneratePlagiarismReportInputSchema },
  output: { schema: GeneratePlagiarismReportOutputSchema },
  prompt: `You are a plagiarism detection expert with advanced multi-language capabilities. You will receive the text content of a document and metadata from the CORE API.
Your task is to:
1.  Determine the overall plagiarism percentage (0-100) for the entire document.
2.  Identify specific segments within the document that appear to be plagiarized. This includes direct copies, as well as cleverly paraphrased content or AI-modified text that attempts to evade simple string-matching. Pay special attention to rephrased sentences, synonym swaps, and structural changes that maintain the original meaning but alter the wording. When identifying paraphrased content, consider the context of the surrounding sentences and the overall meaning of the text. Specifically look for AI-assisted paraphrasing techniques.
3.  For each plagiarized segment (including paraphrased ones), provide:
    a.  The exact 'snippetFromDocument' from the submitted text.
    b.  The 'sourceURL' from which the content was likely taken, if identifiable.
    c.  The 'sourceSnippet' from the identified source that matches the document snippet.'
    d.  A 'similarityScore' (0-100) for that specific segment, indicating how similar it is to the source, considering both lexical and semantic similarity. Provide a detailed explanation of why you believe the segment is plagiarized, including specific examples of paraphrasing techniques used.

When comparing the document text to the CORE metadata, pay close attention to titles, abstracts, and full texts. Consider the possibility that the document may have been derived from or inspired by existing scholarly works.

Your analysis should include:
-   Comprehensive plagiarism checking across 50+ languages.
-   Intelligent translation and cross-linguistic similarity detection where applicable.
-   Preservation of linguistic nuances and context during analysis.
-   Advanced detection of paraphrasing, including AI-assisted modifications and AI-generated text patterns.

Return your findings as a structured list. If no plagiarism is detected, the 'plagiarismPercentage' should be 0 and the 'findings' array should be empty.
Do not invent sources or similarity scores if they cannot be reasonably determined.

CORE Metadata: {{{coreMetadata}}}
Document Text: {{{documentText}}}`,
});

const generatePlagiarismReportFlow = ai.defineFlow(
  {
    name: 'generatePlagiarismReportFlow',
    inputSchema: GeneratePlagiarismReportInputSchema,
    outputSchema: GeneratePlagiarismReportOutputSchema,
  },
  async (input: GeneratePlagiarismReportInput): Promise<GeneratePlagiarismReportOutput> => {
    let coreMetadataString = input.coreMetadata;

    if (!coreMetadataString) {
      // Ensure YOUR_API_KEY is replaced with an actual environment variable or secure configuration in a real app
      const coreApiKey = process.env.CORE_API_KEY || "YOUR_API_KEY"; 
      const CORE_API_ENDPOINT = `https://core.ac.uk/api-v2/articles/search/${encodeURIComponent(input.documentText.substring(0, 500))}?apiKey=${coreApiKey}&limit=5`; // Limit search for performance

      try {
        const response = await fetch(CORE_API_ENDPOINT);
        if (!response.ok) {
          console.error(`CORE API request failed with status ${response.status}: ${await response.text()}`);
          coreMetadataString = JSON.stringify({ error: "Failed to fetch data from CORE API", status: response.status });
        } else {
          const data = await response.json();
          coreMetadataString = JSON.stringify(data, null, 2);
        }
      } catch (error: any) {
        console.error("Error fetching from CORE API:", error);
        coreMetadataString = JSON.stringify({ error: "Exception during CORE API fetch", message: error.message });
      }
    }
    
    const { output } = await prompt({ documentText: input.documentText, coreMetadata: coreMetadataString });
    
    if (!output) {
      console.error("Plagiarism report generation failed to produce structured output from AI model.");
      return {
        plagiarismPercentage: 0,
        findings: [],
      };
    }
    return {
      plagiarismPercentage: output.plagiarismPercentage ?? 0,
      findings: output.findings ?? [],
    };
  }
);
