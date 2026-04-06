import { useEffect, useState } from "react";
import { Users, Zap } from "lucide-react";
import { useCart } from "@/contexts/CartContext";
import { supabase } from "@/integrations/supabase/client";

interface Category {
  id: string;
  name: string;
  sort_order: number;
}

interface Product {
  id: string;
  name: string;
  description: string | null;
  price: number;
  image_url: string | null;
  serves: number | null;
  tag: string | null;
  category_id: string | null;
  sort_order: number;
}

const KitsSection = () => {
  const { addItem } = useCart();
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      const [{ data: cats }, { data: prods }] = await Promise.all([
        supabase.from("categories").select("*").eq("active", true).order("sort_order"),
        supabase.from("products").select("*").eq("active", true).order("sort_order"),
      ]);
      if (cats) setCategories(cats);
      if (prods) setProducts(prods);
    };
    fetchData();
  }, []);

  if (categories.length === 0 && products.length === 0) return null;

  // Products without category
  const uncategorized = products.filter((p) => !p.category_id);

  return (
    <section id="kits" className="py-6 md:py-16">
      <div className="container">
        {categories.map((cat) => {
          const catProducts = products.filter((p) => p.category_id === cat.id);
          if (catProducts.length === 0) return null;

          return (
            <div key={cat.id} className="mb-8">
              <div className="text-center mb-4 md:mb-6">
                <span className="inline-block bg-primary/15 text-primary text-[10px] md:text-xs font-bold uppercase tracking-widest px-3 py-1 rounded-full mb-2">
                  {cat.name}
                </span>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-3 gap-2.5 md:gap-5">
                {catProducts.map((product) => (
                  <ProductCard key={product.id} product={product} addItem={addItem} />
                ))}
              </div>
            </div>
          );
        })}

        {uncategorized.length > 0 && (
          <div className="mb-8">
            <div className="text-center mb-4 md:mb-6">
              <span className="inline-block bg-primary/15 text-primary text-[10px] md:text-xs font-bold uppercase tracking-widest px-3 py-1 rounded-full mb-2">
                Produtos
              </span>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2.5 md:gap-5">
              {uncategorized.map((product) => (
                <ProductCard key={product.id} product={product} addItem={addItem} />
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

const ProductCard = ({ product, addItem }: { product: Product; addItem: any }) => (
  <div className="bg-card rounded-xl overflow-hidden border border-border hover:border-primary/40 transition-all group">
    <div className="relative overflow-hidden">
      {product.image_url ? (
        <img
          src={product.image_url}
          alt={product.name}
          className="w-full h-24 md:h-52 object-cover group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
          width={800}
          height={800}
        />
      ) : (
        <div className="w-full h-24 md:h-52 bg-muted flex items-center justify-center text-muted-foreground text-2xl">🍖</div>
      )}
      {product.tag && (
        <span className="absolute top-1.5 left-1.5 md:top-3 md:left-3 bg-background/85 backdrop-blur-sm text-foreground px-1.5 py-0.5 md:px-2.5 md:py-1 rounded-full text-[8px] md:text-xs font-bold">
          {product.tag}
        </span>
      )}
    </div>
    <div className="p-2.5 md:p-4">
      <h3 className="font-display text-sm md:text-xl text-foreground leading-tight">{product.name}</h3>
      {product.description && (
        <p className="text-muted-foreground text-[10px] md:text-sm mt-0.5 line-clamp-1">{product.description}</p>
      )}
      {product.serves && (
        <div className="flex items-center gap-1 mt-1 text-muted-foreground text-[9px] md:text-xs">
          <Users className="h-2.5 w-2.5 md:h-3.5 md:w-3.5" />
          <span>{product.serves} pessoas</span>
        </div>
      )}
      <div className="mt-2 md:mt-4 pt-2 border-t border-border/50">
        <span className="font-display text-base md:text-2xl text-brasil-yellow block leading-none">
          R$ {Number(product.price).toFixed(2).replace(".", ",")}
        </span>
        <button
          onClick={() => addItem({ id: product.id, name: product.name, price: Number(product.price), image: product.image_url || "" })}
          className="w-full flex items-center justify-center gap-1 bg-gradient-green text-primary-foreground mt-2 py-1.5 md:py-2.5 rounded-full font-bold text-[10px] md:text-sm hover:brightness-110 active:scale-95 transition-all"
        >
          <Zap className="h-3 w-3 md:h-4 md:w-4" />
          Pedir Agora
        </button>
      </div>
    </div>
  </div>
);

export default KitsSection;
