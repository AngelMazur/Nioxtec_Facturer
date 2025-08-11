import { useEffect, useState } from 'react';
import { useStore } from '../store/store';
import {
  apiGet,
  apiPost,
  apiGetBlob,
  apiDelete,
  // apiPut,
  // apiPatch,
} from '../lib/api';
import toast from 'react-hot-toast';
import Skeleton from 'react-loading-skeleton';
import { motion } from 'framer-motion';
import 'react-loading-skeleton/dist/skeleton.css';

export default function Facturas() {
  const { clients, invoices, setClients, setInvoices, token } = useStore();
  const [loading, setLoading] = useState(true);
  const [sort, setSort] = useState({ field: 'date', dir: 'desc' });
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;
  const [userSorted, setUserSorted] = useState(false);
  const [form, setForm] = useState({
    number: '',
    date: new Date().toISOString().slice(0, 10),
    type: 'factura',
    client_id: '',
    items: [],
  });

  const fetchNextNumber = async (docType, atDate) => {
    try {
      const qs = new URLSearchParams({ type: docType, ...(atDate ? { date: atDate } : {}) })
      const res = await apiGet(`/invoices/next_number?${qs.toString()}`, token)
      const nn = res?.next_number || ''
      setForm(f=>({ ...f, number: nn }))
    } catch {
      // Silencioso; el backend asignará número al guardar
    }
  }

  useEffect(() => {
    async function load() {
      setLoading(true);
      const [clientsData, invoicesData] = await Promise.all([
        apiGet('/clients?limit=50&offset=0', token),
        apiGet('/invoices?limit=50&offset=0', token),
      ]);
      setClients(clientsData.items || clientsData);
      setInvoices(invoicesData.items || invoicesData);
      setLoading(false);
      // Pre-cargar número siguiente para tipo por defecto
      fetchNextNumber('factura', new Date().toISOString().slice(0, 10))
    }
    if (token) load();
  }, [setClients, setInvoices, token]);

  const addItem = () => {
    setForm({
      ...form,
      items: [
        ...form.items,
        { description: '', units: 1, unit_price: 0, tax_rate: 21 },
      ],
    });
  };
  const handleItemChange = (idx, field, value) => {
    const items = form.items.map((it, i) =>
      i === idx
        ? { ...it, [field]: field === 'description' ? value : Number(value) }
        : it,
    );
    setForm({ ...form, items });
  };
  const handleChange = (e) => {
    const { name, value } = e.target
    setForm((prev) => {
      const next = { ...prev, [name]: value }
      return next
    })
    if (e.target.name === 'type') {
      fetchNextNumber(value, form.date)
    }
    if (e.target.name === 'date') {
      fetchNextNumber(form.type, value)
    }
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = { ...form, client_id: Number(form.client_id) };
    try {
      const data = await apiPost('/invoices', payload, token);
      toast.success('Documento creado');
      setForm({
        number: '',
        date: new Date().toISOString().slice(0, 10),
        type: 'factura',
        client_id: '',
        items: [],
      });
      // Cargar siguiente número tras crear
      fetchNextNumber('factura', new Date().toISOString().slice(0, 10))
      // Fijar al principio independientemente del orden
      setInvoices([{ ...data, __pinned: true }, ...invoices]);
      setCurrentPage(1);
    } catch {
      toast.error('Error al crear');
    }
  };

  // Duplicar factura: obtiene detalles con líneas
  const duplicateInvoice = async (inv) => {
    try {
      const details = await apiGet(`/invoices/${inv.id}`, token);
      setForm({
        number: '',
        date: new Date().toISOString().slice(0, 10),
        type: details.type,
        client_id: String(details.client_id),
        items: (details.items || []).map((it) => ({
          description: it.description,
          units: it.units,
          unit_price: it.unit_price,
          tax_rate: it.tax_rate,
        })),
      });
      // Cargar el próximo número según tipo del duplicado
      fetchNextNumber(details.type)
      window.scrollTo({ top: 0, behavior: 'smooth' });
      toast.success('Factura cargada para duplicar');
    } catch {
      toast.error('No se pudo cargar la factura');
    }
  };

  const deleteInvoice = async (inv) => {
    if (!window.confirm('¿Eliminar este documento?')) return;
    try {
      await apiDelete(`/invoices/${inv.id}`, token);
      setInvoices(invoices.filter((i) => i.id !== inv.id));
      toast.success('Eliminado');
    } catch {
      toast.error('No se pudo eliminar');
    }
  };
  const [preview, setPreview] = useState(null);

  const downloadInvoice = async (id, number) => {
    try {
      const blob = await apiGetBlob(`/invoices/${id}/pdf`, token);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${number}.pdf`;
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch {
      toast.error('Error al descargar PDF');
    }
  };

  const openPreview = async (id) => {
    try {
      const blob = await apiGetBlob(`/invoices/${id}/pdf`, token);
      const url = window.URL.createObjectURL(blob);
      setPreview(url);
    } catch {
      toast.error('Error al previsualizar PDF');
    }
  };
  return (
    <main className="mx-auto max-w-6xl p-4 space-y-8">
      <h2 className="text-2xl font-bold">Facturas / Proformas</h2>
      <form
        onSubmit={handleSubmit}
        className="space-y-4 bg-gray-800 p-4 rounded-lg border border-gray-700"
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <label className="flex flex-col gap-1">
            <span className="text-sm text-gray-500">Número</span>
            <input
              className="border border-gray-300 dark:border-gray-600 p-2 rounded focus:outline-none focus:ring-2 focus:ring-brand"
              name="number"
              value={form.number}
              readOnly
              required
            />
          </label>
          <label className="flex flex-col gap-1">
            <span className="text-sm text-gray-500">Fecha</span>
            <input
              className="border border-gray-300 dark:border-gray-600 p-2 rounded focus:outline-none focus:ring-2 focus:ring-brand"
              type="date"
              name="date"
              value={form.date}
              onChange={handleChange}
              required
            />
          </label>
          <label className="flex flex-col gap-1">
            <span className="text-sm text-gray-500">Tipo</span>
            <select
              className="border border-gray-300 dark:border-gray-600 p-2 rounded focus:outline-none focus:ring-2 focus:ring-brand"
              name="type"
              value={form.type}
              onChange={handleChange}
            >
              <option value="factura">Factura</option>
              <option value="proforma">Proforma</option>
            </select>
          </label>
          <label className="flex flex-col gap-1">
            <span className="text-sm text-gray-500">Cliente</span>
            <select
              className="border border-gray-300 dark:border-gray-600 p-2 rounded focus:outline-none focus:ring-2 focus:ring-brand"
              name="client_id"
              value={form.client_id}
              onChange={handleChange}
              required
            >
              <option value="">Selecciona un cliente</option>
              {clients.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </label>
        </div>
        <h3 className="font-semibold">Líneas</h3>
        {form.items.map((item, idx) => (
          <div
            key={idx}
            className="grid grid-cols-1 sm:grid-cols-4 gap-2 border border-gray-700 p-2 rounded"
          >
            <label className="flex flex-col gap-1">
              <span className="text-sm text-gray-500">Descripción</span>
              <input
                className="border border-gray-300 dark:border-gray-600 p-2 rounded focus:outline-none focus:ring-2 focus:ring-brand"
                value={item.description}
                onChange={(e) =>
                  handleItemChange(idx, 'description', e.target.value)
                }
                required
              />
            </label>
            <label className="flex flex-col gap-1">
              <span className="text-sm text-gray-500">Unidades</span>
              <input
                className="border border-gray-300 dark:border-gray-600 p-2 rounded focus:outline-none focus:ring-2 focus:ring-brand"
                type="number"
                min="1"
                value={item.units}
                onChange={(e) => handleItemChange(idx, 'units', e.target.value)}
                required
              />
            </label>
            <label className="flex flex-col gap-1">
              <span className="text-sm text-gray-500">Precio unitario</span>
              <input
                className="border border-gray-300 dark:border-gray-600 p-2 rounded focus:outline-none focus:ring-2 focus:ring-brand [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                type="number"
                //step="0.01"
                value={item.unit_price}
                onChange={(e) =>
                  handleItemChange(idx, 'unit_price', e.target.value)
                }
                required
              />
            </label>
            <label className="flex flex-col gap-1">
              <span className="text-sm text-gray-500">IVA (%)</span>
              <input
                className="border border-gray-300 dark:border-gray-600 p-2 rounded focus:outline-none focus:ring-2 focus:ring-brand"
                type="number"
                step="0.01"
                value={item.tax_rate}
                onChange={(e) =>
                  handleItemChange(idx, 'tax_rate', e.target.value)
                }
                required
              />
            </label>
          </div>
        ))}
        <button
          type="button"
          onClick={addItem}
          className="bg-secondary hover:opacity-90 transition px-3 py-1 rounded text-white"
        >
          Añadir línea
        </button>
        <button
          type="submit"
          className="bg-primary hover:opacity-90 transition text-white px-4 py-2 rounded"
        >
          Guardar
        </button>
      </form>
      <section>
        <h3 className="text-xl font-semibold mb-2">Listado</h3>
        {loading ? (
          <Skeleton count={5} height={30} className="mb-2" />
        ) : (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-2">
            {(() => {
              const sorted = invoices.slice().sort((a,b)=>{
                if (!userSorted) {
                  if (a.__pinned && !b.__pinned) return -1;
                  if (!a.__pinned && b.__pinned) return 1;
                }
                const dir = sort.dir==='asc'?1:-1
                let av = a[sort.field];
                let bv = b[sort.field];
                if (sort.field==='date') { av = a.date||''; bv = b.date||''; return String(av).localeCompare(String(bv))*dir; }
                if (sort.field==='total') { return ((av||0)-(bv||0))*dir; }
                return String(av).localeCompare(String(bv),'es',{ numeric:true })*dir;
              });
              const totalPages = Math.max(1, Math.ceil(sorted.length / pageSize));
              const safePage = Math.min(currentPage, totalPages);
              const start = (safePage - 1) * pageSize;
              const pageItems = sorted.slice(start, start + pageSize);

              return (
                <>
                  {/* Desktop table */}
                  <div className="hidden md:block">
                    <table className="w-full table-fixed border-separate border-spacing-y-2">
                      <thead>
                        <tr className="text-xs text-gray-400">
                          <th className="text-left px-2 w-[14%]"><button className="hover:underline" onClick={()=>{ setSort(s=>({ field: 'number', dir: s.dir==='asc'?'desc':'asc' })); setUserSorted(true); setCurrentPage(1); }}>Número</button></th>
                          <th className="text-left px-2 w-[28%]"><button className="hover:underline" onClick={()=>{ setSort(s=>({ field: 'client_id', dir: s.dir==='asc'?'desc':'asc' })); setUserSorted(true); setCurrentPage(1); }}>Cliente</button></th>
                          <th className="text-center px-2 w-[14%]"><button className="hover:underline" onClick={()=>{ setSort(s=>({ field: 'date', dir: s.dir==='asc'?'desc':'asc' })); setUserSorted(true); setCurrentPage(1); }}>Fecha</button></th>
                          <th className="text-center px-2 w-[10%]"><button className="hover:underline" onClick={()=>{ setSort(s=>({ field: 'type', dir: s.dir==='asc'?'desc':'asc' })); setUserSorted(true); setCurrentPage(1); }}>Tipo</button></th>
                          <th className="text-right px-2 w-[12%]"><button className="hover:underline" onClick={()=>{ setSort(s=>({ field: 'total', dir: s.dir==='asc'?'desc':'asc' })); setUserSorted(true); setCurrentPage(1); }}>Total</button></th>
                          <th className="text-right px-2 w-[22%]">Acciones</th>
                        </tr>
                      </thead>
                      <tbody>
                        {pageItems.map(inv=>{
                          const clientName = clients.find(c=>c.id===inv.client_id)?.name ?? ''
                          return (
                            <tr key={inv.id} onClick={()=>openPreview(inv.id)} className="cursor-pointer">
                              <td className="px-2 py-2 bg-gray-800 rounded-l-lg whitespace-nowrap font-medium">{inv.number}</td>
                              <td className="px-2 py-2 bg-gray-800 truncate">{clientName}</td>
                              <td className="px-2 py-2 bg-gray-800 text-center text-sm text-gray-300">{inv.date?.slice(0,10)}</td>
                              <td className="px-2 py-2 bg-gray-800 text-center text-xs uppercase">{inv.type}</td>
                              <td className="px-2 py-2 bg-gray-800 text-right font-semibold tabular-nums whitespace-nowrap">{(inv.total ?? 0).toFixed(2)} €</td>
                              <td className="px-2 py-2 bg-gray-800 rounded-r-lg">
                                <div className="flex flex-col items-end gap-1">
                                  <button onClick={(e)=>{e.stopPropagation(); downloadInvoice(inv.id, inv.number);}} className="text-brand underline">PDF</button>
                                  <button onClick={(e)=>{e.stopPropagation(); duplicateInvoice(inv);}} className="underline">Duplicar</button>
                                  <button onClick={(e)=>{e.stopPropagation(); deleteInvoice(inv);}} className="text-red-600 underline">Eliminar</button>
                                </div>
                              </td>
                            </tr>
                          )
                        })}
                      </tbody>
                    </table>
                  </div>

                  {/* Mobile cards */}
                  <div className="md:hidden space-y-2">
                    {pageItems.map(inv=>{
                      const clientName = clients.find(c=>c.id===inv.client_id)?.name ?? ''
                      return (
                        <div key={inv.id} className="p-3 bg-gray-800 border border-gray-700 rounded" onClick={()=>openPreview(inv.id)}>
                          <div className="space-y-1">
                            <div className="text-xs text-gray-500">Número</div>
                            <div className="font-medium">{inv.number}</div>
                            <div className="text-xs text-gray-500 mt-2">Cliente</div>
                            <div className="text-gray-300">{clientName}</div>
                            <div className="text-xs text-gray-500 mt-2">Fecha</div>
                            <div className="text-gray-300">{inv.date?.slice(0,10)}</div>
                            <div className="text-xs text-gray-500 mt-2">Tipo</div>
                            <div className="text-gray-300 uppercase text-xs">{inv.type}</div>
                            <div className="text-xs text-gray-500 mt-2">Total</div>
                            <div className="font-semibold text-gray-100">{(inv.total ?? 0).toFixed(2)} €</div>
                          </div>
                          <div className="mt-3 flex items-center gap-4" onClick={(e)=>e.stopPropagation()}>
                            <button className="text-brand underline" onClick={()=>downloadInvoice(inv.id, inv.number)}>PDF</button>
                            <button className="underline" onClick={()=>duplicateInvoice(inv)}>Duplicar</button>
                            <button className="text-red-600 underline" onClick={()=>deleteInvoice(inv)}>Eliminar</button>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </>
              )
            })()}
          </motion.div>
        )}
      </section>

      {preview && (
        <div
          className="fixed inset-0 bg-black/60 flex items-center justify-center p-4"
          onClick={() => setPreview(null)}
        >
          <div
            className="bg-white dark:bg-gray-900 rounded-lg overflow-hidden shadow-xl max-w-4xl w-full h-[80vh]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center p-2 border-b border-gray-200 dark:border-gray-800">
              <span className="font-medium">Vista previa</span>
              <button
                className="text-sm text-red-600"
                onClick={() => setPreview(null)}
              >
                Cerrar
              </button>
            </div>
            <iframe title="preview" src={preview} className="w-full h-full" />
          </div>
        </div>
      )}
      {(() => {
        const totalPages = Math.max(1, Math.ceil(invoices.length / pageSize));
        const safePage = Math.min(currentPage, totalPages);
        return (
          <div className="flex items-center justify-between gap-2 mt-3">
            {safePage > 1 ? (
              <button className="bg-secondary text-white px-3 py-1 rounded" onClick={()=>setCurrentPage(p=>Math.max(1,p-1))}>Anterior</button>
            ) : <span />}
            <div className="flex items-center gap-1">
              {Array.from({ length: totalPages }).map((_, i)=>{
                const page = i+1
                const isActive = page === safePage
                return (
                  <button
                    key={page}
                    onClick={()=>setCurrentPage(page)}
                    className={isActive ? 'bg-primary text-white px-3 py-1 rounded' : 'px-3 py-1 rounded border border-gray-700 text-gray-300 hover:text-brand'}
                  >
                    {page}
                  </button>
                )
              })}
            </div>
            {safePage < totalPages ? (
              <button className="bg-primary text-white px-3 py-1 rounded" onClick={()=>setCurrentPage(p=>Math.min(totalPages,p+1))}>Siguiente</button>
            ) : <span />}
          </div>
        );
      })()}
    </main>
  );
}
