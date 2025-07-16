export default function Home() {
  return (
    <main className="flex flex-col items-center justify-center min-h-screen">
      <h1 className="text-4xl font-bold">Crypto Alerts Dashboard</h1>
      <a href="/dashboard" className="text-blue-500 underline mt-4">
        Go to Dashboard
      </a>
      <p className="mt-2 text-gray-600">Monitor your crypto alerts and manage your trades.</p>
      <p className="mt-2 text-gray-600">
        <a href="/auth" className="text-blue-500 underline">Login</a> to get started.
      </p>
      <p className="mt-2 text-gray-600">
        <a href="/api/fetch-alerts" className="text-blue-500 underline">Fetch Alerts</a> to see the latest recommendations.
      </p>
    </main>
  );
}
