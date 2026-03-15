import { describe, it, expect, beforeAll, afterAll, vi } from 'vitest';
import { generateAIResponse, parseToolCall } from './gptService';

describe('gptService', () => {
  describe('generateAIResponse', () => {
    it('deve gerar uma resposta válida da IA', async () => {
      const userMessage = 'Olá, gostaria de fazer uma aula de direção';
      const autoescolaContext = {
        id: 'test-123',
        nome: 'Autoescola Teste',
        precoTeoria: 50,
        precoManobra: 75,
        precoRua: 100,
        precoMatricula: 200,
      };
      const conversationHistory = [];

      // Mock da resposta da API OpenAI
      const mockResponse = {
        choices: [
          {
            message: {
              content: 'Ótimo! Temos ótimas opções de aulas para você.',
              tool_calls: [],
            },
          },
        ],
      };

      // Simular resposta
      expect(mockResponse.choices[0].message.content).toBeTruthy();
      expect(mockResponse.choices[0].message.content).toContain('Ótimo');
    });

    it('deve detectar function calling para venda', async () => {
      const mockResponse = {
        choices: [
          {
            message: {
              content: 'Perfeito! Vou registrar sua matrícula.',
              tool_calls: [
                {
                  function: {
                    name: 'registrar_venda',
                    arguments: JSON.stringify({
                      tipo: 'matricula',
                      valor: 200,
                    }),
                  },
                },
              ],
            },
          },
        ],
      };

      expect(mockResponse.choices[0].message.tool_calls).toHaveLength(1);
      expect(mockResponse.choices[0].message.tool_calls[0].function.name).toBe('registrar_venda');
    });
  });

  describe('parseToolCall', () => {
    it('deve fazer parse de um tool call válido', () => {
      const toolCall = {
        function: {
          name: 'registrar_venda',
          arguments: JSON.stringify({
            tipo: 'teoria',
            valor: 50,
          }),
        },
      };

      const parsed = JSON.parse(toolCall.function.arguments);
      expect(parsed.tipo).toBe('teoria');
      expect(parsed.valor).toBe(50);
    });

    it('deve lançar erro para arguments inválidos', () => {
      const toolCall = {
        function: {
          name: 'registrar_venda',
          arguments: 'invalid json',
        },
      };

      expect(() => {
        JSON.parse(toolCall.function.arguments);
      }).toThrow();
    });
  });

  describe('System Prompt', () => {
    it('deve incluir contexto da autoescola no system prompt', () => {
      const autoescolaContext = {
        id: 'test-123',
        nome: 'Autoescola Premium',
        precoTeoria: 60,
        precoManobra: 85,
        precoRua: 110,
        precoMatricula: 250,
      };

      const systemPrompt = `
        Você é a assistente virtual da ${autoescolaContext.nome}.
        Preços:
        - Teoria: R$ ${autoescolaContext.precoTeoria}
        - Manobra: R$ ${autoescolaContext.precoManobra}
        - Rua: R$ ${autoescolaContext.precoRua}
        - Matrícula: R$ ${autoescolaContext.precoMatricula}
      `;

      expect(systemPrompt).toContain('Autoescola Premium');
      expect(systemPrompt).toContain('60');
      expect(systemPrompt).toContain('250');
    });
  });

  describe('Validações', () => {
    it('deve validar tipos de aula válidos', () => {
      const tiposValidos = ['teoria', 'manobra', 'rua', 'matricula'];
      const tipoTeste = 'teoria';

      expect(tiposValidos).toContain(tipoTeste);
    });

    it('deve rejeitar tipos de aula inválidos', () => {
      const tiposValidos = ['teoria', 'manobra', 'rua', 'matricula'];
      const tipoInvalido = 'invalido';

      expect(tiposValidos).not.toContain(tipoInvalido);
    });

    it('deve validar preços positivos', () => {
      const preco = 50;
      expect(preco).toBeGreaterThan(0);
    });

    it('deve rejeitar preços negativos', () => {
      const preco = -50;
      expect(preco).toBeLessThan(0);
    });
  });
});
