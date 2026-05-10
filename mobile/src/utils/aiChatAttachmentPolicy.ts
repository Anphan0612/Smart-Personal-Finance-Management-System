import type { ChatMessage } from '../store/useAppStore';

function looksLikeAggregateSpendingNarrative(text: string): boolean {
  const n = text.toLowerCase();
  return (
    n.includes('tổng quan') ||
    n.includes('tong quan') ||
    n.includes('tổng chi tiêu') ||
    n.includes('tong chi tieu') ||
    n.includes('số giao dịch') ||
    n.includes('so giao dich') ||
    n.includes('danh mục chi tiêu') ||
    n.includes('danh muc chi tieu') ||
    n.includes('tổng thu nhập') ||
    n.includes('tong thu nhap') ||
    n.includes('chi tiêu tháng') ||
    n.includes('chi tieu thang')
  );
}

/**
 * Per-transaction confirm cards are for drill-down; hide them for concise monthly / aggregate answers.
 */
export function shouldRenderAiChatTransactionCards(message: ChatMessage): boolean {
  if (message.role !== 'assistant' || !message.data?.transactions?.length) {
    return false;
  }

  const t = (message.type || '').toUpperCase();
  if (t === 'SUMMARY') {
    return false;
  }

  const attach = (message.data as any)?.attachTransactionCards;
  if (attach === false) {
    return false;
  }

  if (t === 'QUERY' && looksLikeAggregateSpendingNarrative(message.content)) {
    return false;
  }

  return true;
}

function hasBudgetWidgetSummary(summary: unknown): boolean {
  if (!summary || typeof summary !== 'object') return false;
  const s = summary as Record<string, unknown>;
  return typeof s.budgetLimit === 'number' && typeof s.percentage === 'number';
}

/**
 * One consolidated report frame (text + optional metrics) instead of many transaction cards.
 */
export function shouldShowChatOverviewCard(message: ChatMessage): boolean {
  if (message.role !== 'assistant' || !message.content?.trim()) {
    return false;
  }
  if (message.type === 'review_transaction') {
    return false;
  }
  if (message.type === 'INSIGHT_CHART' && message.data?.chartData) {
    return false;
  }
  if (shouldRenderAiChatTransactionCards(message)) {
    return false;
  }
  if (message.type === 'SUMMARY' && hasBudgetWidgetSummary(message.data?.summary)) {
    return false;
  }

  const attach = (message.data as any)?.attachTransactionCards;
  if (attach === false) {
    return true;
  }
  if (looksLikeAggregateSpendingNarrative(message.content)) {
    return true;
  }
  const s = message.data?.summary as Record<string, unknown> | undefined;
  if (s && typeof s.totalSpent === 'number' && typeof s.transactionCount === 'number') {
    return true;
  }
  if (message.type === 'SUMMARY' && message.data?.summary) {
    return true;
  }
  return false;
}
