import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Eye, CheckCircle, Clock, XCircle } from "lucide-react";

interface Order {
  id: string;
  customer_name: string;
  customer_phone: string;
  customer_address: string;
  payment_method: string;
  items: any;
  total: number;
  status: string;
  created_at: string;
}

const statusOptions = [
  { value: "pending", label: "Pendente", icon: Clock, color: "text-secondary" },
  { value: "paid", label: "Pago", icon: CheckCircle, color: "text-primary" },
  { value: "cancelled", label: "Cancelado", icon: XCircle, color: "text-destructive" },
];

const AdminOrders = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [selected, setSelected] = useState<Order | null>(null);
  const [filter, setFilter] = useState("all");

  const fetchOrders = async () => {
    const { data } = await supabase.from("orders").select("*").order("created_at", { ascending: false });
    if (data) setOrders(data);
  };

  useEffect(() => { fetchOrders(); }, []);

  const updateStatus = async (id: string, status: string) => {
    await supabase.from("orders").update({ status }).eq("id", id);
    fetchOrders();
    if (selected?.id === id) setSelected({ ...selected, status });
  };

  const filtered = filter === "all" ? orders : orders.filter((o) => o.status === filter);

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex gap-2 overflow-x-auto pb-1">
        {[{ value: "all", label: "Todos" }, ...statusOptions].map((s) => (
          <button key={s.value} onClick={() => setFilter(s.value)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors ${
              filter === s.value ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground hover:text-foreground"
            }`}>
            {s.label} {s.value === "all" ? `(${orders.length})` : `(${orders.filter((o) => o.status === s.value).length})`}
          </button>
        ))}
      </div>

      {/* Order detail modal */}
      {selected && (
        <div className="fixed inset-0 bg-background/70 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setSelected(null)}>
          <div className="bg-card border border-border rounded-xl p-5 max-w-md w-full max-h-[80vh] overflow-y-auto animate-scale-in" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-display text-xl text-foreground">Pedido</h3>
              <button onClick={() => setSelected(null)} className="text-muted-foreground hover:text-foreground">✕</button>
            </div>
            <div className="space-y-3 text-sm">
              <div><span className="text-muted-foreground">Cliente:</span> <span className="text-foreground font-medium">{selected.customer_name}</span></div>
              <div><span className="text-muted-foreground">Telefone:</span> <span className="text-foreground">{selected.customer_phone}</span></div>
              <div><span className="text-muted-foreground">Endereço:</span> <span className="text-foreground">{selected.customer_address}</span></div>
              <div><span className="text-muted-foreground">Pagamento:</span> <span className="text-foreground uppercase">{selected.payment_method}</span></div>
              <div className="border-t border-border pt-3">
                <p className="text-muted-foreground mb-2">Itens:</p>
                {Array.isArray(selected.items) && selected.items.map((item: any, i: number) => (
                  <div key={i} className="flex justify-between text-foreground py-0.5">
                    <span>{item.quantity}x {item.name}</span>
                    <span>R$ {(item.price * item.quantity).toFixed(2).replace(".", ",")}</span>
                  </div>
                ))}
              </div>
              <div className="flex justify-between font-bold text-foreground border-t border-border pt-2">
                <span>Total</span>
                <span className="text-brasil-yellow">R$ {Number(selected.total).toFixed(2).replace(".", ",")}</span>
              </div>
              <div className="flex gap-2 pt-2">
                {statusOptions.map((s) => (
                  <button key={s.value} onClick={() => updateStatus(selected.id, s.value)}
                    className={`flex-1 py-2 rounded-lg text-xs font-medium transition-colors ${
                      selected.status === s.value ? "bg-primary/10 text-primary border border-primary/30" : "bg-muted text-muted-foreground hover:text-foreground"
                    }`}>
                    {s.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Orders list */}
      <div className="space-y-2">
        {filtered.map((order) => {
          const statusInfo = statusOptions.find((s) => s.value === order.status) || statusOptions[0];
          return (
            <div key={order.id} className="bg-card border border-border rounded-xl p-3 flex items-center gap-3 cursor-pointer hover:border-primary/30 transition-colors"
              onClick={() => setSelected(order)}>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-medium text-foreground truncate">{order.customer_name}</p>
                  <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium ${
                    order.status === "paid" ? "bg-primary/10 text-primary" :
                    order.status === "pending" ? "bg-secondary/10 text-secondary" :
                    "bg-destructive/10 text-destructive"
                  }`}>
                    {statusInfo.label}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground">{new Date(order.created_at).toLocaleString("pt-BR")}</p>
              </div>
              <p className="text-sm font-display text-brasil-yellow">R$ {Number(order.total).toFixed(2).replace(".", ",")}</p>
              <Eye className="h-4 w-4 text-muted-foreground" />
            </div>
          );
        })}
        {filtered.length === 0 && <p className="text-center text-muted-foreground text-sm py-8">Nenhum pedido encontrado</p>}
      </div>
    </div>
  );
};

export default AdminOrders;
