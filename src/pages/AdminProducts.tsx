import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Plus, Pencil, Trash2, Save, X, Upload } from "lucide-react";

interface Product {
  id: string;
  name: string;
  description: string | null;
  price: number;
  image_url: string | null;
  serves: number | null;
  tag: string | null;
  active: boolean;
  sort_order: number;
  category_id: string | null;
}

interface Category { id: string; name: string; }

const emptyForm = { name: "", description: "", price: 0, image_url: "", serves: 0, tag: "", active: true, sort_order: 0, category_id: "" };

const AdminProducts = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [editing, setEditing] = useState<string | null>(null);
  const [adding, setAdding] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [uploading, setUploading] = useState(false);

  const fetchAll = async () => {
    const [{ data: prods }, { data: cats }] = await Promise.all([
      supabase.from("products").select("*").order("sort_order"),
      supabase.from("categories").select("id, name"),
    ]);
    if (prods) setProducts(prods);
    if (cats) setCategories(cats);
  };

  useEffect(() => { fetchAll(); }, []);

  const uploadImage = async (file: File) => {
    setUploading(true);
    const ext = file.name.split(".").pop();
    const path = `products/${Date.now()}.${ext}`;
    const { error } = await supabase.storage.from("uploads").upload(path, file);
    if (!error) {
      const { data } = supabase.storage.from("uploads").getPublicUrl(path);
      setForm({ ...form, image_url: data.publicUrl });
    }
    setUploading(false);
  };

  const save = async () => {
    const payload = {
      name: form.name,
      description: form.description || null,
      price: form.price,
      image_url: form.image_url || null,
      serves: form.serves || null,
      tag: form.tag || null,
      active: form.active,
      sort_order: form.sort_order,
      category_id: form.category_id || null,
    };
    if (editing) {
      await supabase.from("products").update(payload).eq("id", editing);
    } else {
      await supabase.from("products").insert(payload);
    }
    setEditing(null);
    setAdding(false);
    setForm(emptyForm);
    fetchAll();
  };

  const remove = async (id: string) => {
    if (!confirm("Excluir produto?")) return;
    await supabase.from("products").delete().eq("id", id);
    fetchAll();
  };

  const startEdit = (p: Product) => {
    setEditing(p.id);
    setForm({
      name: p.name, description: p.description || "", price: p.price,
      image_url: p.image_url || "", serves: p.serves || 0, tag: p.tag || "",
      active: p.active, sort_order: p.sort_order, category_id: p.category_id || "",
    });
    setAdding(false);
  };

  const cancel = () => { setEditing(null); setAdding(false); setForm(emptyForm); };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">{products.length} produtos</p>
        <button onClick={() => { setAdding(true); setEditing(null); setForm(emptyForm); }}
          className="flex items-center gap-1.5 bg-gradient-green text-primary-foreground px-4 py-2 rounded-lg text-sm font-medium hover:brightness-110">
          <Plus className="h-4 w-4" /> Novo Produto
        </button>
      </div>

      {(adding || editing) && (
        <div className="bg-card border border-border rounded-xl p-4 space-y-3 animate-fade-in">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="bg-muted border border-border rounded-lg px-3 py-2 text-sm text-foreground outline-none focus:ring-2 focus:ring-primary/40"
              placeholder="Nome do produto" />
            <input type="number" step="0.01" value={form.price} onChange={(e) => setForm({ ...form, price: Number(e.target.value) })}
              className="bg-muted border border-border rounded-lg px-3 py-2 text-sm text-foreground outline-none focus:ring-2 focus:ring-primary/40"
              placeholder="Preço" />
          </div>
          <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })}
            className="w-full bg-muted border border-border rounded-lg px-3 py-2 text-sm text-foreground outline-none resize-none h-16 focus:ring-2 focus:ring-primary/40"
            placeholder="Descrição" />
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <select value={form.category_id} onChange={(e) => setForm({ ...form, category_id: e.target.value })}
              className="bg-muted border border-border rounded-lg px-3 py-2 text-sm text-foreground outline-none focus:ring-2 focus:ring-primary/40">
              <option value="">Sem categoria</option>
              {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
            <input type="number" value={form.serves} onChange={(e) => setForm({ ...form, serves: Number(e.target.value) })}
              className="bg-muted border border-border rounded-lg px-3 py-2 text-sm text-foreground outline-none focus:ring-2 focus:ring-primary/40"
              placeholder="Serve" />
            <input value={form.tag} onChange={(e) => setForm({ ...form, tag: e.target.value })}
              className="bg-muted border border-border rounded-lg px-3 py-2 text-sm text-foreground outline-none focus:ring-2 focus:ring-primary/40"
              placeholder="Tag (ex: TOP)" />
            <input type="number" value={form.sort_order} onChange={(e) => setForm({ ...form, sort_order: Number(e.target.value) })}
              className="bg-muted border border-border rounded-lg px-3 py-2 text-sm text-foreground outline-none focus:ring-2 focus:ring-primary/40"
              placeholder="Ordem" />
          </div>

          <div className="flex items-center gap-3">
            {form.image_url && <img src={form.image_url} alt="" className="w-16 h-16 rounded-lg object-cover border border-border" />}
            <label className="flex items-center gap-1.5 bg-muted border border-border px-3 py-2 rounded-lg text-sm text-muted-foreground cursor-pointer hover:bg-muted/80">
              <Upload className="h-4 w-4" />
              {uploading ? "Enviando..." : "Upload Imagem"}
              <input type="file" accept="image/*" className="hidden" onChange={(e) => e.target.files?.[0] && uploadImage(e.target.files[0])} />
            </label>
            <label className="flex items-center gap-2 text-sm text-foreground cursor-pointer">
              <input type="checkbox" checked={form.active} onChange={(e) => setForm({ ...form, active: e.target.checked })} className="rounded" />
              Ativo
            </label>
          </div>

          <div className="flex justify-end gap-2">
            <button onClick={cancel} className="px-4 py-2 rounded-lg text-sm text-muted-foreground hover:bg-muted"><X className="h-4 w-4 inline mr-1" />Cancelar</button>
            <button onClick={save} className="flex items-center gap-1 bg-primary text-primary-foreground px-4 py-2 rounded-lg text-sm font-medium hover:brightness-110">
              <Save className="h-4 w-4" /> Salvar
            </button>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {products.map((p) => (
          <div key={p.id} className="flex gap-3 bg-card border border-border rounded-xl p-3">
            {p.image_url && <img src={p.image_url} alt={p.name} className="w-16 h-16 rounded-lg object-cover" />}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-medium text-foreground truncate">{p.name}</h3>
                {!p.active && <span className="text-[10px] bg-muted text-muted-foreground px-1.5 py-0.5 rounded">Inativo</span>}
              </div>
              <p className="text-xs text-muted-foreground truncate">{p.description}</p>
              <p className="text-sm font-display text-brasil-yellow mt-0.5">R$ {Number(p.price).toFixed(2).replace(".", ",")}</p>
            </div>
            <div className="flex flex-col gap-1">
              <button onClick={() => startEdit(p)} className="p-1.5 hover:bg-muted rounded text-muted-foreground"><Pencil className="h-3.5 w-3.5" /></button>
              <button onClick={() => remove(p.id)} className="p-1.5 hover:bg-destructive/10 rounded text-destructive"><Trash2 className="h-3.5 w-3.5" /></button>
            </div>
          </div>
        ))}
        {products.length === 0 && <p className="col-span-2 text-center text-muted-foreground text-sm py-8">Nenhum produto criado</p>}
      </div>
    </div>
  );
};

export default AdminProducts;
