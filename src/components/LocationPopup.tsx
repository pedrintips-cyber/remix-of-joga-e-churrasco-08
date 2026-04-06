import { useState, useEffect } from "react";
import { MapPin, X, Truck } from "lucide-react";

const LocationPopup = () => {
  const [visible, setVisible] = useState(false);
  const [city, setCity] = useState("");
  const [state, setState] = useState("");

  useEffect(() => {
    if (sessionStorage.getItem("location_shown")) return;

    const getLocation = async () => {
      try {
        const res = await fetch("https://ipapi.co/json/");
        const data = await res.json();
        if (data.city) {
          setCity(data.city);
          setState(data.region || data.country_name || "");
          setVisible(true);
          sessionStorage.setItem("location_shown", "1");
          setTimeout(() => setVisible(false), 8000);
        }
      } catch {
        // Silently fail
      }
    };

    const timer = setTimeout(getLocation, 2000);
    return () => clearTimeout(timer);
  }, []);

  if (!visible) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fade-in">
      <div className="bg-card border-2 border-brasil-green/40 rounded-2xl p-5 max-w-sm w-full shadow-2xl relative overflow-hidden animate-scale-in">
        {/* Top gradient bar */}
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-brasil-green via-brasil-yellow to-brasil-green" />

        <button
          onClick={() => setVisible(false)}
          className="absolute top-3 right-3 p-1.5 hover:bg-muted rounded-full text-muted-foreground transition-colors"
        >
          <X className="h-4 w-4" />
        </button>

        <div className="flex flex-col items-center text-center pt-2">
          <div className="w-14 h-14 rounded-full bg-brasil-green/10 border-2 border-brasil-green/20 flex items-center justify-center mb-3">
            <MapPin className="h-7 w-7 text-brasil-green" />
          </div>

          <h3 className="font-display text-lg text-foreground">
            🇧🇷 Olá, torcedor de {city}!
          </h3>

          <p className="text-sm text-muted-foreground mt-1">
            {state && `${state} • `}Detectamos sua localização
          </p>

          <div className="flex items-center gap-2 mt-4 bg-brasil-green/10 border border-brasil-green/20 rounded-xl px-4 py-2.5 w-full">
            <Truck className="h-5 w-5 text-brasil-green shrink-0" />
            <div className="text-left">
              <p className="text-sm font-bold text-brasil-green">Frete Grátis!</p>
              <p className="text-[11px] text-muted-foreground">Entrega disponível para {city}</p>
            </div>
          </div>

          <p className="text-[11px] text-muted-foreground mt-3">
            ⚽ Aproveite os kits de churrasco pro jogo!
          </p>

          <button
            onClick={() => setVisible(false)}
            className="mt-3 bg-gradient-green text-primary-foreground px-6 py-2 rounded-full font-bold text-sm hover:brightness-110 transition-all active:scale-95"
          >
            Ver Kits 🔥
          </button>
        </div>
      </div>
    </div>
  );
};

export default LocationPopup;
