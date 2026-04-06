import { useState, useEffect } from "react";
import { Clock } from "lucide-react";

const getNextGameTime = () => {
  const now = new Date();
  const target = new Date(now);
  target.setHours(20, 0, 0, 0);
  if (now >= target) target.setDate(target.getDate() + 1);
  return target.getTime() - now.getTime();
};

const UrgencySection = () => {
  const [timeLeft, setTimeLeft] = useState(getNextGameTime());

  useEffect(() => {
    const timer = setInterval(() => setTimeLeft(getNextGameTime()), 1000);
    return () => clearInterval(timer);
  }, []);

  const hours = Math.floor(timeLeft / 3600000);
  const minutes = Math.floor((timeLeft % 3600000) / 60000);
  const seconds = Math.floor((timeLeft % 60000) / 1000);

  return (
    <section className="py-6 md:py-14 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-primary/8 via-secondary/5 to-primary/8" />
      <div className="container text-center relative z-10">
        <div className="inline-flex items-center gap-1.5 bg-primary/10 text-primary px-3 py-1 rounded-full text-[10px] md:text-xs font-bold uppercase tracking-wider mb-3 md:mb-5">
          <Clock className="h-3 w-3" />
          Tempo Limitado
        </div>
        <h2 className="font-display text-xl md:text-4xl text-foreground mb-1">
          PEDIDOS FECHAM ANTES DO JOGO
        </h2>
        <p className="text-muted-foreground text-xs md:text-sm mb-4 md:mb-6">Não fique sem churrasco!</p>

        <div className="flex justify-center gap-2 md:gap-4">
          {[
            { value: hours, label: "Hrs" },
            { value: minutes, label: "Min" },
            { value: seconds, label: "Seg" },
          ].map((t) => (
            <div key={t.label} className="bg-card border border-border rounded-lg p-2 md:p-4 min-w-[52px] md:min-w-[80px]">
              <span className="font-display text-xl md:text-4xl text-brasil-yellow block leading-none">
                {String(t.value).padStart(2, "0")}
              </span>
              <p className="text-muted-foreground text-[8px] md:text-xs mt-0.5 uppercase">{t.label}</p>
            </div>
          ))}
        </div>

        <a href="#kits" className="inline-flex items-center gap-1.5 mt-5 md:mt-8 bg-gradient-green text-primary-foreground px-5 py-2 md:px-8 md:py-3 rounded-full font-bold text-xs md:text-sm shadow-brasil hover:brightness-110 active:scale-95 transition-all">
          Garantir Meu Kit 🔥
        </a>
      </div>
    </section>
  );
};

export default UrgencySection;
