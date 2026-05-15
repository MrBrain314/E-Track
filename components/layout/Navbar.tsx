"use client";

import React, { useEffect } from "react";
import { UserButton, useUser } from "@clerk/nextjs";
import Link from "next/link";
import { checkAndAddUser } from "@/app/actions";

const Navbar = () => {
  const { isLoaded, isSignedIn, user } = useUser();

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
                  Mes budgets
                </Link>
                <Link href="/dashboard" className="btn">
                  Tableau de bord
                </Link>
                <Link href="/transactions" className="btn">
                  Mes Transactions
                </Link>
              </div>
              <UserButton />
            </div>
            <div className="md:hidden flex gap-3 mt-2 justify-center">
              <Link href="/budgets" className="btn btn-sm">
                Mes budgets
              </Link>
              <Link href="/dashboard" className="btn btn-sm">
                Tableau de bord
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