import { useEffect, useState, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom'
import { useStore } from '../store/store';
import {
  apiGet,
  apiPost,
  apiGetBlob,
  apiDelete,
} from '../lib/api';
import toast from 'react-hot-toast';
import CustomSkeleton from "../components/CustomSkeleton"
import { motion } from 'framer-motion';
import CreateInvoiceModal from "../components/CreateInvoiceModal";
import NeoGradientButton from "../components/NeoGradientButton";
import DataCard from "../components/DataCard";
import { formatDateES } from '../lib/format'
import LoadingSpinner from "../components/LoadingSpinner";

export default function Facturas() {
  const { 
    clients, 
    invoices, 
    setClients, 
    setInvoices, 
    token, 
    addInvoiceToTop, 
    setUserSorted, 
    getOrderedInvoices,
    userHasSorted
  } = useStore();
  const [loading, setLoading] = useState(true);
  const [sort, setSort] = useState({ field: 'date', dir: 'desc' });
  const [currentPage, setCurrentPage] = useState(1);
  const [searchParams, setSearchParams] = useSearchParams()
  const pageSize = 10;
  // Inicializar estado desde URL si existe (fallback a localStorage)
  useEffect(() => {
    const spSort = searchParams.get('sort')
    const spDir = searchParams.get('dir')
    const spPage = Number(searchParams.get('page') || '1')
    if (spSort && spDir) setSort({ field: spSort, dir: spDir })
    if (!Number.isNaN(spPage) && spPage > 0) setCurrentPage(spPage)
    if (!spSort && !spDir) {
      try {
        const saved = typeof window !== 'undefined' ? window.localStorage.getItem('invoiceSort') : null
        if (saved) {
          const parsed = JSON.parse(saved)
          if (parsed && parsed.field && parsed.dir) setSort({ field: parsed.field, dir: parsed.dir })
        }
      } catch (e) { void e }
    }
  }, [])
  // Persistir sort en localStorage y URL
  useEffect(() => {
    try {
      if (typeof window !== 'undefined') {
        window.localStorage.setItem('invoiceSort', JSON.stringify(sort))
      }
    } catch (e) { void e }
    const next = new URLSearchParams(searchParams)
    next.set('sort', sort.field)
    next.set('dir', sort.dir)
    setSearchParams(next, { replace: true })
  }, [sort])
  // Persistir página seleccionada entre secciones
  useEffect(() => {
    try { if (typeof window !== 'undefined') window.localStorage.setItem('invoicePage', String(currentPage)) } catch (e) { void e }
    const next = new URLSearchParams(searchParams)
    next.set('page', String(currentPage))
    setSearchParams(next, { replace: true })
  }, [currentPage])
  // Helpers de redondeo/conversión (2 decimales máximo)
  const round2 = (n) => Math.round((Number(n) + Number.EPSILON) * 100) / 100;
  const round4 = (n) => Math.round((Number(n) + Number.EPSILON) * 10000) / 10000;
  // Nota: para evitar perder 0,01 al recomponer el IVA en backend, enviamos neto con 4 decimales
  const grossToNet = (gross, rate) => {
    const r = Number(rate) || 0;
    const g = Number(gross) || 0;
    return r ? round4(g / (1 + r / 100)) : round4(g);
  };
  const netToGross = (net, rate) => {
    const r = Number(rate) || 0;
    const n = Number(net) || 0;
    return r ? round2(n * (1 + r / 100)) : round2(n);
  };
  const [form, setForm] = useState({
    number: '',
    date: new Date().toISOString().slice(0, 10),
    type: 'factura',
    client_id: '',
    payment_method: 'efectivo',
    items: [],
  });
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [previewLoading, setPreviewLoading] = useState(false);

  const fetchNextNumber = useCallback(async (docType, atDate) => {
    try {
      const qs = new URLSearchParams({ type: docType, ...(atDate ? { date: atDate } : {}) })
      const res = await apiGet(`/invoices/next_number?${qs.toString()}`, token)
      const nn = res?.next_number || ''
      setForm(f=>({ ...f, number: nn }))
    } catch {
      // Silencioso; el backend asignará número al guardar
    }
  }, [token])

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
  }, [setClients, setInvoices, token, fetchNextNumber]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = { ...form, client_id: Number(form.client_id) };
    // Convertir precios del formulario (brutos con IVA) a netos antes de enviar
    payload.items = (payload.items || []).map((it) => ({
      description: it.description,
      units: Number(it.units),
      unit_price: grossToNet(it.unit_price, it.tax_rate),
      tax_rate: Number(it.tax_rate),
    }));
    if (payload.type !== 'factura') {
      delete payload.payment_method;
    } else if (!payload.payment_method) {
      payload.payment_method = 'efectivo';
    }
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
      // Usar el nuevo método del store para añadir al principio manteniendo orden personalizado
      addInvoiceToTop(data);
              setCurrentPage(1);
        setShowCreateModal(false);
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
        payment_method: details.payment_method || 'efectivo',
        items: (details.items || []).map((it) => ({
          description: it.description,
          units: it.units,
           // Convertir neto del backend a bruto para el formulario (mostrar IVA incl.)
           unit_price: netToGross(it.unit_price, it.tax_rate),
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
    setPreviewLoading(true);
    try {
      const blob = await apiGetBlob(`/invoices/${id}/pdf`, token);
      const url = window.URL.createObjectURL(blob);
      setPreview(url);
    } catch {
      toast.error('Error al previsualizar PDF');
    } finally {
      setPreviewLoading(false);
    }
  };
  return (
    <main className="mx-auto max-w-6xl p-4 space-y-8">
      <h2 className="text-2xl font-semibold tracking-tight text-white/90">Facturas / Proformas</h2>
      
      {/* Botón Crear Factura */}
      <div className="flex justify-center">
        <NeoGradientButton
          onClick={() => setShowCreateModal(true)}
          icon={
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 5v14M5 12h14"/>
            </svg>
          }
        >
          Crear Factura
        </NeoGradientButton>
      </div>

      <section>
        <h3 className="text-xl font-semibold mb-2">Listado</h3>
        {loading ? (
          <CustomSkeleton count={5} height={30} className="mb-2" />
        ) : (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-2">
            {(() => {
              // Obtener facturas en orden personalizado o aplicar ordenamiento manual
              let sorted;
              if (userHasSorted) {
                // Si el usuario ha ordenado manualmente, aplicar ese ordenamiento con desempate estable por ID
                sorted = invoices.slice().sort((a, b) => {
                  const dir = sort.dir === 'asc' ? 1 : -1
                  const aId = a?.id || 0
                  const bId = b?.id || 0
                  const fallback = (aId - bId) * dir
                  if (sort.field === 'date') {
                    const cmp = String(a.date || '').localeCompare(String(b.date || ''))
                    return cmp !== 0 ? cmp * dir : fallback
                  }
                  if (sort.field === 'total') {
                    const diff = ((a.total ?? 0) - (b.total ?? 0))
                    return diff !== 0 ? diff * dir : fallback
                  }
                  const av = a[sort.field]
                  const bv = b[sort.field]
                  const cmp = String(av ?? '').localeCompare(String(bv ?? ''), 'es', { numeric: true })
                  return cmp !== 0 ? cmp * dir : fallback
                })
              } else {
                // Usar orden personalizado del store (nuevas facturas al principio)
                sorted = getOrderedInvoices();
              }
              
              const totalPages = Math.max(1, Math.ceil(sorted.length / pageSize));
              const safePage = Math.min(currentPage, totalPages);
              const start = (safePage - 1) * pageSize;
              const pageItems = sorted.slice(start, start + pageSize);

              return (
                <>
                  {/* Desktop table - hidden, using responsive cards instead */}
                  <div className="hidden">
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
                            <tr key={inv.id} onClick={()=>openPreview(inv.id)} className="cursor-pointer group hover:scale-[1.02] transition-all duration-200">
                              <td className="px-2 py-2 bg-gray-800 group-hover:bg-gray-800/80 transition-colors rounded-l-lg whitespace-nowrap font-medium">{inv.number}</td>
                              <td className="px-2 py-2 bg-gray-800 group-hover:bg-gray-800/80 transition-colors truncate">{clientName}</td>
                              <td className="px-2 py-2 bg-gray-800 group-hover:bg-gray-800/80 transition-colors text-center text-sm text-gray-300">{formatDateES(inv.date)}</td>
                              <td className="px-2 py-2 bg-gray-800 group-hover:bg-gray-800/80 transition-colors text-center text-xs uppercase">{inv.type}</td>
                              <td className="px-2 py-2 bg-gray-800 group-hover:bg-gray-800/80 transition-colors text-right font-semibold tabular-nums whitespace-nowrap">{(inv.total ?? 0).toFixed(2)} €</td>
                              <td className="px-2 py-2 bg-gray-800 group-hover:bg-gray-800/80 transition-colors rounded-r-lg">
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

                  {/* Labels externos solo en desktop */}
                  <div className={`
                    hidden md:grid md:grid-cols-6
                    gap-2 sm:gap-3 md:gap-4
                    mb-2 sm:mb-2.5 md:mb-3
                    text-xs text-gray-500 font-medium
                  `}>
                    <div>Número</div>
                    <div>Cliente</div>
                    <div>Fecha</div>
                    <div>Tipo</div>
                    <div>Total</div>
                    <div>Acciones</div>
                  </div>

                  {/* Cards responsive */}
                  <div className="space-y-2">
                    {pageItems.map(inv=>{
                      const clientName = clients.find(c=>c.id===inv.client_id)?.name ?? ''
                      return (
                                                <DataCard
                          key={inv.id}
                          onClick={()=>openPreview(inv.id)}
                          actions={[
                            {
                              label: 'PDF',
                              className: 'text-brand focus:ring-brand',
                              onClick: () => downloadInvoice(inv.id, inv.number)
                            },
                            {
                              label: 'Duplicar',
                              className: 'focus:ring-gray-500',
                              onClick: () => duplicateInvoice(inv)
                            },
                            {
                              label: 'Eliminar',
                              className: 'text-red-600 focus:ring-red-500',
                              onClick: () => deleteInvoice(inv)
                            }
                          ]}
                          columns={5}
                          >
                            <div>
                              <div className="text-xs text-gray-500 md:hidden">Número</div>
                              <div className="font-medium">{inv.number}</div>
                            </div>
                            <div>
                              <div className="text-xs text-gray-500 md:hidden">Cliente</div>
                              <div className="text-gray-300">{clientName}</div>
                            </div>
                            <div>
                              <div className="text-xs text-gray-500 md:hidden">Fecha</div>
                              <div className="text-gray-300">{formatDateES(inv.date)}</div>
                            </div>
                            <div>
                              <div className="text-xs text-gray-500 md:hidden">Tipo</div>
                              <div className="text-gray-300 uppercase text-xs">{inv.type}</div>
                            </div>
                            <div>
                              <div className="text-xs text-gray-500 md:hidden">Total</div>
                              <div className="font-semibold text-gray-100">{(inv.total ?? 0).toFixed(2)} €</div>
                            </div>
                          </DataCard>
                      )
                    })}
                  </div>
                </>
              )
            })()}
          </motion.div>
        )}
      </section>

      {(preview || previewLoading) && (
        <div
          className="fixed inset-0 bg-black/60 flex items-center justify-center p-4"
          onClick={() => !previewLoading && setPreview(null)}
        >
          <div
            className="bg-white dark:bg-gray-900 rounded-lg overflow-hidden shadow-xl max-w-4xl w-full h-[80vh]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center p-2 border-b border-gray-200 dark:border-gray-800">
              <span className="font-medium">Vista previa</span>
              <button
                className="text-sm text-red-600"
                onClick={() => !previewLoading && setPreview(null)}
                disabled={previewLoading}
              >
                Cerrar
              </button>
            </div>
            {previewLoading ? (
              <div className="flex items-center justify-center h-full">
                <LoadingSpinner />
              </div>
            ) : (
              <iframe title="preview" src={preview} className="w-full h-full" />
            )}
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

      {/* Modal para crear factura */}
      <CreateInvoiceModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSubmit={handleSubmit}
        form={form}
        setForm={setForm}
        clients={clients}
      />
    </main>
  );
}
