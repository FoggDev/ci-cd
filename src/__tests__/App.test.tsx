import { render, screen, waitFor } from '@testing-library/react';
import { App } from '@/App';

type FetchResponse = {
  json: () => Promise<unknown>;
};

type FetchMock = jest.Mock<Promise<FetchResponse>, [RequestInfo | URL, RequestInit?]>;

function mockGlobalFetch(response: Partial<FetchResponse> | Error) {
  if (response instanceof Error) {
    const failingFetch: FetchMock = jest.fn().mockRejectedValue(response);
    Object.defineProperty(globalThis, 'fetch', {
      configurable: true,
      value: failingFetch,
    });
    return failingFetch;
  }

  const fetchMock: FetchMock = jest.fn().mockResolvedValue({
    json: async () => ({}),
    ...response,
  });

  Object.defineProperty(globalThis, 'fetch', {
    configurable: true,
    value: fetchMock,
  });

  return fetchMock;
}

describe('App', () => {
  afterEach(() => {
    jest.restoreAllMocks();
    delete (globalThis as { fetch?: typeof fetch }).fetch;
  });

  it('renders dashboard metrics once feature flags load', async () => {
    const fetchMock = mockGlobalFetch({
      json: async () => ({
        newDashboard: true,
        experimentalEditor: false,
        advancedAnalytics: true,
      }),
    });

    render(<App />);

    expect(screen.getByTestId('dashboard-title')).toHaveTextContent('Dashboard');
    expect(screen.getAllByTestId('metric-card')).toHaveLength(4);
    expect(fetchMock).toHaveBeenCalledWith('/api/feature-flags');

    expect(await screen.findByText('Analytics enabled')).toBeInTheDocument();
    expect(screen.queryByTestId('error-message')).not.toBeInTheDocument();
  });

  it('falls back to default flags when the API request fails', async () => {
    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    const fetchMock = mockGlobalFetch(new Error('network down'));

    render(<App />);

    await waitFor(() => expect(fetchMock).toHaveBeenCalled());

    const errorMessage = await screen.findByTestId('error-message');
    expect(errorMessage).toBeVisible();
    expect(consoleErrorSpy).toHaveBeenCalled();

    consoleErrorSpy.mockRestore();
  });

  it('renders an environment notice when analytics are intentionally disabled', async () => {
    const fetchMock = mockGlobalFetch({
      ok: true,
      json: async () => ({
        newDashboard: true,
        experimentalEditor: true,
        advancedAnalytics: false,
      }),
    });

    render(<App />);

    await waitFor(() => expect(fetchMock).toHaveBeenCalledWith('/api/feature-flags'));

    const notice = await screen.findByTestId('beta-message');
    expect(notice).toHaveTextContent('Analytics disabled for this environment');
    expect(screen.queryByTestId('error-message')).not.toBeInTheDocument();
  });

  it('navigates between dashboard and settings views via the navigation buttons', async () => {
    mockGlobalFetch({
      ok: true,
      json: async () => ({
        newDashboard: true,
        experimentalEditor: true,
        advancedAnalytics: true,
      }),
    });

    render(<App />);

    expect(await screen.findByTestId('dashboard-title')).toHaveTextContent('Dashboard');

    screen.getByTestId('nav-settings').click();

    expect(screen.getByTestId('dashboard-title')).toHaveTextContent('Settings');
    expect(screen.getByText('Application settings')).toBeInTheDocument();

    screen.getByTestId('nav-dashboard').click();

    await waitFor(() =>
      expect(screen.getByTestId('dashboard-title')).toHaveTextContent('Dashboard'),
    );
    expect(screen.getAllByTestId('metric-card')).toHaveLength(4);
  });
});
