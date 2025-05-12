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

const GeneratePlagiarismReportOutputSchema = z.object({
  plagiarismPercentage: z
    .number()
    .describe('The percentage of the document that is plagiarized.'),
  report: z.string().describe('A detailed report highlighting plagiarized snippets and source URLs.'),
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
  prompt: `You are a plagiarism detection expert. You will receive the text content of a document and must determine the percentage of plagiarism detected and generate a detailed report highlighting plagiarized snippets and source URLs.

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
    return output!;
  }
);
