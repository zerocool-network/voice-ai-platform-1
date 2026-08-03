import { Head, Link } from '@inertiajs/react';
import { AlertTriangle, ChevronLeft } from 'lucide-react';

export default function Error({ status = 500, message }) {
  const defaultMessage = {
    403: 'You do not have permission to access this resource.',
    404: "The page you're looking for doesn't exist or has been moved.",
    419: 'Your session has expired due to inactivity. Please reload and try again.',
    500: 'Something went wrong on our end. Our team has been notified.',
    503: 'The service is temporarily unavailable. Please try again later.',
  };

  const titles = {
    403: 'Access denied',
    404: 'Page not found',
    419: 'Session expired',
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-white dark:bg-zinc-950">
      <Head title={`${status} — ${message || defaultMessage[status]?.split('.')[0] || 'Error'}`} />

      <div className="mx-auto flex max-w-md flex-col items-center px-6 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-red-50 dark:bg-red-950">
          <AlertTriangle className="h-8 w-8 text-red-500 dark:text-red-400" />
        </div>

        <p className="mt-6 text-6xl font-extrabold tracking-tight text-zinc-200 dark:text-zinc-800">
          {status}
        </p>

        <h1 className="mt-2 text-xl font-semibold text-zinc-950 dark:text-white">
          {titles[status] || 'Unexpected error'}
        </h1>

        <p className="mt-3 text-sm leading-relaxed text-zinc-500 dark:text-zinc-400">
          {message || defaultMessage[status] || defaultMessage[500]}
        </p>

        {status === 419 ? (
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="mt-8 inline-flex items-center gap-2 rounded-lg bg-zinc-950 px-4 py-2.5 text-sm font-medium text-white hover:bg-zinc-800 dark:bg-white dark:text-zinc-950 dark:hover:bg-zinc-100 transition-colors"
          >
            Reload page
          </button>
        ) : (
          <Link
            href="/dashboard"
            className="mt-8 inline-flex items-center gap-2 rounded-lg bg-zinc-950 px-4 py-2.5 text-sm font-medium text-white hover:bg-zinc-800 dark:bg-white dark:text-zinc-950 dark:hover:bg-zinc-100 transition-colors"
          >
            <ChevronLeft className="h-4 w-4" />
            Back to Dashboard
          </Link>
        )}
      </div>
    </div>
  );
}
