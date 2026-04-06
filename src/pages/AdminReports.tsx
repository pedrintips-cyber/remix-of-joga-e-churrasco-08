import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { TrendingUp, DollarSign, ShoppingBag, Calendar } from "lucide-react";

const AdminReports = () => {
  const [orders, setOrders] = useState<any[]>([]);
  const [period, setPeriod] = useState<"7d" | "30d" | "all">("30d");

  useEffect(() => {
    const fetch = async () => {
      const { data } = await supabase.from("orders").select("*").order("created_at", { ascending: false });
      if (data) setOrders(data);
    };
    fetch();
  }, []);

  const now = new Date();
  const filtered = orders.filter((o) => {
    if (period === "all") return true;
    const days = period === "7d" ? 7 : 30;
    return (now.getTime() - new Date(o.created_at).getTime()) < days * 86400000;
  });

  const totalRevenue = filtered.reduce((s, o) => s + Number(o.total), 0);
  const paidRevenue = filtered.filter((o) => o.status === "paid").reduce((s, o) => s + Number(o.total), 0);
  const avgTicket = filtered.length > 0 ? totalRevenue / filtered.length : 0;

  // Group by day
  const dailyData: Record<string, { count: number; revenue: number }> = {};
  filtered.forEach((o) => {
    const day = new Date(o.created_at).toLocaleDateString("pt-BR");
    if (!dailyData[day]) dailyData[day] = { count: 0, revenue: 0 };
    dailyData[day].count++;
    dailyData[day].revenue += Number(o.total);
  });

  const days = Object.entries(dailyData).slice(0, 14).reverse();
  const maxRevenue = Math.max(...days.map(([, d]) => d.revenue), 1);

  return (
    <div className="space-y-6">
      {/* Period filter */}
      <div className="flex gap-2">
        {[{ v: "7d" as const, l: "7 dias" }, { v: "30d" as const, l: "30 dias" }, { v: "all" as const, l: "Tudo" }].map((p) => (
          <button key={p.v} onClick={() => setPeriod(p.v)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
              period === p.v ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"
            }`}>
            {p.l}
          </button>
        ))}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: "Pedidos", value: filtered.length, icon: ShoppingBag, color: "text-primary" },
          { label: "Receita Total", value: `R$ ${totalRevenue.toFixed(0)}`, icon: DollarSign, color: "text-brasil-yellow" },
          { label: "Receita Paga", value: `R$ ${paidRevenue.toFixed(0)}`, icon: TrendingUp, color: "text-primary" },
          { label: "Ticket Médio", value: `R$ ${avgTicket.toFixed(0)}`, icon: Calendar, color: "text-accent" },
        ].map((s) => (
          <div key={s.label} className="bg-card border border-border rounded-xl p-4">
            <div className="flex items-center gap-2 mb-1">
              <s.icon className={`h-4 w-4 ${s.color}`} />
              <span className="text-xs text-muted-foreground">{s.label}</span>
            </div>
            <p className="font-display text-2xl text-foreground">{s.value}</p>
          </div>
        ))}
      </div>

      {/* Chart */}
      <div className="bg-card border border-border rounded-xl p-5">
        <h3 className="font-display text-lg text-foreground mb-4 flex items-center gap-2">
          <TrendingUp className="h-4 w-4 text-primary" /> Vendas por Dia
        </h3>
        {days.length === 0 ? (
          <p className="text-center text-muted-foreground text-sm py-8">Nenhum dado no período</p>
        ) : (
          <div className="space-y-2">
            {days.map(([day, data]) => (
              <div key={day} className="flex items-center gap-3">
                <span className="text-xs text-muted-foreground w-16 shrink-0">{day.slice(0, 5)}</span>
                <div className="flex-1 bg-muted rounded-full h-4 overflow-hidden">
                  <div className="h-full bg-gradient-green rounded-full transition-all"
                    style={{ width: `${(data.revenue / maxRevenue) * 100}%` }} />
                </div>
                <span className="text-xs text-foreground w-20 text-right">R$ {data.revenue.toFixed(0)} ({data.count})</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminReports;
