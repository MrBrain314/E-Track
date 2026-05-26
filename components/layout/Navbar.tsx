"use client";

import React, { useEffect } from "react";
import { UserButton, useUser } from "@clerk/nextjs";
import Link from "next/link";
import { checkAndAddUser } from "@/app/actions";
import { CURRENCIES, useCurrency } from "@/context/CurrencyContext";

const Navbar = () => {
  const { isLoaded, isSignedIn, user } = useUser();
  const { currency, setCurrency } = useCurrency();

  useEffect(() => {
    if (user?.primaryEmailAddress?.emailAddress) {
      checkAndAddUser(user.primaryEmailAddress.emailAddress);
    }
  }, [user]);

  const Logo = (
    <Link
      href="/"
      className="flex text-2xl items-center font-bold hover:opacity-80 transition-opacity"
    >
      e<span className="text-accent">.Track</span>
    </Link>
  );

  return (
    <div className="bg-base-200/30 px-5 md:px-[10%] py-4">
      {isLoaded &&
        (isSignedIn ? (
          <>
            <div className="flex justify-between items-center">
              {Logo}

              <div className="md:flex gap-6 hidden">
                <Link href="/budgets" className="btn">
                  Mes Budgets
                </Link>
                <Link href="/dashboard" className="btn">
                  Tableau de Bord
                </Link>
                <Link href="/transactions" className="btn">
                  Mes Transactions
                </Link>
              </div>
              <div className="flex items-center gap-3">
                <div className="dropdown dropdown-end">
                  <label tabIndex={0} className="btn btn-ghost btn-sm gap-1 font-semibold">
                    {currency.symbol} <span className="text-xs">▾</span>
                  </label>
                  <ul tabIndex={0} className="dropdown-content menu p-1 shadow bg-base-100 rounded-box w-44 z-50 border border-base-300">
                    <li className="menu-title text-xs text-gray-400 px-3 py-2">Choisir votre devise</li>
                    {CURRENCIES.map((c) => (
                      <li key={c.code}>
                        <button
                          onClick={() => setCurrency(c)}
                          className={currency.code === c.code ? "active" : ""}
                        >
                          {c.symbol} - {c.label}
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
                <UserButton />
              </div>
            </div>
            <div className="md:hidden flex gap-3 mt-2 justify-center">
              <Link href="/budgets" className="btn btn-sm">
                Mes Budgets
              </Link>
              <Link href="/dashboard" className="btn btn-sm">
                Tableau de Bord
              </Link>
              <Link href="/transactions" className="btn btn-sm">
                Mes Transactions
              </Link>
            </div>
          </>
        ) : (
          <div className="flex justify-between items-center">
            {Logo}
            <div className="flex gap-3 mt-2 justify-center">
              <Link href="/sign-in" className="btn btn-sm">
                Se connecter
              </Link>
              <Link href="/sign-up" className="btn btn-sm btn-accent">
                S&apos;inscrire
              </Link>
            </div>
          </div>
        ))}
    </div>
  );
};

export default Navbar;