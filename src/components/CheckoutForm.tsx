import { useState } from "react";
import { ArrowLeft, Send, Loader2 } from "lucide-react";
import { useCart } from "@/contexts/CartContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface Props {
  onBack: () => void;
}

const CheckoutForm = ({ onBack }: Props) => {
  const { items, total, clearCart, toggleCart } = useCart();
  const [form, setForm] = useState({ name: "", phone: "", email: "", document: "", address: "", payment: "pix" });
  const [submitting, setSubmitting] = useState(false);
  const [pixData, setPixData] = useState<{ qr_code: string; qr_code_base64: string } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      // Save order to DB
      const orderItems = items.map((i) => ({ id: i.id, name: i.name, price: i.price, quantity: i.quantity }));
      const { data: order, error } = await supabase.from("orders").insert({
        customer_name: form.name,
        customer_phone: form.phone,
        customer_address: form.address,
        customer_email: form.email || null,
        customer_document: form.document || null,
        payment_method: form.payment,
        items: orderItems,
        total,
        status: "pending",
      }).select().single();

      if (error) throw error;

      // Try to create PIX payment via Paradise
      if (form.payment === "pix" && order) {
        try {
          const { data: fnData, error: fnError } = await supabase.functions.invoke("paradise-create-transaction", {
            body: {
              order_id: order.id,
              amount: total,
              description: `Pedido #${order.id.slice(0, 8)}`,
              customer: {
                name: form.name,
                phone: form.phone,
                email: form.email,
                document: form.document,
              },
            },
          });

          if (!fnError && fnData?.success) {
            setPixData({ qr_code: fnData.qr_code, qr_code_base64: fnData.qr_code_base64 });
            toast.success("PIX gerado! Escaneie o QR Code para pagar.");
            setSubmitting(false);
            return;
          }
        } catch {
          // Fall back to WhatsApp
        }
      }

      // Fallback: Send via WhatsApp
      const { data: whatsappSetting } = await supabase
        .from("site_settings")
        .select("value")
        .eq("key", "whatsapp_number")
        .single();

      const whatsapp = whatsappSetting?.value || "5500000000000";
      const itemsList = items.map((i) => `• ${i.quantity}x ${i.name} - R$ ${(i.price * i.quantity).toFixed(2).replace(".", ",")}`).join("\n");
      const message = encodeURIComponent(
        `🔥 *PEDIDO - CHURRASCO DA TORCIDA* 🔥\n\n` +
        `*Cliente:* ${form.name}\n` +
        `*Telefone:* ${form.phone}\n` +
        `*Endereço:* ${form.address}\n` +
        `*Pagamento:* ${form.payment === "pix" ? "PIX" : "Dinheiro"}\n\n` +
        `*Itens:*\n${itemsList}\n\n` +
        `*TOTAL: R$ ${total.toFixed(2).replace(".", ",")}*\n\n` +
        `⚽ Bora pro jogo! 🇧🇷`
      );
      window.open(`https://wa.me/${whatsapp}?text=${message}`, "_blank");
      clearCart();
      toggleCart();
      toast.success("Pedido enviado!");
    } catch (err: any) {
      toast.error("Erro ao processar pedido: " + (err.message || "Tente novamente"));
    }
    setSubmitting(false);
  };

  const update = (field: string, value: string) => setForm((f) => ({ ...f, [field]: value }));

  // Show PIX QR Code screen
  if (pixData) {
    return (
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        <div className="text-center">
          <h3 className="font-display text-xl text-foreground mb-2">📱 Pague via PIX</h3>
          <p className="text-sm text-muted-foreground mb-4">Escaneie o QR Code abaixo ou copie o código</p>
          {pixData.qr_code_base64 && (
            <img src={pixData.qr_code_base64} alt="QR Code PIX" className="mx-auto w-48 h-48 rounded-xl border border-border" />
          )}
          {pixData.qr_code && (
            <div className="mt-4">
              <button
                onClick={() => {
                  navigator.clipboard.writeText(pixData.qr_code);
                  toast.success("Código PIX copiado!");
                }}
                className="w-full bg-gradient-green text-primary-foreground py-3 rounded-full font-bold text-sm hover:brightness-110 transition-all"
              >
                📋 Copiar Código PIX
              </button>
            </div>
          )}
          <p className="text-xs text-muted-foreground mt-4">
            Após o pagamento, seu pedido será confirmado automaticamente.
          </p>
          <button
            onClick={() => { clearCart(); toggleCart(); }}
            className="mt-4 text-sm text-primary hover:underline"
          >
            Fechar
          </button>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-4 space-y-3">
      <button type="button" onClick={onBack} className="flex items-center gap-1 text-muted-foreground hover:text-foreground text-xs mb-1 transition-colors">
        <ArrowLeft className="h-3.5 w-3.5" /> Voltar
      </button>

      {[
        { field: "name", label: "Nome", placeholder: "Seu nome", type: "text" },
        { field: "phone", label: "Telefone", placeholder: "(00) 00000-0000", type: "tel" },
        { field: "email", label: "Email", placeholder: "seu@email.com", type: "email", required: false },
        { field: "document", label: "CPF", placeholder: "000.000.000-00", type: "text", required: false },
      ].map((f) => (
        <div key={f.field}>
          <label className="text-xs font-semibold text-foreground block mb-1">{f.label}</label>
          <input
            required={f.required !== false}
            maxLength={100}
            type={f.type}
            value={form[f.field as keyof typeof form]}
            onChange={(e) => update(f.field, e.target.value)}
            className="w-full bg-muted border border-border rounded-xl px-3.5 py-2.5 text-foreground text-sm placeholder:text-muted-foreground focus:ring-2 focus:ring-primary/40 outline-none transition-shadow"
            placeholder={f.placeholder}
          />
        </div>
      ))}

      <div>
        <label className="text-xs font-semibold text-foreground block mb-1">Endereço</label>
        <textarea
          required
          maxLength={300}
          value={form.address}
          onChange={(e) => update("address", e.target.value)}
          className="w-full bg-muted border border-border rounded-xl px-3.5 py-2.5 text-foreground text-sm placeholder:text-muted-foreground focus:ring-2 focus:ring-primary/40 outline-none resize-none h-20 transition-shadow"
          placeholder="Rua, número, bairro"
        />
      </div>

      <div>
        <label className="text-xs font-semibold text-foreground block mb-1">Pagamento</label>
        <div className="grid grid-cols-2 gap-2">
          {[
            { value: "pix", label: "PIX", icon: "💰" },
            { value: "dinheiro", label: "Dinheiro", icon: "💵" },
          ].map((p) => (
            <button
              key={p.value}
              type="button"
              onClick={() => update("payment", p.value)}
              className={`flex items-center justify-center gap-1.5 p-2.5 rounded-xl border text-sm font-medium transition-all ${
                form.payment === p.value
                  ? "border-primary bg-primary/10 text-primary"
                  : "border-border text-muted-foreground hover:border-border/80"
              }`}
            >
              {p.icon} {p.label}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-card rounded-xl p-3 border border-border">
        <h4 className="font-semibold text-foreground text-sm mb-2">Resumo</h4>
        {items.map((i) => (
          <div key={i.id} className="flex justify-between text-xs text-muted-foreground py-0.5">
            <span>{i.quantity}x {i.name}</span>
            <span>R$ {(i.price * i.quantity).toFixed(2).replace(".", ",")}</span>
          </div>
        ))}
        <div className="flex justify-between font-bold text-foreground text-sm border-t border-border mt-2 pt-2">
          <span>Total</span>
          <span className="text-brasil-yellow">R$ {total.toFixed(2).replace(".", ",")}</span>
        </div>
      </div>

      <button
        type="submit"
        disabled={submitting}
        className="w-full bg-gradient-green text-primary-foreground py-3.5 rounded-full font-extrabold text-base flex items-center justify-center gap-2 hover:brightness-110 transition-all active:scale-[0.98] disabled:opacity-50"
      >
        {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
        {submitting ? "Processando..." : "Finalizar Pedido"}
      </button>
    </form>
  );
};

export default CheckoutForm;
