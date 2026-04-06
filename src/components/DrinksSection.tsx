import { useEffect, useState } from "react";
import { CirclePlus, Users } from "lucide-react";
import { useCart } from "@/contexts/CartContext";
import { supabase } from "@/integrations/supabase/client";

interface Product {
  id: string;
  name: string;
  description: string | null;
  price: number;
  image_url: string | null;
  tag: string | null;
  category_id: string | null;
}

const DrinksSection = () => {
  const { addItem } = useCart();
  const [drinks, setDrinks] = useState<Product[]>([]);

  useEffect(() => {
    const fetchDrinks = async () => {
      const { data: cats } = await supabase
        .from("categories")
        .select("id")
        .ilike("name", "%bebida%")
        .eq("active", true);

      if (cats && cats.length > 0) {
        const catIds = cats.map((c) => c.id);
        const { data: prods } = await supabase
          .from("products")
          .select("*")
          .in("category_id", catIds)
          .eq("active", true)
          .order("sort_order");
        if (prods) setDrinks(prods);
      }
    };
    fetchDrinks();
  }, []);

  if (drinks.length === 0) return null;

  return (
    <section id="bebidas" className="py-6 md:py-14">
      <div className="container">
        <div className="text-center mb-4 md:mb-8">
          <span className="inline-block bg-secondary/10 text-secondary text-[10px] md:text-xs font-bold uppercase tracking-widest px-3 py-1 rounded-full mb-2">
            🍺 Bebidas
          </span>
          <h2 className="font-display text-2xl md:text-4xl text-gradient-gold">GELADAS PRO JOGO</h2>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2.5 md:gap-5">
          {drinks.map((d) => (
            <div key={d.id} className="bg-card rounded-xl overflow-hidden border border-border hover:border-secondary/40 transition-all group">
              <div className="relative overflow-hidden">
                {d.image_url ? (
                  <img
                    src={d.image_url}
                    alt={d.name}
                    className="w-full h-24 md:h-44 object-cover group-hover:scale-105 transition-transform duration-500"
                    loading="lazy"
                  />
                ) : (
                  <div className="w-full h-24 md:h-44 bg-muted flex items-center justify-center text-muted-foreground text-3xl">🍺</div>
                )}
                {d.tag && (
                  <span className="absolute top-1.5 left-1.5 md:top-3 md:left-3 bg-background/85 backdrop-blur-sm text-foreground px-1.5 py-0.5 md:px-2.5 md:py-1 rounded-full text-[8px] md:text-xs font-bold">
                    {d.tag}
                  </span>
                )}
              </div>
              <div className="p-2.5 md:p-4">
                <h3 className="font-display text-sm md:text-lg text-foreground leading-tight">{d.name}</h3>
                {d.description && (
                  <p className="text-muted-foreground text-[10px] md:text-sm mt-0.5 line-clamp-1">{d.description}</p>
                )}
                <div className="mt-2 md:mt-3 pt-2 border-t border-border/50">
                  <span className="font-display text-base md:text-xl text-brasil-yellow block leading-none">
                    R$ {Number(d.price).toFixed(2).replace(".", ",")}
                  </span>
                  <button
                    onClick={() => addItem({ id: d.id, name: d.name, price: Number(d.price), image: d.image_url || "" })}
                    className="w-full flex items-center justify-center gap-1 bg-secondary/10 hover:bg-secondary/20 text-secondary mt-2 py-1.5 md:py-2 rounded-full font-bold text-[10px] md:text-sm transition-colors active:scale-95"
                  >
                    <CirclePlus className="h-3 w-3 md:h-4 md:w-4" /> Adicionar
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default DrinksSection;
