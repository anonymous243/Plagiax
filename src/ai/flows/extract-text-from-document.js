'use server';
"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.extractTextFromDocument = extractTextFromDocument;
/**
 * @fileOverview An AI agent for extracting text from documents.
 *
 * - extractTextFromDocument - A function that handles document text extraction.
 * - ExtractTextFromDocumentInput - The input type for the extractTextFromDocument function.
 * - ExtractTextFromDocumentOutput - The return type for the extractTextFromDocument function.
 */
var genkit_1 = require("../genkit");
var genkit_2 = require("genkit");
var ExtractTextFromDocumentInputSchema = genkit_2.z.object({
    documentDataUri: genkit_2.z
        .string()
        .describe("The document file (e.g., DOCX or PDF) as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."),
});
var ExtractTextFromDocumentOutputSchema = genkit_2.z.object({
    extractedText: genkit_2.z.string().describe('The extracted text content from the document body.'),
});
function extractTextFromDocument(input) {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            return [2 /*return*/, extractTextFromDocumentFlow(input)];
        });
    });
}
var prompt = genkit_1.ai.definePrompt({
    name: 'extractTextFromDocumentPrompt',
    input: { schema: ExtractTextFromDocumentInputSchema },
    output: { schema: ExtractTextFromDocumentOutputSchema },
    prompt: "You are an advanced document processing AI. Your primary task is to meticulously extract readable text content ONLY from the main body of the provided document (DOCX or PDF). The document is supplied as a data URI.\n\nCrucially, you MUST EXCLUDE any text found in headers and footers.\n\nYour extraction should focus on:\n- Main body text content.\n- Text within tables located in the main body (preserving cell content as plain text).\n- Text within text boxes and callouts that are part of the main document body.\n- Captions for images or diagrams if they are within the main body flow.\n- Text within lists found in the main body.\n\nPreserve paragraph structure and line breaks from the main body content as much as possible, but ONLY if it does not compromise the completeness of the extracted main body text. If there's a conflict, extracting ALL main body text is more important than perfectly preserving structure. Ensure no content from the main body is omitted.\n\nThere is NO LIMIT on the length of the text to be extracted from the main body. Ensure the entire document's main body textual content is captured.\n\nExecute this extraction with maximum speed and efficiency. The extracted text will be used for further analysis, so a clean, complete, and direct extraction of the main body content is crucial.\n\nDocument: {{media url=documentDataUri}}\n\nReturn ONLY the extracted text from the document's main body. If the document's main body is empty or contains no readable text, return an empty string for extractedText. Do not add any commentary, preamble, or explanation other than the extracted main body text itself. The output must be solely the content of the 'extractedText' field.",
});
var extractTextFromDocumentFlow = genkit_1.ai.defineFlow({
    name: 'extractTextFromDocumentFlow',
    inputSchema: ExtractTextFromDocumentInputSchema,
    outputSchema: ExtractTextFromDocumentOutputSchema,
}, function (input) { return __awaiter(void 0, void 0, void 0, function () {
    var output;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, prompt(input)];
            case 1:
                output = (_a.sent()).output;
                if (!output) {
                    throw new Error("Failed to extract text from the document. The model did not return the expected output structure.");
                }
                // Ensure extractedText is always a string, even if the model somehow misses it.
                return [2 /*return*/, { extractedText: output.extractedText || "" }];
        }
    });
}); });
