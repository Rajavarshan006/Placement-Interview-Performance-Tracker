function StudentDashboard({ user, onLogout }) {
    const [myResults, setMyResults] = React.useState([]);
    const [allDrives, setAllDrives] = React.useState([]);
    const [loading, setLoading] = React.useState(true);

    const fetchData = React.useCallback(async () => {
        setLoading(true);
        try {
            const [resResults, resDrives] = await Promise.all([
                fetch(`/api/student/results?gmail=${encodeURIComponent(user.gmail)}`),
                fetch('/api/drives')
            ]);
            
            const dataResults = await resResults.json();
            const dataDrives = await resDrives.json();

            if (resResults.ok && dataResults.success) {
                setMyResults(dataResults.results || []);
            }
            if (resDrives.ok && dataDrives.success) {
                setAllDrives(dataDrives.drives || []);
            }
        } catch (err) {
            console.error('Error fetching student dashboard data:', err);
        } finally {
            setLoading(false);
        }
    }, [user.gmail]);

    React.useEffect(() => {
        fetchData();
    }, [fetchData]);

    return (
        <div className="laptop-dashboard">
            {/* Top Navigation Bar */}
            <header className="desktop-navbar">
                <div className="nav-left">
                    <div className="brand-icon student-brand">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M22 10v6M2 10l10-5 10 5-10 5z"></path>
                            <path d="M6 12v5c3 3 9 3 12 0v-5"></path>
                        </svg>
                    </div>
                    <div className="brand-text">
                        <span className="portal-name">Placement Portal</span>
                        <span className="portal-sub">Student Workspace</span>
                    </div>
                </div>

                <div className="nav-right">
                    <div className="user-badge">
                        <span className="user-email">{user.gmail}</span>
                        <span className="badge-pill student-pill">Student</span>
                    </div>

                    <button type="button" className="btn-nav-signout" onClick={onLogout} title="Sign Out">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                            <polyline points="16 17 21 12 16 7"></polyline>
                            <line x1="21" y1="12" x2="9" y2="12"></line>
                        </svg>
                        Sign Out
                    </button>
                </div>
            </header>

            {/* Main Content Area */}
            <div className="dashboard-content">
                <div className="student-banner">
                    <div>
                        <h2>Welcome back, {user.gmail.split('@')[0]}</h2>
                        <p>Track active recruitment drive notifications, eligibility status, and round results.</p>
                    </div>
                </div>

                <div style={{ marginTop: '20px' }}>
                    <h3 style={{ fontSize: '1.1rem', color: 'var(--text-primary)', marginBottom: '12px' }}>
                        My Drive Results & Shortlists ({myResults.length})
                    </h3>

                    <div className="data-panel">
                        {loading ? (
                            <div className="panel-loading">
                                <div className="spinner-sm"></div>
                                <span>Loading your drive round status...</span>
                            </div>
                        ) : myResults.length === 0 ? (
                            <div className="panel-empty">
                                <div className="empty-icon-clean">
                                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                                        <circle cx="12" cy="12" r="10"></circle>
                                        <polyline points="12 6 12 12 16 14"></polyline>
                                    </svg>
                                </div>
                                <h3>No Drive Results Posted Yet</h3>
                                <p>Shortlist updates and round progression will appear here once uploaded by placement coordinators.</p>
                            </div>
                        ) : (
                            <table className="enterprise-table">
                                <thead>
                                    <tr>
                                        <th>Company Name</th>
                                        <th>Job Role</th>
                                        <th>Current Round</th>
                                        <th>Status / Result</th>
                                        <th style={{ textAlign: 'right' }}>Last Updated</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {myResults.map(r => (
                                        <tr key={r.id}>
                                            <td className="font-semibold">{r.company_name}</td>
                                            <td>{r.job_role} ({r.ctc_lpa} LPA)</td>
                                            <td>
                                                <span className="round-badge" style={{
                                                    padding: '3px 8px',
                                                    borderRadius: '6px',
                                                    fontSize: '0.78rem',
                                                    fontWeight: '600',
                                                    background: 'rgba(99, 102, 241, 0.15)',
                                                    color: '#818cf8',
                                                    border: '1px solid rgba(99, 102, 241, 0.3)'
                                                }}>
                                                    Round {r.round || 1}
                                                </span>
                                            </td>
                                            <td>
                                                <span className="res-badge-pill">
                                                    {r.result}
                                                </span>
                                            </td>
                                            <td style={{ textAlign: 'right', fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                                                {r.updated_at}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                    </div>
                </div>

                <div style={{ marginTop: '32px' }}>
                    <h3 style={{ fontSize: '1.1rem', color: 'var(--text-primary)', marginBottom: '12px' }}>
                        Active Recruitment Drives ({allDrives.length})
                    </h3>

                    <div className="data-panel">
                        {allDrives.length === 0 ? (
                            <div className="panel-empty">
                                <p>No active placement drives currently scheduled.</p>
                            </div>
                        ) : (
                            <table className="enterprise-table">
                                <thead>
                                    <tr>
                                        <th>Company</th>
                                        <th>Job Role</th>
                                        <th>CTC</th>
                                        <th>Drive Round</th>
                                        <th>Location</th>
                                        <th style={{ textAlign: 'right' }}>Status</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {allDrives.map(d => (
                                        <tr key={d.id}>
                                            <td className="font-semibold">{d.company_name}</td>
                                            <td>{d.job_role}</td>
                                            <td>{d.ctc_lpa} LPA</td>
                                            <td>
                                                <span className="round-badge" style={{
                                                    padding: '2px 6px',
                                                    borderRadius: '4px',
                                                    fontSize: '0.75rem',
                                                    background: 'rgba(59, 130, 246, 0.15)',
                                                    color: '#60a5fa'
                                                }}>
                                                    Round {d.current_round || 1}
                                                </span>
                                            </td>
                                            <td>{d.location}</td>
                                            <td style={{ textAlign: 'right' }}>
                                                <span className="badge-pill active-pill">{d.status}</span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
