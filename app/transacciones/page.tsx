'use client';

import { useEffect, useState } from 'react';

// ─── Tipos ────────────────────────────────────────────────────────────────────
type Tipo = 'INGRESO' | 'GASTO';
type MetodoPago = 'EFECTIVO' | 'TRANSFERENCIA' | 'TARJETA_DEBITO' | 'TARJETA_CREDITO' | 'CHEQUE' | 'OTRO';

interface Categoria {
  id: number;
  nombre: string;
  color?: string;
  icono?: string;
}

interface Transaccion {
  id: number;
  usuario_id: number;
  categoria_id: number;
  categoria_nombre?: string;
  categoria_color?: string;
  categoria_icono?: string;
  tipo: Tipo;
  monto: number;
  descripcion?: string;
  fecha_transaccion: string;
  fecha_registro: string;
  es_recurrente: boolean;
  metodo_pago?: MetodoPago;
}

interface FormData {
  categoria_id: string;
  tipo: Tipo;
  monto: string;
  descripcion: string;
  fecha_transaccion: string;
  es_recurrente: boolean;
  metodo_pago: MetodoPago | '';
}

// ─── Constantes ───────────────────────────────────────────────────────────────
const USUARIO_ID = 1; // TODO: reemplazar con el usuario de sesión real

const EMPTY_FORM: FormData = {
  categoria_id: '',
  tipo: 'GASTO',
  monto: '',
  descripcion: '',
  fecha_transaccion: new Date().toISOString().split('T')[0],
  es_recurrente: false,
  metodo_pago: '',
};

