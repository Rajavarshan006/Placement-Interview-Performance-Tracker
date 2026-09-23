function UploadUserAccessModal({ isOpen, onClose, onAccessGranted }) {
    if (!isOpen) return null;

    const [selectedRole, setSelectedRole] = React.useState('Student');
    const [file, setFile] = React.useState(null);
    const [loading, setLoading] = React.useState(false);
    const [errorMsg, setErrorMsg] = React.useState('');
    const [summaryReport, setSummaryReport] = React.useState(null);

    const handleFileChange = (e) => {
        const selected = e.target.files[0];
        if (selected) {
            setFile(selected);
            setErrorMsg('');
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setErrorMsg('');
        setSummaryReport(null);

        if (!file) {
            setErrorMsg('Please select an Excel (.xlsx) or CSV file to upload.');
            return;
        }

        setLoading(true);

        try {
            const formData = new FormData();
            formData.append('file', file);
            formData.append('default_role', selectedRole);

            const res = await fetch('/api/users/upload-access', {
                method: 'POST',
                body: formData
            });

            const data = await res.json();

            if (res.ok && data.success) {
                setSummaryReport(data);
                if (onAccessGranted) {
                    onAccessGranted(data);
                }
            } else {
                setErrorMsg(data.message || 'Failed to process user access upload.');
            }
        } catch (err) {
            console.error('Error uploading user access:', err);
            setErrorMsg('Network error. Could not connect to API server.');
        } finally {
            setLoading(false);
        }
    };

    const handleReset = () => {
        setFile(null);
        setSummaryReport(null);
        setErrorMsg('');
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-dialog" onClick={(e) => e.stopPropagation()}>
                <div className="modal-head">
                    <div>
                        <h3>Bulk User Access Grant (Excel Upload)</h3>
                        <p className="modal-sub">Upload an Excel/CSV file containing user Gmail addresses to grant platform access</p>
                    </div>
                    <button type="button" className="modal-close" onClick={onClose}>&times;</button>
                </div>

                {errorMsg && (
                    <div className="form-alert-error">
                        {errorMsg}
                    </div>
                )}

                {summaryReport ? (
                    <div className="upload-summary-box">
                        <div className="summary-badge-icon">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                <polyline points="20 6 9 17 4 12"></polyline>
                            </svg>
                        </div>
                        <h4>User Access Granted Successfully!</h4>
                        <p className="summary-desc">{summaryReport.message}</p>

                        <div className="summary-metrics">
                            <div className="sum-stat">
                                <span className="val">{summaryReport.created_count}</span>
                                <span className="lbl">New Accounts Created</span>
                            </div>
                            <div className="sum-stat">
                                <span className="val">{summaryReport.updated_count}</span>
                                <span className="lbl">Roles Updated</span>
                            </div>
                            <div className="sum-stat">
                                <span className="val">{summaryReport.skipped_count}</span>
                                <span className="lbl">Skipped Rows</span>
                            </div>
                        </div>

                        {summaryReport.processed_users && summaryReport.processed_users.length > 0 && (
                            <div className="preview-list-container">
                                <span className="preview-title">Granted Access Accounts Summary:</span>
                                <div className="preview-list">
                                    {summaryReport.processed_users.slice(0, 6).map((usr, i) => (
                                        <div key={i} className="preview-item">
                                            <span className="p-gmail">{usr.gmail}</span>
                                            <span className="p-res">{usr.role} ({usr.action})</span>
                                        </div>
                                    ))}
                                    {summaryReport.processed_users.length > 6 && (
                                        <span className="more-count">+ {summaryReport.processed_users.length - 6} more user accounts processed</span>
                                    )}
                                </div>
                            </div>
                        )}

                        <div className="modal-foot">
                            <button type="button" className="btn-cancel" onClick={handleReset}>
                                Upload Another File
                            </button>
                            <button type="button" className="btn-submit" onClick={onClose}>
                                Done
                            </button>
                        </div>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className="modal-form">
                        <div className="input-field">
                            <label>Default Assignee Role *</label>
                            <select
                                className="form-select"
                                value={selectedRole}
                                onChange={(e) => setSelectedRole(e.target.value)}
                                required
                            >
                                <option value="Student">Student</option>
                                <option value="Recruiter">Recruiter</option>
                                <option value="Coordinator">Coordinator</option>
                            </select>
                            <span className="field-hint" style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '4px', display: 'block' }}>
                                Role to assign if no specific 'role' column is defined in the spreadsheet.
                            </span>
                        </div>

                        <div className="file-dropzone">
                            <input
                                type="file"
                                id="userAccessFileInput"
                                accept=".xlsx, .xls, .csv"
                                onChange={handleFileChange}
                                style={{ display: 'none' }}
                            />
                            <label htmlFor="userAccessFileInput" className="dropzone-label">
                                <div className="dropzone-icon">
                                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                                        <circle cx="9" cy="7" r="4"></circle>
                                        <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                                        <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                                    </svg>
                                </div>
                                {file ? (
                                    <div className="file-selected-info">
                                        <span className="fname">{file.name}</span>
                                        <span className="fsize">({(file.size / 1024).toFixed(1)} KB)</span>
                                    </div>
                                ) : (
                                    <div>
                                        <span className="drop-title">Click to upload user spreadsheet</span>
                                        <span className="drop-sub">Supports .xlsx and .csv files</span>
                                    </div>
                                )}
                            </label>
                        </div>

                        <div className="info-box-tip">
                            <strong>File Format Requirements:</strong> Spreadsheet must contain a column header named <code>gmail</code> (or <code>email</code>). Optional column header: <code>role</code> (values: Student, Recruiter, Coordinator).
                        </div>

                        <div className="modal-foot">
                            <button type="button" className="btn-cancel" onClick={onClose} disabled={loading}>
                                Cancel
                            </button>
                            <button type="submit" className="btn-submit" disabled={loading || !file}>
                                {loading ? 'Granting Access...' : 'Upload & Grant User Access'}
                            </button>
                        </div>
                    </form>
                )}
            </div>
        </div>
    );
}
