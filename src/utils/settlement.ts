export interface Player {
  id: string;
  name: string;
  units: number;
  current: number;
}

export interface Settlement {
  from: string;
  to: string;
  amount: number;
}

export function calculateSettlements(players: Player[], globalBase: number): Settlement[] {
  const settlements: Settlement[] = [];
  
  // Calculate net balances
  const balances = players.map(p => ({
    name: p.name || `Player ${p.id}`,
    amount: p.current - (p.units * globalBase)
  }));

  // Separate into debtors (negative balance) and creditors (positive balance)
  let debtors = balances
    .filter(b => b.amount < -0.001) // Use small epsilon for float precision
    .map(b => ({ ...b, amount: Math.abs(b.amount) }))
    .sort((a, b) => b.amount - a.amount);
    
  let creditors = balances
    .filter(b => b.amount > 0.001)
    .sort((a, b) => b.amount - a.amount);

  // Match debtors and creditors
  let dIdx = 0;
  let cIdx = 0;

  while (dIdx < debtors.length && cIdx < creditors.length) {
    const debtor = debtors[dIdx]!;
    const creditor = creditors[cIdx]!;

    const transferAmount = Math.min(debtor.amount, creditor.amount);

    if (transferAmount > 0) {
      settlements.push({
        from: debtor.name,
        to: creditor.name,
        amount: Number(transferAmount.toFixed(2))
      });
    }

    debtor.amount -= transferAmount;
    creditor.amount -= transferAmount;

    if (debtor.amount < 0.001) dIdx++;
    if (creditor.amount < 0.001) cIdx++;
  }

  return settlements;
}
