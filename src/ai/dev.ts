import { config } from 'dotenv';
config();

import { generatePlagiarismReport } from './flows/generate-plagiarism-report';
import './flows/extract-text-from-document.ts';

async function testPlagiarismDetection() {
  const input = {
    documentText: "This is a test document. It contains some text that may or may not be plagiarized."
  };
  const result = await generatePlagiarismReport(input);
  console.log(result);
}

testPlagiarismDetection();
