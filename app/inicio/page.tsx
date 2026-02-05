export default function InicioSeguroPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-zinc-50 dark:bg-black py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-2xl space-y-6 bg-white dark:bg-zinc-900 p-8 rounded-lg shadow-lg">
        <header className="text-center space-y-2">
          <h1 className="text-3xl font-bold text-black dark:text-white">
            Bienvenido a Casitapp
          </h1>
          <p className="text-sm text-zinc-600 dark:text-zinc-400">
            Has iniciado sesión correctamente. Esta es tu pantalla de inicio segura.
          </p>
        </header>

        <section className="space-y-4">
          <p className="text-zinc-700 dark:text-zinc-300">
            Desde aquí podrás gestionar tus finanzas personales, revisar tus movimientos
            y controlar tus gastos e ingresos.
          </p>
          <div className="rounded-md border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/40 p-4">
            <p className="text-sm text-zinc-700 dark:text-zinc-300">
              Próximos pasos:
            </p>
            <ul className="mt-2 list-disc list-inside text-sm text-zinc-700 dark:text-zinc-300 space-y-1">
              <li>Diseñar el dashboard con tus métricas principales.</li>
              <li>Agregar navegación a otras secciones de la app.</li>
              <li>Proteger esta ruta con autenticación real (middleware / JWT) más adelante.</li>
            </ul>
          </div>
        </section>
      </div>
    </main>
  );
}

