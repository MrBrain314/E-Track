"use client";

import {
  getTransactionsByBudgetId,
  addTransactionToBudget,
  deleteBudget,
  deleteTransaction,
  updateBudget,
} from "@/app/actions";
import BudgetItem from "@/components/section/BudgetItem";
import Wrapper from "@/components/section/Wrapper";
import Notification from "@/components/section/Notification";
import React, { useEffect, useState } from "react";
import { Pencil, Send, Trash } from "lucide-react";
import { useCurrency } from "@/context/CurrencyContext";
import { redirect } from "next/navigation";
import EmojiPicker from "emoji-picker-react";

const Page = ({ params }: { params: Promise<{ budgetId: string }> }) => {
  const { convert } = useCurrency();
  const [budgetId, setBudgetId] = useState<string>("");
  const [budget, setBudget] = useState<Budget>();
  const [description, setDescription] = useState<string>("");
  const [amount, setAmount] = useState<string>("");
  const [notification, setNotification] = useState<string>("");

  // États pour la modale d'édition
  const [editName, setEditName] = useState<string>("");
  const [editAmount, setEditAmount] = useState<string>("");
  const [editEmoji, setEditEmoji] = useState<string>("");
  const [showEmojiPicker, setShowEmojiPicker] = useState<boolean>(false);

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

  const openEditModal = () => {
    if (!budget) return;
    setEditName(budget.name);
    setEditAmount(budget.amount.toString());
    setEditEmoji(budget.emoji ?? "");
    setShowEmojiPicker(false);
    (document.getElementById("modal_edit_budget") as HTMLDialogElement).showModal();
  };

  const handleUpdateBudget = async () => {
    const amountNumber = parseFloat(editAmount);
    if (!editName.trim()) {
      setNotification("Le nom du budget ne peut pas être vide.");
      return;
    }
    if (isNaN(amountNumber) || amountNumber <= 0) {
      setNotification("Le montant doit être un nombre positif.");
      return;
    }
    try {
      await updateBudget(budgetId, editName.trim(), amountNumber, editEmoji);
      (document.getElementById("modal_edit_budget") as HTMLDialogElement).close();
      setNotification("Budget mis à jour avec succès.");
      fetchBudgetData(budgetId);
    } catch (error) {
      setNotification("Erreur lors de la mise à jour du budget.");
    }
  };

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

      {/* Modale d'édition du budget */}
      <dialog id="modal_edit_budget" className="modal">
        <div className="modal-box w-11/12 max-w-md">
          <form method="dialog">
            <button className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2">
              ✕
            </button>
          </form>

          <h3 className="font-bold text-lg flex items-center gap-2 mb-1">
            <Pencil className="w-5 h-5 text-accent" />
            Modifier le budget
          </h3>
          <p className="text-gray-500 text-sm mb-4">
            Modifiez le nom, le montant ou l&apos;émoji de votre budget.
          </p>

          <div className="flex flex-col gap-3">
            <label className="form-control w-full">
              <span className="label-text text-sm mb-1">Nom du budget</span>
              <input
                type="text"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                className="input input-bordered w-full"
              />
            </label>

            <label className="form-control w-full">
              <span className="label-text text-sm mb-1">Montant alloué</span>
              <input
                type="number"
                value={editAmount}
                onChange={(e) => setEditAmount(e.target.value)}
                className="input input-bordered w-full"
              />
            </label>

            <label className="form-control w-full">
              <span className="label-text text-sm mb-1">Émoji</span>
              <button
                type="button"
                className="btn justify-start w-full"
                onClick={() => setShowEmojiPicker(!showEmojiPicker)}
              >
                <span className="text-xl">{editEmoji || "✅"}</span>
                <span className="text-sm font-normal">
                  {editEmoji ? "Changer l'émoji" : "Sélectionnez un émoji"}
                </span>
              </button>
            </label>

            {showEmojiPicker && (
              <div className="flex justify-center">
                <EmojiPicker
                  onEmojiClick={(emojiObj) => {
                    setEditEmoji(emojiObj.emoji);
                    setShowEmojiPicker(false);
                  }}
                />
              </div>
            )}

            <button
              type="button"
              onClick={handleUpdateBudget}
              className="btn btn-accent w-full mt-2"
            >
              Enregistrer les modifications
            </button>
          </div>
        </div>
        <form method="dialog" className="modal-backdrop">
          <button>Fermer</button>
        </form>
      </dialog>

      {budget && (
        <div className="flex flex-col md:flex-row gap-6">
          {/* Colonne de gauche : carte budget + formulaire */}
          <div className="md:w-1/3 flex flex-col gap-4">
            <BudgetItem budget={budget} enableHover={0} />

            <div className="flex gap-2">
              <button
                onClick={openEditModal}
                className="btn btn-outline btn-sm flex-1"
              >
                <Pencil className="w-4" />
                Modifier
              </button>
              <button
                onClick={handleDeleteBudget}
                className="btn btn-outline btn-sm flex-1"
              >
                <Trash className="w-4" />
                Supprimer
              </button>
            </div>

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
                              - {convert(transaction.amount)}
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
