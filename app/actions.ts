"use server";

import prisma from "@/lib/prisma";

export async function checkAndAddUser(email: string |undefined) {
  if (!email) return;

  try {
    const existingUser = await prisma.user.findUnique({
      where: {
        email,
      },
    });
    if (!existingUser) {
      await prisma.user.create({
        data: {
          email,
        },
      });
        console.log("Nouvel utilisateur ajouté dans la base de données");
    } else {
      console.log("L'utilisateur existe déjà dans la base de données");
    }
  } catch (error) {
    console.error("Erreur lors de la vérification de l'utilisateur:", error);
  }
}

export async function addBudget(email: string, name: string, amount: number, selectedEmoji: string) {
 try {
  const user = await prisma.user.findUnique({
    where: { email },
  });

  if (!user) {
    throw new Error("Utilisateur non trouvé");
  }

  await prisma.budget.create({
    data: {
      name,
      amount,
      emoji : selectedEmoji,
      userId: user.id,
    },
  });

 } catch (error) {
  console.error("Erreur lors de l'ajout du budget:");
  throw error;
 }
}

export async function getBudgetsByUser(email : string){
    try {
        const user = await prisma.user.findUnique(
            {
                where : {
                    email
                },
                include : {
                    budgets : {
                        include : {
                            transactions:true
                        }
                    }
                }
            }
        )

        if(!user){
            throw new Error("Utilisateur non trouvé")
        }

        return user.budgets

    } catch (error) {
        console.error('Erreur lors de la récupération des budgets:', error);
        throw error;
    }
}

export async function getTransactionsByBudgetId(budgetId : string){
  try {
    const budget = await prisma.budget.findUnique({
      where: {
        id : budgetId
      },
      include : {
        transactions: true
      }
    })
    if(!budget){
      throw new Error('Budget non trouvé.');
    }

    return budget;
  } catch (error) {
    console.error('Erreur lors de la récupération des transactions:', error);
    throw error;
  }
}

export async function addTransactionToBudget(
  budgetId: string,
  amount: number,
  description: string
) {
  try {
    const budget = await prisma.budget.findUnique({
      where: {
        id: budgetId
      },
      include: {
        transactions: true
      }
    })

    if (!budget) {
      throw new Error('Budget non trouvé.')
    }

    const totalTransactions = budget.transactions.reduce(
      (sum: number, transaction) => {
        return sum + transaction.amount;
      },
      0,
    );

    const totalWithNewTransaction = totalTransactions + amount

    if (totalWithNewTransaction > budget.amount) {
      throw new Error(
        'Le montant total des transactions dépasse le montant du budget.'
      )
    }

    const newTransaction = await prisma.transaction.create({
      data: {
        amount,
        description,
        emoji: budget.emoji,
        budget : {
          connect : {
            id : budget.id
          }
        }
      }
    })

  } catch (error) {
    console.error("Erreur lors de l'ajout de la transaction:", error)
    throw error
  }
}

export const deleteBudget = async (budgetId: string) => {
  try {
    await prisma.transaction.deleteMany({
      where: { budgetId }
    })

    await prisma.budget.delete({
      where: {
        id: budgetId
      }
    })
  } catch (error) {
    console.error(
      'Erreur lors de la suppression du budget et de ses transactions associées: ',
      error
    )
    throw error
  }
}


export async function deleteTransaction(transactionId: string) {
  try {
    const transaction = await prisma.transaction.findUnique({
      where: {
        id: transactionId
      }
    });

    if (!transaction) {
      throw new Error('Transaction non trouvée.');
    }

    await prisma.transaction.delete({
      where: {
        id: transactionId,
      },
    });
  } catch (error) {
    console.error('Erreur lors de la suppression de la transaction:', error);
    throw error;
  }
}

export async function getTransactionsByEmailAndPeriod(
  email: string,
  period: string,
) {
  try {
    const now = new Date();
    let dateLimit: Date;

    switch (period) {
      case "last7":
        dateLimit = new Date(now);
        dateLimit.setDate(now.getDate() - 7);
        break;
      case "last30":
        dateLimit = new Date(now);
        dateLimit.setDate(now.getDate() - 30);
        break;
      case "last90":
        dateLimit = new Date(now);
        dateLimit.setDate(now.getDate() - 90);
        break;
      case "last360":
        dateLimit = new Date(now);
        dateLimit.setFullYear(now.getFullYear() - 1);
        break;
      default:
        throw new Error("Période invalide.");
    }

    const user = await prisma.user.findUnique({
      where: { email },
      include: {
        budgets: {
          include: {
            transactions: {
              where: {
                createdAt: {
                  gte: dateLimit,
                },
              },
              orderBy: {
                createdAt: "desc",
              },
            },
          },
        },
      },
    });

    if (!user) {
      throw new Error("Utilisateur non trouvé.");
    }

    const transactions = user.budgets.flatMap((budget) =>
      budget.transactions.map((transaction) => ({
        ...transaction,
        budgetName: budget.name,
      })),
    );

    return transactions;
  } catch (error) {
    console.error("Erreur lors de la récupération des transactions:", error);
    throw error;
  }
}



export async function getDashboardData(email: string) {
  try {
    const user = await prisma.user.findUnique({
      where: { email },
      include: {
        budgets: {
          orderBy: { createdAt: "desc" },
          include: {
            transactions: {
              orderBy: { createdAt: "desc" },
            },
          },
        },
      },
    });

    if (!user) {
      throw new Error("Utilisateur non trouvé.");
    }

    // KPI globaux 
    const totalSpent = user.budgets.reduce(
      (s, b) => s + b.transactions.reduce((ss, t) => ss + t.amount, 0),
      0,
    );

    const transactionsCount = user.budgets.reduce(
      (s, b) => s + b.transactions.length,
      0,
    );

    const reachedBudgetsCount = user.budgets.filter(
      (b) => b.transactions.reduce((s, t) => s + t.amount, 0) >= b.amount,
    ).length;

    const stats = {
      totalSpent,
      transactionsCount,
      reachedBudgetsCount,
      totalBudgetsCount: user.budgets.length,
    };

    // Bar chart : budget vs dépensé, par budget
    const chartByBudget = user.budgets.map((b) => ({
      name: b.name,
      budget: b.amount,
      spent: b.transactions.reduce((s, t) => s + t.amount, 0),
    }));

    //  Dernières transactions (toutes confondues, top 5)
    const allTransactions = user.budgets
      .flatMap((b) =>
        b.transactions.map((t) => ({
          id: t.id,
          amount: t.amount,
          description: t.description,
          createdAt: t.createdAt,
          budgetName: b.name,
        })),
      )
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
      .slice(0, 5);

    //  Derniers budgets 
    const lastBudgets = user.budgets.slice(0, 3).map((b) => ({
      id: b.id,
      name: b.name,
      emoji: b.emoji,
      amount: b.amount,
      spent: b.transactions.reduce((s, t) => s + t.amount, 0),
      transactionsCount: b.transactions.length,
    }));

    return {
      stats,
      chartByBudget,
      lastTransactions: allTransactions,
      lastBudgets,
    };
  } catch (error) {
    console.error("Erreur dashboard :", error);
    throw error;
  }
}


