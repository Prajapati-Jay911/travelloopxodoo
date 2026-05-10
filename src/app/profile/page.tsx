import { AppShell } from "@/components/app-shell";
import { ButtonLink, Icon, PageHeader } from "@/components/ui";

const tabs = ["Profile", "Security", "Preferences", "Saved", "Danger Zone"];

export default function ProfilePage() {
  return (
    <AppShell active="Profile">
      <div className="mx-auto max-w-6xl space-y-8 pb-24 lg:pb-0">
        <PageHeader
          eyebrow="Account settings"
          title="Keep traveler identity, privacy, and preferences current."
          description="Manage profile fields, saved destinations, sessions, and account-level controls from one place."
        />
        <div className="hide-scrollbar flex gap-3 overflow-x-auto">
          {tabs.map((tab, index) => (
            <button
              key={tab}
              type="button"
              aria-label={tab}
              className={`rounded-xl border px-4 py-2 text-sm font-semibold ${
                index === 0
                  ? "border-indigo-400 bg-indigo-500 text-white"
                  : "border-slate-700 bg-slate-950/70 text-slate-300"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
        <section className="grid gap-6 lg:grid-cols-[300px_1fr]">
          <aside className="surface-panel rounded-3xl p-6 text-center">
            <div className="mx-auto grid h-28 w-28 place-items-center rounded-full bg-indigo-500 text-3xl font-semibold text-white">
              PR
            </div>
            <h2 className="mt-5 text-xl font-semibold text-white">Priya Rao</h2>
            <p className="mt-1 text-sm text-slate-400">Mumbai, India</p>
            <button
              type="button"
              aria-label="Upload profile photo"
              className="mt-5 h-11 w-full rounded-xl border border-slate-700 bg-slate-950 text-sm font-semibold text-slate-100"
            >
              Upload photo
            </button>
          </aside>
          <form className="glass-panel rounded-3xl p-6 md:p-8">
            <div className="grid gap-4 md:grid-cols-2">
              {["First name", "Last name", "Email", "Phone", "City", "Country"].map((field) => (
                <label key={field} className="text-sm font-medium text-slate-200">
                  {field}
                  <input
                    aria-label={field}
                    className="mt-2 h-12 w-full rounded-xl border border-slate-700 bg-slate-950 px-4 text-slate-100"
                    placeholder={field}
                  />
                </label>
              ))}
              <label className="text-sm font-medium text-slate-200 md:col-span-2">
                Bio
                <textarea
                  aria-label="Bio"
                  rows={5}
                  className="mt-2 w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-slate-100"
                  placeholder="Budget-aware cultural traveler with a soft spot for train routes."
                />
              </label>
            </div>
            <div className="mt-6 flex justify-end">
              <ButtonLink href="/profile">
                Save changes <Icon name="check" className="h-4 w-4" />
              </ButtonLink>
            </div>
          </form>
        </section>
      </div>
    </AppShell>
  );
}
