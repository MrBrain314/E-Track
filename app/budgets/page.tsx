"use client";
import Wrapper from "@/components/section/Wrapper";
import { useUser } from "@clerk/nextjs";
import EmojiPicker from "emoji-picker-react";
import { useState } from "react";
import { addBudget } from "../actions";
import Notification from "@/components/section/Notification";

const Page = () => {
  const { user } = useUser();
  const [budgetName, setBudgetName] = useState<string>("");
  const [budgetAmount, setBudgetAmount] = useState<string>("");
  const [showEmojiPicker, setShowEmojiPicker] = useState<boolean>(false);
  const [selectedEmoji, setSelectedEmoji] = useState<string>("");

  const [notification, setNotification] = useState<string>("");
  const closeNotification = () => {
    setNotification("");
  };

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

      if (modal) {
        modal.close();
      }

      setNotification("Nouveau budget créé avec succès.")
      setBudgetAmount("")
      setBudgetName("")
      setSelectedEmoji("")
      setShowEmojiPicker(false)
    } catch (error) {
      setNotification(`Erreur : ${error}`)
    }
  };

  return (
    <Wrapper>
      {notification && (
        <Notification message={notification} onclose={closeNotification} />
      )}

      <button
        className="btn"
        onClick={() =>
          (
            document.getElementById("my_modal_3") as HTMLDialogElement
          ).showModal()
        }
      >
        Nouveau budget
      </button>

      <dialog id="my_modal_3" className="modal">
        <div className="modal-box w-11/12 max-w-md">
          <form method="dialog">
            <button className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2">
              ✕
            </button>
          </form>
          <h3 className="font-bold text-lg">Création d&apos;un budget</h3>
          <p className="py-4">Permet de controler ses dépenses facilement</p>
          <div className="w-full flex flex-col gap-3">
            <input
              type="text"
              value={budgetName}
              placeholder="Nom du budget"
              onChange={(e) => setBudgetName(e.target.value)}
              className="input input-bordered w-full"
              required
            />
            <input
              type="number"
              value={budgetAmount}
              placeholder="Montant"
              onChange={(e) => setBudgetAmount(e.target.value)}
              className="input input-bordered w-full"
              required
            />
            <button
              className="btn"
              onClick={() => setShowEmojiPicker(!showEmojiPicker)}
            >
              {selectedEmoji || "Sélectionnez un emoji 👍"}
            </button>

            {showEmojiPicker && (
              <div className="flex justify-center">
                <EmojiPicker onEmojiClick={handleEmojiSelect} />
              </div>
            )}

            <button
              onClick={handleAddBudget}
              className="btn btn-primary w-full"
            >
              Ajouter Budget
            </button>
          </div>
        </div>
        <form method="dialog" className="modal-backdrop">
          <button>Fermer</button>
        </form>
      </dialog>
    </Wrapper>
  );
};

export default Page;
