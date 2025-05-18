
import { config } from 'dotenv';
config(); // Load .env file variables

console.log("Attempting to run Genkit dev script (src/ai/dev.ts)...");

import { generatePlagiarismReport } from './flows/generate-plagiarism-report';
import { extractTextFromDocument } from './flows/extract-text-from-document';

async function testPlagiarismDetection() {
  const testDocumentText = `
    This is a test document. It contains some text that may or may not be plagiarized 
    to test the plagiarism detection capabilities. 
    The quick brown fox jumps over the lazy dog. This sentence is very common.
    Another section here repeats some ideas from well-known sources.
    It's important for students to submit original work. Academic integrity is paramount.
    Consider the impact of submitting copied material.
  `;
  const input = {
    documentText: testDocumentText
  };
  try {
    console.log("======================================================================");
    console.log("🧪 Starting Plagiarism Detection Test...");
    console.log("======================================================================");
    console.log("Input Document Text (snippet):", input.documentText.substring(0, 150) + "...");
    
    const result = await generatePlagiarismReport(input);
    
    console.log("\n----------------------------------------------------------------------");
    console.log("✅ Plagiarism Detection Test Result:");
    console.log("----------------------------------------------------------------------");
    console.log("Overall Plagiarism Percentage:", result.plagiarismPercentage, "%");
    if (result.findings && result.findings.length > 0) {
      console.log("\nDetailed Findings (" + result.findings.length + "):");
      result.findings.forEach((finding, index) => {
        console.log(`\n  Finding #${index + 1}:`);
        console.log(`    Snippet from Document: "${finding.snippetFromDocument.substring(0,100)}..."`);
        console.log(`    Source URL: ${finding.sourceURL || 'N/A'}`);
        console.log(`    Source Snippet: "${(finding.sourceSnippet || 'N/A').substring(0,100)}..."`);
        console.log(`    Similarity Score: ${finding.similarityScore !== undefined ? finding.similarityScore.toFixed(1) + '%' : 'N/A'}`);
      });
    } else {
      console.log("No specific plagiarized segments found by the AI.");
    }
    console.log("\nRaw JSON Result:", JSON.stringify(result, null, 2));
    console.log("======================================================================");
    console.log("🏁 Plagiarism Detection Test Finished.");
    console.log("======================================================================");

  } catch (error) {
    console.error("======================================================================");
    console.error("❌ Error during plagiarism detection test:", error);
    console.error("======================================================================");
  }
}


async function testTextExtraction() {
  // This requires a valid base64 encoded DOCX or PDF data URI.
  // For a real test, you'd read a file and convert it.
  // Example (Conceptual - replace with actual data URI for testing):
  // const samplePdfDataUri = "data:application/pdf;base64,JVBERi0xLjQKJeLjz9MKMyAwIG9iago8PC9..."; 
  const sampleDocxDataUri = "data:application/vnd.openxmlformats-officedocument.wordprocessingml.document;base64,UEsDBBQABgAIAAAAIQC..."; // A very short, placeholder base64 for a tiny docx

  if (!sampleDocxDataUri.startsWith("data:application")) {
      console.warn("Skipping text extraction test: No valid sample data URI provided in src/ai/dev.ts");
      return;
  }

  const input = { documentDataUri: sampleDocxDataUri };
  try {
    console.log("======================================================================");
    console.log("🧪 Starting Text Extraction Test...");
    console.log("======================================================================");
    console.log("Input Document Data URI (snippet):", input.documentDataUri.substring(0, 100) + "...");
    
    const result = await extractTextFromDocument(input);

    console.log("\n----------------------------------------------------------------------");
    console.log("✅ Text Extraction Test Result:");
    console.log("----------------------------------------------------------------------");
    console.log("Extracted Text (snippet):", result.extractedText.substring(0, 200) + "...");
    console.log("Total Extracted Length:", result.extractedText.length);
    console.log("\nRaw JSON Result:", JSON.stringify(result, null, 2));
    console.log("======================================================================");
    console.log("🏁 Text Extraction Test Finished.");
    console.log("======================================================================");

  } catch (error) {
    console.error("======================================================================");
    console.error("❌ Error during text extraction test:", error);
    console.error("======================================================================");
  }
}


// To run the tests when Genkit starts in dev mode:
// Ensure GENKIT_ENV is set, or adjust the condition as needed.
if (process.env.GENKIT_ENV === 'dev' || process.env.NODE_ENV === 'development') {
  console.log("Running dev tests (plagiarism and/or text extraction) as per src/ai/dev.ts ...");
  // You can choose to run one or both tests:
  testPlagiarismDetection();
  // testTextExtraction(); // Uncomment to run text extraction test. Requires a valid data URI.
} else {
  console.log("Skipping dev tests (GENKIT_ENV not 'dev' or NODE_ENV not 'development'). Set GENKIT_ENV=dev or NODE_ENV=development to run.");
}
