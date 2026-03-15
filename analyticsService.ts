import { getDb } from '../db';

/**
 * Serviço de analytics para rastreamento de eventos e métricas
 */

export interface AnalyticsEvent {
  autoescolaId: string;
  eventType: 'cliente_criado' | 'conversa_iniciada' | 'venda_registrada' | 'mensagem_enviada' | 'login' | 'logout';
  metadata?: Record<string, any>;
  timestamp: Date;
}

export interface MetricasDiarias {
  autoescolaId: string;
  data: Date;
  totalClientes: number;
  totalConversas: number;
  totalVendas: number;
  valorTotalVendas: number;
  mensagensEnviadas: number;
  taxaConversao: number;
}

/**
 * Registra um evento de analytics
 */
export async function rastrearEvento(evento: AnalyticsEvent): Promise<void> {
  const db = await getDb();
  if (!db) {
    console.warn('[Analytics] Database not available');
    return;
  }

  try {
    // Aqui você salvaria no banco de dados
    // await db.analyticsEvent.create({
    //   data: {
    //     autoescolaId: evento.autoescolaId,
    //     eventType: evento.eventType,
    //     metadata: evento.metadata,
    //     timestamp: evento.timestamp,
    //   },
    // });

    console.log(`[Analytics] Evento registrado: ${evento.eventType} para ${evento.autoescolaId}`);
  } catch (error) {
    console.error('[Analytics] Erro ao registrar evento:', error);
  }
}

/**
 * Obtém métricas diárias de uma autoescola
 */
export async function obterMetricasDiarias(
  autoescolaId: string,
  data: Date
): Promise<MetricasDiarias> {
  const db = await getDb();
  if (!db) {
    throw new Error('Database not available');
  }

  const inicioDodia = new Date(data);
  inicioDodia.setHours(0, 0, 0, 0);

  const fimDodia = new Date(data);
  fimDodia.setHours(23, 59, 59, 999);

  try {
    // Contar clientes criados hoje
    const clientesCriados = await db.cliente.count({
      where: {
        autoescolaId,
        createdAt: {
          gte: inicioDodia,
          lte: fimDodia,
        },
      },
    });

    // Contar conversas iniciadas hoje
    const conversasIniciadas = await db.conversa.count({
      where: {
        autoescolaId,
        createdAt: {
          gte: inicioDodia,
          lte: fimDodia,
        },
      },
    });

    // Contar vendas registradas hoje
    const vendasRegistradas = await db.venda.count({
      where: {
        autoescolaId,
        createdAt: {
          gte: inicioDodia,
          lte: fimDodia,
        },
      },
    });

    // Calcular valor total de vendas
    const vendas = await db.venda.findMany({
      where: {
        autoescolaId,
        createdAt: {
          gte: inicioDodia,
          lte: fimDodia,
        },
      },
      select: { valor: true },
    });

    const valorTotalVendas = vendas.reduce((sum: number, venda: any) => sum + venda.valor, 0);

    // Contar mensagens enviadas
    const mensagensEnviadas = await db.mensagem.count({
      where: {
        conversa: {
          autoescolaId,
        },
        remetente: 'ia',
        createdAt: {
          gte: inicioDodia,
          lte: fimDodia,
        },
      },
    });

    // Calcular taxa de conversão
    const totalClientes = await db.cliente.count({
      where: { autoescolaId },
    });

    const taxaConversao = totalClientes > 0 ? (vendasRegistradas / totalClientes) * 100 : 0;

    return {
      autoescolaId,
      data,
      totalClientes: clientesCriados,
      totalConversas: conversasIniciadas,
      totalVendas: vendasRegistradas,
      valorTotalVendas,
      mensagensEnviadas,
      taxaConversao: parseFloat(taxaConversao.toFixed(2)),
    };
  } catch (error) {
    console.error('[Analytics] Erro ao obter métricas:', error);
    throw error;
  }
}

/**
 * Obtém métricas de um período
 */
export async function obterMetricasPeriodo(
  autoescolaId: string,
  dataInicio: Date,
  dataFim: Date
): Promise<MetricasDiarias[]> {
  const metricas: MetricasDiarias[] = [];
  const dataAtual = new Date(dataInicio);

  while (dataAtual <= dataFim) {
    const metrica = await obterMetricasDiarias(autoescolaId, new Date(dataAtual));
    metricas.push(metrica);
    dataAtual.setDate(dataAtual.getDate() + 1);
  }

  return metricas;
}

/**
 * Obtém estatísticas gerais de uma autoescola
 */
export async function obterEstatisticasGerais(autoescolaId: string) {
  const db = await getDb();
  if (!db) {
    throw new Error('Database not available');
  }

  try {
    const totalClientes = await db.cliente.count({
      where: { autoescolaId },
    });

    const totalConversas = await db.conversa.count({
      where: { autoescolaId },
    });

    const totalVendas = await db.venda.count({
      where: { autoescolaId },
    });

    const vendas = await db.venda.findMany({
      where: { autoescolaId },
      select: { valor: true },
    });

    const valorTotalVendas = vendas.reduce((sum: number, venda: { valor: number }) => sum + venda.valor, 0);

    const clientesAtivos = await db.cliente.count({
      where: {
        autoescolaId,
        status: 'ativo',
      },
    });

    return {
      totalClientes,
      totalConversas,
      totalVendas,
      valorTotalVendas,
      clientesAtivos,
      taxaConversao: totalClientes > 0 ? ((totalVendas / totalClientes) * 100).toFixed(2) : '0',
      vendaMedia: totalVendas > 0 ? (valorTotalVendas / totalVendas).toFixed(2) : '0',
    };
  } catch (error) {
    console.error('[Analytics] Erro ao obter estatísticas:', error);
    throw error;
  }
}
