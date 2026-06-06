import { validateAnalysis } from '../src/services/aiService';

const meetingMock = {
  id: 'test',
  title: 'Team Sync',
  meetingDate: new Date(),
  participants: ['alice@example.com', 'bob@example.com'],
  transcript: [
    { timestamp: '00:10', speaker: 'Alice', text: 'We need to update the roadmap.' },
    { timestamp: '00:20', speaker: 'Bob', text: 'I can own the API work.' },
  ],
  aiSummary: null,
  aiActionItems: null,
  aiDecisions: null,
  aiFollowUps: null,
  createdAt: new Date(),
  updatedAt: new Date(),
  ownerId: 'user-1',
};

test('validateAnalysis accepts a grounded response', () => {
  const response = {
    summary: [{ text: 'The team agreed to update the roadmap.', citations: ['00:10'] }],
    actionItems: [{ task: 'Own API work', assignee: 'Bob', citations: ['00:20'] }],
    decisions: [{ text: 'Proceed with roadmap updates.', citations: ['00:10'] }],
    followUpSuggestions: [{ text: 'Share the updated plan next week.', citations: ['00:20'] }],
  };
  expect(() => validateAnalysis(response as any, meetingMock as any)).not.toThrow();
});

test('validateAnalysis rejects missing citation timestamps', () => {
  const response = {
    summary: [{ text: 'The team agreed to update the roadmap.', citations: ['00:30'] }],
    actionItems: [{ task: 'Own API work', assignee: 'Bob', citations: ['00:20'] }],
    decisions: [{ text: 'Proceed with roadmap updates.', citations: ['00:10'] }],
    followUpSuggestions: [{ text: 'Share the updated plan next week.', citations: ['00:20'] }],
  };
  expect(() => validateAnalysis(response as any, meetingMock as any)).toThrow(/citations/);
});

test('validateAnalysis rejects hallucinated assignee', () => {
  const response = {
    summary: [{ text: 'The team agreed to update the roadmap.', citations: ['00:10'] }],
    actionItems: [{ task: 'Own API work', assignee: 'Charlie', citations: ['00:20'] }],
    decisions: [{ text: 'Proceed with roadmap updates.', citations: ['00:10'] }],
    followUpSuggestions: [{ text: 'Share the updated plan next week.', citations: ['00:20'] }],
  };
  expect(() => validateAnalysis(response as any, meetingMock as any)).toThrow(/hallucinated/);
});
