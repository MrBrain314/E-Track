import Navbar from "@/components/layout/Navbar";
import BudgetItem from "@/components/section/BudgetItem";
import Link from "next/link";
import budgets from "./data";
import { auth, currentUser } from "@clerk/nextjs/server";
import { ArrowRight } from "lucide-react";
import { getBudgetsByUser } from "./actions";
import BilanSection from "@/components/section/BilanSection";

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
          <BilanSection
            totalAlloue={totalAlloue}
            totalDepense={totalDepense}
            totalRestant={totalRestant}
            pctDepense={pctDepense}
            nbBudgets={realBudgets.length}
            nbTransactions={nbTransactions}
            budgetLePlusSollicite={budgetLePlusSollicite}
            budgetLePlusSolliciteSpent={budgetLePlusSolliciteSpent}
            budgetLePlusSollicitePct={budgetLePlusSollicitePct}
          />
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
