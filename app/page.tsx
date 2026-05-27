import Navbar from "@/components/layout/Navbar";
import Link from "next/link";
import { auth, currentUser } from "@clerk/nextjs/server";
import { ArrowRight, PlusCircle, TrendingDown, BarChart2 } from "lucide-react";
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
          <div className="flex flex-col items-center gap-12">
            <div className="text-center">
              <h2 className="text-2xl md:text-3xl font-bold">Comment ça marche ?</h2>
              <p className="text-gray-500 mt-2 text-sm">Gérez vos finances en 3 étapes simples</p>
            </div>

            <div className="grid md:grid-cols-3 gap-8 w-full">
              {/* Étape 1 */}
              <div className="flex flex-col items-center text-center gap-4">
                <div className="relative">
                  <div className="bg-accent/10 w-20 h-20 rounded-full flex items-center justify-center">
                    <PlusCircle className="w-9 h-9 text-accent" strokeWidth={1.5} />
                  </div>
                  <span className="absolute -top-1 -right-1 bg-accent text-white text-xs font-bold w-6 h-6 rounded-full flex items-center justify-center">1</span>
                </div>
                <h3 className="text-lg font-bold">Créez un budget</h3>
                <p className="text-gray-500 text-sm leading-relaxed">
                  Définissez un budget pour chaque catégorie : alimentation, transport, loisirs avec un montant et un émoji personnalisé.
                </p>
              </div>

              {/* Étape 2 */}
              <div className="flex flex-col items-center text-center gap-4">
                <div className="relative">
                  <div className="bg-accent/10 w-20 h-20 rounded-full flex items-center justify-center">
                    <TrendingDown className="w-9 h-9 text-accent" strokeWidth={1.5} />
                  </div>
                  <span className="absolute -top-1 -right-1 bg-accent text-white text-xs font-bold w-6 h-6 rounded-full flex items-center justify-center">2</span>
                </div>
                <h3 className="text-lg font-bold">Enregistrez vos dépenses</h3>
                <p className="text-gray-500 text-sm leading-relaxed">
                  Ajoutez chaque dépense en quelques secondes. e.Track vérifie automatiquement que vous ne dépassez pas votre budget.
                </p>
              </div>

              {/* Étape 3 */}
              <div className="flex flex-col items-center text-center gap-4">
                <div className="relative">
                  <div className="bg-accent/10 w-20 h-20 rounded-full flex items-center justify-center">
                    <BarChart2 className="w-9 h-9 text-accent" strokeWidth={1.5} />
                  </div>
                  <span className="absolute -top-1 -right-1 bg-accent text-white text-xs font-bold w-6 h-6 rounded-full flex items-center justify-center">3</span>
                </div>
                <h3 className="text-lg font-bold">Suivez votre bilan</h3>
                <p className="text-gray-500 text-sm leading-relaxed">
                  Visualisez vos statistiques, consultez l&apos;historique de vos transactions et identifiez les budgets les plus sollicités.
                </p>
              </div>
            </div>

            <Link href={isSignedIn ? "/budgets" : "/sign-up"} className="btn btn-accent btn-md gap-2">
              {isSignedIn ? "Créer mon premier budget" : "Commencer gratuitement"}
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
