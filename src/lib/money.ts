// Money helpers. All amounts in the CRM domain are stored as bigint
// cents in the database. We mirror that as `number` in TypeScript since
// cent amounts in this business will not exceed Number.MAX_SAFE_INTEGER.

export function dollarsToCents(dollars: number): number {
  return Math.round(dollars * 100);
}

export function centsToDollars(cents: number): number {
  return cents / 100;
}

export function formatCents(cents: number | null | undefined): string {
  if (cents == null) return '$0.00';
  return centsToDollars(cents).toLocaleString('en-US', {
    style: 'currency',
    currency: 'USD'
  });
}

export function parseMoneyInput(input: string): number {
  const digits = input.replace(/[^0-9.-]/g, '');
  const parsed = parseFloat(digits);
  if (Number.isNaN(parsed)) return 0;
  return dollarsToCents(parsed);
}
