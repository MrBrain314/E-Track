"use client";

import Wrapper from "@/components/section/Wrapper";
import { useUser } from "@clerk/nextjs";
import { CircleDollarSign, Receipt, Trophy } from "lucide-react";
import Link from "next/link";
import React, { useEffect, useState } from "react";
import { getDashboardData } from "../actions";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

type DashboardData = Awaited<ReturnType<typeof getDashboardData>>;

const Dashboard = () => {
  const { user } = useUser();
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const email = user?.primaryEmailAddress?.emailAddress;
    if (!email) return;
    let cancelled = false;

    (async () => {
      try {
        const result = await getDashboardData(email);
        if (!cancelled) setData(result);
      } catch (err) {
        console.error("Erreur dashboard :", err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [user?.primaryEmailAddress?.emailAddress]);

  if (loading || !data) {
    return (
      <Wrapper>
        <div className="card bg-base-100 border border-base-300 py-20 flex flex-col items-center justify-center gap-3">
          <span className="loading loading-spinner loading-lg text-accent"></span>
          <span className="text-sm text-gray-500">Chargement...</span>
        </div>
      </Wrapper>
    );
  }

  return (
    <Wrapper>
      {/* 3 KPI en haut */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
        <KpiCard
          label="Total des Transactions"
          value={`${data.stats.totalSpent.toFixed(0)}€`}
          icon={<CircleDollarSign className="w-5 h-5" />}
        />
        <KpiCard
          label="Nombre de Transactions"
          value={data.stats.transactionsCount.toString()}
          icon={<Receipt className="w-5 h-5" />}
        />
        <KpiCard
          label="Budgets Atteints"
          value={`${data.stats.reachedBudgetsCount}/${data.stats.totalBudgetsCount}`}
          icon={<Trophy className="w-5 h-5" />}
        />
      </div>

      {/* Grille principale : chart + transactions à gauche, budgets à droite */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Colonne gauche : chart + dernières transactions */}
        <div className="lg:col-span-2 flex flex-col gap-4">
          {/* Bar chart */}
          <div className="card bg-base-100 border border-base-300 p-5">
            <h2 className="font-semibold mb-4">Statistiques ( en € )</h2>
            {data.chartByBudget.length === 0 ? (
              <div className="h-70 flex items-center justify-center text-sm text-gray-400">
                Aucun budget à afficher.
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={data.chartByBudget}>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    vertical={false}
                    stroke="#e5e7eb"
                  />
                  <XAxis dataKey="name" stroke="#9ca3af" fontSize={12} />
                  <YAxis stroke="#9ca3af" fontSize={12} />
                  <Tooltip
                    formatter={(value) => `${Number(value).toFixed(2)} €`}
                    contentStyle={{
                      borderRadius: 8,
                      border: "1px solid #e5e7eb",
                    }}
                  />
                  <Legend iconType="circle" />
                  <Bar
                    dataKey="budget"
                    fill="#a7f3d0"
                    name="Budget"
                    radius={[6, 6, 0, 0]}
                  />
                  <Bar
                    dataKey="spent"
                    fill="#059669"
                    name="Dépensé"
                    radius={[6, 6, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>

          {/* Dernières transactions */}
          <div className="card bg-base-100 border border-base-300 p-5">
            <h2 className="font-semibold mb-4">Dernières Transactions</h2>
            {data.lastTransactions.length === 0 ? (
              <p className="text-sm text-gray-500">Aucune transaction.</p>
            ) : (
              <ul className="divide-y divide-base-300">
                {data.lastTransactions.map((t) => (
                  <li
                    key={t.id}
                    className="flex flex-col md:flex-row md:items-center justify-between gap-2 py-3"
                  >
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <span className="badge badge-accent badge-md font-semibold whitespace-nowrap">
                        - {t.amount} €
                      </span>
                      <span className="badge badge-ghost badge-sm">
                        {t.budgetName}
                      </span>
                    </div>
                    <div className="flex items-center gap-4 flex-1 min-w-0">
                      <span className="font-medium truncate">
                        {t.description}
                      </span>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-gray-500">
                      <span>
                        {new Date(t.createdAt).toLocaleDateString("fr-FR")} à{" "}
                        {new Date(t.createdAt).toLocaleTimeString("fr-FR", {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                      <Link
                        href="/transactions"
                        className="btn btn-ghost btn-xs"
                      >
                        Voir plus
                      </Link>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        {/* Colonne droite : derniers budgets */}
        <div>
          <h2 className="font-semibold mb-4">Derniers Budgets</h2>
          <div className="flex flex-col gap-4">
            {data.lastBudgets.length === 0 ? (
              <p className="text-sm text-gray-500">Aucun budget.</p>
            ) : (
              data.lastBudgets.map((b) => {
                const pct = Math.min((b.spent / b.amount) * 100, 100);
                const exceeded = b.spent > b.amount;
                const remaining = Math.max(b.amount - b.spent, 0);
                return (
                  <Link
                    key={b.id}
                    href={`/manage/${b.id}`}
                    className="card bg-base-100 border border-base-300 p-4 hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-3">
                        <div className="bg-accent/10 rounded-full p-2 text-xl">
                          {b.emoji}
                        </div>
                        <div>
                          <div className="font-bold">{b.name}</div>
                          <div className="text-xs text-gray-500">
                            {b.transactionsCount} transaction(s)
                          </div>
                        </div>
                      </div>
                      <span className="font-bold text-accent">
                        {b.amount} €
                      </span>
                    </div>
                    <div className="flex justify-between text-sm text-gray-500 mb-2">
                      <span>{b.spent.toFixed(0)} € dépensés</span>
                      <span>{remaining.toFixed(0)} € restants</span>
                    </div>
                    <progress
                      className={`progress w-full ${
                        exceeded ? "progress-error" : "progress-accent"
                      }`}
                      value={pct}
                      max={100}
                    ></progress>
                  </Link>
                );
              })
            )}
          </div>
        </div>
      </div>
    </Wrapper>
  );
};

const KpiCard = ({
  label,
  value,
  icon,
}: {
  label: string;
  value: string;
  icon: React.ReactNode;
}) => (
  <div className="card bg-base-100 border border-base-300 p-5 flex flex-row items-center justify-between">
    <div>
      <div className="text-sm text-gray-500">{label}</div>
      <div className="text-2xl font-bold text-accent mt-1">{value}</div>
    </div>
    <div className="bg-accent/10 p-3 rounded-full text-accent">{icon}</div>
  </div>
);

export default Dashboard;