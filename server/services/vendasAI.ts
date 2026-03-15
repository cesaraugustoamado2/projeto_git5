import { GPTService } from "./gptService";
import { getDb, getAutoescolaById, addMensagemToConversa } from "../db";

/**
 * Interface para contexto de vendas
 */
interface VendasAIContext {
  autoescolaId: string;
  conversaId: string;
  clienteNome: string;
  historicoMensagens: Array<{
    role: "user" | "assistant";
    content: string;
  }>;
}

/**
 * Resultado da análise de IA
 */
interface VendasAIResult {
  resposta: string;
  vendaDetectada: boolean;
  tipoVenda?: string;
  valorVenda?: number;
  confiancaVenda?: number;
  proximosPassos?: string[];
}

/**
 * Serviço de IA para vendas
 */
export class VendasAI {
  private gptService: GPTService;
  private autoescolaId: string;

  constructor(gptService: GPTService, autoescolaId: string) {
    this.gptService = gptService;
    this.autoescolaId = autoescolaId;
  }

  /**
   * Gerar system prompt personalizado para a autoescola
   */
  private async generateSystemPrompt(): Promise<string> {
    const db = await getDb();
    if (!db) throw new Error("Database not available");

    const autoescola = await getAutoescolaById(this.autoescolaId);
    if (!autoescola) throw new Error("Autoescola not found");

    const basePrompt = autoescola.systemPrompt || 
      "Você é a assistente virtual de uma autoescola. Seu tom é amigável, prestativo e focado em fechar matrículas. Você conhece as leis de trânsito brasileiras (CFC) e o processo de tirar a CNH.";

    return `${basePrompt}

CONTEXTO DA AUTOESCOLA:
- Nome: ${autoescola.nome}
- Telefone: ${autoescola.telefone}
- Email: ${autoescola.email}

PREÇOS DOS SERVIÇOS:
- Aula de Teoria: R$ ${autoescola.precoAulaTeoria.toFixed(2)}
- Aula de Manobra: R$ ${autoescola.precoAulaManobra.toFixed(2)}
- Aula de Rua: R$ ${autoescola.precoAulaRua.toFixed(2)}
- Matrícula: R$ ${autoescola.precoMatricula.toFixed(2)}

DESCRIÇÃO DOS SERVIÇOS:
${autoescola.descricaoServicos || "Oferecemos aulas completas para obtenção da CNH, com instrutores experientes e veículos modernos."}

INSTRUÇÕES CRÍTICAS:
1. Sempre responda em português brasileiro
2. Seja amigável, prestativo e profissional
3. Quando o cliente demonstrar interesse, use a função "registrar_venda"
4. Nunca pressione o cliente, mas seja persuasivo
5. Ofereça promoções ou pacotes quando apropriado
6. Mantenha o histórico de conversa em contexto
7. Se o cliente não responder, tente diferentes abordagens
8. Sempre pergunte sobre as necessidades específicas do cliente`;
  }

  /**
   * Processar mensagem do cliente e gerar resposta de vendas
   */
  async processarMensagem(context: VendasAIContext): Promise<VendasAIResult> {
    try {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      // Validar que o contexto pertence a esta autoescola
      if (context.autoescolaId !== this.autoescolaId) {
        throw new Error("Unauthorized: tenant mismatch");
      }

      // Gerar system prompt
      const systemPrompt = await this.generateSystemPrompt();

      // Obter autoescola para contexto
      const autoescola = await getAutoescolaById(this.autoescolaId);
      if (!autoescola) throw new Error("Autoescola not found");

      // Última mensagem do cliente
      const ultimaMensagem = context.historicoMensagens[context.historicoMensagens.length - 1];
      if (!ultimaMensagem || ultimaMensagem.role !== "user") {
        throw new Error("Invalid message history: last message must be from user");
      }

      // Chamar GPT com function calling
      const gptResponse = await this.gptService.generateSalesResponse(
        ultimaMensagem.content,
        context.historicoMensagens.slice(0, -1), // Histórico sem a última mensagem
        systemPrompt,
        {
          nome: autoescola.nome,
          precos: {
            aulaTeoria: autoescola.precoAulaTeoria,
            aulaManobra: autoescola.precoAulaManobra,
            aulaRua: autoescola.precoAulaRua,
            matricula: autoescola.precoMatricula,
          },
          servicos: autoescola.descricaoServicos,
        }
      );

      // Salvar mensagem da IA no banco
      await addMensagemToConversa(this.autoescolaId, context.conversaId, {
        role: "assistant",
        content: gptResponse.content,
        tipo: gptResponse.functionCall ? "funcao" : "texto",
      });

      // Processar function call se houver
      let vendaDetectada = false;
      let tipoVenda: string | undefined;
      let valorVenda: number | undefined;
      let confiancaVenda: number | undefined;

      if (gptResponse.functionCall) {
        if (gptResponse.functionCall.name === "registrar_venda") {
          vendaDetectada = true;
          tipoVenda = gptResponse.functionCall.arguments.tipoServico;
          valorVenda = gptResponse.functionCall.arguments.valor;
          confiancaVenda = gptResponse.functionCall.arguments.confianca || 0.8;

          console.log(
            `[VendasAI] Venda detectada: ${tipoVenda} - R$ ${valorVenda} (confiança: ${confiancaVenda})`
          );
        } else if (gptResponse.functionCall.name === "agendar_aula") {
          console.log(
            `[VendasAI] Aula agendada: ${gptResponse.functionCall.arguments.tipoAula}`
          );
        }
      }

      return {
        resposta: gptResponse.content,
        vendaDetectada,
        tipoVenda,
        valorVenda,
        confiancaVenda,
        proximosPassos: this.sugerirProximosPassos(gptResponse.content),
      };
    } catch (error) {
      console.error("[VendasAI] Error processing message:", error);
      throw error;
    }
  }

  /**
   * Sugerir próximos passos baseado na resposta da IA
   */
  private sugerirProximosPassos(resposta: string): string[] {
    const passos: string[] = [];

    // Análise simples da resposta
    if (
      resposta.toLowerCase().includes("aula") ||
      resposta.toLowerCase().includes("aulas")
    ) {
      passos.push("Confirmar tipo de aula desejada");
    }

    if (
      resposta.toLowerCase().includes("preço") ||
      resposta.toLowerCase().includes("valor")
    ) {
      passos.push("Oferecer pacotes ou promoções");
    }

    if (
      resposta.toLowerCase().includes("horário") ||
      resposta.toLowerCase().includes("data")
    ) {
      passos.push("Agendar aula com cliente");
    }

    if (
      resposta.toLowerCase().includes("dúvida") ||
      resposta.toLowerCase().includes("pergunta")
    ) {
      passos.push("Esclarecer dúvidas do cliente");
    }

    if (passos.length === 0) {
      passos.push("Continuar conversação");
    }

    return passos;
  }
}

/**
 * Factory para criar instância do VendasAI
 */
export async function createVendasAI(
  autoescolaId: string,
  openaiApiKey: string
): Promise<VendasAI> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  // Obter configuração da autoescola
  const autoescola = await getAutoescolaById(autoescolaId);
  if (!autoescola) throw new Error("Autoescola not found");

  // Criar GPT Service
  const gptService = new GPTService({
    apiKey: openaiApiKey,
    model: autoescola.configuracoes?.[0]?.modeloGPT || "gpt-4o-mini",
    temperature: autoescola.configuracoes?.[0]?.temperaturaSistema || 0.7,
    maxTokens: autoescola.configuracoes?.[0]?.maxTokens || 500,
  });

  return new VendasAI(gptService, autoescolaId);
}
