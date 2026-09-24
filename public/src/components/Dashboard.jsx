function Dashboard({ user, onLogout }) {
    if (!user) return null;

    const role = (user.role || '').toLowerCase();

    // Render Student portal for Student role
    if (role === 'student') {
        return <StudentDashboard user={user} onLogout={onLogout} />;
    }

    // Render Mentor portal for Mentor role
    if (role === 'mentor') {
        return <MentorDashboard user={user} onLogout={onLogout} />;
    }

    // Render Department portal for Department role
    if (role === 'department' || role === 'dept') {
        return <DepartmentDashboard user={user} onLogout={onLogout} />;
    }

    // Default to Coordinator workspace for Coordinator and all management roles
    return <CoordinatorDashboard user={user} onLogout={onLogout} />;
}

