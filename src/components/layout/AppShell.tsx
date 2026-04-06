import { PropsWithChildren, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import { navItems } from '../../config/navigation';
import { fetchAuthConfig, fetchAuthSession } from '../../services/authApi';
import { fetchAdminConfig } from '../../services/configApi';
import { useAppStore } from '../../store/appStore';

export function AppShell({ children }: PropsWithChildren) {
  const configLoaded = useAppStore((state) => state.configLoaded);
  const authLoaded = useAppStore((state) => state.authLoaded);
  const authConfig = useAppStore((state) => state.authConfig);
  const authSession = useAppStore((state) => state.authSession);
  const setAdminConfig = useAppStore((state) => state.setAdminConfig);
  const setConfigLoaded = useAppStore((state) => state.setConfigLoaded);
  const setAuthConfig = useAppStore((state) => state.setAuthConfig);
  const setAuthSession = useAppStore((state) => state.setAuthSession);
  const setAuthLoaded = useAppStore((state) => state.setAuthLoaded);

  useEffect(() => {
    if (configLoaded) {
      return;
    }

    void fetchAdminConfig()
      .then((config) => {
        setAdminConfig(config);
        setConfigLoaded(true);
      })
      .catch(() => {
        setConfigLoaded(true);
      });
  }, [configLoaded, setAdminConfig, setConfigLoaded]);

  useEffect(() => {
    if (authLoaded) {
      return;
    }

    void Promise.all([fetchAuthConfig(), fetchAuthSession()])
      .then(([configResponse, sessionResponse]) => {
        setAuthConfig(configResponse.config);
        setAuthSession(sessionResponse.session);
        setAuthLoaded(true);
      })
      .catch(() => {
        setAuthLoaded(true);
      });
  }, [authLoaded, setAuthConfig, setAuthLoaded, setAuthSession]);

  return (
    <div className="app-shell">
      <header className="topbar">
        <div className="brand-block">
          <div className="brand-mark">KH</div>
          <div>
            <p className="eyebrow">AI-basert HR-assistent</p>
            <h1>KommuneHR</h1>
          </div>
        </div>
        <nav className="topnav" aria-label="Hovednavigasjon">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}
            >
              {item.label}
            </NavLink>
          ))}
        </nav>
      </header>
      {authSession ? (
        <section className="session-banner">
          <span>
            {authSession.isAuthenticated ? (
              <>
                Innlogget som <strong>{authSession.displayName}</strong>
              </>
            ) : (
              <>
                Ikke logget inn.{' '}
                {authSession.loginUrl ? (
                  <a href={authSession.loginUrl}>Logg inn med Microsoft Entra ID</a>
                ) : null}
              </>
            )}
          </span>
          <span>
            Rolle: <strong>{authSession.role.toUpperCase()}</strong> via {authSession.provider}
          </span>
          {authConfig?.provider === 'entra-id' ? (
            <span>Entra ID-klargjort via sikker header/proxy-flyt</span>
          ) : (
            <span>Mock-innlogging aktiv for lokal utvikling</span>
          )}
        </section>
      ) : null}
      <main className="page-shell">{children}</main>
      <nav className="bottom-nav" aria-label="Mobilnavigasjon">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) => (isActive ? 'bottom-link active' : 'bottom-link')}
          >
            {item.label}
          </NavLink>
        ))}
      </nav>
    </div>
  );
}
