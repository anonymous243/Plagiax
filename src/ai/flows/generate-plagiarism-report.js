
'use server';
"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
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
exports.generatePlagiarismReport = generatePlagiarismReport;
var genkit_1 = require("../genkit");
var genkit_2 = require("genkit");
var node_fetch_1 = require("node-fetch"); // CommonJS import for node-fetch v2
var GeneratePlagiarismReportInputSchema = genkit_2.z.object({
    documentText: genkit_2.z
        .string()
        .describe('The text content of the document to be checked for plagiarism.'),
    coreMetadata: genkit_2.z
        .string()
        .optional()
        .describe('Pre-fetched metadata from the CORE API (if available, otherwise fetched in flow).'),
});
var PlagiarizedSegmentSchema = genkit_2.z.object({
    snippetFromDocument: genkit_2.z
        .string()
        .describe('The exact text snippet from the submitted document identified as potentially plagiarized.'),
    sourceURL: genkit_2.z
        .string()
        .optional()
        .describe('The URL of the identified source, if available.'),
    sourceSnippet: genkit_2.z
        .string()
        .optional()
        .describe('The text snippet from the source material that matches the document snippet.'),
    similarityScore: genkit_2.z
        .number()
        .optional()
        .describe('A percentage score (0-100) indicating the similarity of this specific snippet to the source.'),
});
var GeneratePlagiarismReportOutputSchema = genkit_2.z.object({
    plagiarismPercentage: genkit_2.z
        .number()
        .min(0).max(100)
        .describe('The overall percentage of the document that is plagiarized (0-100).'),
    findings: genkit_2.z
        .array(PlagiarizedSegmentSchema)
        .describe('A detailed list of plagiarized snippets, their potential sources, and similarity scores. If no plagiarism is detected, this should be an empty array.'),
});
function generatePlagiarismReport(input) {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            return [2 /*return*/, generatePlagiarismReportFlow(input)];
        });
    });
}
var prompt = genkit_1.ai.definePrompt({
    name: 'generatePlagiarismReportPrompt',
    input: { schema: GeneratePlagiarismReportInputSchema },
    output: { schema: GeneratePlagiarismReportOutputSchema },
    prompt: "You are a plagiarism detection expert with advanced multi-language capabilities. You will receive the text content of a document and metadata from the CORE API.\nYour task is to:\n1.  Determine the overall plagiarism percentage (0-100) for the entire document.\n2.  Identify specific segments within the document that appear to be plagiarized. This includes direct copies, as well as cleverly paraphrased content or AI-modified text that attempts to evade simple string-matching. Pay special attention to rephrased sentences, synonym swaps, and structural changes that maintain the original meaning but alter the wording. When identifying paraphrased content, consider the context of the surrounding sentences and the overall meaning of the text. Specifically look for AI-assisted paraphrasing techniques.\n3.  For each plagiarized segment (including paraphrased ones), provide:\n    a.  The exact 'snippetFromDocument' from the submitted text.\n    b.  The 'sourceURL' from which the content was likely taken, if identifiable.\n    c.  The 'sourceSnippet' from the identified source that matches the document snippet.'\n    d.  A 'similarityScore' (0-100) for that specific segment, indicating how similar it is to the source, considering both lexical and semantic similarity. Provide a detailed explanation of why you believe the segment is plagiarized, including specific examples of paraphrasing techniques used.\n\nWhen comparing the document text to the CORE metadata, pay close attention to titles, abstracts, and full texts. Consider the possibility that the document may have been derived from or inspired by existing scholarly works.\n\nYour analysis should include:\n-   Comprehensive plagiarism checking across 50+ languages.\n-   Intelligent translation and cross-linguistic similarity detection where applicable.\n-   Preservation of linguistic nuances and context during analysis.\n-   Advanced detection of paraphrasing, including AI-assisted modifications and AI-generated text patterns.\n\nReturn your findings as a structured list. If no plagiarism is detected, the 'plagiarismPercentage' should be 0 and the 'findings' array should be empty.\nDo not invent sources or similarity scores if they cannot be reasonably determined.\n\nCORE Metadata: {{{coreMetadata}}}\nDocument Text: {{{documentText}}}",
});
var generatePlagiarismReportFlow = genkit_1.ai.defineFlow({
    name: 'generatePlagiarismReportFlow',
    inputSchema: GeneratePlagiarismReportInputSchema,
    outputSchema: GeneratePlagiarismReportOutputSchema,
}, function (input) { return __awaiter(void 0, void 0, void 0, function () {
    var coreMetadataString, coreApiKey, CORE_API_ENDPOINT, response, data_1, error_1, output;
    var _a, _b;
    return __generator(this, function (_c) {
        switch (_c.label) {
            case 0:
                coreMetadataString = input.coreMetadata;
                if (!!coreMetadataString) return [3 /*break*/, 5];
                coreApiKey = process.env.CORE_API_KEY || "YOUR_API_KEY";
                CORE_API_ENDPOINT = "https://core.ac.uk/api-v2/articles/search/".concat(encodeURIComponent(input.documentText.substring(0, 500)), "?apiKey=").concat(coreApiKey, "&limit=5");
                _c.label = 1;
            case 1:
                _c.trys.push([1, 4, , 5]);
                return [4 /*yield*/, (0, node_fetch_1.default)(CORE_API_ENDPOINT)];
            case 2:
                response = _c.sent();
                if (!!response.ok) return [3 /*break*/, 3];
                console.error("CORE API request failed with status ".concat(response.status, ": ").concat(yield response.text()));
                coreMetadataString = JSON.stringify({ error: "Failed to fetch data from CORE API", status: response.status });
                return [3 /*break*/, 4];
            case 3: return [4 /*yield*/, response.json()];
            case 3.5: // Adjusted label for transpiled JS
                data_1 = _c.sent();
                coreMetadataString = JSON.stringify(data_1, null, 2);
                _c.label = 4;
                break;
            case 4:
                _c.label = 4; // Ensure this label is distinct if previous case doesn't fall through.
                return [3 /*break*/, 5];
            case 4.5: // Catch block
                error_1 = _c.sent();
                console.error("Error fetching from CORE API:", error_1);
                coreMetadataString = JSON.stringify({ error: "Exception during CORE API fetch", message: error_1.message });
                return [3 /*break*/, 5];
            case 5: return [4 /*yield*/, prompt({ documentText: input.documentText, coreMetadata: coreMetadataString })];
            case 6:
                output = (_c.sent()).output;
                if (!output) {
                    console.error("Plagiarism report generation failed to produce structured output from AI model.");
                    return [2 /*return*/, {
                            plagiarismPercentage: 0,
                            findings: [],
                        }];
                }
                return [2 /*return*/, {
                        plagiarismPercentage: (_a = output.plagiarismPercentage) !== null && _a !== void 0 ? _a : 0,
                        findings: (_b = output.findings) !== null && _b !== void 0 ? _b : [],
                    }];
        }
    });
}); });
// Ensure consistent labeling for the transpiled JavaScript:
// If `case 3` has an async operation that might error and jump to `case 4.5` (catch block),
// then `case 4` after the try block should be correctly labeled and reached.
// The current structure looks mostly fine for standard transpilation, but async/await in try/catch
// can sometimes lead to slightly different label sequences than direct manual JS.
// The labels 3.5 and 4.5 are illustrative for where the `await response.json()` and `catch` block might map.
// It's crucial that the control flow correctly reaches `case 5` (the `await prompt` call)
// after either successfully fetching metadata or handling an error during the fetch.
// The `finally` block in a try/catch/finally in TS might also affect label generation.
// However, this flow doesn't use a `finally` block.

// The main change is replacing the `crossref` client with `node-fetch` and the CORE API logic.
// The rest of the Zod schemas and AI prompt/flow definitions are structurally similar to the TS version.
// The `encodeURIComponent` and `response.ok` checks from the TS version are included.
// Using `process.env.CORE_API_KEY` for the API key is good practice.
// Limiting the search text for CORE API (`substring(0, 500)`) and results (`limit=5`) is a practical step for performance/cost.
