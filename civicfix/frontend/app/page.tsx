import Link from "next/link";

export default function HomePage() {
  return (
    <main className="mx-auto min-h-screen max-w-5xl px-6 py-16 md:py-24">
      <header className="mb-20">
        <p className="mb-6 font-mono text-sm text-asphalt/60">CivicFix</p>
        <h1 className="max-w-2xl font-display text-5xl font-800 leading-[1.05] md:text-6xl">
          See a problem.
          <br />
          Report it.
        </h1>
        <p className="mt-6 max-w-md text-lg text-asphalt/70">
          Photograph a pothole, a broken streetlight, a damaged sidewalk.
          CivicFix figures out who handles it and files the ticket.
        </p>
        <Link
          href="/report"
          className="mt-10 inline-flex items-center bg-signal px-8 py-4 font-display text-lg font-700 text-concrete transition-colors hover:bg-asphalt"
        >
          Report an Issue
        </Link>
      </header>

      <section className="grid grid-cols-1 gap-px border border-paint bg-paint sm:grid-cols-3">
        <StatBlock label="Recent Reports" value="—" />
        <StatBlock label="Active Reports" value="—" accent="curb" />
        <StatBlock label="Resolved" value="—" accent="route" />
      </section>
    </main>
  );
}

function StatBlock({
  label,
  value,
  accent,
}: {
  label: string;
  value: string;
  accent?: "curb" | "route";
}) {
  const accentClass =
    accent === "curb" ? "text-curb" : accent === "route" ? "text-route" : "text-asphalt";
  return (
    <div className="bg-concrete p-6">
      <p className={`font-mono text-3xl font-medium ${accentClass}`}>{value}</p>
      <p className="mt-1 text-sm text-asphalt/60">{label}</p>
    </div>
  );
}
