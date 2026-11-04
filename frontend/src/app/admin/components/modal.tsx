"use client";
import { useState, useEffect, useRef } from "react";

type Category = { id: string; nome: string; slug: string; cor?: string; descricao?: string };
type Post = any;
type Tab = 'conteudo' | 'midia' | 'produto' | 'plataforma' | 'evento' | 'config' | 'ficha';

export type FichaItem = { campo: string; valor: string };

const TIPOS = [
    { value: 'noticia', label: 'Notícia' },
    { value: 'evento', label: 'Evento' },
    { value: 'produto', label: 'Produto' },
    { value: 'plataforma', label: 'Plataforma / SaaS' },
    { value: 'app', label: 'App' },
    { value: 'site', label: 'Site' },
    { value: 'sistema', label: 'Sistema' },
    { value: 'saas', label: 'SaaS' },
    { value: 'case', label: 'Case / Projeto' },
    { value: 'video', label: 'Vídeo' },
    { value: 'imagem', label: 'Imagem' },
];
const STATUS = [
    { value: 'published', label: 'Publicado' },
    { value: 'draft', label: 'Rascunho' },
    { value: 'archived', label: 'Arquivado' },
];
const STATUS_PLATAFORMA = [
    { value: 'em_utilizacao', label: '● Em utilização' },
    { value: 'em_desenvolvimento', label: '● Em desenvolvimento' },
];
const STATUS_EVENTO = [
    { value: 'ativo', label: '✅ Ativo / Confirmado' },
    { value: 'adiado', label: '⏸️ Adiado' },
    { value: 'cancelado', label: '❌ Cancelado' },
    { value: 'esgotado', label: '🔴 Esgotado / Lotado' },
];
const MODALIDADES = [
    { value: 'presencial', label: 'Presencial' },
    { value: 'online', label: 'Online' },
    { value: 'hibrido', label: 'Híbrido' },
];
const TIPOS_PLATAFORMA = ['plataforma','app','site','sistema','saas','case','projeto'];

function generateCloudinaryThumb(videoUrl: string): string {
    if (!videoUrl) return "";
    if (videoUrl.includes("cloudinary") && videoUrl.includes("/video/upload/")) {
        const parts = videoUrl.split("/video/upload/");
        if (parts.length === 2) {
            let suffix = parts[1].replace(/^(so_[^/]+\/)+/, "");
            return `${parts[0]}/video/upload/so_1,w_1280,h_720,c_fill/${suffix}`.replace(/\.(mp4|mov|webm|m4v|avi|mkv)(\?.*)?$/i, ".jpg");
        }
    }
    return "";
}

