import Link from "next/link";
import { Mail } from "lucide-react";
import { FaGithub, FaLinkedin } from "react-icons/fa";
import React from "react";

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-base-200/30 border-t border-base-300 mt-16">
      <div className="px-5 md:px-[10%] py-10">
        {/* Section principale */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          {/* Colonne 1 : Branding */}
          <div className="flex flex-col gap-3">
            <Link
              href="/"
              className="flex text-2xl items-center font-bold hover:opacity-80 transition-opacity w-fit"
            >
              e<span className="text-accent">.Track</span>
            </Link>

            <p className="text-sm text-gray-500 max-w-xs">
              Prenez le contrôle de vos finances. Suivez vos budgets et vos
              dépenses en toute simplicité.
            </p>
          </div>

          {/* Colonne 2 : Navigation */}
          <div className="flex flex-col gap-3">
            <h3 className="font-semibold text-sm uppercase tracking-wider">
              Navigation
            </h3>

            <ul className="flex flex-col gap-2 text-sm">
              <li>
                <Link
                  href="/budgets"
                  className="text-gray-500 hover:text-accent transition-colors"
                >
                  Mes budgets
                </Link>
              </li>

              <li>
                <Link
                  href="/dashboard"
                  className="text-gray-500 hover:text-accent transition-colors"
                >
                  Tableau de bord
                </Link>
              </li>

              <li>
                <Link
                  href="/transactions"
                  className="text-gray-500 hover:text-accent transition-colors"
                >
                  Mes transactions
                </Link>
              </li>
            </ul>
          </div>

          {/* Colonne 3 : Liens sociaux */}
          <div className="flex flex-col gap-3">
            <h3 className="font-semibold text-sm uppercase tracking-wider">
              Restons en contact
            </h3>

            <div className="flex gap-2">
              <a
                href="https://github.com/MrBrain314"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="GitHub"
                className="btn btn-circle btn-ghost btn-sm"
              >
                <FaGithub className="w-4 h-4" />
              </a>

              <a
                href="https://www.linkedin.com/in/ouro-tagbabastou/"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="LinkedIn"
                className="btn btn-circle btn-ghost btn-sm"
              >
                <FaLinkedin className="w-4 h-4" />
              </a>

              <a
                href="mailto:ourotagbabastouu@gmail.com"
                aria-label="Email"
                className="btn btn-circle btn-ghost btn-sm"
              >
                <Mail className="w-4 h-4" />
              </a>
            </div>
          </div>
        </div>

        {/* Barre de séparation : copyright centré */}
        <div className="border-t border-base-300 pt-6 flex justify-center text-sm text-gray-500">
          <p>
            © {currentYear}{" "}
            <span className="font-semibold text-accent">@MrBrain</span> - Tous
            droits réservés.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;