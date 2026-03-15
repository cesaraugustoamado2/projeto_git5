import type { Request, Response } from "express";
import { whatsappService } from "../services/whatsappService";

/**
 * Webhook para receber mensagens do WhatsApp Cloud API
 * 
 * Fluxo:
 * 1. Validar token do Facebook
 * 2. Identificar autoescola pelo número de destino
 * 3. Buscar/criar cliente no banco
 * 4. Adicionar mensagem à fila de processamento
 * 5. Retornar 200 OK imediatamente (não bloquear)
 */
export async function handleWhatsappWebhook(
  req: Request,
  res: Response
): Promise<void> {
  try {
    // Validar token do Facebook
    const token = req.query.hub_verify_token as string;
    const challenge = req.query.hub_challenge as string;

    if (req.method === "GET") {
      // Verificação inicial do webhook
      if (token === process.env.WHATSAPP_WEBHOOK_TOKEN) {
        res.status(200).send(challenge);
        return;
      } else {
        res.status(403).json({ error: "Invalid verification token" });
        return;
      }
    }

    if (req.method !== "POST") {
      res.status(405).json({ error: "Method not allowed" });
      return;
    }

    // Validar estrutura da mensagem
    const body = req.body;
    if (!body.entry || !Array.isArray(body.entry)) {
      res.status(400).json({ error: "Invalid message format" });
      return;
    }

    // Processar cada entrada
    for (const entry of body.entry) {
      if (!entry.changes || !Array.isArray(entry.changes)) continue;

      for (const change of entry.changes) {
        if (change.field !== "messages") continue;

        const value = change.value;
        if (!value.messages || value.messages.length === 0) continue;

        // Processar cada mensagem
        for (const message of value.messages) {
          // Apenas processar mensagens de texto
          if (message.type !== "text") continue;

          try {
            await processarMensagemWhatsapp(
              message,
              value.contacts?.[0],
              value.metadata
            );
          } catch (error) {
            console.error("[WhatsappController] Error processing message:", error);
            // Continuar processando outras mensagens
          }
        }
      }
    }

    // Retornar 200 OK imediatamente para evitar retry do Facebook
    res.status(200).json({ success: true });
  } catch (error) {
    console.error("[WhatsappController] Error in webhook:", error);
    res.status(500).json({ error: "Internal server error" });
  }
}

/**
 * Processar mensagem individual do WhatsApp
 */
async function processarMensagemWhatsapp(
  message: any,
  contact: any,
  metadata: any
): Promise<void> {
  const { id: messageId, from, timestamp, text } = message;
  const { display_phone_number: phoneNumber } = metadata;
  const clienteNome = contact?.profile?.name || "Cliente";
  const clienteTelefone = from;

  console.log(
    `[WhatsappController] Mensagem recebida de ${clienteTelefone}: ${text.body}`
  );

  // Aqui você adicionaria à fila BullMQ
  // Por enquanto, apenas log
}

/**
 * Endpoint para enviar mensagem de teste
 */
export async function sendTestMessage(
  req: Request,
  res: Response
): Promise<void> {
  try {
    const { autoescolaId, clienteWhatsappId, mensagem } = req.body;

    if (!autoescolaId || !clienteWhatsappId || !mensagem) {
      res.status(400).json({
        error: "Missing required fields: autoescolaId, clienteWhatsappId, mensagem",
      });
      return;
    }

    // Validar acesso do tenant
    if (req.tenant?.autoescolaId !== autoescolaId) {
      res.status(403).json({ error: "Unauthorized" });
      return;
    }

    // Enviar mensagem
    const resultado = await whatsappService.enviarMensagem(
      autoescolaId,
      clienteWhatsappId,
      mensagem
    );

    res.status(200).json({
      success: true,
      messageId: resultado.messageId,
    });
  } catch (error) {
    console.error("[WhatsappController] Error sending test message:", error);
    res.status(500).json({ error: "Failed to send message" });
  }
}

/**
 * Endpoint para obter status de mensagem
 */
export async function getMessageStatus(
  req: Request,
  res: Response
): Promise<void> {
  try {
    const { messageId } = req.params;

    if (!messageId) {
      res.status(400).json({ error: "Missing messageId" });
      return;
    }

    // Aqui você buscaria o status do banco de dados
    res.status(200).json({
      messageId,
      status: "sent", // ou "delivered", "read", "failed"
    });
  } catch (error) {
    console.error("[WhatsappController] Error getting message status:", error);
    res.status(500).json({ error: "Failed to get message status" });
  }
}

/**
 * Endpoint para listar conversas de uma autoescola
 */
export async function listarConversas(
  req: Request,
  res: Response
): Promise<void> {
  try {
    if (!req.tenant) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }

    const { page = 1, limit = 20 } = req.query;
    const skip = ((Number(page) || 1) - 1) * (Number(limit) || 20);

    // Aqui você buscaria as conversas do banco de dados
    res.status(200).json({
      conversas: [],
      total: 0,
      page: Number(page) || 1,
      limit: Number(limit) || 20,
    });
  } catch (error) {
    console.error("[WhatsappController] Error listing conversations:", error);
    res.status(500).json({ error: "Failed to list conversations" });
  }
}
