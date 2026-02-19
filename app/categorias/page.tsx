'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

interface Categoria {
  id: number;
  nombre: string;
  descripcion?: string;
  color?: string;
  icono?: string;
  activa: boolean;
}

interface FormData {
  nombre: string;
  descripcion: string;
  color: string;
  icono: string;
}

const EMPTY_FORM: FormData = { nombre: '', descripcion: '', color: '#6366f1', icono: '' };

export default function CategoriasPage() {
  const router = useRouter();
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [soloActivas, setSoloActivas] = useState(false);

  // Modal state
  const [modal, setModal] = useState<'create' | 'edit' | 'delete' | null>(null);
  const [selected, setSelected] = useState<Categoria | null>(null);
  const [form, setForm] = useState<FormData>(EMPTY_FORM);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const fetchCategorias = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/categorias${soloActivas ? '?activas=true' : ''}`);
      if (!res.ok) throw new Error('Error al cargar categorías');
      const data = await res.json();
      setCategorias(data);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchCategorias(); }, [soloActivas]);

  const openCreate = () => {
    setForm(EMPTY_FORM);
    setFormError(null);
    setSelected(null);
    setModal('create');
  };

  const openEdit = (cat: Categoria) => {
    setForm({
      nombre: cat.nombre,
      descripcion: cat.descripcion ?? '',
      color: cat.color ?? '#6366f1',
      icono: cat.icono ?? '',
    });
    setFormError(null);
    setSelected(cat);
    setModal('edit');
  };

  const openDelete = (cat: Categoria) => {
    setSelected(cat);
    setModal('delete');
  };

  const closeModal = () => {
    setModal(null);
    setSelected(null);
    setFormError(null);
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    setFormError(null);
    try {
      const isEdit = modal === 'edit' && selected;
      const url = isEdit ? `/api/categorias/${selected.id}` : '/api/categorias';
      const method = isEdit ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nombre: form.nombre,
          descripcion: form.descripcion || undefined,
          color: form.color || undefined,
          icono: form.icono || undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? 'Error al guardar');

      await fetchCategorias();
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
      const res = await fetch(`/api/categorias/${selected.id}`, { method: 'DELETE' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? 'Error al eliminar');
      await fetchCategorias();
      closeModal();
    } catch (e: any) {
      setFormError(e.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeactivate = async (cat: Categoria) => {
    try {
      const res = await fetch(`/api/categorias/${cat.id}/deactivate`, { method: 'PATCH' });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error ?? 'Error al desactivar');
      }
      await fetchCategorias();
    } catch (e: any) {
      setError(e.message);
    }
  };

  return (
    <main className="min-h-screen bg-zinc-50 dark:bg-black py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-4xl mx-auto space-y-6">

        {/* Header */}
        <header className="flex items-center justify-between gap-4 bg-white dark:bg-zinc-900 p-6 rounded-lg shadow-lg">
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.push('/inicio')}
              className="rounded-md border border-zinc-200 dark:border-zinc-700 text-zinc-500 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-800 text-sm font-medium py-2 px-3 transition-colors"
            >
              ← Inicio
            </button>
            <div className="space-y-1">
              <h1 className="text-2xl font-bold text-black dark:text-white">Categorías</h1>
              <p className="text-sm text-zinc-500 dark:text-zinc-400">Gestiona las categorías de tus transacciones</p>
            </div>
          </div>
          <button
            onClick={openCreate}
            className="rounded-md bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium py-2 px-4 transition-colors"
          >
            + Nueva categoría
          </button>
        </header>

        {/* Filtro */}
        <div className="flex items-center gap-3 px-1">
          <label className="flex items-center gap-2 cursor-pointer select-none text-sm text-zinc-600 dark:text-zinc-400">
            <div
              onClick={() => setSoloActivas(v => !v)}
              className={`relative w-10 h-5 rounded-full transition-colors ${soloActivas ? 'bg-indigo-600' : 'bg-zinc-300 dark:bg-zinc-700'}`}
            >
              <span className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${soloActivas ? 'translate-x-5' : ''}`} />
            </div>
            Solo activas
          </label>
        </div>

        {/* Content */}
        <div className="bg-white dark:bg-zinc-900 rounded-lg shadow-lg overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center py-20 text-zinc-400">
              Cargando...
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center py-20 gap-3">
              <p className="text-red-500 text-sm">{error}</p>
              <button onClick={fetchCategorias} className="text-sm text-indigo-600 hover:underline">
                Reintentar
              </button>
            </div>
          ) : categorias.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 gap-2 text-zinc-400">
              <span className="text-4xl">🗂️</span>
              <p className="text-sm">No hay categorías aún</p>
              <button onClick={openCreate} className="text-sm text-indigo-600 hover:underline">
                Crear la primera
              </button>
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead className="border-b border-zinc-200 dark:border-zinc-800">
                <tr className="text-left text-xs uppercase tracking-wide text-zinc-500 dark:text-zinc-500">
                  <th className="px-6 py-3">Categoría</th>
                  <th className="px-6 py-3 hidden sm:table-cell">Descripción</th>
                  <th className="px-6 py-3">Estado</th>
                  <th className="px-6 py-3 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
                {categorias.map((cat) => (
                  <tr key={cat.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <span
                          className="w-3 h-3 rounded-full flex-shrink-0"
                          style={{ backgroundColor: cat.color ?? '#6366f1' }}
                        />
                        <div>
                          <p className="font-medium text-zinc-900 dark:text-white">
                            {cat.icono && <span className="mr-1">{cat.icono}</span>}
                            {cat.nombre}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 hidden sm:table-cell text-zinc-500 dark:text-zinc-400 max-w-xs truncate">
                      {cat.descripcion ?? '—'}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                        cat.activa
                          ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                          : 'bg-zinc-100 text-zinc-500 dark:bg-zinc-800 dark:text-zinc-500'
                      }`}>
                        {cat.activa ? 'Activa' : 'Inactiva'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => openEdit(cat)}
                          className="text-xs text-indigo-600 hover:text-indigo-800 dark:text-indigo-400 dark:hover:text-indigo-300 font-medium transition-colors"
                        >
                          Editar
                        </button>
                        {cat.activa && (
                          <button
                            onClick={() => handleDeactivate(cat)}
                            className="text-xs text-amber-600 hover:text-amber-800 dark:text-amber-400 font-medium transition-colors"
                          >
                            Desactivar
                          </button>
                        )}
                        <button
                          onClick={() => openDelete(cat)}
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

      {/* Modal overlay */}
      {modal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
          <div className="w-full max-w-md bg-white dark:bg-zinc-900 rounded-lg shadow-xl p-6 space-y-5">

            {/* Delete Modal */}
            {modal === 'delete' && (
              <>
                <h2 className="text-lg font-bold text-zinc-900 dark:text-white">Eliminar categoría</h2>
                <p className="text-sm text-zinc-600 dark:text-zinc-400">
                  ¿Estás seguro de que deseas eliminar{' '}
                  <span className="font-semibold text-zinc-800 dark:text-white">{selected?.nombre}</span>?
                  Esta acción no se puede deshacer. Si tiene transacciones asociadas, no podrá eliminarse.
                </p>
                {formError && (
                  <p className="text-sm text-red-500 bg-red-50 dark:bg-red-900/20 rounded p-2">{formError}</p>
                )}
                <div className="flex justify-end gap-3 pt-2">
                  <button
                    onClick={closeModal}
                    disabled={submitting}
                    className="text-sm px-4 py-2 rounded-md border border-zinc-300 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={handleDelete}
                    disabled={submitting}
                    className="text-sm px-4 py-2 rounded-md bg-red-600 hover:bg-red-700 disabled:bg-red-400 text-white font-medium transition-colors"
                  >
                    {submitting ? 'Eliminando...' : 'Eliminar'}
                  </button>
                </div>
              </>
            )}

            {/* Create / Edit Modal */}
            {(modal === 'create' || modal === 'edit') && (
              <>
                <h2 className="text-lg font-bold text-zinc-900 dark:text-white">
                  {modal === 'create' ? 'Nueva categoría' : 'Editar categoría'}
                </h2>

                <div className="space-y-4">
                  {/* Nombre */}
                  <div className="space-y-1">
                    <label className="text-xs font-medium text-zinc-600 dark:text-zinc-400 uppercase tracking-wide">
                      Nombre *
                    </label>
                    <input
                      type="text"
                      value={form.nombre}
                      onChange={e => setForm(f => ({ ...f, nombre: e.target.value }))}
                      placeholder="Ej: Alimentación"
                      className="w-full rounded-md border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white text-sm px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
                    />
                  </div>

                  {/* Descripción */}
                  <div className="space-y-1">
                    <label className="text-xs font-medium text-zinc-600 dark:text-zinc-400 uppercase tracking-wide">
                      Descripción
                    </label>
                    <input
                      type="text"
                      value={form.descripcion}
                      onChange={e => setForm(f => ({ ...f, descripcion: e.target.value }))}
                      placeholder="Descripción opcional"
                      className="w-full rounded-md border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white text-sm px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
                    />
                  </div>

                  {/* Color e Ícono */}
                  <div className="flex gap-4">
                    <div className="space-y-1 flex-1">
                      <label className="text-xs font-medium text-zinc-600 dark:text-zinc-400 uppercase tracking-wide">
                        Color
                      </label>
                      <div className="flex items-center gap-2">
                        <input
                          type="color"
                          value={form.color}
                          onChange={e => setForm(f => ({ ...f, color: e.target.value }))}
                          className="w-9 h-9 rounded cursor-pointer border border-zinc-300 dark:border-zinc-700 bg-transparent"
                        />
                        <input
                          type="text"
                          value={form.color}
                          onChange={e => setForm(f => ({ ...f, color: e.target.value }))}
                          placeholder="#6366f1"
                          className="flex-1 rounded-md border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white text-sm px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
                        />
                      </div>
                    </div>
                    <div className="space-y-1 w-28">
                      <label className="text-xs font-medium text-zinc-600 dark:text-zinc-400 uppercase tracking-wide">
                        Ícono
                      </label>
                      <input
                        type="text"
                        value={form.icono}
                        onChange={e => setForm(f => ({ ...f, icono: e.target.value }))}
                        placeholder="🛒"
                        className="w-full rounded-md border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white text-sm px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition text-center"
                      />
                    </div>
                  </div>

                  {/* Preview */}
                  {form.nombre && (
                    <div className="flex items-center gap-2 p-3 rounded-md bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700">
                      <span className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: form.color }} />
                      <span className="text-sm text-zinc-700 dark:text-zinc-300">
                        {form.icono && <span className="mr-1">{form.icono}</span>}
                        {form.nombre}
                      </span>
                    </div>
                  )}
                </div>

                {formError && (
                  <p className="text-sm text-red-500 bg-red-50 dark:bg-red-900/20 rounded p-2">{formError}</p>
                )}

                <div className="flex justify-end gap-3 pt-2">
                  <button
                    onClick={closeModal}
                    disabled={submitting}
                    className="text-sm px-4 py-2 rounded-md border border-zinc-300 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={handleSubmit}
                    disabled={submitting || !form.nombre.trim()}
                    className="text-sm px-4 py-2 rounded-md bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 disabled:cursor-not-allowed text-white font-medium transition-colors"
                  >
                    {submitting ? 'Guardando...' : modal === 'create' ? 'Crear' : 'Guardar cambios'}
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