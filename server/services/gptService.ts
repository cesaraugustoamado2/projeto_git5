import axios from "axios";

/**
 * Configuração do serviço GPT
 */
interface GPTConfig {
  apiKey: string;
  model: string;
  temperature: number;
  maxTokens: number;
}

/**
 * Mensagem no formato OpenAI
 */
interface Message {
  role: "system" | "user" | "assistant";
  content: string;
}

/**
 * Função para ser chamada pela IA
 */
interface FunctionDefinition {
  name: string;
  description: string;
  parameters: {
    type: string;
    properties: Record<string, any>;
    required: string[];
  };
}

/**
 * Resposta da IA
 */
interface GPTResponse {
  content: string;
  functionCall?: {
    name: string;
    arguments: Record<string, any>;
  };
  finishReason: string;
}

/**
 * Serviço de integração com OpenAI GPT-4o-mini
 */
export class GPTService {
  private config: GPTConfig;
  private apiUrl = "https://api.openai.com/v1/chat/completions";

  constructor(config: GPTConfig) {
    this.config = config;
    if (!config.apiKey) {
      throw new Error("OpenAI API key is required");
    }
  }

  /**
   * Fazer uma chamada ao GPT com suporte a function calling
   */
  async chat(
    messages: Message[],
    functions?: FunctionDefinition[]
  ): Promise<GPTResponse> {
    try {
      const payload: any = {
        model: this.config.model,
        messages,
        temperature: this.config.temperature,
        max_tokens: this.config.maxTokens,
      };

      // Adicionar funções se fornecidas
      if (functions && functions.length > 0) {
        payload.tools = functions.map((fn) => ({
          type: "function",
          function: fn,
        }));
        payload.tool_choice = "auto";
      }

      const response = await axios.post(this.apiUrl, payload, {
        headers: {
          Authorization: `Bearer ${this.config.apiKey}`,
          "Content-Type": "application/json",
        },
      });

      const choice = response.data.choices[0];

      // Verificar se houve function call
      if (choice.message.tool_calls && choice.message.tool_calls.length > 0) {
        const toolCall = choice.message.tool_calls[0];
        return {
          content: choice.message.content || "",
          functionCall: {
            name: toolCall.function.name,
            arguments: JSON.parse(toolCall.function.arguments),
          },
          finishReason: choice.finish_reason,
        };
      }

      return {
        content: choice.message.content || "",
        finishReason: choice.finish_reason,
      };
    } catch (error) {
      console.error("[GPTService] Error calling OpenAI API:", error);
      throw error;
    }
  }

  /**
   * Conversar com histórico de mensagens
   */
  async converse(
    userMessage: string,
    conversationHistory: Message[],
    systemPrompt: string,
    functions?: FunctionDefinition[]
  ): Promise<GPTResponse> {
    // Construir histórico com system prompt
    const messages: Message[] = [
      {
        role: "system",
        content: systemPrompt,
      },
      ...conversationHistory,
      {
        role: "user",
        content: userMessage,
      },
    ];

    return this.chat(messages, functions);
  }

  /**
   * Gerar resposta de vendas com function calling
   */
  async generateSalesResponse(
    userMessage: string,
    conversationHistory: Message[],
    systemPrompt: string,
    autoescolaContext: {
      nome: string;
      precos: {
        aulaTeoria: number;
        aulaManobra: number;
        aulaRua: number;
        matricula: number;
      };
      servicos: string;
    }
  ): Promise<GPTResponse> {
    // Definir funções disponíveis para a IA
    const functions: FunctionDefinition[] = [
      {
        name: "registrar_venda",
        description:
          "Registrar uma venda quando o cliente demonstrar interesse em comprar um serviço",
        parameters: {
          type: "object",
          properties: {
            tipoServico: {
              type: "string",
              enum: ["aula_teoria", "aula_manobra", "aula_rua", "matricula"],
              description: "Tipo de serviço que o cliente deseja",
            },
            valor: {
              type: "number",
              description: "Valor do serviço",
            },
            confianca: {
              type: "number",
              minimum: 0,
              maximum: 1,
              description:
                "Nível de confiança de que o cliente realmente quer comprar (0-1)",
            },
          },
          required: ["tipoServico", "valor"],
        },
      },
      {
        name: "agendar_aula",
        description: "Agendar uma aula para o cliente",
        parameters: {
          type: "object",
          properties: {
            tipoAula: {
              type: "string",
              enum: ["teoria", "manobra", "rua"],
              description: "Tipo de aula a agendar",
            },
            dataPreferida: {
              type: "string",
              description: "Data preferida para a aula (formato: YYYY-MM-DD)",
            },
            horarioPreferido: {
              type: "string",
              description: "Horário preferido (formato: HH:MM)",
            },
          },
          required: ["tipoAula"],
        },
      },
    ];

    // Enriquecer system prompt com contexto da autoescola
    const enrichedSystemPrompt = `${systemPrompt}

CONTEXTO DA AUTOESCOLA:
- Nome: ${autoescolaContext.nome}
- Preços:
  * Aula de Teoria: R$ ${autoescolaContext.precos.aulaTeoria.toFixed(2)}
  * Aula de Manobra: R$ ${autoescolaContext.precos.aulaManobra.toFixed(2)}
  * Aula de Rua: R$ ${autoescolaContext.precos.aulaRua.toFixed(2)}
  * Matrícula: R$ ${autoescolaContext.precos.matricula.toFixed(2)}
- Serviços: ${autoescolaContext.servicos}

INSTRUÇÕES IMPORTANTES:
1. Use as funções disponíveis quando apropriado
2. Registre vendas quando o cliente demonstrar interesse claro
3. Seja persuasivo mas honesto
4. Responda sempre em português brasileiro
5. Mantenha um tom amigável e profissional`;

    return this.converse(
      userMessage,
      conversationHistory,
      enrichedSystemPrompt,
      functions
    );
  }
}

/**
 * Factory para criar instância do GPT Service
 */
export function createGPTService(
  apiKey: string,
  model: string = "gpt-4o-mini",
  temperature: number = 0.7,
  maxTokens: number = 500
): GPTService {
  return new GPTService({
    apiKey,
    model,
    temperature,
    maxTokens,
  });
}
