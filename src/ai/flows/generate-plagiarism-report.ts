
'use server';

import { ai } from '../genkit';
import { z } from 'genkit';
import fetch from 'node-fetch'; // Ensure this is node-fetch v2 for CommonJS compatibility if not using ESM

const GeneratePlagiarismReportInputSchema = z.object({
  documentText: z
    .string()
    .describe('The text content of the document to be checked for plagiarism.'),
  coreMetadata: z
    .string()
    .optional()
    .describe('Metadata from the CORE API.'),
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
2.  Identify specific segments within the document that appear to be plagiarized. This includes:
    a.  Direct copies.
    b.  Cleverly paraphrased content: Look for synonym swaps, sentence reordering, changes in voice or tense, and structural alterations that maintain the original meaning but alter the wording. Be especially vigilant for patterns that suggest AI-assisted paraphrasing.
    c.  Potentially AI-generated text segments: Identify text that exhibits characteristics of AI generation, such as overly generic language, unusual sentence structures, or a style inconsistent with the rest of the document, especially if it seems to be used to disguise plagiarized ideas.
3.  For each identified segment (direct, paraphrased, or potentially AI-generated to hide plagiarism), provide:
    a.  The exact 'snippetFromDocument' from the submitted text.
    b.  The 'sourceURL' from which the content was likely taken, if identifiable.
    c.  The 'sourceSnippet' from the identified source that matches the document snippet.'
    d.  A 'similarityScore' (0-100) for that specific segment, indicating how similar it is to the source, considering both lexical and semantic similarity. Provide a detailed explanation of why you believe the segment is plagiarized, including specific examples of paraphrasing techniques used or indicators of AI generation.

When comparing the document text to the CORE metadata, pay close attention to titles, abstracts, and full texts. Consider the possibility that the document may have been derived from or inspired by existing scholarly works.

Your analysis should include:
-   Comprehensive plagiarism checking across 50+ languages.
-   Intelligent translation and cross-linguistic similarity detection where applicable.
-   Preservation of linguistic nuances and context during analysis.
-   Advanced detection of paraphrasing, including sophisticated AI-assisted modifications and AI-generated text patterns used to obscure plagiarism.

Return your findings as a structured list. If no plagiarism is detected, the 'plagiarismPercentage' should be 0 and the 'findings' array should be empty.
Do not invent sources or similarity scores if they cannot be reasonably determined. If a source is suspected but cannot be pinpointed to a URL, describe the nature of the suspected source if possible (e.g., "general web content," "common knowledge phrasing adapted").

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
      const coreApiKey = process.env.CORE_API_KEY || "eX1MLyWY0CfukdUF9V4bAJG6Sv5TcKwi"; // Prefer environment variable
      // Use a more limited portion of the text for the query to avoid overly long URLs or performance issues
      const queryText = input.documentText.substring(0, 250); 
      const CORE_API_ENDPOINT = `https://core.ac.uk/api-v2/articles/search/${encodeURIComponent(queryText)}?apiKey=${coreApiKey}&limit=5`;

      console.log("[generatePlagiarismReportFlow] CORE API Endpoint:", CORE_API_ENDPOINT);

      try {
        const response = await fetch(CORE_API_ENDPOINT);
        if (!response.ok) {
          const errorBody = await response.text();
          console.error(`[generatePlagiarismReportFlow] CORE API request failed with status ${response.status}: ${errorBody}`);
          coreMetadataString = JSON.stringify({ error: "Failed to fetch data from CORE API", status: response.status, body: errorBody });
        } else {
          const data = await response.json();
          coreMetadataString = JSON.stringify(data, null, 2);
        }
      } catch (error: any) {
        console.error("[generatePlagiarismReportFlow] Error fetching from CORE API:", error);
        coreMetadataString = JSON.stringify({ error: "Exception during CORE API fetch", message: error.message });
      }
    }
    
    try {
      // console.log("[generatePlagiarismReportFlow] CORE Metadata being sent to AI:", coreMetadataString ? coreMetadataString.substring(0, 200) + "..." : "None");
      // console.log("[generatePlagiarismReportFlow] Document text being sent to AI (first 200 chars):", input.documentText.substring(0,200) + "...");
      
      const {output, usage} = await prompt({ documentText: input.documentText, coreMetadata: coreMetadataString });
      // console.log("[generatePlagiarismReportFlow] AI prompt usage:", usage);
      
      if (!output || typeof output.plagiarismPercentage !== 'number' || !Array.isArray(output.findings)) {
        console.error("[generatePlagiarismReportFlow] Plagiarism report generation failed to produce structured output or valid fields from AI model. Output received:", output);
        // Return a default/empty report to prevent crashes downstream
        return {
          plagiarismPercentage: 0,
          findings: [],
        };
      }
      // console.log("[generatePlagiarismReportFlow] AI prompt output:", JSON.stringify(output, null, 2));
      return {
        plagiarismPercentage: output.plagiarismPercentage,
        findings: output.findings,
      };

    } catch (aiError: any) {
      console.error("[generatePlagiarismReportFlow] Error during AI prompt execution:", aiError);
      // Return a default/empty report in case of AI call failure
      return {
        plagiarismPercentage: 0,
        findings: [],
      };
    }
  }
);
