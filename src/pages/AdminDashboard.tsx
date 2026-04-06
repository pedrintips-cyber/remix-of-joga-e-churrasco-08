import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { ShoppingBag, DollarSign, Clock, CheckCircle, TrendingUp, Eye } from "lucide-react";

interface Stats {
  totalOrders: number;
  totalRevenue: number;
  pendingOrders: number;
  paidOrders: number;
}

const AdminDashboard = () => {
  const [stats, setStats] = useState<Stats>({ totalOrders: 0, totalRevenue: 0, pendingOrders: 0, paidOrders: 0 });
  const [recentOrders, setRecentOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      const { data: orders } = await supabase.from("orders").select("*").order("created_at", { ascending: false });

      if (orders) {
        const totalRevenue = orders.reduce((sum, o) => sum + Number(o.total), 0);
        const pendingOrders = orders.filter((o) => o.status === "pending").length;
        const paidOrders = orders.filter((o) => o.status === "paid").length;

        setStats({ totalOrders: orders.length, totalRevenue, pendingOrders, paidOrders });
        setRecentOrders(orders.slice(0, 10));
      }
      setLoading(false);
    };
    fetchData();
  }, []);

  const statCards = [
    { label: "Total Pedidos", value: stats.totalOrders, icon: ShoppingBag, color: "text-primary" },
    { label: "Receita Total", value: `R$ ${stats.totalRevenue.toFixed(2).replace(".", ",")}`, icon: DollarSign, color: "text-brasil-yellow" },
    { label: "Pendentes", value: stats.pendingOrders, icon: Clock, color: "text-secondary" },
    { label: "Pagos", value: stats.paidOrders, icon: CheckCircle, color: "text-primary" },
  ];

  if (loading) return <div className="flex items-center justify-center py-20 text-muted-foreground">Carregando...</div>;

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
        {statCards.map((s) => (
          <div key={s.label} className="bg-card border border-border rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <s.icon className={`h-4 w-4 ${s.color}`} />
              <span className="text-xs text-muted-foreground">{s.label}</span>
            </div>
            <p className="font-display text-2xl md:text-3xl text-foreground">{s.value}</p>
          </div>
        ))}
      </div>

      {/* Real sales chart - grouped by day */}
      <div className="bg-card border border-border rounded-xl p-5">
        <div className="flex items-center gap-2 mb-4">
          <TrendingUp className="h-4 w-4 text-primary" />
          <h3 className="font-display text-lg text-foreground">Vendas Recentes</h3>
        </div>
        <div className="h-48 flex items-center justify-center">
          {recentOrders.length > 0 ? (
            <div className="w-full space-y-2">
              {(() => {
                const dailyData: Record<string, { count: number; revenue: number }> = {};
                recentOrders.forEach((o) => {
                  const day = new Date(o.created_at).toLocaleDateString("pt-BR");
                  if (!dailyData[day]) dailyData[day] = { count: 0, revenue: 0 };
                  dailyData[day].count++;
                  dailyData[day].revenue += Number(o.total);
                });
                const days = Object.entries(dailyData).slice(0, 7);
                const maxRevenue = Math.max(...days.map(([, d]) => d.revenue), 1);
                return days.map(([day, data]) => (
                  <div key={day} className="flex items-center gap-2">
                    <span className="text-xs w-14 text-muted-foreground shrink-0">{day.slice(0, 5)}</span>
                    <div className="flex-1 bg-muted rounded-full h-3 overflow-hidden">
                      <div
                        className="h-full bg-gradient-green rounded-full transition-all"
                        style={{ width: `${(data.revenue / maxRevenue) * 100}%` }}
                      />
                    </div>
                    <span className="text-xs text-foreground w-24 text-right">R$ {data.revenue.toFixed(0)} ({data.count})</span>
                  </div>
                ));
              })()}
            </div>
          ) : (
            <span className="text-muted-foreground text-sm">Nenhuma venda registrada ainda</span>
          )}
        </div>
      </div>

      {/* Recent Orders */}
      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <div className="flex items-center gap-2 p-4 border-b border-border">
          <Eye className="h-4 w-4 text-primary" />
          <h3 className="font-display text-lg text-foreground">Pedidos Recentes</h3>
        </div>
        {recentOrders.length === 0 ? (
          <div className="p-8 text-center text-muted-foreground text-sm">Nenhum pedido ainda</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-left text-muted-foreground">
                  <th className="px-4 py-3 font-medium">Cliente</th>
                  <th className="px-4 py-3 font-medium">Total</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3 font-medium">Data</th>
                </tr>
              </thead>
              <tbody>
                {recentOrders.map((order) => (
                  <tr key={order.id} className="border-b border-border/50 hover:bg-muted/30">
                    <td className="px-4 py-3 text-foreground">{order.customer_name}</td>
                    <td className="px-4 py-3 text-brasil-yellow font-medium">R$ {Number(order.total).toFixed(2).replace(".", ",")}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                        order.status === "paid" ? "bg-primary/10 text-primary" :
                        order.status === "pending" ? "bg-secondary/10 text-secondary" :
                        "bg-muted text-muted-foreground"
                      }`}>
                        {order.status === "paid" ? "Pago" : order.status === "pending" ? "Pendente" : order.status === "cancelled" ? "Cancelado" : order.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">{new Date(order.created_at).toLocaleDateString("pt-BR")}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
