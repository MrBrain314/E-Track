"use client";

import {
  getTransactionsByBudgetId,
  addTransactionToBudget,
  deleteBudget,
  deleteTransaction,
} from "@/app/actions";
import BudgetItem from "@/components/section/BudgetItem";
import Wrapper from "@/components/section/Wrapper";
import Notification from "@/components/section/Notification";
import React, { useEffect, useState } from "react";
import { Send, Trash } from "lucide-react";
import { redirect } from "next/navigation";

const Page = ({ params }: { params: Promise<{ budgetId: string }> }) => {
  const [budgetId, setBudgetId] = useState<string>("");
  const [budget, setBudget] = useState<Budget>();
  const [description, setDescription] = useState<string>("");
  const [amount, setAmount] = useState<string>("");
  const [notification, setNotification] = useState<string>("");

  const closeNotification = () => setNotification("");

  const fetchBudgetData = async (id: string) => {
    try {
      if (!id) return;
      const budgetData = await getTransactionsByBudgetId(id);
      setBudget(budgetData);
    } catch (error) {
      console.error(
        "Erreur lors de la récupération du budget et des transactions:",
        error,
      );
    }
  };

  useEffect(() => {
    const init = async () => {
      const { budgetId: id } = await params;
      setBudgetId(id);
      fetchBudgetData(id);
    };
    init();
  }, [params]);

  const handleAddTransaction = async () => {
    if (!amount || !description) {
      setNotification("Veuillez remplir tous les champs.");
      return;
    }

    const amountNumber = parseFloat(amount);
    if (isNaN(amountNumber) || amountNumber <= 0) {
      setNotification("Le montant doit être un nombre positif.");
      return;
    }

    try {
      await addTransactionToBudget(budgetId, amountNumber, description);
      setNotification("Transaction ajoutée avec succès");
      fetchBudgetData(budgetId);
      setAmount("");
      setDescription("");
    } catch (error) {
      setNotification("Vous avez dépassé votre budget");
    }
  };

  const handleDeleteBudget = async () => {
    const confirmed = window.confirm(
      "Êtes-vous sûr de vouloir supprimer ce budget et toutes ses transactions associées ?",
    );
    if (confirmed) {
      try {
        await deleteBudget(budgetId);
      } catch (error) {
        console.error("Erreur lors de la suppression du budget:", error);
      }
      redirect("/budgets");
    }
  };

  const handleDeleteTransaction = async (transactionId: string) => {
    const confirmed = window.confirm(
      "Êtes-vous sûr de vouloir supprimer cette transaction ?",
    );
    if (confirmed) {
      try {
        await deleteTransaction(transactionId);
        fetchBudgetData(budgetId);
        setNotification("Dépense supprimée");
      } catch (error) {
        console.error(
          "Erreur lors de la suppression de la transaction:",
          error,
        );
      }
    }
  };

  return (
    <Wrapper>
      {notification && (
        <Notification message={notification} onclose={closeNotification} />
      )}

      {budget && (
        <div className="flex flex-col md:flex-row gap-6">
          {/* Colonne de gauche : carte budget + formulaire */}
          <div className="md:w-1/3 flex flex-col gap-4">
            <BudgetItem budget={budget} enableHover={0} />

            <button
              onClick={handleDeleteBudget}
              className="btn btn-outline btn-sm"
            >
              <Trash className="w-4" />
              Supprimer le budget
            </button>

            <div className="card bg-base-100 border border-base-300 p-10 space-y-3">
              <h3 className="font-semibold text-base">Ajouter une dépense</h3>
              <input
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Description"
                className="input input-bordered w-full"
              />
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="Montant"
                className="input input-bordered w-full"
              />
              <button
                onClick={handleAddTransaction}
                className="btn btn-accent w-full"
              >
                Ajouter votre dépense
              </button>
            </div>
          </div>

          {/* Colonne de droite : tableau */}
          <div className="md:flex-1">
            {budget?.transactions && budget.transactions.length > 0 ? (
              <div className="card bg-base-100 border border-base-300 overflow-hidden md:max-h-[calc(100vh-8rem)] flex flex-col">
                <div className="overflow-y-auto">
                  <table className="table table-zebra">
                    <thead className="bg-base-200 sticky top-0 z-10">
                      <tr>
                        <th className="w-16"></th>
                        <th className="text-right">Montant</th>
                        <th>Description</th>
                        <th>Date</th>
                        <th>Heure</th>
                        <th className="text-center">Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {budget.transactions.map((transaction) => (
                        <tr key={transaction.id} className="hover">
                          <td className="text-2xl text-center align-middle">
                            {transaction.emoji}
                          </td>
                          <td className="text-right align-middle">
                            <span className="badge badge-accent badge-sm font-semibold">
                              - {transaction.amount} €
                            </span>
                          </td>
                          <td className="align-middle font-medium">
                            {transaction.description}
                          </td>
                          <td className="align-middle text-sm text-gray-500">
                            {transaction.createdAt.toLocaleDateString("fr-FR")}
                          </td>
                          <td className="align-middle text-sm text-gray-500">
                            {transaction.createdAt.toLocaleTimeString("fr-FR", {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </td>
                          <td className="text-center align-middle">
                            <button
                              onClick={() =>
                                handleDeleteTransaction(transaction.id)
                              }
                              className="btn btn-sm btn-ghost text-error"
                            >
                              <Trash className="w-4" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : (
              <div className="card bg-base-100 border border-base-300 border-dashed h-full flex flex-col items-center justify-center gap-2">
                <Send strokeWidth={1.5} className="w-10 h-10 text-accent" />
                <span className="text-gray-500">Aucune transaction.</span>
              </div>
            )}
          </div>
        </div>
      )}
    </Wrapper>
  );
};

export default Page;