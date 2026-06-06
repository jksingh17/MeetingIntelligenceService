import { validateAnalysis, MeetingInput } from '../src/services/aiService';

// Mock meeting with JSON strings (as stored in DB)
const meetingMock: MeetingInput = {
  id: 'test',
  title: 'Team Sync',
  meetingDate: new Date(),
  participants: JSON.stringify(['alice@example.com', 'bob@example.com']),
  transcript: JSON.stringify([
    { timestamp: '00:10', speaker: 'Alice', text: 'We need to update the roadmap.' },
    { timestamp: '00:20', speaker: 'Bob', text: 'I can own the API work.' },
  ]),
  aiSummary: null,
  aiActionItems: null,
  aiDecisions: null,
  aiFollowUps: null,
  createdAt: new Date(),
  updatedAt: new Date(),
  createdBy: 'user-1',
};

test('validateAnalysis accepts a grounded response', () => {
  const response = {
    summary: [{ text: 'The team agreed to update the roadmap.', citations: ['00:10'] }],
    actionItems: [{ task: 'Own API work', assignee: 'Bob', citations: ['00:20'] }],
    decisions: [{ text: 'Proceed with roadmap updates.', citations: ['00:10'] }],
    followUpSuggestions: [{ text: 'Share the updated plan next week.', citations: ['00:20'] }],
  };
  expect(() => validateAnalysis(response as any, meetingMock)).not.toThrow();
});

test('validateAnalysis rejects missing citation timestamps', () => {
  const response = {
    summary: [{ text: 'The team agreed to update the roadmap.', citations: ['00:30'] }],
    actionItems: [{ task: 'Own API work', assignee: 'Bob', citations: ['00:20'] }],
    decisions: [{ text: 'Proceed with roadmap updates.', citations: ['00:10'] }],
    followUpSuggestions: [{ text: 'Share the updated plan next week.', citations: ['00:20'] }],
  };
  expect(() => validateAnalysis(response as any, meetingMock)).toThrow(/citations/);
});

test('validateAnalysis rejects hallucinated assignee', () => {
  const response = {
    summary: [{ text: 'The team agreed to update the roadmap.', citations: ['00:10'] }],
    actionItems: [{ task: 'Own API work', assignee: 'Charlie', citations: ['00:20'] }],
    decisions: [{ text: 'Proceed with roadmap updates.', citations: ['00:10'] }],
    followUpSuggestions: [{ text: 'Share the updated plan next week.', citations: ['00:20'] }],
  };
  expect(() => validateAnalysis(response as any, meetingMock)).toThrow(/hallucinated/);
});