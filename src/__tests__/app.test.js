const { OpenAIProvider, AnthropicProvider } = require('../../app');

describe('AI Providers', () => {
  describe('OpenAIProvider', () => {
    const provider = new OpenAIProvider();

    test('should be initialized with API key', () => {
      expect(provider.apiKey).toBeDefined();
      expect(provider.endpoint).toBe('https://api.openai.com/v1/completions');
    });
  });

  describe('AnthropicProvider', () => {
    const provider = new AnthropicProvider();

    test('should be initialized with API key', () => {
      expect(provider.apiKey).toBeDefined();
      expect(provider.endpoint).toBe('https://api.anthropic.com/v1/completions');
    });
  });
});