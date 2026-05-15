import Navbar from "@/components/layout/Navbar";
import BudgetItem from "@/components/section/BudgetItem";
import Link from "next/link";
import budgets from "./data";
import { auth } from "@clerk/nextjs/server";
import { ArrowRight } from "lucide-react";

export default async function Home() {
  const { userId } = await auth();
  const isSignedIn = !!userId;

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

      {/* Grille budgets */}
      <div className="max-w-6xl mx-auto px-6 pb-16">
        <h2 className="text-xl font-semibold text-gray-500 mb-4">
          Aperçu des budgets
        </h2>
        <ul className="grid sm:grid-cols-2 md:grid-cols-3 gap-5">
          {budgets.map((budget) => (
            <li key={budget.id}>
              <Link href="">
                <BudgetItem budget={budget} enableHover={1} />
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}