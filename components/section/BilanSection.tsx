"use client";

import { ArrowRight, CircleDollarSign, LayoutDashboard, ListChecks, TrendingDown, Wallet } from "lucide-react";
import Link from "next/link";
import { useCurrency } from "@/context/CurrencyContext";

type Props = {
  totalAlloue: number;
  totalDepense: number;
  totalRestant: number;
  pctDepense: number;
  nbBudgets: number;
  nbTransactions: number;
  budgetLePlusSollicite: {
    name: string;
    emoji: string | null;
    amount: number;
  } | null;
  budgetLePlusSolliciteSpent: number;
  budgetLePlusSollicitePct: number;
};

export default function BilanSection({
  totalAlloue,
  totalDepense,
  totalRestant,
  pctDepense,
  nbBudgets,
  nbTransactions,
  budgetLePlusSollicite,
  budgetLePlusSolliciteSpent,
  budgetLePlusSollicitePct,
}: Props) {
  const { convert } = useCurrency();

  return (
    <div className="flex flex-col gap-6">
      {/* Carte bilan global */}
      <div className="rounded-2xl border-2 border-base-300 p-8">
        <p className="text-sm font-medium text-gray-400 uppercase tracking-widest mb-1">
          Mon bilan global
        </p>
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-6">
          <div>
            <p className="text-5xl font-extrabold">{convert(totalAlloue)}</p>
            <p className="text-gray-400 mt-1">de budget total alloué</p>
          </div>
          <div className="text-right">
            <p className="text-lg font-semibold text-error">
              − {convert(totalDepense)} dépensés
            </p>
            <p className="text-lg font-semibold text-success">
              + {convert(totalRestant)} restants
            </p>
          </div>
        </div>
        <div className="w-full bg-base-200 rounded-full h-4 overflow-hidden">
          <div
            className="h-4 rounded-full bg-accent transition-all"
            style={{ width: `${pctDepense}%` }}
          />
        </div>
        <p className="text-sm text-gray-400 mt-2">
          {pctDepense.toFixed(1)}% du budget utilisé
        </p>
      </div>

      {/* Stats secondaires */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="rounded-xl border-2 border-base-300 p-5 flex flex-col gap-2">
          <div className="bg-accent/20 h-10 w-10 rounded-full flex justify-center items-center">
            <Wallet className="w-5 h-5 text-accent" />
          </div>
          <p className="text-2xl font-bold">{nbBudgets}</p>
          <p className="text-sm text-gray-400">Budget{nbBudgets > 1 ? "s" : ""} actif{nbBudgets > 1 ? "s" : ""}</p>
        </div>
        <div className="rounded-xl border-2 border-base-300 p-5 flex flex-col gap-2">
          <div className="bg-error/20 h-10 w-10 rounded-full flex justify-center items-center">
            <TrendingDown className="w-5 h-5 text-error" />
          </div>
          <p className="text-2xl font-bold">{nbTransactions}</p>
          <p className="text-sm text-gray-400">Transaction{nbTransactions > 1 ? "s" : ""}</p>
        </div>
        <div className="rounded-xl border-2 border-base-300 p-5 flex flex-col gap-2">
          <div className="bg-success/20 h-10 w-10 rounded-full flex justify-center items-center">
            <CircleDollarSign className="w-5 h-5 text-success" />
          </div>
          <p className="text-2xl font-bold">{convert(totalRestant)}</p>
          <p className="text-sm text-gray-400">Disponible</p>
        </div>
        <div className="rounded-xl border-2 border-base-300 p-5 flex flex-col gap-2">
          <div className="bg-warning/20 h-10 w-10 rounded-full flex justify-center items-center">
            <ListChecks className="w-5 h-5 text-warning" />
          </div>
          <p className="text-2xl font-bold">
            {totalAlloue > 0 ? `${(100 - pctDepense).toFixed(0)}%` : "—"}
          </p>
          <p className="text-sm text-gray-400">Restant</p>
        </div>
      </div>

      {/* Budget le plus sollicité + raccourcis */}
      <div className="grid sm:grid-cols-2 gap-4">
        {budgetLePlusSollicite && (
          <div className="rounded-xl border-2 border-base-300 p-6">
            <p className="text-sm font-medium text-gray-400 uppercase tracking-widest mb-4">
              Budget le plus sollicité
            </p>
            <div className="flex items-center gap-3 mb-4">
              <div className="bg-accent/20 text-2xl h-12 w-12 rounded-full flex justify-center items-center">
                {budgetLePlusSollicite.emoji}
              </div>
              <div>
                <p className="font-bold text-lg">{budgetLePlusSollicite.name}</p>
                <p className="text-sm text-gray-400">
                  {convert(budgetLePlusSolliciteSpent)} / {convert(budgetLePlusSollicite.amount)}
                </p>
              </div>
            </div>
            <div className="w-full bg-base-200 rounded-full h-3 overflow-hidden">
              <div
                className="h-3 rounded-full bg-accent"
                style={{ width: `${budgetLePlusSollicitePct}%` }}
              />
            </div>
            <p className="text-sm text-gray-400 mt-2">
              {budgetLePlusSollicitePct.toFixed(1)}% utilisé
            </p>
          </div>
        )}

        {/* Raccourcis */}
        <div className="rounded-xl border-2 border-base-300 p-6 flex flex-col gap-3">
          <p className="text-sm font-medium text-gray-400 uppercase tracking-widest mb-1">
            Accès rapide
          </p>
          <Link href="/dashboard" className="flex items-center justify-between p-3 rounded-lg hover:bg-base-200 transition-colors group">
            <div className="flex items-center gap-3">
              <LayoutDashboard className="w-5 h-5 text-accent" />
              <span className="font-medium">Tableau de bord</span>
            </div>
            <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-accent transition-colors" />
          </Link>
          <Link href="/budgets" className="flex items-center justify-between p-3 rounded-lg hover:bg-base-200 transition-colors group">
            <div className="flex items-center gap-3">
              <Wallet className="w-5 h-5 text-accent" />
              <span className="font-medium">Mes budgets</span>
            </div>
            <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-accent transition-colors" />
          </Link>
          <Link href="/transactions" className="flex items-center justify-between p-3 rounded-lg hover:bg-base-200 transition-colors group">
            <div className="flex items-center gap-3">
              <ListChecks className="w-5 h-5 text-accent" />
              <span className="font-medium">Mes transactions</span>
            </div>
            <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-accent transition-colors" />
          </Link>
        </div>
      </div>
    </div>
  );
}
