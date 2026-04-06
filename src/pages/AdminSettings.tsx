import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Save, Loader2 } from "lucide-react";
import { toast } from "sonner";

interface Setting { id: string; key: string; value: string | null; }

const settingsConfig = [
  { key: "site_name", label: "Nome do Site", placeholder: "Churrasco da Torcida" },
  { key: "whatsapp_number", label: "WhatsApp (com DDI)", placeholder: "5511999999999" },
  { key: "instagram_url", label: "Instagram URL", placeholder: "https://instagram.com/..." },
  { key: "footer_text", label: "Texto do Rodapé", placeholder: "© 2026..." },
  { key: "facebook_pixel_id", label: "Facebook Pixel ID", placeholder: "123456789" },
];

const AdminSettings = () => {
  const [settings, setSettings] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetch = async () => {
      const { data } = await supabase.from("site_settings").select("*");
      if (data) {
        const map: Record<string, string> = {};
        data.forEach((s: Setting) => { map[s.key] = s.value || ""; });
        setSettings(map);
      }
    };
    fetch();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    for (const cfg of settingsConfig) {
      const value = settings[cfg.key] || "";
      // Try update first, if no rows affected, insert
      const { data } = await supabase.from("site_settings").update({ value }).eq("key", cfg.key).select();
      if (!data || data.length === 0) {
        await supabase.from("site_settings").insert({ key: cfg.key, value });
      }
    }
    setSaving(false);
    toast.success("Configurações salvas!");
  };

  return (
    <div className="max-w-2xl space-y-6">
      <div className="space-y-4">
        {settingsConfig.map((cfg) => (
          <div key={cfg.key}>
            <label className="text-xs font-semibold text-foreground block mb-1.5">{cfg.label}</label>
            <input
              value={settings[cfg.key] || ""}
              onChange={(e) => setSettings({ ...settings, [cfg.key]: e.target.value })}
              className="w-full bg-muted border border-border rounded-xl px-4 py-3 text-foreground text-sm placeholder:text-muted-foreground focus:ring-2 focus:ring-primary/40 outline-none"
              placeholder={cfg.placeholder}
            />
          </div>
        ))}
      </div>

      <button
        onClick={handleSave}
        disabled={saving}
        className="flex items-center gap-2 bg-gradient-green text-primary-foreground px-6 py-3 rounded-xl font-bold text-sm hover:brightness-110 transition-all disabled:opacity-50"
      >
        {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
        {saving ? "Salvando..." : "Salvar Configurações"}
      </button>

      <div className="bg-card border border-border rounded-xl p-4 mt-6">
        <h3 className="font-display text-lg text-foreground mb-2">📌 Facebook Pixel</h3>
        <p className="text-sm text-muted-foreground">
          Cole o ID do Pixel do Facebook acima. O script será carregado automaticamente no site para rastreamento de conversões e anúncios.
        </p>
      </div>
    </div>
  );
};

export default AdminSettings;
