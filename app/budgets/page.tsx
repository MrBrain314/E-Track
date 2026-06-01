"use client";

import Wrapper from "@/components/section/Wrapper";
import Notification from "@/components/section/Notification";
import { useUser } from "@clerk/nextjs";
import EmojiPicker from "emoji-picker-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { addBudget, getBudgetsByUser } from "../actions";
import BudgetItem from "@/components/section/BudgetItem";
import { Landmark, Plus, Wallet } from "lucide-react";

const Page = () => {
  const { user } = useUser();

  const [budgetName, setBudgetName] = useState<string>("");
  const [budgetAmount, setBudgetAmount] = useState<string>("");
  const [showEmojiPicker, setShowEmojiPicker] = useState<boolean>(false);
  const [selectedEmoji, setSelectedEmoji] = useState<string>("");
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [notification, setNotification] = useState<string>("");

  const closeNotification = () => setNotification("");

  const handleEmojiSelect = (emojiObject: { emoji: string }) => {
    setSelectedEmoji(emojiObject.emoji);
    setShowEmojiPicker(false);
  };

  const handleAddBudget = async () => {
    try {
      const amount = parseFloat(budgetAmount);

      if (isNaN(amount) || amount <= 0) {
        throw new Error("Le montant doit être un nombre positif.");
      }

      await addBudget(
        user?.primaryEmailAddress?.emailAddress as string,
        budgetName,
        amount,
        selectedEmoji,
      );

      const modal = document.getElementById("my_modal_3") as HTMLDialogElement;
      if (modal) modal.close();

      setNotification("Nouveau budget créé avec succès.");
      setBudgetAmount("");
      setBudgetName("");
      setSelectedEmoji("");
      setShowEmojiPicker(false);

      fetchBudgets();
    } catch (error) {
      setNotification(`Erreur : ${error}`);
    }
  };

  const fetchBudgets = async () => {
    if (user?.primaryEmailAddress?.emailAddress) {
      setLoading(true);
      try {
        const userBudgets = await getBudgetsByUser(
          user.primaryEmailAddress.emailAddress,
        );
        setBudgets(userBudgets);
      } catch (error) {
        setNotification(
          `Erreur lors de la récupération des budgets : ${error}`,
        );
      } finally {
        setLoading(false);
      }
    }
  };

  useEffect(() => {
    fetchBudgets();
  }, [user?.primaryEmailAddress?.emailAddress]);

  const openModal = () =>
    (document.getElementById("my_modal_3") as HTMLDialogElement).showModal();

  return (
    <Wrapper>
      {notification && (
        <Notification message={notification} onclose={closeNotification} />
      )}

      {/* En-tête de page */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold flex items-center gap-2">
            <Wallet className="w-7 h-7 text-accent" />
            Mes budgets
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            {budgets.length > 0
              ? `${budgets.length} budget${budgets.length > 1 ? "s" : ""} en cours de suivi`
              : "Commencez par créer votre premier budget"}
          </p>
        </div>

        <button className="btn btn-accent gap-2 shadow-md" onClick={openModal}>
          <Plus className="w-4 h-4" />
          Nouveau budget
        </button>
      </div>

      {/* Modale de création */}
      <dialog id="my_modal_3" className="modal">
        <div className="modal-box w-11/12 max-w-md">
          <form method="dialog">
            <button className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2">
              ✕
            </button>
          </form>

          <h3 className="font-bold text-lg flex items-center gap-2">
            <Landmark className="w-5 h-5 text-accent" />
            Création d&apos;un budget
          </h3>

          <p className="text-gray-500 text-sm py-3">
            Définissez un budget pour mieux contrôler vos dépenses.
          </p>

          <div className="w-full flex flex-col gap-3">
            <label className="form-control w-full">
              <span className="label-text text-sm mb-1">Nom du budget</span>
              <input
                type="text"
                value={budgetName}
                placeholder="Ex : Courses, Loisirs..."
                onChange={(e) => setBudgetName(e.target.value)}
                className="input input-bordered w-full"
                required
              />
            </label>

            <label className="form-control w-full">
              <span className="label-text text-sm mb-1">Montant alloué</span>
              <input
                type="number"
                value={budgetAmount}
                placeholder="0,00 €"
                onChange={(e) => setBudgetAmount(e.target.value)}
                className="input input-bordered w-full"
                required
              />
            </label>

            <label className="form-control w-full">
              <button
                type="button"
                className="btn justify-start w-full"
                onClick={() => setShowEmojiPicker(!showEmojiPicker)}
              >
                <span className="text-xl">{selectedEmoji || "✅"}</span>
                <span className="text-sm font-normal">
                  {selectedEmoji ? "Changer l'emoji" : "Sélectionnez un emoji"}
                </span>
              </button>
            </label>

            {showEmojiPicker && (
              <div className="flex justify-center">
                <EmojiPicker onEmojiClick={handleEmojiSelect} />
              </div>
            )}

            <button
              type="button"
              onClick={handleAddBudget}
              className="btn btn-accent w-full mt-2"
            >
              Créer le budget
            </button>
          </div>
        </div>

        <form method="dialog" className="modal-backdrop">
          <button>Fermer</button>
        </form>
      </dialog>

      {/* Liste des budgets ou état vide */}
      {loading ? (
        <div className="card bg-base-100 border border-base-300 py-20 flex flex-col items-center justify-center gap-3">
          <span className="loading loading-spinner loading-lg text-accent"></span>
          <span className="text-sm text-gray-500">Chargement de vos budgets...</span>
        </div>
      ) : budgets.length > 0 ? (
        <ul className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {budgets.map((budget) => (
            <li key={budget.id}>
              <Link href={`/manage/${budget.id}`}>
                <BudgetItem budget={budget} enableHover={1} />
              </Link>
            </li>
          ))}
        </ul>
      ) : (
        <div className="card bg-base-100 border border-base-300 border-dashed py-16 flex flex-col items-center justify-center gap-3">
          <div className="bg-accent/10 p-4 rounded-full">
            <Wallet className="w-10 h-10 text-accent" strokeWidth={1.5} />
          </div>
          <h2 className="font-semibold text-lg">
            Aucun budget pour l&apos;instant
          </h2>
          <p className="text-gray-500 text-sm text-center max-w-xs">
            Créez votre premier budget pour suivre vos dépenses et atteindre vos
            objectifs financiers.
          </p>
          <button
            onClick={openModal}
            className="btn btn-accent btn-sm gap-2 mt-2"
          >
            <Plus className="w-4 h-4" />
            Créer un budget
          </button>
        </div>
      )}
    </Wrapper>

  );
};

export default Page;