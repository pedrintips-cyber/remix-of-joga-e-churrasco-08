import { Truck, Beef, Flame, Trophy } from "lucide-react";

const items = [
  { icon: Truck, title: "Entrega Rápida", desc: "Antes do jogo" },
  { icon: Beef, title: "Carnes Premium", desc: "Qualidade top" },
  { icon: Flame, title: "Pronto pra Assar", desc: "Só grelhar" },
  { icon: Trophy, title: "Copa do Mundo", desc: "Clima de jogo" },
];

const Differentials = () => (
  <section className="py-5 md:py-12 bg-muted/30">
    <div className="container">
      <div className="grid grid-cols-4 gap-2 md:gap-5">
        {items.map((item) => (
          <div key={item.title} className="flex flex-col items-center text-center p-2 md:p-5 rounded-xl bg-card border border-border">
            <div className="w-8 h-8 md:w-11 md:h-11 rounded-lg bg-primary/10 flex items-center justify-center mb-1.5 md:mb-3">
              <item.icon className="h-4 w-4 md:h-5 md:w-5 text-primary" />
            </div>
            <h3 className="font-display text-[10px] md:text-base text-foreground leading-tight">{item.title}</h3>
            <p className="text-muted-foreground text-[8px] md:text-xs mt-0.5 hidden md:block">{item.desc}</p>
          </div>
        ))}
      </div>
    </div>
  </section>
);

export default Differentials;
