interface Budget {
  id: string;
  createdAt: Date;
  name: string;
  amount: number;
  emoji: string | null;
  transactions: Transaction[];
}

interface Transaction {
  id: string;
  amount: number;
  emoji: string | null;
  description: string;
  createdAt: Date;
  budgetName?: string;
  budgetId: string ;
}


