import { ShoppingCart, Menu, X, Flame } from "lucide-react";
import { useCart } from "@/contexts/CartContext";
import { useState } from "react";

const navLinks = [
  { label: "Início", href: "#inicio" },
  { label: "Kits", href: "#kits" },
  { label: "Bebidas", href: "#bebidas" },
  { label: "Contato", href: "#contato" },
];

const Header = () => {
  const { toggleCart, totalItems } = useCart();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-lg border-b border-border/50">
      <div className="container flex items-center justify-between h-12 md:h-14">
        <a href="#inicio" className="flex items-center gap-1">
          <Flame className="h-5 w-5 text-brasil-green" />
          <span className="font-display text-base md:text-xl text-gradient-brasil leading-none">CHURRASCO DA TORCIDA</span>
        </a>

        <nav className="hidden md:flex items-center gap-5">
          {navLinks.map((l) => (
            <a key={l.href} href={l.href} className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
              {l.label}
            </a>
          ))}
          <a href="#kits" className="bg-gradient-cta text-secondary-foreground px-4 py-1.5 rounded-full font-bold text-sm shadow-cta hover:brightness-110 transition-all">
            🔥 Ver Kits
          </a>
        </nav>

        <div className="flex items-center gap-1.5">
          <button onClick={toggleCart} className="relative p-1.5 hover:bg-muted rounded-full transition-colors">
            <ShoppingCart className="h-4 w-4 md:h-5 md:w-5 text-foreground" />
            {totalItems > 0 && (
              <span className="absolute -top-0.5 -right-0.5 bg-brasil-green text-primary-foreground text-[8px] font-bold w-4 h-4 rounded-full flex items-center justify-center animate-scale-in">
                {totalItems}
              </span>
            )}
          </button>
          <button onClick={() => setMenuOpen(!menuOpen)} className="md:hidden p-1.5 hover:bg-muted rounded-full">
            {menuOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </button>
        </div>
      </div>

      {menuOpen && (
        <div className="md:hidden bg-background/98 backdrop-blur-lg border-b border-border animate-fade-in">
          <nav className="container flex flex-col gap-0.5 py-2">
            {navLinks.map((l) => (
              <a key={l.href} href={l.href} onClick={() => setMenuOpen(false)} className="text-foreground font-medium py-2 px-3 rounded-lg hover:bg-muted transition-colors text-sm">
                {l.label}
              </a>
            ))}
            <a href="#kits" onClick={() => setMenuOpen(false)} className="bg-gradient-cta text-secondary-foreground py-2.5 rounded-full font-bold text-center mt-1 text-sm shadow-cta">
              🔥 Ver Kits
            </a>
          </nav>
        </div>
      )}
    </header>
  );
};

export default Header;
