import { config } from 'dotenv';
config();

import { generatePlagiarismReport } from './flows/generate-plagiarism-report';

async function testPlagiarismDetection() {
  const input = {
    documentText: "This is a test document. It contains some text that may or may not be plagiarized to test the plagiarism detection capabilities."
  };
  try {
    console.log("Testing plagiarism detection with input:", input.documentText.substring(0, 50) + "...");
    const result = await generatePlagiarismReport(input);
    console.log("Plagiarism detection test result:", JSON.stringify(result, null, 2));
  } catch (error) {
    console.error("Error during plagiarism detection test:", error);
  }
}

// To run the test when Genkit starts in dev mode:
if (process.env.NODE_ENV === 'development') { // Or some other condition if you prefer
  testPlagiarismDetection();
}
