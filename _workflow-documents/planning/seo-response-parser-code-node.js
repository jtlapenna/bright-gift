// SEO Keyword Discovery Response Parser
// This code node extracts the choice from your response email

function decodeBase64(str) {
  return Buffer.from(str.replace(/-/g, '+').replace(/_/g, '/'), 'base64').toString('utf-8');
}

// Extract the plain text part from the Gmail payload
const parts = $json.payload?.parts || [];
const textPart = parts.find(p => p.mimeType === 'text/plain');
const encoded = textPart?.body?.data;

const decodedBody = encoded ? decodeBase64(encoded) : '';

// Look for keyword choice in the response
// You can respond with just the keyword number or the full keyword
const keywordNumberMatch = decodedBody.match(/(?:choice|select|pick|keyword)\s*[#:]?\s*(\d+)/i);
const keywordTextMatch = decodedBody.match(/(?:choice|select|pick|keyword)\s*[#:]?\s*([^\n\r]+)/i);

// If no structured choice found, look for any number or keyword that might be the choice
const anyNumberMatch = decodedBody.match(/\b(\d+)\b/);
const anyKeywordMatch = decodedBody.match(/\b([a-zA-Z][a-zA-Z\s-]{2,30})\b/);

let choice = null;
let selectedKeyword = null;

if (keywordNumberMatch) {
  choice = parseInt(keywordNumberMatch[1], 10);
} else if (keywordTextMatch) {
  selectedKeyword = keywordTextMatch[1].trim();
} else if (anyNumberMatch) {
  choice = parseInt(anyNumberMatch[1], 10);
} else if (anyKeywordMatch) {
  selectedKeyword = anyKeywordMatch[1].trim();
}

// Extract thread ID for tracking
const threadMatch = decodedBody.match(/thread_[\w-]+/i);
const thread_id = threadMatch?.[0] || null;

// Extract any notes or feedback
const notesMatch = decodedBody.match(/(?:notes?|feedback|suggestions?|comments?)[:：]?\s*([\s\S]*?)(?:\r?\nOn\s|\r?\n>|\r?\n?$)/i);
const notes = notesMatch ? notesMatch[1].trim() : '';

// Check if this looks like a valid response
const hasChoice = choice !== null || selectedKeyword !== null;
const isResponse = hasChoice && decodedBody.length > 0;

return [
  {
    json: {
      thread_id,
      choice,
      selectedKeyword,
      notes,
      hasChoice,
      isResponse,
      decodedBody, // Keep for debugging, remove when stable
      internalDate: $json.internalDate || null,
      emailId: $json.id,
      threadId: $json.threadId
    }
  }
]; 