function CustomSelect({ value, options, onChange, placeholder }: { value: string, options: { value: string, label: string }[], onChange: (v: string) => void, placeholder: string }) {
    const [open, setOpen] = useState(false);
    const ref = useRef<HTMLDivElement>(null);
    useEffect(() => {
        const h = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false) };
        document.addEventListener('mousedown', h);
        return () => document.removeEventListener('mousedown', h);
    }, []);
    const selected = options.find(o => o.value === value);
    return (
        <div ref={ref} className="relative w-full">
            <button type="button" onClick={() => setOpen(!open)} className={`w-full h-11 bg-white border border-gray-200 rounded-xl px-3 text-[16px] text-black flex items-center justify-between focus:outline-none focus:border-black transition ${open ? 'border-black ring-2 ring-black/10' : ''}`}>
                <span className={`truncate ${selected ? 'text-black font-medium' : 'text-black/40'}`}>{selected ? selected.label : placeholder}</span>
                <span className={`text-gray-400 transition-transform shrink-0 text-xs ${open ? 'rotate-180' : ''}`}>▼</span>
            </button>
            {open && (
                <div className="absolute z-50 top-12 left-0 w-full bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden p-1.5 max-h-55 overflow-y-auto">
                    {options.map(o => (
                        <button key={o.value} type="button" onClick={() => { onChange(o.value); setOpen(false) }} className={`w-full text-left px-3 py-2.5 rounded-xl text-[16px] flex items-center justify-between transition ${value === o.value ? 'bg-blue-50 font-semibold text-black' : 'hover:bg-gray-50 text-gray-700'}`}>
                            {o.label} {value === o.value && <span>✓</span>}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}

export type PostForm = {
    titulo: string; slug: string; tipo: string; descricao: string; conteudo: string; category_id: string; status: string; destaque: boolean; tags: string; media_url: string; thumbnail_url: string; link_url: string;
    preco: string; preco_promocional: string; estoque: string; sku: string; unidade: string; em_promocao: boolean;
    status_plataforma: string; em_utilizacao: boolean;
    data_inicio: string; data_fim: string; local_evento: string; cidade: string; endereco: string; link_mapa: string; link_inscricao: string; modalidade: string; capacidade: string; organizador: string;
    status_evento: string; data_nova_inicio: string;
};

type Props = {
    show: boolean;
    editingPost: Post | null;
    form: PostForm;
    setForm: (f: PostForm) => void;
    tab: Tab;
    setTab: (t: Tab) => void;
    cats: Category[];
    ficha: FichaItem[];
    setFicha: (f: FichaItem[]) => void;
    camposFicha: string[];
    files: FileList | null;
    setFiles: (f: FileList | null) => void;
    thumbFile: FileList | null;
    setThumbFile: (f: FileList | null) => void;
    loading: boolean;
    onClose: () => void;
    onSave: () => void;
};

export default function PostModal({ show, editingPost, form, setForm, tab, setTab, cats, ficha, setFicha, camposFicha, files, setFiles, thumbFile, setThumbFile, loading, onClose, onSave }: Props) {
    const [novoCampo, setNovoCampo] = useState("");
    const [novoValor, setNovoValor] = useState("");

    if (!show) return null;

    const inputClass = "w-full h-11 bg-white border border-gray-200 rounded-xl px-3 text-[16px] text-black placeholder:text-black/40 focus:outline-none focus:border-black focus:ring-1 focus:ring-black/10 transition";
    const textareaClass = "w-full rounded-xl border border-gray-200 px-3 py-3 text-[16px] text-black placeholder:text-black/40 focus:outline-none focus:border-black transition";
    const TabBtn = ({ id, label, show = true }: { id: Tab, label: string, show?: boolean }) => {
        if(!show) return null;
        return (<button type="button" onClick={() => setTab(id)} className={`px-3.5 py-2 text-[13px] font-medium rounded-full transition border shrink-0 ${tab === id ? 'bg-black text-white border-black' : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'}`}>{label}</button>)
    };
    const previewAutoThumb = form.media_url ? generateCloudinaryThumb(form.media_url) : "";
    const previewFinalThumb = form.thumbnail_url || previewAutoThumb || form.media_url;
    const isProduto = form.tipo === 'produto';
    const isPlataforma = TIPOS_PLATAFORMA.includes(form.tipo);
    const isEvento = form.tipo === 'evento';

    // ===== FICHA INFORMATIVA =====
    function addFicha() {
        if (!novoCampo) return;
        if (!novoValor.trim()) return;
        if (ficha.some(f => f.campo.toLowerCase() === novoCampo.toLowerCase())) return;
        setFicha([...ficha, { campo: novoCampo, valor: novoValor.trim() }]);
        setNovoCampo(""); setNovoValor("");
    }
    function removeFicha(campo: string) {
        setFicha(ficha.filter(f => f.campo !== campo));
    }
    function updateFichaValor(campo: string, valor: string) {
        setFicha(ficha.map(f => f.campo === campo ? { ...f, valor } : f));
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
            <div className="relative flex max-h-[90vh] w-full max-w-2xl flex-col overflow-hidden rounded-3xl bg-white shadow-2xl">
                <div className="flex h-18 shrink-0 items-start justify-between bg-blue-50 px-5 pt-5"><div className="grid h-9 w-9 place-items-center rounded-full border bg-white shadow-sm text-sm">{isEvento ? '📅' : isProduto ? '📦' : isPlataforma ? '💻' : '📄'}</div><button onClick={onClose} className="grid h-8 w-8 place-items-center rounded-full border bg-white">×</button></div>
                <div className="border-b px-6 pb-3 pt-5"><h3 className="text-lg font-bold">{editingPost ? 'Editar' : 'Novo'} {isEvento ? 'Evento' : isProduto ? 'Produto' : isPlataforma ? 'Plataforma' : 'Post'}</h3><div className="mt-4 flex gap-1.5 flex-wrap"><TabBtn id="conteudo" label="Conteúdo" /><TabBtn id="evento" label="Evento" show={isEvento} /><TabBtn id="midia" label="Mídia" /><TabBtn id="plataforma" label="Plataforma / Link" show={isPlataforma} /><TabBtn id="produto" label="Preço" show={isProduto} /><TabBtn id="ficha" label="Ficha Informativa" show={isProduto} /><TabBtn id="config" label="Config" /></div></div>
                <div className="flex-1 overflow-y-auto px-6 py-4">
                    {tab === 'conteudo' && <div className="flex flex-col gap-3"><input value={form.titulo} onChange={e => setForm({ ...form, titulo: e.target.value })} placeholder={isEvento ? "Nome do evento *" : isProduto ? "Nome do produto *" : isPlataforma ? "Nome da plataforma / site *" : "Título *"} className={inputClass} /><div className="grid gap-2 md:grid-cols-2"><CustomSelect value={form.category_id} onChange={v => setForm({ ...form, category_id: v })} placeholder="Categoria" options={cats.map(c => ({ value: c.id, label: c.nome }))} /><CustomSelect value={form.tipo} onChange={v => { setForm({ ...form, tipo: v }); if(v==='produto') setTab('produto'); else if(v==='evento') setTab('evento'); else if(TIPOS_PLATAFORMA.includes(v)) setTab('plataforma'); }} placeholder="Tipo" options={TIPOS} /></div><textarea value={form.descricao} onChange={e => setForm({ ...form, descricao: e.target.value })} rows={3} placeholder={isEvento ? "Resumo do evento - aparece no card" : isPlataforma ? "Descrição curta - aparece no card" : isProduto ? "Descrição curta do produto" : "Descrição curta"} className={textareaClass} /><textarea value={form.conteudo} onChange={e => setForm({ ...form, conteudo: e.target.value })} rows={5} placeholder={isEvento ? "Programação completa, palestrantes, etc..." : isPlataforma ? "Sobre a plataforma, tecnologias usadas..." : isProduto ? "Ficha técnica / conteúdo detalhado" : "Conteúdo completo"} className={textareaClass} /></div>}
                    {tab === 'evento' && isEvento && (
                        <div className="flex flex-col gap-3">
                            <div className="rounded-2xl bg-sky-50 border border-sky-200 p-3 text-xs text-sky-800">📅 Configuração do Evento</div>
                            <div>
                                <label className="text-xs font-semibold mb-1 block">Status do Evento</label>
                                <CustomSelect value={form.status_evento} onChange={v => setForm({ ...form, status_evento: v })} placeholder="Status" options={STATUS_EVENTO} />
                                {form.status_evento !== 'ativo' && (
                                    <div className={`mt-2 rounded-xl p-2.5 text-[11px] ${form.status_evento === 'cancelado' ? 'bg-red-50 border border-red-200 text-red-700' : form.status_evento === 'adiado' ? 'bg-amber-50 border border-amber-200 text-amber-700' : 'bg-zinc-100 border text-zinc-700'}`}>
                                        {form.status_evento === 'cancelado' && '❌ O flyer ficará preto e branco com selo CANCELADO no site.'}
                                        {form.status_evento === 'adiado' && '⏸️ O flyer ficará preto e branco com selo ADIADO. Se informar nova data, ela será mostrada, se não, aparece "Sem data".'}
                                        {form.status_evento === 'esgotado' && '🔴 O flyer ficará preto e branco com selo ESGOTADO.'}
                                    </div>
                                )}
                            </div>
                            <div className="grid gap-3 md:grid-cols-2">
                                <div><label className="text-xs font-semibold">Data Início *</label><input type="datetime-local" value={form.data_inicio} onChange={e => setForm({ ...form, data_inicio: e.target.value })} className={inputClass} /></div>
                                <div><label className="text-xs font-semibold">Data Fim</label><input type="datetime-local" value={form.data_fim} onChange={e => setForm({ ...form, data_fim: e.target.value })} className={inputClass} /></div>
                            </div>
                            {form.status_evento === 'adiado' && (
                                <div className="rounded-2xl border-2 border-amber-300 bg-amber-50 p-3 space-y-2">
                                    <label className="text-xs font-bold text-amber-800">Nova data do evento (adiado para quando?)</label>
                                    <input type="datetime-local" value={form.data_nova_inicio} onChange={e => setForm({ ...form, data_nova_inicio: e.target.value })} className={inputClass} />
                                    <p className="text-[11px] text-amber-700">{form.data_nova_inicio ? `Nova data: ${new Date(form.data_nova_inicio).toLocaleString('pt-AO')}` : 'Sem data definida ainda - no site aparecerá "Sem data"'}</p>
                                </div>
                            )}
                            <div className="grid gap-3 md:grid-cols-2">
                                <div><label className="text-xs font-semibold">Local</label><input value={form.local_evento} onChange={e => setForm({ ...form, local_evento: e.target.value })} placeholder="Hotel Intercontinental" className={inputClass} /></div>
                                <div><label className="text-xs font-semibold">Cidade</label><input value={form.cidade} onChange={e => setForm({ ...form, cidade: e.target.value })} placeholder="Luanda" className={inputClass} /></div>
                            </div>
                            <div><label className="text-xs font-semibold">Endereço completo</label><input value={form.endereco} onChange={e => setForm({ ...form, endereco: e.target.value })} placeholder="Av. 4 de Fevereiro, 123" className={inputClass} /></div>
                            <div className="grid gap-3 md:grid-cols-2">
                                <div><label className="text-xs font-semibold">Modalidade</label><CustomSelect value={form.modalidade} onChange={v => setForm({ ...form, modalidade: v })} placeholder="Modalidade" options={MODALIDADES} /></div>
                                <div><label className="text-xs font-semibold">Capacidade</label><input type="number" value={form.capacidade} onChange={e => setForm({ ...form, capacidade: e.target.value })} placeholder="100" className={inputClass} /></div>
                            </div>
                            <div><label className="text-xs font-semibold">Link de Inscrição</label><input value={form.link_inscricao} onChange={e => setForm({ ...form, link_inscricao: e.target.value })} placeholder="https://wa.me/..." className={inputClass} /></div>
                            <div><label className="text-xs font-semibold">Link do Mapa</label><input value={form.link_mapa} onChange={e => setForm({ ...form, link_mapa: e.target.value })} placeholder="https://maps.google.com/..." className={inputClass} /></div>
                            <div><label className="text-xs font-semibold">Organizador</label><input value={form.organizador} onChange={e => setForm({ ...form, organizador: e.target.value })} placeholder="CONNECT Angola" className={inputClass} /></div>
                        </div>
                    )}
                    {tab === 'midia' && <div className="flex flex-col gap-3"><input value={form.media_url} onChange={e => setForm({ ...form, media_url: e.target.value })} placeholder="Media URL" className={inputClass} /><div><p className="mb-1 text-xs font-semibold">Thumbnail (capa) - Recomendado 1280x720</p><input type="file" accept="image/*" onChange={e => setThumbFile(e.target.files)} className="text-[16px]" /></div><div><p className="mb-1 text-xs font-semibold">Galeria</p><input type="file" multiple onChange={e => setFiles(e.target.files)} className="text-[16px]" /></div>{previewFinalThumb && <img src={previewFinalThumb} className="h-40 w-full rounded-xl border object-cover" alt="" />}</div>}
                    {tab === 'plataforma' && isPlataforma && (
                        <div className="flex flex-col gap-3">
                            <div className="rounded-2xl bg-blue-50 border border-blue-200 p-3 text-xs text-blue-800">🔗 Configuração de Plataforma</div>
                            <div><label className="text-xs font-semibold">Link da Plataforma</label><input value={form.link_url} onChange={e => setForm({ ...form, link_url: e.target.value })} placeholder="https://..." className={inputClass} /></div>
                            <div><label className="text-xs font-semibold">Status da Plataforma</label><CustomSelect value={form.status_plataforma} onChange={v => setForm({ ...form, status_plataforma: v, em_utilizacao: v === 'em_utilizacao' })} placeholder="Status" options={STATUS_PLATAFORMA} /></div>
                            <div><label className="text-xs font-semibold">Tags</label><input value={form.tags} onChange={e => setForm({ ...form, tags: e.target.value })} placeholder="SAAS, APP, SITE" className={inputClass} /></div>
                        </div>
                    )}
                    {tab === 'produto' && isProduto && (
                        <div className="flex flex-col gap-3">
                            <div className="rounded-2xl bg-amber-50 border border-amber-200 p-3 text-xs text-amber-800">💰 Configuração de Produto</div>
                            <div className="grid gap-3 md:grid-cols-2">
                                <div><label className="text-xs font-semibold">Preço (Kz) *</label><input value={form.preco} onChange={e => setForm({ ...form, preco: e.target.value })} type="number" placeholder="150000" className={inputClass} /></div>
                                <div><label className="text-xs font-semibold">Preço Promocional (Kz)</label><input value={form.preco_promocional} onChange={e => setForm({ ...form, preco_promocional: e.target.value })} type="number" placeholder="129000" className={inputClass} /></div>
                            </div>
                            <div className="grid gap-3 md:grid-cols-3">
                                <div><label className="text-xs font-semibold">Estoque</label><input value={form.estoque} onChange={e => setForm({ ...form, estoque: e.target.value })} type="number" placeholder="10" className={inputClass} /></div>
                                <div><label className="text-xs font-semibold">SKU</label><input value={form.sku} onChange={e => setForm({ ...form, sku: e.target.value })} placeholder="EXO-001" className={inputClass} /></div>
                                <div><label className="text-xs font-semibold">Unidade</label><CustomSelect value={form.unidade} onChange={v => setForm({ ...form, unidade: v })} placeholder="Unidade" options={[{value:'un',label:'Unidade'},{value:'cx',label:'Caixa'},{value:'kit',label:'Kit'},{value:'mês',label:'Mês'}]} /></div>
                            </div>
                            <label className="flex items-center gap-2 rounded-xl border p-3 cursor-pointer hover:bg-zinc-50"><input type="checkbox" checked={form.em_promocao} onChange={e => setForm({ ...form, em_promocao: e.target.checked })} /><span className="text-[16px] font-medium">Em promoção?</span></label>
                        </div>
                    )}
                    {/* ===== NOVA SECÇÃO: FICHA INFORMATIVA ===== */}
                    {tab === 'ficha' && isProduto && (
                        <div className="flex flex-col gap-3">
                            <div className="rounded-2xl bg-violet-50 border border-violet-200 p-3 text-xs text-violet-800">📋 Ficha Informativa - Escolhe o campo e digita o valor. Só aparece nos produtos. Serve para qualquer produto: computador, telemóvel, acessório, etc.</div>
                            <div className="grid gap-2 md:grid-cols-[1fr_1fr_auto]">
                                <CustomSelect value={novoCampo} onChange={v => setNovoCampo(v)} placeholder="Escolher campo..." options={camposFicha.filter(c => !ficha.some(f => f.campo === c)).map(c => ({ value: c, label: c }))} />
                                <input value={novoValor} onChange={e => setNovoValor(e.target.value)} placeholder="Valor ex: BLACKVIEW, 16GB, Sim..." className={inputClass} />
                                <button type="button" onClick={addFicha} className="h-11 px-4 rounded-xl bg-black text-white text-sm font-semibold shrink-0">+ Adicionar</button>
                            </div>
                            {ficha.length === 0 && <p className="text-xs text-zinc-400 text-center py-4">Nenhuma informação ainda. Adiciona em cima.</p>}
                            <div className="flex flex-col gap-2">
                                {ficha.map((f) => (
                                    <div key={f.campo} className="flex gap-2 items-center rounded-xl border p-2 bg-zinc-50">
                                        <span className="w-40 shrink-0 text-[13px] font-semibold truncate">{f.campo}</span>
                                        <input value={f.valor} onChange={e => updateFichaValor(f.campo, e.target.value)} placeholder="Valor" className="flex-1 h-9 bg-white border border-gray-200 rounded-lg px-2 text-[14px] outline-none focus:border-black" />
                                        <button type="button" onClick={() => removeFicha(f.campo)} className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-white border text-zinc-500 hover:bg-red-500 hover:text-white">×</button>
                                    </div>
                                ))}
                            </div>
                            {ficha.length > 0 && <p className="text-[11px] text-zinc-500">{ficha.length} campo(s) na ficha deste produto.</p>}
                        </div>
                    )}
                    {tab === 'config' && <div className="flex flex-col gap-3"><CustomSelect value={form.status} onChange={v => setForm({ ...form, status: v })} placeholder="Status" options={STATUS} /><input value={form.tags} onChange={e => setForm({ ...form, tags: e.target.value })} placeholder="Tags separadas por vírgula" className={inputClass} /><input value={form.slug} onChange={e => setForm({ ...form, slug: e.target.value })} placeholder="Slug (opcional)" className={inputClass} /><label className="flex items-center gap-2"><input type="checkbox" checked={form.destaque} onChange={e => setForm({ ...form, destaque: e.target.checked })} /> Destaque na home</label></div>}
                </div>
                <div className="flex gap-2 border-t bg-white px-6 py-4"><button onClick={onClose} className="flex-1 h-11 rounded-full border">×</button><button onClick={onSave} disabled={loading} className="flex-1 h-11 rounded-full bg-black text-white font-semibold disabled:opacity-50">{loading ? "…" : editingPost ? 'ATUALIZAR' : 'CRIAR'}</button></div>
            </div>
        </div>
    );
}
