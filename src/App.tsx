import { useFeatureFlags } from '@/hooks/useFeatureFlags';

export function App() {
  const flags = useFeatureFlags();

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
      ) : (
        <div data-testid="error-message" hidden>
          Error loading metrics
        </div>
      )}
    </div>
  );
}