const METODOS: { value: MetodoPago; label: string }[] = [
  { value: 'EFECTIVO', label: 'Efectivo' },
  { value: 'TRANSFERENCIA', label: 'Transferencia' },
  { value: 'TARJETA_DEBITO', label: 'Tarjeta débito' },
  { value: 'TARJETA_CREDITO', label: 'Tarjeta crédito' },
  { value: 'CHEQUE', label: 'Cheque' },
  { value: 'OTRO', label: 'Otro' },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────
function formatMonto(monto: number) {
  return new Intl.NumberFormat('es-PY', { style: 'currency', currency: 'PYG', maximumFractionDigits: 0 }).format(monto);
}

function formatFecha(fecha: string) {
  return new Date(fecha + 'T00:00:00').toLocaleDateString('es-PY', { day: '2-digit', month: 'short', year: 'numeric' });
}

// ─── Componente ───────────────────────────────────────────────────────────────
export default function TransaccionesPage() {
  const [transacciones, setTransacciones] = useState<Transaccion[]>([]);
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filtros
  const [filtroTipo, setFiltroTipo] = useState<Tipo | ''>('');
  const [filtroCategoria, setFiltroCategoria] = useState<string>('');
  const [filtroDesde, setFiltroDesde] = useState('');
  const [filtroHasta, setFiltroHasta] = useState('');

  // Modal
  const [modal, setModal] = useState<'create' | 'edit' | 'delete' | null>(null);
  const [selected, setSelected] = useState<Transaccion | null>(null);
  const [form, setForm] = useState<FormData>(EMPTY_FORM);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  // ─── Fetch ─────────────────────────────────────────────────────────────────
  const fetchTransacciones = async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({ usuario_id: String(USUARIO_ID) });
      if (filtroTipo) params.set('tipo', filtroTipo);
      if (filtroCategoria) params.set('categoria_id', filtroCategoria);
      if (filtroDesde) params.set('fecha_desde', filtroDesde);
      if (filtroHasta) params.set('fecha_hasta', filtroHasta);

      const res = await fetch(`/api/transacciones?${params}`);
      if (!res.ok) throw new Error('Error al cargar transacciones');
      setTransacciones(await res.json());
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategorias = async () => {
    try {
      const res = await fetch('/api/categorias?activas=true');
      if (res.ok) setCategorias(await res.json());
    } catch {}
  };

  useEffect(() => { fetchCategorias(); }, []);
  useEffect(() => { fetchTransacciones(); }, [filtroTipo, filtroCategoria, filtroDesde, filtroHasta]);

  // ─── Resumen ───────────────────────────────────────────────────────────────
  const totalIngresos = transacciones.filter(t => t.tipo === 'INGRESO').reduce((s, t) => s + Number(t.monto), 0);
  const totalGastos   = transacciones.filter(t => t.tipo === 'GASTO').reduce((s, t) => s + Number(t.monto), 0);
  const balance       = totalIngresos - totalGastos;

  // ─── Modal helpers ─────────────────────────────────────────────────────────
  const openCreate = () => {
    setForm(EMPTY_FORM);
    setFormError(null);
    setSelected(null);
    setModal('create');
  };

  const openEdit = (t: Transaccion) => {
    setForm({
      categoria_id: String(t.categoria_id),
      tipo: t.tipo,
      monto: String(t.monto),
      descripcion: t.descripcion ?? '',
      fecha_transaccion: t.fecha_transaccion.split('T')[0],
      es_recurrente: t.es_recurrente,
      metodo_pago: t.metodo_pago ?? '',
    });
    setFormError(null);
    setSelected(t);
    setModal('edit');
  };

  const openDelete = (t: Transaccion) => { setSelected(t); setModal('delete'); };
  const closeModal = () => { setModal(null); setSelected(null); setFormError(null); };

  // ─── Submit ────────────────────────────────────────────────────────────────
  const handleSubmit = async () => {
    setSubmitting(true);
    setFormError(null);
    try {
      const isEdit = modal === 'edit' && selected;
      const url    = isEdit ? `/api/transacciones/${selected.id}` : '/api/transacciones';
      const method = isEdit ? 'PUT' : 'POST';

      const body: any = {
        categoria_id: Number(form.categoria_id),
        tipo: form.tipo,
        monto: Number(form.monto),
        descripcion: form.descripcion || undefined,
        fecha_transaccion: form.fecha_transaccion,
        es_recurrente: form.es_recurrente,
        metodo_pago: form.metodo_pago || undefined,
      };
      if (!isEdit) body.usuario_id = USUARIO_ID;

      const res  = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? 'Error al guardar');

      await fetchTransacciones();
      closeModal();
    } catch (e: any) {
      setFormError(e.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!selected) return;
    setSubmitting(true);
    setFormError(null);
    try {
      const res  = await fetch(`/api/transacciones/${selected.id}`, { method: 'DELETE' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? 'Error al eliminar');
      await fetchTransacciones();
      closeModal();
    } catch (e: any) {
      setFormError(e.message);
    } finally {
      setSubmitting(false);
    }
  };

  // ─── Render ────────────────────────────────────────────────────────────────
  return (
    <main className="min-h-screen bg-zinc-50 dark:bg-black py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-5xl mx-auto space-y-6">

        {/* Header */}
        <header className="flex items-center justify-between gap-4 bg-white dark:bg-zinc-900 p-6 rounded-lg shadow-lg">
          <div className="space-y-1">
            <h1 className="text-2xl font-bold text-black dark:text-white">Transacciones</h1>
            <p className="text-sm text-zinc-500 dark:text-zinc-400">
              Registra y gestiona tus ingresos y gastos
            </p>
          </div>
          <button
            onClick={openCreate}
            className="rounded-md bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium py-2 px-4 transition-colors"
          >
            + Nueva transacción
          </button>
        </header>

        {/* Tarjetas resumen */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white dark:bg-zinc-900 rounded-lg shadow p-5 border-l-4 border-green-500">
            <p className="text-xs text-zinc-500 dark:text-zinc-400 uppercase tracking-wide">Ingresos</p>
            <p className="text-xl font-bold text-green-600 dark:text-green-400 mt-1">{formatMonto(totalIngresos)}</p>
          </div>
          <div className="bg-white dark:bg-zinc-900 rounded-lg shadow p-5 border-l-4 border-red-500">
            <p className="text-xs text-zinc-500 dark:text-zinc-400 uppercase tracking-wide">Gastos</p>
            <p className="text-xl font-bold text-red-500 dark:text-red-400 mt-1">{formatMonto(totalGastos)}</p>
          </div>
          <div className={`bg-white dark:bg-zinc-900 rounded-lg shadow p-5 border-l-4 ${balance >= 0 ? 'border-indigo-500' : 'border-orange-500'}`}>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 uppercase tracking-wide">Balance</p>
            <p className={`text-xl font-bold mt-1 ${balance >= 0 ? 'text-indigo-600 dark:text-indigo-400' : 'text-orange-500'}`}>
              {formatMonto(balance)}
            </p>
          </div>
        </div>

        {/* Filtros */}
        <div className="bg-white dark:bg-zinc-900 rounded-lg shadow-lg p-4">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {/* Tipo */}
            <div className="space-y-1">
              <label className="text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wide">Tipo</label>
              <select
                value={filtroTipo}
                onChange={e => setFiltroTipo(e.target.value as any)}
                className="w-full rounded-md border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white text-sm px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="">Todos</option>
                <option value="INGRESO">Ingreso</option>
                <option value="GASTO">Gasto</option>
              </select>
            </div>
            {/* Categoría */}
            <div className="space-y-1">
              <label className="text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wide">Categoría</label>
              <select
                value={filtroCategoria}
                onChange={e => setFiltroCategoria(e.target.value)}
                className="w-full rounded-md border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white text-sm px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="">Todas</option>
                {categorias.map(c => <option key={c.id} value={c.id}>{c.icono} {c.nombre}</option>)}
              </select>
            </div>
            {/* Desde */}
            <div className="space-y-1">
              <label className="text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wide">Desde</label>
              <input
                type="date"
                value={filtroDesde}
                onChange={e => setFiltroDesde(e.target.value)}
                className="w-full rounded-md border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white text-sm px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            {/* Hasta */}
            <div className="space-y-1">
              <label className="text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wide">Hasta</label>
              <input
                type="date"
                value={filtroHasta}
                onChange={e => setFiltroHasta(e.target.value)}
                className="w-full rounded-md border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white text-sm px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>
          {(filtroTipo || filtroCategoria || filtroDesde || filtroHasta) && (
            <button
              onClick={() => { setFiltroTipo(''); setFiltroCategoria(''); setFiltroDesde(''); setFiltroHasta(''); }}
              className="mt-3 text-xs text-indigo-600 dark:text-indigo-400 hover:underline"
            >
              Limpiar filtros
            </button>
          )}
        </div>

        {/* Tabla */}
        <div className="bg-white dark:bg-zinc-900 rounded-lg shadow-lg overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center py-20 text-zinc-400">Cargando...</div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center py-20 gap-3">
              <p className="text-red-500 text-sm">{error}</p>
              <button onClick={fetchTransacciones} className="text-sm text-indigo-600 hover:underline">Reintentar</button>
            </div>
          ) : transacciones.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 gap-2 text-zinc-400">
              <span className="text-4xl">💳</span>
              <p className="text-sm">No hay transacciones registradas</p>
              <button onClick={openCreate} className="text-sm text-indigo-600 hover:underline">Registrar la primera</button>
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead className="border-b border-zinc-200 dark:border-zinc-800">
                <tr className="text-left text-xs uppercase tracking-wide text-zinc-500 dark:text-zinc-500">
                  <th className="px-6 py-3">Fecha</th>
                  <th className="px-6 py-3">Descripción</th>
                  <th className="px-6 py-3 hidden md:table-cell">Categoría</th>
                  <th className="px-6 py-3 hidden sm:table-cell">Método</th>
                  <th className="px-6 py-3 text-right">Monto</th>
                  <th className="px-6 py-3 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
                {transacciones.map(t => (
                  <tr key={t.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors">
                    {/* Fecha */}
                    <td className="px-6 py-4 text-zinc-500 dark:text-zinc-400 whitespace-nowrap">
                      <div>{formatFecha(t.fecha_transaccion)}</div>
                      {t.es_recurrente && (
                        <span className="text-xs text-indigo-500">↻ Recurrente</span>
                      )}
                    </td>
                    {/* Descripción */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <span className={`inline-block w-1.5 h-1.5 rounded-full flex-shrink-0 ${t.tipo === 'INGRESO' ? 'bg-green-500' : 'bg-red-500'}`} />
                        <span className="text-zinc-900 dark:text-white font-medium truncate max-w-[160px]">
                          {t.descripcion || (t.tipo === 'INGRESO' ? 'Ingreso' : 'Gasto')}
                        </span>
                      </div>
                    </td>
                    {/* Categoría */}
                    <td className="px-6 py-4 hidden md:table-cell">
                      <div className="flex items-center gap-2">
                        <span
                          className="w-2 h-2 rounded-full flex-shrink-0"
                          style={{ backgroundColor: t.categoria_color ?? '#6366f1' }}
                        />
                        <span className="text-zinc-500 dark:text-zinc-400 text-xs">
                          {t.categoria_icono} {t.categoria_nombre ?? '—'}
                        </span>
                      </div>
                    </td>
                    {/* Método */}
                    <td className="px-6 py-4 hidden sm:table-cell text-zinc-500 dark:text-zinc-400 text-xs">
                      {t.metodo_pago ? METODOS.find(m => m.value === t.metodo_pago)?.label : '—'}
                    </td>
                    {/* Monto */}
                    <td className="px-6 py-4 text-right font-semibold whitespace-nowrap">
                      <span className={t.tipo === 'INGRESO' ? 'text-green-600 dark:text-green-400' : 'text-red-500 dark:text-red-400'}>
                        {t.tipo === 'INGRESO' ? '+' : '-'}{formatMonto(t.monto)}
                      </span>
                    </td>
                    {/* Acciones */}
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => openEdit(t)}
                          className="text-xs text-indigo-600 hover:text-indigo-800 dark:text-indigo-400 font-medium transition-colors"
                        >
                          Editar
                        </button>
                        <button
                          onClick={() => openDelete(t)}
                          className="text-xs text-red-600 hover:text-red-800 dark:text-red-400 font-medium transition-colors"
                        >
                          Eliminar
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* ─── Modal ──────────────────────────────────────────────────────────── */}
      {modal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
          <div className="w-full max-w-md bg-white dark:bg-zinc-900 rounded-lg shadow-xl p-6 space-y-5 max-h-[90vh] overflow-y-auto">

            {/* Eliminar */}
            {modal === 'delete' && (
              <>
                <h2 className="text-lg font-bold text-zinc-900 dark:text-white">Eliminar transacción</h2>
                <p className="text-sm text-zinc-600 dark:text-zinc-400">
                  ¿Estás seguro de que deseas eliminar esta transacción?{' '}
                  {selected && (
                    <span className="font-semibold text-zinc-800 dark:text-white">
                      {selected.tipo === 'INGRESO' ? '+' : '-'}{formatMonto(selected.monto)}
                    </span>
                  )}. Esta acción no se puede deshacer.
                </p>
                {selected && (
                  <div className="rounded-md bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 p-3 text-sm text-zinc-700 dark:text-zinc-300">
                    <p><span className="font-medium">Tipo:</span> {selected.tipo}</p>
                    <p><span className="font-medium">Monto:</span> {formatMonto(selected.monto)}</p>
                    <p><span className="font-medium">Fecha:</span> {formatFecha(selected.fecha_transaccion)}</p>
                    {selected.descripcion && <p><span className="font-medium">Descripción:</span> {selected.descripcion}</p>}
                  </div>
                )}
                {formError && <p className="text-sm text-red-500 bg-red-50 dark:bg-red-900/20 rounded p-2">{formError}</p>}
                <div className="flex justify-end gap-3 pt-2">
                  <button onClick={closeModal} disabled={submitting} className="text-sm px-4 py-2 rounded-md border border-zinc-300 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors">
                    Cancelar
                  </button>
                  <button onClick={handleDelete} disabled={submitting} className="text-sm px-4 py-2 rounded-md bg-red-600 hover:bg-red-700 disabled:bg-red-400 text-white font-medium transition-colors">
                    {submitting ? 'Eliminando...' : 'Eliminar'}
                  </button>
                </div>
              </>
            )}

            {/* Crear / Editar */}
            {(modal === 'create' || modal === 'edit') && (
              <>
                <h2 className="text-lg font-bold text-zinc-900 dark:text-white">
                  {modal === 'create' ? 'Nueva transacción' : 'Editar transacción'}
                </h2>

                <div className="space-y-4">
                  {/* Tipo */}
                  <div className="space-y-1">
                    <label className="text-xs font-medium text-zinc-600 dark:text-zinc-400 uppercase tracking-wide">Tipo *</label>
                    <div className="flex gap-2">
                      {(['INGRESO', 'GASTO'] as Tipo[]).map(tipo => (
                        <button
                          key={tipo}
                          onClick={() => setForm(f => ({ ...f, tipo }))}
                          className={`flex-1 py-2 rounded-md text-sm font-medium border transition-colors ${
                            form.tipo === tipo
                              ? tipo === 'INGRESO'
                                ? 'bg-green-600 border-green-600 text-white'
                                : 'bg-red-600 border-red-600 text-white'
                              : 'border-zinc-300 dark:border-zinc-700 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-800'
                          }`}
                        >
                          {tipo === 'INGRESO' ? '↑ Ingreso' : '↓ Gasto'}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Monto */}
                  <div className="space-y-1">
                    <label className="text-xs font-medium text-zinc-600 dark:text-zinc-400 uppercase tracking-wide">Monto *</label>
                    <input
                      type="number"
                      min="0"
                      step="any"
                      value={form.monto}
                      onChange={e => setForm(f => ({ ...f, monto: e.target.value }))}
                      placeholder="0"
                      className="w-full rounded-md border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white text-sm px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>

                  {/* Categoría */}
                  <div className="space-y-1">
                    <label className="text-xs font-medium text-zinc-600 dark:text-zinc-400 uppercase tracking-wide">Categoría *</label>
                    <select
                      value={form.categoria_id}
                      onChange={e => setForm(f => ({ ...f, categoria_id: e.target.value }))}
                      className="w-full rounded-md border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white text-sm px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    >
                      <option value="">Seleccionar categoría</option>
                      {categorias.map(c => (
                        <option key={c.id} value={c.id}>{c.icono} {c.nombre}</option>
                      ))}
                    </select>
                  </div>

                  {/* Fecha */}
                  <div className="space-y-1">
                    <label className="text-xs font-medium text-zinc-600 dark:text-zinc-400 uppercase tracking-wide">Fecha *</label>
                    <input
                      type="date"
                      value={form.fecha_transaccion}
                      onChange={e => setForm(f => ({ ...f, fecha_transaccion: e.target.value }))}
                      className="w-full rounded-md border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white text-sm px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>

                  {/* Descripción */}
                  <div className="space-y-1">
                    <label className="text-xs font-medium text-zinc-600 dark:text-zinc-400 uppercase tracking-wide">Descripción</label>
                    <input
                      type="text"
                      value={form.descripcion}
                      onChange={e => setForm(f => ({ ...f, descripcion: e.target.value }))}
                      placeholder="Descripción opcional"
                      className="w-full rounded-md border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white text-sm px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>

                  {/* Método de pago */}
                  <div className="space-y-1">
                    <label className="text-xs font-medium text-zinc-600 dark:text-zinc-400 uppercase tracking-wide">Método de pago</label>
                    <select
                      value={form.metodo_pago}
                      onChange={e => setForm(f => ({ ...f, metodo_pago: e.target.value as any }))}
                      className="w-full rounded-md border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white text-sm px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    >
                      <option value="">Sin especificar</option>
                      {METODOS.map(m => <option key={m.value} value={m.value}>{m.label}</option>)}
                    </select>
                  </div>

                  {/* Recurrente */}
                  <label className="flex items-center gap-3 cursor-pointer">
                    <div
                      onClick={() => setForm(f => ({ ...f, es_recurrente: !f.es_recurrente }))}
                      className={`relative w-10 h-5 rounded-full transition-colors ${form.es_recurrente ? 'bg-indigo-600' : 'bg-zinc-300 dark:bg-zinc-700'}`}
                    >
                      <span className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${form.es_recurrente ? 'translate-x-5' : ''}`} />
                    </div>
                    <span className="text-sm text-zinc-700 dark:text-zinc-300">Transacción recurrente</span>
                  </label>
                </div>

                {formError && (
                  <p className="text-sm text-red-500 bg-red-50 dark:bg-red-900/20 rounded p-2">{formError}</p>
                )}

                <div className="flex justify-end gap-3 pt-2">
                  <button onClick={closeModal} disabled={submitting} className="text-sm px-4 py-2 rounded-md border border-zinc-300 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors">
                    Cancelar
                  </button>
                  <button
                    onClick={handleSubmit}
                    disabled={submitting || !form.monto || !form.categoria_id || !form.fecha_transaccion}
                    className="text-sm px-4 py-2 rounded-md bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 disabled:cursor-not-allowed text-white font-medium transition-colors"
                  >
                    {submitting ? 'Guardando...' : modal === 'create' ? 'Registrar' : 'Guardar cambios'}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </main>
  );
}