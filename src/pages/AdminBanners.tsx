import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Plus, Pencil, Trash2, Save, X, Upload } from "lucide-react";

interface Banner {
  id: string;
  image_url: string;
  title: string;
  subtitle: string | null;
  cta_text: string | null;
  cta_link: string | null;
  sort_order: number;
  active: boolean;
}

const emptyForm = { image_url: "", title: "", subtitle: "", cta_text: "VER KITS", cta_link: "#kits", sort_order: 0, active: true };

const AdminBanners = () => {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [editing, setEditing] = useState<string | null>(null);
  const [adding, setAdding] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [uploading, setUploading] = useState(false);

  const fetchBanners = async () => {
    const { data } = await supabase.from("banners").select("*").order("sort_order");
    if (data) setBanners(data);
  };

  useEffect(() => { fetchBanners(); }, []);

  const uploadImage = async (file: File) => {
    setUploading(true);
    const path = `banners/${Date.now()}.${file.name.split(".").pop()}`;
    const { error } = await supabase.storage.from("uploads").upload(path, file);
    if (!error) {
      const { data } = supabase.storage.from("uploads").getPublicUrl(path);
      setForm({ ...form, image_url: data.publicUrl });
    }
    setUploading(false);
  };

  const save = async () => {
    const payload = { image_url: form.image_url, title: form.title, subtitle: form.subtitle || null, cta_text: form.cta_text, cta_link: form.cta_link, sort_order: form.sort_order, active: form.active };
    if (editing) {
      await supabase.from("banners").update(payload).eq("id", editing);
    } else {
      await supabase.from("banners").insert(payload);
    }
    cancel();
    fetchBanners();
  };

  const remove = async (id: string) => {
    if (!confirm("Excluir banner?")) return;
    await supabase.from("banners").delete().eq("id", id);
    fetchBanners();
  };

  const startEdit = (b: Banner) => {
    setEditing(b.id);
    setForm({ image_url: b.image_url, title: b.title, subtitle: b.subtitle || "", cta_text: b.cta_text || "", cta_link: b.cta_link || "", sort_order: b.sort_order, active: b.active });
    setAdding(false);
  };

  const cancel = () => { setEditing(null); setAdding(false); setForm(emptyForm); };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">{banners.length} banners</p>
        <button onClick={() => { setAdding(true); setEditing(null); setForm(emptyForm); }}
          className="flex items-center gap-1.5 bg-gradient-green text-primary-foreground px-4 py-2 rounded-lg text-sm font-medium hover:brightness-110">
          <Plus className="h-4 w-4" /> Novo Banner
        </button>
      </div>

      {(adding || editing) && (
        <div className="bg-card border border-border rounded-xl p-4 space-y-3 animate-fade-in">
          <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })}
            className="w-full bg-muted border border-border rounded-lg px-3 py-2 text-sm text-foreground outline-none focus:ring-2 focus:ring-primary/40"
            placeholder="Título do banner" />
          <input value={form.subtitle} onChange={(e) => setForm({ ...form, subtitle: e.target.value })}
            className="w-full bg-muted border border-border rounded-lg px-3 py-2 text-sm text-foreground outline-none focus:ring-2 focus:ring-primary/40"
            placeholder="Subtítulo" />
          <div className="grid grid-cols-2 gap-3">
            <input value={form.cta_text} onChange={(e) => setForm({ ...form, cta_text: e.target.value })}
              className="bg-muted border border-border rounded-lg px-3 py-2 text-sm text-foreground outline-none focus:ring-2 focus:ring-primary/40"
              placeholder="Texto do botão" />
            <input value={form.cta_link} onChange={(e) => setForm({ ...form, cta_link: e.target.value })}
              className="bg-muted border border-border rounded-lg px-3 py-2 text-sm text-foreground outline-none focus:ring-2 focus:ring-primary/40"
              placeholder="Link do botão" />
          </div>
          <div className="flex items-center gap-3">
            {form.image_url && <img src={form.image_url} alt="" className="w-24 h-14 rounded-lg object-cover border border-border" />}
            <label className="flex items-center gap-1.5 bg-muted border border-border px-3 py-2 rounded-lg text-sm text-muted-foreground cursor-pointer hover:bg-muted/80">
              <Upload className="h-4 w-4" />
              {uploading ? "Enviando..." : "Upload Imagem"}
              <input type="file" accept="image/*" className="hidden" onChange={(e) => e.target.files?.[0] && uploadImage(e.target.files[0])} />
            </label>
            <input type="number" value={form.sort_order} onChange={(e) => setForm({ ...form, sort_order: Number(e.target.value) })}
              className="w-20 bg-muted border border-border rounded-lg px-3 py-2 text-sm text-foreground outline-none"
              placeholder="Ordem" />
            <label className="flex items-center gap-2 text-sm text-foreground cursor-pointer">
              <input type="checkbox" checked={form.active} onChange={(e) => setForm({ ...form, active: e.target.checked })} className="rounded" />
              Ativo
            </label>
          </div>
          <div className="flex justify-end gap-2">
            <button onClick={cancel} className="px-4 py-2 rounded-lg text-sm text-muted-foreground hover:bg-muted">Cancelar</button>
            <button onClick={save} className="flex items-center gap-1 bg-primary text-primary-foreground px-4 py-2 rounded-lg text-sm font-medium hover:brightness-110">
              <Save className="h-4 w-4" /> Salvar
            </button>
          </div>
        </div>
      )}

      <div className="space-y-2">
        {banners.map((b) => (
          <div key={b.id} className="flex items-center gap-3 bg-card border border-border rounded-xl p-3">
            <img src={b.image_url} alt={b.title} className="w-24 h-14 rounded-lg object-cover" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-foreground truncate">{b.title}</p>
              <p className="text-xs text-muted-foreground truncate">{b.subtitle}</p>
            </div>
            <button onClick={() => startEdit(b)} className="p-2 hover:bg-muted rounded text-muted-foreground"><Pencil className="h-4 w-4" /></button>
            <button onClick={() => remove(b.id)} className="p-2 hover:bg-destructive/10 rounded text-destructive"><Trash2 className="h-4 w-4" /></button>
          </div>
        ))}
        {banners.length === 0 && <p className="text-center text-muted-foreground text-sm py-8">Nenhum banner criado</p>}
      </div>
    </div>
  );
};

export default AdminBanners;
