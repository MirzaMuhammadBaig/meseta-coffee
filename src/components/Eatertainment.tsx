import { Gamepad2, Wifi, Users, Music } from "lucide-react";
import Reveal from "@/components/anim/Reveal";

const perks = [
  {
    icon: Gamepad2,
    title: "Board games on every table",
    body: "Jenga, Ludo, Uno, chess. Yours to keep busy with for as long as you like.",
  },
  {
    icon: Wifi,
    title: "Fast, free Wi-Fi",
    body: "Work-friendly tables, plenty of power outlets, no time limit on lattes.",
  },
  {
    icon: Users,
    title: "Kid & family-friendly",
    body: "High chairs, a kid's menu, and a team that loves a happy family table.",
  },
  {
    icon: Music,
    title: "Carefully curated playlists",
    body: "Mellow mornings, upbeat afternoons, jazz-and-conversation evenings.",
  },
];

export default function Eatertainment() {
  return (
    <section className="section">
      <div className="container-base">
        <Reveal className="mx-auto max-w-2xl text-center">
          <p className="eyebrow">Why we call it Eatertainment</p>
          <h2 className="mt-3 font-display text-3xl text-coffee-800 sm:mt-4 sm:text-4xl lg:text-5xl">
            More than a coffee run.
          </h2>
          <p className="mt-3 text-coffee-600 sm:mt-4">
            Meseta is designed to be a third place, the spot between home and
            work where you actually want to spend a few hours.
          </p>
        </Reveal>

        <div className="mt-10 grid gap-5 sm:mt-14 sm:grid-cols-2 sm:gap-6 lg:grid-cols-4">
          {perks.map((p, idx) => (
            <Reveal
              key={p.title}
              delay={idx * 110}
              variant="scale"
              className="card-interactive group flex h-full flex-col items-start p-6 sm:p-7"
            >
              <div className="rounded-2xl bg-gold-500/15 p-3 text-gold-600 transition-all duration-500 ease-out group-hover:-rotate-6 group-hover:scale-110 group-hover:bg-gold-500/30 group-hover:text-gold-500">
                <p.icon className="h-6 w-6" strokeWidth={1.6} />
              </div>
              <h3 className="mt-4 font-display text-lg text-coffee-800 transition-colors duration-300 group-hover:text-coffee-900 sm:mt-5 sm:text-xl">
                {p.title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-coffee-500">
                {p.body}
              </p>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
