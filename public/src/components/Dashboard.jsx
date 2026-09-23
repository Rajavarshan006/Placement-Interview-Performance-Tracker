function Dashboard({ user, onLogout }) {
    if (!user) return null;

    const role = (user.role || '').toLowerCase();

    // Render Student portal for Student role
    if (role === 'student') {
        return <StudentDashboard user={user} onLogout={onLogout} />;
    }

    // Default to Coordinator workspace for Coordinator and all management roles
    return <CoordinatorDashboard user={user} onLogout={onLogout} />;
}
