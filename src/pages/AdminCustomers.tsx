import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Users, Phone, Mail, MapPin, CheckCircle, Clock, Search } from "lucide-react";

interface Customer {
  name: string;
  phone: string;
  email: string | null;
  address: string;
  ordersCount: number;
  totalSpent: number;
  lastOrderDate: string;
  lastStatus: string;
}

const AdminCustomers = () => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    const fetchCustomers = async () => {
      const { data: orders } = await supabase.from("orders").select("*").order("created_at", { ascending: false });

      if (orders) {
        const customerMap: Record<string, Customer> = {};
        orders.forEach((o) => {
          const key = o.customer_phone;
          if (!customerMap[key]) {
            customerMap[key] = {
              name: o.customer_name,
              phone: o.customer_phone,
              email: o.customer_email,
              address: o.customer_address,
              ordersCount: 0,
              totalSpent: 0,
              lastOrderDate: o.created_at,
              lastStatus: o.status,
            };
          }
          customerMap[key].ordersCount++;
          customerMap[key].totalSpent += Number(o.total);
        });
        setCustomers(Object.values(customerMap));
      }
      setLoading(false);
    };
    fetchCustomers();
  }, []);

  const filtered = search
    ? customers.filter((c) =>
        c.name.toLowerCase().includes(search.toLowerCase()) ||
        c.phone.includes(search) ||
        (c.email && c.email.toLowerCase().includes(search.toLowerCase()))
      )
    : customers;

  if (loading) return <div className="flex items-center justify-center py-20 text-muted-foreground">Carregando...</div>;

  return (
    <div className="space-y-4">
      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar por nome, telefone ou email..."
          className="w-full bg-muted border border-border rounded-xl pl-10 pr-4 py-2.5 text-foreground text-sm placeholder:text-muted-foreground focus:ring-2 focus:ring-primary/40 outline-none"
        />
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-card border border-border rounded-xl p-4">
          <div className="flex items-center gap-2 mb-1">
            <Users className="h-4 w-4 text-primary" />
            <span className="text-xs text-muted-foreground">Total Clientes</span>
          </div>
          <p className="font-display text-2xl text-foreground">{customers.length}</p>
        </div>
        <div className="bg-card border border-border rounded-xl p-4">
          <div className="flex items-center gap-2 mb-1">
            <CheckCircle className="h-4 w-4 text-brasil-green" />
            <span className="text-xs text-muted-foreground">Com Pagamento</span>
          </div>
          <p className="font-display text-2xl text-foreground">
            {customers.filter((c) => c.lastStatus === "paid" || c.lastStatus === "approved").length}
          </p>
        </div>
      </div>

      {/* Customers list */}
      <div className="space-y-2">
        {filtered.map((customer) => (
          <div key={customer.phone} className="bg-card border border-border rounded-xl p-3 md:p-4">
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="text-sm font-medium text-foreground">{customer.name}</h3>
                  <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium ${
                    customer.lastStatus === "paid" || customer.lastStatus === "approved"
                      ? "bg-primary/10 text-primary"
                      : customer.lastStatus === "pending"
                      ? "bg-secondary/10 text-secondary"
                      : "bg-destructive/10 text-destructive"
                  }`}>
                    {customer.lastStatus === "paid" || customer.lastStatus === "approved" ? (
                      <><CheckCircle className="h-2.5 w-2.5" /> Pago</>
                    ) : customer.lastStatus === "pending" ? (
                      <><Clock className="h-2.5 w-2.5" /> Pendente</>
                    ) : (
                      customer.lastStatus
                    )}
                  </span>
                </div>
                <div className="flex flex-col gap-0.5 mt-1.5">
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <Phone className="h-3 w-3" /> {customer.phone}
                  </div>
                  {customer.email && (
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      <Mail className="h-3 w-3" /> {customer.email}
                    </div>
                  )}
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <MapPin className="h-3 w-3" /> <span className="truncate">{customer.address}</span>
                  </div>
                </div>
              </div>
              <div className="text-right shrink-0">
                <p className="text-sm font-display text-brasil-yellow">
                  R$ {customer.totalSpent.toFixed(2).replace(".", ",")}
                </p>
                <p className="text-[10px] text-muted-foreground mt-0.5">
                  {customer.ordersCount} pedido{customer.ordersCount > 1 ? "s" : ""}
                </p>
                <p className="text-[10px] text-muted-foreground">
                  {new Date(customer.lastOrderDate).toLocaleDateString("pt-BR")}
                </p>
              </div>
            </div>
          </div>
        ))}
        {filtered.length === 0 && (
          <p className="text-center text-muted-foreground text-sm py-8">Nenhum cliente encontrado</p>
        )}
      </div>
    </div>
  );
};

export default AdminCustomers;
