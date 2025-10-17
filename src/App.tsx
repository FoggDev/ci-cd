import { useFeatureFlags } from '@/hooks/useFeatureFlags';

export function App() {
  const { flags, hasError } = useFeatureFlags();

  return (
    <div>
      <header>
        <h1 data-testid="dashboard-title">Dashboard</h1>
        <nav>
          <button data-testid="nav-settings">Settings</button>
        </nav>
      </header>
      <section>
        {[1, 2, 3, 4].map((metric) => (
          <article key={metric} data-testid="metric-card">
            <h2>Metric {metric}</h2>
            <p>{metric * 42}</p>
          </article>
        ))}
      </section>
      {flags.advancedAnalytics ? (
        <div>Analytics enabled</div>
      ) : hasError ? (
        <div data-testid="error-message">Error loading metrics</div>
      ) : (
        <div data-testid="beta-message">Analytics disabled for this environment</div>
      )}
    </div>
  );
}
