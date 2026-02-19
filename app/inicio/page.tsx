'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

// ─── Tipos ────────────────────────────────────────────────────────────────────
interface Transaccion {
  id: number;
  tipo: 'INGRESO' | 'GASTO';
  estado: 'COMPLETADO' | 'PENDIENTE';
  monto: number;
  descripcion?: string;
  fecha_transaccion: string;
  categoria_nombre?: string;
  categoria_color?: string;
  categoria_icono?: string;
  metodo_pago?: string;
}

interface Categoria {
  id: number;
  nombre: string;
  color?: string;
  icono?: string;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
function fmt(n: number) {
  return new Intl.NumberFormat('es-PY', {
    style: 'currency', currency: 'PYG', maximumFractionDigits: 0,
  }).format(n);
}

function fmtFecha(f: string) {
  return new Date(f + 'T00:00:00').toLocaleDateString('es-PY', {
    day: '2-digit', month: 'short',
  });
}

function getMesActual() {
  const now = new Date();
  const desde = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];
  const hasta = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().split('T')[0];
  return { desde, hasta };
}

function getMesNombre() {
  return new Date().toLocaleDateString('es-PY', { month: 'long', year: 'numeric' });
}

// ─── Componente ───────────────────────────────────────────────────────────────
export default function InicioSeguroPage() {
  const router = useRouter();
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [transacciones, setTransacciones] = useState<Transaccion[]>([]);
  const [categorias, setCategorias]       = useState<Categoria[]>([]);
  const [loading, setLoading]             = useState(true);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      router.push('/login');
    } catch {
      router.push('/login');
    } finally {
      setIsLoggingOut(false);
    }
  };

  useEffect(() => {
    const { desde, hasta } = getMesActual();

    Promise.all([
      fetch(`/api/transacciones?fecha_desde=${desde}&fecha_hasta=${hasta}`).then(r => r.json()),
      fetch('/api/categorias?activas=true').then(r => r.json()),
    ]).then(([txs, cats]) => {
      setTransacciones(Array.isArray(txs) ? txs : []);
      setCategorias(Array.isArray(cats) ? cats : []);
    }).catch(() => {
      setTransacciones([]);
      setCategorias([]);
    }).finally(() => setLoading(false));
  }, []);

  // ─── Cálculos ───────────────────────────────────────────────────────────────
  const completadas     = transacciones.filter(t => t.estado === 'COMPLETADO');
  const pendientes      = transacciones.filter(t => t.estado === 'PENDIENTE');
  const ingresos        = completadas.filter(t => t.tipo === 'INGRESO').reduce((s, t) => s + Number(t.monto), 0);
  const gastos          = completadas.filter(t => t.tipo === 'GASTO').reduce((s, t)  => s + Number(t.monto), 0);
  const balance         = ingresos - gastos;
  const porCobrar       = pendientes.filter(t => t.tipo === 'INGRESO').reduce((s, t) => s + Number(t.monto), 0);
  const porPagar        = pendientes.filter(t => t.tipo === 'GASTO').reduce((s, t)   => s + Number(t.monto), 0);
  const balanceProyect  = balance + porCobrar - porPagar;
  const pctGastos       = ingresos > 0 ? Math.min((gastos / ingresos) * 100, 100) : 0;

  // Gastos por categoría (top 5)
  const porCategoria = completadas
    .filter(t => t.tipo === 'GASTO')
    .reduce((acc: Record<string, { nombre: string; color: string; icono: string; total: number }>, t) => {
      const key = t.categoria_nombre ?? 'Sin categoría';
      if (!acc[key]) acc[key] = { nombre: key, color: t.categoria_color ?? '#6366f1', icono: t.categoria_icono ?? '', total: 0 };
      acc[key].total += Number(t.monto);
      return acc;
    }, {});

  const topCategorias = Object.values(porCategoria)
    .sort((a, b) => b.total - a.total)
    .slice(0, 5);

  const maxCategoria = topCategorias[0]?.total ?? 1;

  // Últimas 5 transacciones
  const ultimas = [...transacciones]
    .sort((a, b) => new Date(b.fecha_transaccion).getTime() - new Date(a.fecha_transaccion).getTime())
    .slice(0, 5);

  // ─── Render ─────────────────────────────────────────────────────────────────
  return (
    <main className="min-h-screen bg-zinc-50 dark:bg-zinc-950 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto space-y-6">

        {/* ── Header ─────────────────────────────────────────────────────── */}
        <header className="flex items-start justify-between gap-4 bg-white dark:bg-zinc-900 rounded-2xl shadow-lg p-6">
          <div>
            <p className="text-xs text-zinc-400 uppercase tracking-widest mb-1">Panel principal</p>
            <h1 className="text-2xl font-bold text-zinc-900 dark:text-white">Bienvenido a Casitapp</h1>
            <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1 capitalize">{getMesNombre()}</p>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={() => router.push('/transacciones')}
              className="rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium py-2 px-4 transition-colors">
              + Nueva transacción
            </button>
            <button onClick={handleLogout} disabled={isLoggingOut}
              className="rounded-lg border border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-800 text-sm font-medium py-2 px-4 transition-colors disabled:opacity-50">
              {isLoggingOut ? 'Saliendo...' : 'Cerrar sesión'}
            </button>
          </div>
        </header>

        {loading ? (
          <div className="flex items-center justify-center py-32 text-zinc-400">
            <div className="text-center space-y-2">
              <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto" />
              <p className="text-sm">Cargando tu resumen...</p>
            </div>
          </div>
        ) : (
          <>
            {/* ── Tarjetas métricas ─────────────────────────────────────── */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Balance */}
              <div className={`col-span-2 rounded-2xl shadow-lg p-6 relative overflow-hidden ${balance >= 0 ? 'bg-indigo-600' : 'bg-rose-600'}`}>
                <div className="absolute inset-0 opacity-10"
                  style={{ backgroundImage: 'radial-gradient(circle at 80% 20%, white 0%, transparent 60%)' }} />
                <p className="text-xs text-white/70 uppercase tracking-widest">Balance del mes</p>
                <p className="text-3xl font-bold text-white mt-2">{fmt(balance)}</p>
                <div className="mt-4">
                  <div className="flex justify-between text-xs text-white/60 mb-1">
                    <span>Gastado vs ingresado</span>
                    <span>{pctGastos.toFixed(0)}%</span>
                  </div>
                  <div className="h-1.5 bg-white/20 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-white rounded-full transition-all duration-700"
                      style={{ width: `${pctGastos}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* Ingresos */}
              <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-lg p-5 border-t-4 border-green-500">
                <p className="text-xs text-zinc-400 uppercase tracking-widest">Ingresos</p>
                <p className="text-xl font-bold text-green-600 dark:text-green-400 mt-2">{fmt(ingresos)}</p>
                <p className="text-xs text-zinc-400 mt-2">
                  {completadas.filter(t => t.tipo === 'INGRESO').length} transacción(es)
                </p>
              </div>

              {/* Gastos */}
              <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-lg p-5 border-t-4 border-red-500">
                <p className="text-xs text-zinc-400 uppercase tracking-widest">Gastos</p>
                <p className="text-xl font-bold text-red-500 dark:text-red-400 mt-2">{fmt(gastos)}</p>
                <p className="text-xs text-zinc-400 mt-2">
                  {completadas.filter(t => t.tipo === 'GASTO').length} transacción(es)
                </p>
              </div>
            </div>

            {/* ── Pendientes ────────────────────────────────────────────── */}
            {(porCobrar > 0 || porPagar > 0) && (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow p-5 border-l-4 border-amber-400">
                  <p className="text-xs text-zinc-400 uppercase tracking-widest">Por cobrar</p>
                  <p className="text-xl font-bold text-amber-500 mt-2">{fmt(porCobrar)}</p>
                  <p className="text-xs text-zinc-400 mt-1">{pendientes.filter(t => t.tipo === 'INGRESO').length} pendiente(s)</p>
                </div>
                <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow p-5 border-l-4 border-rose-400">
                  <p className="text-xs text-zinc-400 uppercase tracking-widest">Por pagar</p>
                  <p className="text-xl font-bold text-rose-500 mt-2">{fmt(porPagar)}</p>
                  <p className="text-xs text-zinc-400 mt-1">{pendientes.filter(t => t.tipo === 'GASTO').length} pendiente(s)</p>
                </div>
                <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow p-5 border-l-4 border-zinc-400">
                  <p className="text-xs text-zinc-400 uppercase tracking-widest">Balance proyectado</p>
                  <p className={`text-xl font-bold mt-2 ${balanceProyect >= 0 ? 'text-zinc-700 dark:text-zinc-200' : 'text-orange-500'}`}>
                    {fmt(balanceProyect)}
                  </p>
                  <p className="text-xs text-zinc-400 mt-1">Incluyendo pendientes</p>
                </div>
              </div>
            )}

            {/* ── Contenido principal ───────────────────────────────────── */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

              {/* Gastos por categoría */}
              <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-lg p-6">
                <div className="flex items-center justify-between mb-5">
                  <h2 className="text-sm font-semibold text-zinc-700 dark:text-zinc-300 uppercase tracking-widest">
                    Gastos por categoría
                  </h2>
                  <button onClick={() => router.push('/categorias')}
                    className="text-xs text-indigo-500 hover:text-indigo-700 transition-colors">
                    Ver categorías →
                  </button>
                </div>

                {topCategorias.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-10 text-zinc-400 gap-2">
                    <span className="text-3xl">📂</span>
                    <p className="text-sm">Sin gastos este mes</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {topCategorias.map(cat => (
                      <div key={cat.nombre}>
                        <div className="flex items-center justify-between mb-1">
                          <div className="flex items-center gap-2">
                            <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: cat.color }} />
                            <span className="text-sm text-zinc-700 dark:text-zinc-300">
                              {cat.icono} {cat.nombre}
                            </span>
                          </div>
                          <span className="text-sm font-semibold text-zinc-800 dark:text-zinc-200">{fmt(cat.total)}</span>
                        </div>
                        <div className="h-1.5 bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                          <div
                            className="h-full rounded-full transition-all duration-700"
                            style={{
                              width: `${(cat.total / maxCategoria) * 100}%`,
                              backgroundColor: cat.color,
                            }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Últimas transacciones */}
              <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-lg p-6">
                <div className="flex items-center justify-between mb-5">
                  <h2 className="text-sm font-semibold text-zinc-700 dark:text-zinc-300 uppercase tracking-widest">
                    Últimas transacciones
                  </h2>
                  <button onClick={() => router.push('/transacciones')}
                    className="text-xs text-indigo-500 hover:text-indigo-700 transition-colors">
                    Ver todas →
                  </button>
                </div>

                {ultimas.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-10 text-zinc-400 gap-2">
                    <span className="text-3xl">💳</span>
                    <p className="text-sm">Sin transacciones este mes</p>
                    <button onClick={() => router.push('/transacciones')}
                      className="text-xs text-indigo-500 hover:underline mt-1">
                      Registrar la primera
                    </button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {ultimas.map(t => (
                      <div key={t.id} className="flex items-center justify-between py-2 border-b border-zinc-100 dark:border-zinc-800 last:border-0">
                        <div className="flex items-center gap-3">
                          <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm flex-shrink-0 ${
                            t.estado === 'PENDIENTE'
                              ? 'bg-zinc-100 dark:bg-zinc-800'
                              : t.tipo === 'INGRESO'
                                ? 'bg-green-100 dark:bg-green-900/30'
                                : 'bg-red-100 dark:bg-red-900/30'
                          }`}>
                            {t.categoria_icono || (t.tipo === 'INGRESO' ? '↑' : '↓')}
                          </div>
                          <div>
                            <p className="text-sm font-medium text-zinc-800 dark:text-zinc-200 truncate max-w-[150px]">
                              {t.descripcion || (t.tipo === 'INGRESO' ? 'Ingreso' : 'Gasto')}
                            </p>
                            <p className="text-xs text-zinc-400">
                              {fmtFecha(t.fecha_transaccion)}
                              {t.categoria_nombre && ` · ${t.categoria_nombre}`}
                              {t.estado === 'PENDIENTE' && (
                                <span className="ml-1 text-amber-500">⏳</span>
                              )}
                            </p>
                          </div>
                        </div>
                        <span className={`text-sm font-semibold ${
                          t.estado === 'PENDIENTE'
                            ? 'text-zinc-400'
                            : t.tipo === 'INGRESO'
                              ? 'text-green-600 dark:text-green-400'
                              : 'text-red-500 dark:text-red-400'
                        }`}>
                          {t.tipo === 'INGRESO' ? '+' : '-'}{fmt(t.monto)}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* ── Navegación rápida ─────────────────────────────────────── */}
            <div className="grid grid-cols-2 gap-4">
              <button
                onClick={() => router.push('/transacciones')}
                className="group bg-white dark:bg-zinc-900 rounded-2xl shadow p-5 text-left hover:shadow-md hover:border-indigo-200 dark:hover:border-indigo-800 border border-transparent transition-all"
              >
                <span className="text-2xl">💳</span>
                <p className="text-sm font-semibold text-zinc-800 dark:text-zinc-200 mt-2">Transacciones</p>
                <p className="text-xs text-zinc-400 mt-0.5">Registrar ingresos y gastos</p>
                <p className="text-xs text-indigo-500 mt-3 group-hover:underline">Ir a transacciones →</p>
              </button>
              <button
                onClick={() => router.push('/categorias')}
                className="group bg-white dark:bg-zinc-900 rounded-2xl shadow p-5 text-left hover:shadow-md hover:border-indigo-200 dark:hover:border-indigo-800 border border-transparent transition-all"
              >
                <span className="text-2xl">🗂️</span>
                <p className="text-sm font-semibold text-zinc-800 dark:text-zinc-200 mt-2">Categorías</p>
                <p className="text-xs text-zinc-400 mt-0.5">
                  {categorias.length > 0 ? `${categorias.length} categorías activas` : 'Gestionar categorías'}
                </p>
                <p className="text-xs text-indigo-500 mt-3 group-hover:underline">Ir a categorías →</p>
              </button>
            </div>
          </>
        )}
      </div>
    </main>
  );
}