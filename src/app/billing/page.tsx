import Link from "next/link";
import { AppShell } from "@/components/app-shell";
import { Icon } from "@/components/ui";
import { trips, formatCurrency } from "@/lib/traveloop-data";

const invoiceItems = [
  {
    id: 1,
    category: "Hotel",
    description: "Hotel booking Paris",
    qty: "3 nights",
    unitCost: 450,
    amount: 1350,
  },
  {
    id: 2,
    category: "Travel",
    description: "Flight bookings (DEL → PAR)",
    qty: "1",
    unitCost: 1200,
    amount: 1200,
  },
  {
    id: 3,
    category: "Activities",
    description: "Private architecture walk",
    qty: "2 persons",
    unitCost: 80,
    amount: 160,
  },
  {
    id: 4,
    category: "Food",
    description: "Market tasting route",
    qty: "2 persons",
    unitCost: 64,
    amount: 128,
  },
  {
    id: 5,
    category: "Transport",
    description: "Airport transfers & local rides",
    qty: "4 rides",
    unitCost: 42,
    amount: 168,
  },
];

const travelers = ["James", "Arjun", "Jenny", "Cristina"];

export default function BillingPage() {
  const trip = trips[0];
  const subtotal = invoiceItems.reduce((sum, item) => sum + item.amount, 0);
  const tax = Math.round(subtotal * 0.05);
  const discount = 50;
  const grandTotal = subtotal + tax - discount;
  const totalBudget = trip.budget;
  const remaining = totalBudget - grandTotal;
  const budgetUsedPercent = Math.round((grandTotal / totalBudget) * 100);

  return (
    <AppShell active="Billing">
      <div className="mx-auto max-w-7xl space-y-6 pb-24 lg:pb-0">
        {/* Search toolbar */}
        <section className="surface-panel grid gap-3 rounded-2xl p-3 md:grid-cols-[1fr_auto_auto]">
          <label className="flex h-12 items-center gap-3 rounded-xl border border-sky-100 bg-white px-4 text-sm text-slate-500">
            <Icon name="search" className="h-4 w-4" />
            <input
              aria-label="Search invoices"
              placeholder="Search invoices..."
              className="w-full bg-transparent text-slate-900 placeholder:text-slate-400 focus:outline-none"
            />
          </label>
          {["Filter", "Sort #"].map((label) => (
            <button
              key={label}
              type="button"
              className="h-12 rounded-xl border border-sky-100 bg-white px-5 text-sm font-semibold text-slate-600 transition hover:border-sky-300 hover:bg-sky-50"
            >
              {label}
            </button>
          ))}
        </section>

        {/* Back link */}
        <Link
          href={`/trips/${trip.id}`}
          className="inline-flex items-center gap-1.5 text-sm font-semibold text-sky-600 transition hover:text-sky-500"
        >
          ← Back to My Trips
        </Link>

        <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
          {/* Main invoice area */}
          <div className="space-y-6">
            {/* Invoice header */}
            <section className="overflow-hidden rounded-2xl border border-sky-100 bg-white shadow-xl shadow-sky-900/5">
              <div className="grid gap-6 border-b border-sky-100 p-6 md:grid-cols-[auto_1fr_1fr]">
                {/* Trip thumbnail */}
                <div className="grid h-28 w-28 shrink-0 place-items-center rounded-2xl border border-sky-100 bg-sky-50 text-sky-600">
                  <Icon name="trips" className="h-10 w-10" />
                </div>

                {/* Trip info */}
                <div>
                  <h2 className="text-lg font-black text-slate-950">
                    {trip.name}
                  </h2>
                  <p className="mt-1 text-sm text-slate-500">{trip.dates}</p>
                  <p className="mt-0.5 text-xs text-slate-400">
                    Created by: {travelers[0]}
                  </p>

                  <div className="mt-3">
                    <p className="text-xs font-bold text-slate-500">
                      Traveler Details:
                    </p>
                    <div className="mt-1 flex flex-wrap gap-2">
                      {travelers.map((t) => (
                        <span
                          key={t}
                          className="rounded-full bg-sky-50 px-2.5 py-0.5 text-xs font-semibold text-sky-600"
                        >
                          {t}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Invoice meta */}
                <div className="space-y-2 text-sm">
                  <div>
                    <p className="text-xs text-slate-500">Invoice Id</p>
                    <p className="font-bold text-slate-950">INV-oye-3D24D</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500">Generated date</p>
                    <p className="font-bold text-slate-950">May 20, 2025</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <p className="text-xs text-slate-500">Payment status:</p>
                    <span className="rounded-full bg-amber-50 px-2.5 py-0.5 text-xs font-bold text-amber-600">
                      Pending
                    </span>
                  </div>
                </div>
              </div>

              {/* Invoice table */}
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-sky-100 bg-sky-50/50 text-left">
                      <th className="px-4 py-3 font-bold text-slate-600">#</th>
                      <th className="px-4 py-3 font-bold text-slate-600">
                        Category
                      </th>
                      <th className="px-4 py-3 font-bold text-slate-600">
                        Description
                      </th>
                      <th className="px-4 py-3 font-bold text-slate-600">
                        Qty/Details
                      </th>
                      <th className="px-4 py-3 text-right font-bold text-slate-600">
                        Unit Cost
                      </th>
                      <th className="px-4 py-3 text-right font-bold text-slate-600">
                        Amount
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-sky-50">
                    {invoiceItems.map((item) => (
                      <tr
                        key={item.id}
                        className="transition hover:bg-sky-50/30"
                      >
                        <td className="px-4 py-3 text-slate-400">{item.id}</td>
                        <td className="px-4 py-3">
                          <span className="rounded-full bg-sky-50 px-2.5 py-0.5 text-xs font-semibold text-sky-600">
                            {item.category}
                          </span>
                        </td>
                        <td className="px-4 py-3 font-medium text-slate-950">
                          {item.description}
                        </td>
                        <td className="px-4 py-3 text-slate-500">{item.qty}</td>
                        <td className="px-4 py-3 text-right text-slate-500">
                          {formatCurrency(item.unitCost)}
                        </td>
                        <td className="px-4 py-3 text-right font-bold text-slate-950">
                          {formatCurrency(item.amount)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Totals */}
              <div className="border-t border-sky-100 p-6">
                <div className="ml-auto max-w-xs space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Subtotal</span>
                    <span className="font-bold text-slate-950">
                      {formatCurrency(subtotal)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Tax (5%)</span>
                    <span className="font-bold text-slate-950">
                      {formatCurrency(tax)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Discount</span>
                    <span className="font-bold text-emerald-600">
                      -{formatCurrency(discount)}
                    </span>
                  </div>
                  <div className="flex justify-between border-t border-sky-100 pt-2">
                    <span className="text-lg font-black text-slate-950">
                      Grand Total
                    </span>
                    <span className="text-lg font-black text-slate-950">
                      {formatCurrency(grandTotal)}
                    </span>
                  </div>
                </div>
              </div>
            </section>

            {/* Action buttons */}
            <section className="flex flex-wrap gap-3">
              <button
                type="button"
                className="inline-flex h-12 items-center gap-2 rounded-xl border border-sky-100 bg-white px-5 text-sm font-bold text-sky-700 shadow-sm shadow-sky-100 transition hover:border-sky-300 hover:bg-sky-50"
              >
                <Icon name="notes" className="h-4 w-4" />
                Download Invoice
              </button>
              <button
                type="button"
                className="inline-flex h-12 items-center gap-2 rounded-xl border border-sky-100 bg-white px-5 text-sm font-bold text-sky-700 shadow-sm shadow-sky-100 transition hover:border-sky-300 hover:bg-sky-50"
              >
                <Icon name="share" className="h-4 w-4" />
                Export as PDF
              </button>
              <button
                type="button"
                className="ml-auto inline-flex h-12 items-center gap-2 rounded-xl bg-[#ff5a3d] px-6 text-sm font-black text-white shadow-lg shadow-orange-200 transition hover:bg-[#f04a2d]"
              >
                <Icon name="check" className="h-4 w-4" />
                Mark as Paid
              </button>
            </section>
          </div>

          {/* Right sidebar — Budget Insights */}
          <aside className="space-y-5">
            <section className="overflow-hidden rounded-2xl border border-sky-100 bg-white shadow-xl shadow-sky-900/5">
              <div className="border-b border-sky-100 p-5">
                <h3 className="text-lg font-black text-slate-950">
                  Budget Insights
                </h3>
              </div>
              <div className="p-5">
                {/* Donut chart representation */}
                <div className="mb-5 flex justify-center">
                  <div className="relative">
                    <svg viewBox="0 0 36 36" className="h-32 w-32">
                      <path
                        d="M18 2.0845a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                        fill="none"
                        stroke="#e0f2fe"
                        strokeWidth="3"
                      />
                      <path
                        d="M18 2.0845a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                        fill="none"
                        stroke="#0ea5e9"
                        strokeWidth="3"
                        strokeDasharray={`${budgetUsedPercent}, 100`}
                        strokeLinecap="round"
                      />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <span className="text-xl font-black text-slate-950">
                        {budgetUsedPercent}%
                      </span>
                      <span className="text-xs text-slate-500">used</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Total Budget</span>
                    <span className="font-bold text-slate-950">
                      {formatCurrency(totalBudget)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Total Spent</span>
                    <span className="font-bold text-slate-950">
                      {formatCurrency(grandTotal)}
                    </span>
                  </div>
                  <div className="flex justify-between border-t border-sky-100 pt-2">
                    <span className="text-slate-500">Remaining</span>
                    <span
                      className={`font-bold ${remaining >= 0 ? "text-emerald-600" : "text-rose-600"}`}
                    >
                      {formatCurrency(remaining)}
                    </span>
                  </div>
                </div>

                <Link
                  href={`/trips/${trip.id}/budget`}
                  className="mt-5 flex h-11 items-center justify-center gap-2 rounded-xl border border-sky-100 bg-white text-sm font-bold text-sky-700 shadow-sm shadow-sky-100 transition hover:border-sky-300 hover:bg-sky-50"
                >
                  View Full Budget
                </Link>
              </div>
            </section>
          </aside>
        </div>
      </div>
    </AppShell>
  );
}
