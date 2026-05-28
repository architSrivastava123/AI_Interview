/**
 * tests/utils/gemini.test.js
 *
 * Tests the Gemini AI client configuration and chat session setup.
 * Mocks @google/generative-ai to avoid real API calls.
 * Verifies that the module is configured correctly with safety settings,
 * generation config, and the expected model name.
 */

const mockSendMessage = jest.fn().mockResolvedValue({
  response: { text: jest.fn().mockResolvedValue('{"questions": []}') },
});

const mockStartChat = jest.fn().mockReturnValue({ sendMessage: mockSendMessage });
const mockGetGenerativeModel = jest.fn().mockReturnValue({ startChat: mockStartChat });
const MockGoogleGenerativeAI = jest.fn().mockImplementation(() => ({
  getGenerativeModel: mockGetGenerativeModel,
}));

jest.mock('@google/generative-ai', () => ({
  GoogleGenerativeAI: MockGoogleGenerativeAI,
  HarmCategory: {
    HARM_CATEGORY_HARASSMENT: 'HARM_CATEGORY_HARASSMENT',
    HARM_CATEGORY_HATE_SPEECH: 'HARM_CATEGORY_HATE_SPEECH',
    HARM_CATEGORY_SEXUALLY_EXPLICIT: 'HARM_CATEGORY_SEXUALLY_EXPLICIT',
    HARM_CATEGORY_DANGEROUS_CONTENT: 'HARM_CATEGORY_DANGEROUS_CONTENT',
  },
  HarmBlockThreshold: {
    BLOCK_MEDIUM_AND_ABOVE: 'BLOCK_MEDIUM_AND_ABOVE',
  },
}));

describe('utils/GeminiAIModal — client configuration', () => {
  let chatSession;

  beforeAll(() => {
    jest.resetModules();
    // Re-register mock after reset
    jest.mock('@google/generative-ai', () => ({
      GoogleGenerativeAI: MockGoogleGenerativeAI,
      HarmCategory: {
        HARM_CATEGORY_HARASSMENT: 'HARM_CATEGORY_HARASSMENT',
        HARM_CATEGORY_HATE_SPEECH: 'HARM_CATEGORY_HATE_SPEECH',
        HARM_CATEGORY_SEXUALLY_EXPLICIT: 'HARM_CATEGORY_SEXUALLY_EXPLICIT',
        HARM_CATEGORY_DANGEROUS_CONTENT: 'HARM_CATEGORY_DANGEROUS_CONTENT',
      },
      HarmBlockThreshold: {
        BLOCK_MEDIUM_AND_ABOVE: 'BLOCK_MEDIUM_AND_ABOVE',
      },
    }));
    chatSession = require('../../utils/GeminiAIModal').chatSession;
  });

  test('GoogleGenerativeAI constructor is called once', () => {
    expect(MockGoogleGenerativeAI).toHaveBeenCalledTimes(1);
  });

  test('getGenerativeModel is called with gemini model name', () => {
    expect(mockGetGenerativeModel).toHaveBeenCalledWith(
      expect.objectContaining({ model: expect.stringContaining('gemini') })
    );
  });

  test('startChat is called with generationConfig', () => {
    expect(mockStartChat).toHaveBeenCalledWith(
      expect.objectContaining({ generationConfig: expect.any(Object) })
    );
  });

  test('startChat is called with safetySettings array', () => {
    const [callArg] = mockStartChat.mock.calls[0];
    expect(callArg.safetySettings).toBeInstanceOf(Array);
    expect(callArg.safetySettings.length).toBe(4);
  });

  test('safetySettings includes all 4 harm categories', () => {
    const [callArg] = mockStartChat.mock.calls[0];
    const categories = callArg.safetySettings.map(s => s.category);
    expect(categories).toContain('HARM_CATEGORY_HARASSMENT');
    expect(categories).toContain('HARM_CATEGORY_HATE_SPEECH');
    expect(categories).toContain('HARM_CATEGORY_SEXUALLY_EXPLICIT');
    expect(categories).toContain('HARM_CATEGORY_DANGEROUS_CONTENT');
  });

  test('all safetySettings use BLOCK_MEDIUM_AND_ABOVE threshold', () => {
    const [callArg] = mockStartChat.mock.calls[0];
    callArg.safetySettings.forEach(s => {
      expect(s.threshold).toBe('BLOCK_MEDIUM_AND_ABOVE');
    });
  });

  test('generationConfig has temperature property', () => {
    const [callArg] = mockStartChat.mock.calls[0];
    expect(callArg.generationConfig).toHaveProperty('temperature');
  });

  test('generationConfig has maxOutputTokens property', () => {
    const [callArg] = mockStartChat.mock.calls[0];
    expect(callArg.generationConfig).toHaveProperty('maxOutputTokens');
  });

  test('chatSession is exported and has sendMessage method', () => {
    expect(chatSession).toBeDefined();
    expect(typeof chatSession.sendMessage).toBe('function');
  });

  test('chatSession.sendMessage returns a response object', async () => {
    const result = await chatSession.sendMessage('test prompt');
    expect(result).toHaveProperty('response');
    expect(typeof result.response.text).toBe('function');
  });

  test('chatSession.sendMessage text() returns a string', async () => {
    const result = await chatSession.sendMessage('hello');
    const text = await result.response.text();
    expect(typeof text).toBe('string');
  });
});
