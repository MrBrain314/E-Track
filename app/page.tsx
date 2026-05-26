import Navbar from "@/components/layout/Navbar";
import BudgetItem from "@/components/section/BudgetItem";
import Link from "next/link";
import budgets from "./data";
import { auth, currentUser } from "@clerk/nextjs/server";
import {
  ArrowRight,
  CircleDollarSign,
  LayoutDashboard,
  ListChecks,
  TrendingDown,
  Wallet,
} from "lucide-react";
import { getBudgetsByUser } from "./actions";

export default async function Home() {
  const { userId } = await auth();
  const isSignedIn = !!userId;

  let realBudgets: Awaited<ReturnType<typeof getBudgetsByUser>> = [];

  if (isSignedIn) {
    const clerkUser = await currentUser();
    const email = clerkUser?.emailAddresses[0]?.emailAddress;
    if (email) {
      try {
        realBudgets = await getBudgetsByUser(email);
      } catch {
        realBudgets = [];
      }
    }
  }

  const hasRealBudgets = realBudgets.length > 0;

  const totalAlloue = hasRealBudgets
    ? realBudgets.reduce((s, b) => s + b.amount, 0)
    : 0;
  const totalDepense = hasRealBudgets
    ? realBudgets.reduce(
        (s, b) => s + b.transactions.reduce((ss, t) => ss + t.amount, 0),
        0,
      )
    : 0;
  const totalRestant = totalAlloue - totalDepense;
  const pctDepense =
    totalAlloue > 0 ? Math.min((totalDepense / totalAlloue) * 100, 100) : 0;
  const nbTransactions = hasRealBudgets
    ? realBudgets.reduce((s, b) => s + b.transactions.length, 0)
    : 0;

  const budgetLePlusSollicite = hasRealBudgets
    ? realBudgets.reduce((prev, curr) => {
        const prevSpent = prev.transactions.reduce(
          (s, t) => s + t.amount,
          0,
        );
        const currSpent = curr.transactions.reduce(
          (s, t) => s + t.amount,
          0,
        );
        return currSpent / curr.amount > prevSpent / prev.amount ? curr : prev;
      })
    : null;

  const budgetLePlusSolliciteSpent = budgetLePlusSollicite
    ? budgetLePlusSollicite.transactions.reduce((s, t) => s + t.amount, 0)
    : 0;
  const budgetLePlusSollicitePct = budgetLePlusSollicite
    ? Math.min(
        (budgetLePlusSolliciteSpent / budgetLePlusSollicite.amount) * 100,
        100,
      )
    : 0;

  return (
    <div className="min-h-screen bg-base-100">
      <Navbar />

      {/* Entete */}
      <div className="flex items-center justify-center flex-col py-20 px-6 text-center">
        <h1 className="text-4xl md:text-6xl font-extrabold leading-tight max-w-2xl">
          Prenez le contrôle <br className="hidden md:block" /> de vos finances
        </h1>
        <p className="mt-4 text-base md:text-lg text-gray-500 max-w-md">
          Suivez vos budgets et vos dépenses <br />
          en toute simplicité avec Etrack !
        </p>

        <div className="flex items-center gap-3 mt-8">
          {isSignedIn ? (
            <Link
              href="/budgets"
              className="btn btn-accent btn-sm md:btn-md gap-2"
            >
              Accéder à mes budgets
              <ArrowRight className="w-4 h-4" />
            </Link>
          ) : (
            <>
              <Link
                href="/sign-in"
                className="btn btn-outline btn-accent btn-sm md:btn-md"
              >
                Se connecter
              </Link>
              <Link
                href="/sign-up"
                className="btn btn-accent btn-sm md:btn-md"
              >
                S&apos;inscrire
              </Link>
            </>
          )}
        </div>
      </div>

      {/* Section principale */}
      <div className="max-w-5xl mx-auto px-6 pb-20">
        {hasRealBudgets ? (
          <div className="flex flex-col gap-6">

            {/* Carte bilan global */}
            <div className="rounded-2xl border-2 border-base-300 p-8">
              <p className="text-sm font-medium text-gray-400 uppercase tracking-widest mb-1">
                Mon bilan global
              </p>
              <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-6">
                <div>
                  <p className="text-5xl font-extrabold">{totalAlloue} €</p>
                  <p className="text-gray-400 mt-1">de budget total alloué</p>
                </div>
                <div className="text-right">
                  <p className="text-lg font-semibold text-error">
                    − {totalDepense} € dépensés
                  </p>
                  <p className="text-lg font-semibold text-success">
                    + {totalRestant} € restants
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
                <p className="text-2xl font-bold">{realBudgets.length}</p>
                <p className="text-sm text-gray-400">Budget{realBudgets.length > 1 ? "s" : ""} actif{realBudgets.length > 1 ? "s" : ""}</p>
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
                <p className="text-2xl font-bold">{totalRestant} €</p>
                <p className="text-sm text-gray-400">Disponible</p>
              </div>
              <div className="rounded-xl border-2 border-base-300 p-5 flex flex-col gap-2">
                <div className="bg-warning/20 h-10 w-10 rounded-full flex justify-center items-center">
                  <ListChecks className="w-5 h-5 text-warning" />
                </div>
                <p className="text-2xl font-bold">
                  {totalAlloue > 0
                    ? `${(100 - pctDepense).toFixed(0)}%`
                    : "—"}
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
                      <p className="font-bold text-lg">
                        {budgetLePlusSollicite.name}
                      </p>
                      <p className="text-sm text-gray-400">
                        {budgetLePlusSolliciteSpent} € /{" "}
                        {budgetLePlusSollicite.amount} €
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
                <Link
                  href="/dashboard"
                  className="flex items-center justify-between p-3 rounded-lg hover:bg-base-200 transition-colors group"
                >
                  <div className="flex items-center gap-3">
                    <LayoutDashboard className="w-5 h-5 text-accent" />
                    <span className="font-medium">Tableau de bord</span>
                  </div>
                  <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-accent transition-colors" />
                </Link>
                <Link
                  href="/budgets"
                  className="flex items-center justify-between p-3 rounded-lg hover:bg-base-200 transition-colors group"
                >
                  <div className="flex items-center gap-3">
                    <Wallet className="w-5 h-5 text-accent" />
                    <span className="font-medium">Mes budgets</span>
                  </div>
                  <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-accent transition-colors" />
                </Link>
                <Link
                  href="/transactions"
                  className="flex items-center justify-between p-3 rounded-lg hover:bg-base-200 transition-colors group"
                >
                  <div className="flex items-center gap-3">
                    <ListChecks className="w-5 h-5 text-accent" />
                    <span className="font-medium">Mes transactions</span>
                  </div>
                  <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-accent transition-colors" />
                </Link>
              </div>
            </div>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-500">
                Aperçu des budgets
              </h2>
              {isSignedIn && (
                <Link href="/budgets" className="btn btn-accent btn-sm gap-2">
                  Créer mon premier budget
                  <ArrowRight className="w-4 h-4" />
                </Link>
              )}
            </div>
            <ul className="grid sm:grid-cols-2 md:grid-cols-3 gap-5">
              {budgets.map((budget) => (
                <li key={budget.id}>
                  <Link href="">
                    <BudgetItem budget={budget} enableHover={1} />
                  </Link>
                </li>
              ))}
            </ul>
          </>
        )}
      </div>
    </div>
  );
}
