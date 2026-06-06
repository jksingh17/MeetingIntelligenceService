import axios from 'axios';
import config from '../config';
import { logger } from '../utils/logger';

export interface MeetingInput {
  id: string;
  title: string;
  participants: string;
  transcript: string;
  meetingDate: Date;
  createdBy: string;
  aiSummary?: string | null;
  aiActionItems?: string | null;
  aiDecisions?: string | null;
  aiFollowUps?: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface AnalysisResult {
  summary: Array<{ text: string; citations: string[] }>;
  actionItems: Array<{ task: string; assignee: string; citations: string[] }>;
  decisions: Array<{ text: string; citations: string[] }>;
  followUpSuggestions: Array<{ text: string; citations: string[] }>;
}

interface TranscriptItem {
  timestamp: string;
  speaker: string;
  text: string;
}

function parseTranscript(meeting: MeetingInput): TranscriptItem[] {
  if (!meeting.transcript) return [];
  try {
    const parsed = JSON.parse(meeting.transcript as string);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function parseParticipants(meeting: MeetingInput): string[] {
  if (!meeting.participants) return [];
  try {
    const parsed = JSON.parse(meeting.participants as string);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function buildPrompt(meeting: MeetingInput): string {
  const transcript = parseTranscript(meeting);
  const transcriptJson = JSON.stringify(transcript, null, 2);
  const participantsArray = parseParticipants(meeting);
  const participantsJson = JSON.stringify(participantsArray);

  return `You are a strict meeting analyst. ONLY use information explicitly in the transcript.
Do NOT invent any attendees, tasks, decisions, or outcomes.
For each insight, provide citations as array of timestamps from the transcript.
Participants: ${participantsJson}
Transcript: ${transcriptJson}

Return JSON exactly in this shape:
{
  "summary": [{ "text": "sentence", "citations": ["00:10"] }],
  "actionItems": [{ "task": "...", "assignee": "name from transcript", "citations": ["00:20"] }],
  "decisions": [{ "text": "...", "citations": ["00:15"] }],
  "followUpSuggestions": [{ "text": "...", "citations": ["00:45"] }]
}

Do not add any explanatory text or markdown. Provide only valid JSON.`;
}

function isValidTimestamp(timestamp: string, validSet: Set<string>): boolean {
  return validSet.has(timestamp);
}

function validateAnalysis(result: AnalysisResult, meeting: MeetingInput): void {
  const transcript = parseTranscript(meeting);
  const validTimestamps = new Set(transcript.map((item) => item.timestamp));

  const participantNames = new Set<string>();
  const participantsArray = parseParticipants(meeting);
  participantsArray.forEach((name) => participantNames.add(name));
  transcript.forEach((item) => participantNames.add(item.speaker));

  const validateCitationArray = (citations: string[]): boolean =>
    Array.isArray(citations) && citations.length > 0 && citations.every((ts) => isValidTimestamp(ts, validTimestamps));

  for (const entry of result.summary) {
    if (!entry.text || !validateCitationArray(entry.citations)) {
      throw new Error('Invalid summary citations or missing text');
    }
  }

  for (const item of result.actionItems) {
    if (!item.task || !item.assignee || !validateCitationArray(item.citations)) {
      throw new Error('Invalid action item structure or citations');
    }
    const normalizedAssignee = item.assignee.trim();
    const found = Array.from(participantNames).some(
      (name) => name.toLowerCase() === normalizedAssignee.toLowerCase()
    );
    if (!found) {
      throw new Error(`Action item assignee appears hallucinated: ${item.assignee}`);
    }
  }

  for (const decision of result.decisions) {
    if (!decision.text || !validateCitationArray(decision.citations)) {
      throw new Error('Invalid decision structure or citations');
    }
  }

  for (const followUp of result.followUpSuggestions) {
    if (!followUp.text || !validateCitationArray(followUp.citations)) {
      throw new Error('Invalid follow-up suggestion structure or citations');
    }
  }
}

export async function analyzeMeetingTranscript(meeting: MeetingInput): Promise<AnalysisResult> {
  const prompt = buildPrompt(meeting);

  const requestBody = {
    model: 'gpt-4.1-mini',
    messages: [
      { role: 'system', content: 'You are a reliable meeting analysis engine.' },
      { role: 'user', content: prompt },
    ],
    temperature: 0.2,
    max_tokens: 1100,
  };

  const response = await axios.post('https://api.openai.com/v1/chat/completions', requestBody, {
    headers: {
      Authorization: `Bearer ${config.openAiApiKey}`,
      'Content-Type': 'application/json',
    },
  });

  const raw = response.data?.choices?.[0]?.message?.content;
  if (!raw || typeof raw !== 'string') {
    throw new Error('Invalid AI response format');
  }

  let parsed: AnalysisResult;
  try {
    const start = raw.indexOf('{');
    const end = raw.lastIndexOf('}');
    const jsonString = start >= 0 && end >= 0 ? raw.slice(start, end + 1) : raw;
    parsed = JSON.parse(jsonString) as AnalysisResult;
  } catch (parseError) {
    logger.error({ rawResponse: raw }, 'Failed to parse AI response');
    throw new Error('AI did not return valid JSON. Retry or check prompt design.');
  }

  validateAnalysis(parsed, meeting);
  return parsed;
}