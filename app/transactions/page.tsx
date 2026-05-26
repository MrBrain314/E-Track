"use client";

import Wrapper from "@/components/section/Wrapper";
import { useUser } from "@clerk/nextjs";
import { ChevronRight, Inbox, Wallet } from "lucide-react";
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import { getTransactionsByEmailAndPeriod } from "../actions";
import { useCurrency } from "@/context/CurrencyContext";

const periods = [
  { label: "7 jours", value: "last7" },
  { label: "30 jours", value: "last30" },
  { label: "90 jours", value: "last90" },
  { label: "1 an", value: "last360" },
];

const Page = () => {
  const { user } = useUser();
  const router = useRouter();
  const { convert } = useCurrency();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [period, setPeriod] = useState<string>("last30");

  const fetchTransactions = async (selectedPeriod: string) => {
    if (!user?.primaryEmailAddress?.emailAddress) return;
    setLoading(true);
    try {
      const data = await getTransactionsByEmailAndPeriod(
        user.primaryEmailAddress.emailAddress,
        selectedPeriod,
      );
      setTransactions(data);
    } catch (err) {
      console.error("Erreur lors de la récupération des transactions: ", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const email = user?.primaryEmailAddress?.emailAddress;
    if (!email) return;
    let cancelled = false;
    (async () => {
      try {
        const data = await getTransactionsByEmailAndPeriod(email, period);
        if (!cancelled) setTransactions(data);
      } catch (err) {
        console.error("Erreur lors de la récupération des transactions: ", err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [user?.primaryEmailAddress?.emailAddress]);

  const handlePeriodChange = (value: string) => {
    setPeriod(value);
    fetchTransactions(value);
  };

  const handleRowClick = (budgetId: string) => {
    router.push(`/manage/${budgetId}`);
  };

  const total = transactions.reduce((sum, t) => sum + t.amount, 0);

  return (
    <Wrapper>
      {/* En-tête */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold flex items-center gap-2">
            <Wallet className="w-7 h-7 text-accent" />
            Mes transactions
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            {loading
              ? "Chargement..."
              : `${transactions.length} transaction${transactions.length > 1 ? "s" : ""} - ${convert(total)} dépensés`}
          </p>
        </div>

        <div className="join">
          {periods.map((p) => (
            <button
              key={p.value}
              onClick={() => handlePeriodChange(p.value)}
              className={`join-item btn btn-sm ${
                period === p.value ? "btn-accent" : "btn-outline"
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {/* Contenu */}
      {loading ? (
        <div className="card bg-base-100 border border-base-300 py-20 flex flex-col items-center justify-center gap-3">
          <span className="loading loading-spinner loading-lg text-accent"></span>
          <span className="text-sm text-gray-500">
            Chargement de vos transactions...
          </span>
        </div>
      ) : transactions.length === 0 ? (
        <div className="card bg-base-100 border border-base-300 border-dashed py-20 flex flex-col items-center justify-center gap-3">
          <div className="bg-accent/10 p-4 rounded-full">
            <Inbox className="w-10 h-10 text-accent" strokeWidth={1.5} />
          </div>
          <h2 className="font-semibold text-lg">Aucune transaction</h2>
          <p className="text-gray-500 text-sm text-center max-w-xs">
            Aucune transaction n&apos;a été enregistrée pour cette période.
            Essayez d&apos;élargir la plage de dates ou commencez par ajouter
            une dépense.
          </p>
        </div>
      ) : (
        <div className="card bg-base-100 border border-base-300 overflow-hidden md:max-h-[calc(100vh-12rem)] flex flex-col">
          <div className="overflow-y-auto">
            <table className="table table-zebra">
              <thead className="bg-base-200 sticky top-0 z-10">
                <tr>
                  <th className="w-16"></th>
                  <th>Description</th>
                  <th>Budget</th>
                  <th className="text-right">Montant</th>
                  <th>Date</th>
                  <th>Heure</th>
                  <th className="w-8"></th>
                </tr>
              </thead>
              <tbody>
                {transactions.map((transaction) => (
                  <tr
                    key={transaction.id}
                    onClick={() => {
                      if (transaction.budgetId) {
                        handleRowClick(transaction.budgetId);
                      }
                    }}
                    className="hover cursor-pointer group"
                  >
                    <td className="text-2xl text-center align-middle">
                      {transaction.emoji}
                    </td>
                    <td className="align-middle font-medium">
                      {transaction.description}
                    </td>
                    <td className="align-middle">
                      <span className="badge badge-ghost badge-sm">
                        {transaction.budgetName}
                      </span>
                    </td>
                    <td className="text-right align-middle">
                      <span className="badge badge-accent badge-sm font-semibold">
                        - {convert(transaction.amount)}
                      </span>
                    </td>
                    <td className="align-middle text-sm text-gray-500">
                      {new Date(transaction.createdAt).toLocaleDateString(
                        "fr-FR",
                      )}
                    </td>
                    <td className="align-middle text-sm text-gray-500">
                      {new Date(transaction.createdAt).toLocaleTimeString(
                        "fr-FR",
                        { hour: "2-digit", minute: "2-digit" },
                      )}
                    </td>
                    <td className="align-middle text-gray-400 group-hover:text-accent transition-colors">
                      <ChevronRight className="w-4 h-4" />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </Wrapper>
  );
};

export default Page;
