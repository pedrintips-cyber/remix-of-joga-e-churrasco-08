import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Plus, Pencil, Trash2, Save, X } from "lucide-react";

interface Category {
  id: string;
  name: string;
  sort_order: number;
  active: boolean;
}

const AdminCategories = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [editing, setEditing] = useState<string | null>(null);
  const [form, setForm] = useState({ name: "", sort_order: 0, active: true });
  const [adding, setAdding] = useState(false);

  const fetch = async () => {
    const { data } = await supabase.from("categories").select("*").order("sort_order");
    if (data) setCategories(data);
  };

  useEffect(() => { fetch(); }, []);

  const save = async () => {
    if (editing) {
      await supabase.from("categories").update({ name: form.name, sort_order: form.sort_order, active: form.active }).eq("id", editing);
    } else {
      await supabase.from("categories").insert({ name: form.name, sort_order: form.sort_order, active: form.active });
    }
    setEditing(null);
    setAdding(false);
    setForm({ name: "", sort_order: 0, active: true });
    fetch();
  };

  const remove = async (id: string) => {
    if (!confirm("Excluir categoria?")) return;
    await supabase.from("categories").delete().eq("id", id);
    fetch();
  };

  const startEdit = (cat: Category) => {
    setEditing(cat.id);
    setForm({ name: cat.name, sort_order: cat.sort_order, active: cat.active });
    setAdding(false);
  };

  const cancel = () => { setEditing(null); setAdding(false); setForm({ name: "", sort_order: 0, active: true }); };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">{categories.length} categorias</p>
        <button onClick={() => { setAdding(true); setEditing(null); setForm({ name: "", sort_order: 0, active: true }); }}
          className="flex items-center gap-1.5 bg-gradient-green text-primary-foreground px-4 py-2 rounded-lg text-sm font-medium hover:brightness-110 transition-all">
          <Plus className="h-4 w-4" /> Nova Categoria
        </button>
      </div>

      {(adding || editing) && (
        <div className="bg-card border border-border rounded-xl p-4 space-y-3 animate-fade-in">
          <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
            className="w-full bg-muted border border-border rounded-lg px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:ring-2 focus:ring-primary/40"
            placeholder="Nome da categoria" />
          <div className="flex items-center gap-3">
            <input type="number" value={form.sort_order} onChange={(e) => setForm({ ...form, sort_order: Number(e.target.value) })}
              className="w-24 bg-muted border border-border rounded-lg px-3 py-2 text-sm text-foreground outline-none focus:ring-2 focus:ring-primary/40"
              placeholder="Ordem" />
            <label className="flex items-center gap-2 text-sm text-foreground cursor-pointer">
              <input type="checkbox" checked={form.active} onChange={(e) => setForm({ ...form, active: e.target.checked })}
                className="rounded border-border" />
              Ativa
            </label>
            <div className="flex-1" />
            <button onClick={cancel} className="p-2 hover:bg-muted rounded-lg text-muted-foreground"><X className="h-4 w-4" /></button>
            <button onClick={save} className="flex items-center gap-1 bg-primary text-primary-foreground px-4 py-2 rounded-lg text-sm font-medium hover:brightness-110">
              <Save className="h-4 w-4" /> Salvar
            </button>
          </div>
        </div>
      )}

      <div className="space-y-2">
        {categories.map((cat) => (
          <div key={cat.id} className="flex items-center gap-3 bg-card border border-border rounded-xl px-4 py-3">
            <div className="flex-1">
              <p className="text-sm font-medium text-foreground">{cat.name}</p>
              <p className="text-xs text-muted-foreground">Ordem: {cat.sort_order} • {cat.active ? "Ativa" : "Inativa"}</p>
            </div>
            <button onClick={() => startEdit(cat)} className="p-2 hover:bg-muted rounded-lg text-muted-foreground"><Pencil className="h-4 w-4" /></button>
            <button onClick={() => remove(cat.id)} className="p-2 hover:bg-destructive/10 rounded-lg text-destructive"><Trash2 className="h-4 w-4" /></button>
          </div>
        ))}
        {categories.length === 0 && <p className="text-center text-muted-foreground text-sm py-8">Nenhuma categoria criada</p>}
      </div>
    </div>
  );
};

export default AdminCategories;
