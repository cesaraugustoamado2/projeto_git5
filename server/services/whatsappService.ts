import axios from "axios";
import { getDb, getAutoescolaById } from "../db";

/**
 * Interface para resposta de envio de mensagem
 */
interface EnvioMensagemResult {
  messageId: string;
  status: string;
}

/**
 * Serviço de integração com WhatsApp Cloud API
 */
class WhatsappService {
  private apiUrl = "https://graph.instagram.com/v18.0";

  /**
   * Enviar mensagem de texto via WhatsApp
   */
  async enviarMensagem(
    autoescolaId: string,
    clienteWhatsappId: string,
    mensagem: string
  ): Promise<EnvioMensagemResult> {
    try {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      // Obter configurações da autoescola
      const autoescola = await getAutoescolaById(autoescolaId);
      if (!autoescola) throw new Error("Autoescola not found");

      const config = autoescola.configuracoes?.[0];
      if (!config || !config.whatsappToken) {
        throw new Error("WhatsApp configuration not found");
      }

      // Construir URL da API
      const url = `${this.apiUrl}/${autoescola.whatsappBusinessId}/messages`;

      // Payload da mensagem
      const payload = {
        messaging_product: "whatsapp",
        to: clienteWhatsappId,
        type: "text",
        text: {
          preview_url: true,
          body: mensagem,
        },
      };

      // Enviar requisição
      const response = await axios.post(url, payload, {
        headers: {
          Authorization: `Bearer ${config.whatsappToken}`,
          "Content-Type": "application/json",
        },
      });

      console.log(
        `[WhatsappService] Mensagem enviada para ${clienteWhatsappId}: ${response.data.messages[0].id}`
      );

      return {
        messageId: response.data.messages[0].id,
        status: "sent",
      };
    } catch (error) {
      console.error("[WhatsappService] Error sending message:", error);
      throw error;
    }
  }

  /**
   * Enviar mensagem com template
   */
  async enviarMensagemTemplate(
    autoescolaId: string,
    clienteWhatsappId: string,
    templateName: string,
    parameters?: Record<string, string>
  ): Promise<EnvioMensagemResult> {
    try {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      // Obter configurações da autoescola
      const autoescola = await getAutoescolaById(autoescolaId);
      if (!autoescola) throw new Error("Autoescola not found");

      const config = autoescola.configuracoes?.[0];
      if (!config || !config.whatsappToken) {
        throw new Error("WhatsApp configuration not found");
      }

      // Construir URL da API
      const url = `${this.apiUrl}/${autoescola.whatsappBusinessId}/messages`;

      // Payload da mensagem com template
      const payload: any = {
        messaging_product: "whatsapp",
        to: clienteWhatsappId,
        type: "template",
        template: {
          name: templateName,
        },
      };

      // Adicionar parâmetros se fornecidos
      if (parameters) {
        payload.template.parameters = {
          body: {
            parameters: Object.values(parameters),
          },
        };
      }

      // Enviar requisição
      const response = await axios.post(url, payload, {
        headers: {
          Authorization: `Bearer ${config.whatsappToken}`,
          "Content-Type": "application/json",
        },
      });

      console.log(
        `[WhatsappService] Template enviado para ${clienteWhatsappId}: ${response.data.messages[0].id}`
      );

      return {
        messageId: response.data.messages[0].id,
        status: "sent",
      };
    } catch (error) {
      console.error("[WhatsappService] Error sending template:", error);
      throw error;
    }
  }

  /**
   * Enviar mensagem com imagem
   */
  async enviarMensagemComImagem(
    autoescolaId: string,
    clienteWhatsappId: string,
    imagemUrl: string,
    caption?: string
  ): Promise<EnvioMensagemResult> {
    try {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      // Obter configurações da autoescola
      const autoescola = await getAutoescolaById(autoescolaId);
      if (!autoescola) throw new Error("Autoescola not found");

      const config = autoescola.configuracoes?.[0];
      if (!config || !config.whatsappToken) {
        throw new Error("WhatsApp configuration not found");
      }

      // Construir URL da API
      const url = `${this.apiUrl}/${autoescola.whatsappBusinessId}/messages`;

      // Payload da mensagem com imagem
      const payload: any = {
        messaging_product: "whatsapp",
        to: clienteWhatsappId,
        type: "image",
        image: {
          link: imagemUrl,
        },
      };

      // Adicionar caption se fornecido
      if (caption) {
        payload.image.caption = caption;
      }

      // Enviar requisição
      const response = await axios.post(url, payload, {
        headers: {
          Authorization: `Bearer ${config.whatsappToken}`,
          "Content-Type": "application/json",
        },
      });

      console.log(
        `[WhatsappService] Imagem enviada para ${clienteWhatsappId}: ${response.data.messages[0].id}`
      );

      return {
        messageId: response.data.messages[0].id,
        status: "sent",
      };
    } catch (error) {
      console.error("[WhatsappService] Error sending image:", error);
      throw error;
    }
  }

  /**
   * Marcar mensagem como lida
   */
  async marcarComoLida(
    autoescolaId: string,
    messageId: string
  ): Promise<void> {
    try {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      // Obter configurações da autoescola
      const autoescola = await getAutoescolaById(autoescolaId);
      if (!autoescola) throw new Error("Autoescola not found");

      const config = autoescola.configuracoes?.[0];
      if (!config || !config.whatsappToken) {
        throw new Error("WhatsApp configuration not found");
      }

      // Construir URL da API
      const url = `${this.apiUrl}/${autoescola.whatsappBusinessId}/messages`;

      // Payload para marcar como lida
      const payload = {
        messaging_product: "whatsapp",
        status: "read",
        message_id: messageId,
      };

      // Enviar requisição
      await axios.post(url, payload, {
        headers: {
          Authorization: `Bearer ${config.whatsappToken}`,
          "Content-Type": "application/json",
        },
      });

      console.log(`[WhatsappService] Mensagem ${messageId} marcada como lida`);
    } catch (error) {
      console.error("[WhatsappService] Error marking message as read:", error);
      throw error;
    }
  }
}

// Exportar instância singleton
export const whatsappService = new WhatsappService();
