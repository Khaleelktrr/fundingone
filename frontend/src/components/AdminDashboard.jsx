import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import { format } from 'date-fns';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import API_URL from '../config';

const AdminDashboard = () => {
    const { logout, admin } = useAuth();
    const navigate = useNavigate();
    const [registrations, setRegistrations] = useState([]);
    const [filteredData, setFilteredData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({ total: 0, today: 0, byCircle: [] });
    const [selectedImage, setSelectedImage] = useState(null);

    // Filter states
    const [searchTerm, setSearchTerm] = useState('');
    const [searchBy, setSearchBy] = useState('name');
    const [circleFilter, setCircleFilter] = useState('');
    const [dateFrom, setDateFrom] = useState('');
    const [dateTo, setDateTo] = useState('');

    useEffect(() => {
        fetchData();
        fetchStats();
    }, []);

    useEffect(() => {
        applyFilters();
    }, [registrations, searchTerm, searchBy, circleFilter, dateFrom, dateTo]);

    const fetchData = async () => {
        try {
            setLoading(true);
            const response = await axios.get(`${API_URL}/api/admin/forms`);
            if (response.data.success) {
                setRegistrations(response.data.data);
            }
        } catch (error) {
            console.error('Error fetching data:', error);
            if (error.response?.status === 401) {
                logout();
                navigate('/admin/login');
            }
        } finally {
            setLoading(false);
        }
    };

    const fetchStats = async () => {
        try {
            const response = await axios.get(`${API_URL}/api/admin/stats`);
            if (response.data.success) {
                setStats(response.data.data);
            }
        } catch (error) {
            console.error('Error fetching stats:', error);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this registration?')) {
            return;
        }

        try {
            const response = await axios.delete(`${API_URL}/api/admin/forms/${id}`);
            if (response.data.success) {
                // Refresh data after deletion
                fetchData();
                fetchStats();
                alert('Registration deleted successfully');
            }
        } catch (error) {
            console.error('Error deleting registration:', error);
            alert('Failed to delete registration');
        }
    };

    const applyFilters = () => {
        let filtered = [...registrations];

        if (searchTerm) {
            filtered = filtered.filter(item => {
                if (searchBy === 'name') {
                    return item.name.toLowerCase().includes(searchTerm.toLowerCase());
                } else if (searchBy === 'phone') {
                    return item.phone.includes(searchTerm);
                }
                return true;
            });
        }

        if (circleFilter) {
            filtered = filtered.filter(item =>
                item.circle.toLowerCase().includes(circleFilter.toLowerCase())
            );
        }

        if (dateFrom) {
            filtered = filtered.filter(item =>
                new Date(item.submittedAt) >= new Date(dateFrom)
            );
        }

        if (dateTo) {
            const endDate = new Date(dateTo);
            endDate.setHours(23, 59, 59, 999);
            filtered = filtered.filter(item =>
                new Date(item.submittedAt) <= endDate
            );
        }

        setFilteredData(filtered);
    };

    const handlePrint = (registration) => {
        const printWindow = window.open('', '_blank');
        printWindow.document.write(generateSinglePrintHTML(registration));
        printWindow.document.close();
        printWindow.focus();
        setTimeout(() => {
            printWindow.print();
        }, 250);
    };

    const handlePrintAll = () => {
        const printWindow = window.open('', '_blank');
        printWindow.document.write(generateTablePrintHTML(filteredData));
        printWindow.document.close();
        printWindow.focus();
        setTimeout(() => {
            printWindow.print();
        }, 250);
    };

    const generateSinglePrintHTML = (item) => {
        return `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Registration Details - ${item.name}</title>
        <style>
          body { font-family: Arial, sans-serif; padding: 40px; max-width: 800px; margin: 0 auto; }
          .header { text-align: center; margin-bottom: 40px; border-bottom: 2px solid #2563eb; padding-bottom: 20px; }
          h1 { color: #1e293b; margin: 0; }
          .details-table { width: 100%; border-collapse: collapse; margin-bottom: 30px; }
          .details-table td { padding: 12px; border-bottom: 1px solid #e2e8f0; }
          .label { font-weight: bold; color: #64748b; width: 200px; }
          .value { color: #1e293b; font-size: 16px; }
          .payment-section { margin-top: 30px; page-break-inside: avoid; }
          .payment-img { max-width: 100%; max-height: 400px; border: 1px solid #ddd; border-radius: 8px; margin-top: 10px; }
          @media print {
            body { padding: 0; }
            .no-print { display: none; }
          }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>Registration Details</h1>
          <p>Generated on ${format(new Date(), 'PPpp')}</p>
        </div>
        
        <table class="details-table">
          <tr><td class="label">പേര് (Name)</td><td class="value">${item.name}</td></tr>
          <tr><td class="label">ഫോൺ നമ്പർ (Phone)</td><td class="value">${item.phone}</td></tr>
          <tr><td class="label">ജോലി (Job)</td><td class="value">${item.job}</td></tr>
          <tr><td class="label">ജോലി സ്ഥലം (Location)</td><td class="value">${item.jobLocation}</td></tr>
          <tr><td class="label">വാസ സ്ഥലം (Address)</td><td class="value">${item.address}</td></tr>
          <tr><td class="label">സർക്കിൾ (Circle)</td><td class="value">${item.circle}</td></tr>
          <tr><td class="label">Payment ID</td><td class="value">${item.paymentId}</td></tr>
          <tr><td class="label">Submitted At</td><td class="value">${format(new Date(item.submittedAt), 'PPpp')}</td></tr>
        </table>

        ${item.paymentScreenshot ? `
          <div class="payment-section">
            <h3>Payment Screenshot</h3>
            <img src="${item.paymentScreenshot}" class="payment-img" alt="Payment Proof" />
          </div>
        ` : ''}
      </body>
      </html>
    `;
    };

    const generateTablePrintHTML = (data) => {
        const rows = data.map((item, index) => `
            <tr>
                <td>${index + 1}</td>
                <td>${item.name}</td>
                <td>${item.phone}</td>
                <td>${item.job}</td>
                <td>${item.jobLocation}</td>
                <td>${item.address}</td>
                <td>${item.circle}</td>
                <td>${item.paymentId}</td>
                <td>${format(new Date(item.submittedAt), 'dd/MM/yyyy h:mm a')}</td>
            </tr>
        `).join('');

        return `
            <!DOCTYPE html>
            <html>
            <head>
                <title>Registration List</title>
                <style>
                    body { font-family: Arial, sans-serif; padding: 20px; }
                    h1 { text-align: center; color: #1e293b; margin-bottom: 10px; }
                    .meta { text-align: center; color: #64748b; margin-bottom: 30px; font-size: 14px; }
                    table { width: 100%; border-collapse: collapse; font-size: 12px; }
                    th, td { border: 1px solid #cbd5e1; padding: 8px; text-align: left; }
                    th { background-color: #f1f5f9; color: #1e293b; font-weight: bold; }
                    tr:nth-child(even) { background-color: #f8fafc; }
                    @media print {
                        @page { size: landscape; margin: 1cm; }
                        body { padding: 0; }
                        th { background-color: #eee !important; -webkit-print-color-adjust: exact; }
                    }
                </style>
            </head>
            <body>
                <h1>Registration List</h1>
                <div class="meta">
                    Total Records: ${data.length} | Generated on: ${format(new Date(), 'PPpp')}
                </div>
                <table>
                    <thead>
                        <tr>
                            <th width="5%">#</th>
                            <th width="15%">Name</th>
                            <th width="12%">Phone</th>
                            <th width="12%">Job</th>
                            <th width="12%">Location</th>
                            <th width="15%">Address</th>
                            <th width="10%">Circle</th>
                            <th width="10%">Payment ID</th>
                            <th width="10%">Time</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${rows}
                    </tbody>
                </table>
            </body>
            </html>
        `;
    };

    const handleExportExcel = () => {
        const exportData = filteredData.map(item => ({
            'പേര് (Name)': item.name,
            'ഫോൺ നമ്പർ (Phone)': item.phone,
            'ജോലി (Job)': item.job,
            'ജോലി സ്ഥലം (Job Location)': item.jobLocation,
            'വാസ സ്ഥലം (Address)': item.address,
            'സർക്കിൾ (Circle)': item.circle,
            'Payment ID': item.paymentId,
            'Submission Time': format(new Date(item.submittedAt), 'PPpp')
        }));

        const worksheet = XLSX.utils.json_to_sheet(exportData);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Registrations');

        const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
        const data = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
        saveAs(data, `registrations_${format(new Date(), 'yyyy-MM-dd')}.xlsx`);
    };

    const handleExportCSV = () => {
        const exportData = filteredData.map(item => ({
            'Name': item.name,
            'Phone': item.phone,
            'Job': item.job,
            'Job Location': item.jobLocation,
            'Address': item.address,
            'Circle': item.circle,
            'Payment ID': item.paymentId,
            'Submission Time': format(new Date(item.submittedAt), 'PPpp')
        }));

        const worksheet = XLSX.utils.json_to_sheet(exportData);
        const csv = XLSX.utils.sheet_to_csv(worksheet);
        const data = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        saveAs(data, `registrations_${format(new Date(), 'yyyy-MM-dd')}.csv`);
    };

    const clearFilters = () => {
        setSearchTerm('');
        setCircleFilter('');
        setDateFrom('');
        setDateTo('');
    };

    if (loading) {
        return (
            <div className="loading-container">
                <div className="spinner"></div>
                <p>Loading dashboard...</p>
            </div>
        );
    }

    return (
        <div className="dashboard-container">
            <header className="dashboard-header">
                <div className="header-content">
                    <h1>Admin Dashboard</h1>
                    <p>Welcome, {admin?.username}</p>
                </div>
                <button onClick={logout} className="logout-button">
                    Logout
                </button>
            </header>

            <div className="stats-container">
                <div className="stat-card">
                    <h3>Total Registrations</h3>
                    <p className="stat-number">{stats.total}</p>
                </div>
                <div className="stat-card">
                    <h3>Today's Registrations</h3>
                    <p className="stat-number">{stats.today}</p>
                </div>
                <div className="stat-card">
                    <h3>Filtered Results</h3>
                    <p className="stat-number">{filteredData.length}</p>
                </div>
            </div>

            <div className="filters-container">
                <h2>Search & Filter</h2>

                <div className="filters-grid">
                    <div className="filter-group">
                        <label>Search By</label>
                        <select value={searchBy} onChange={(e) => setSearchBy(e.target.value)}>
                            <option value="name">Name</option>
                            <option value="phone">Phone Number</option>
                        </select>
                    </div>

                    <div className="filter-group">
                        <label>Search Term</label>
                        <input
                            type="text"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            placeholder={`Search by ${searchBy}...`}
                        />
                    </div>

                    <div className="filter-group">
                        <label>Circle</label>
                        <input
                            type="text"
                            value={circleFilter}
                            onChange={(e) => setCircleFilter(e.target.value)}
                            placeholder="Filter by circle..."
                        />
                    </div>

                    <div className="filter-group">
                        <label>Date From</label>
                        <input
                            type="date"
                            value={dateFrom}
                            onChange={(e) => setDateFrom(e.target.value)}
                        />
                    </div>

                    <div className="filter-group">
                        <label>Date To</label>
                        <input
                            type="date"
                            value={dateTo}
                            onChange={(e) => setDateTo(e.target.value)}
                        />
                    </div>

                    <div className="filter-group">
                        <button onClick={clearFilters} className="clear-button">
                            Clear Filters
                        </button>
                    </div>
                </div>
            </div>

            <div className="actions-container">
                <button onClick={handlePrintAll} className="action-button print-all">
                    🖨️ Print All ({filteredData.length})
                </button>
                <button onClick={handleExportExcel} className="action-button export">
                    📊 Export to Excel
                </button>
                <button onClick={handleExportCSV} className="action-button export">
                    📄 Export to CSV
                </button>
                <button onClick={fetchData} className="action-button refresh">
                    🔄 Refresh
                </button>
            </div>

            <div className="table-container">
                <table className="data-table">
                    <thead>
                        <tr>
                            <th>#</th>
                            <th>പേര് (Name)</th>
                            <th>ഫോൺ നമ്പർ (Phone)</th>
                            <th>ജോലി (Job)</th>
                            <th>ജോലി സ്ഥലം (Location)</th>
                            <th>വാസ സ്ഥലം (Address)</th>
                            <th>സർക്കിൾ (Circle)</th>
                            <th>Payment ID</th>
                            <th>Payment Screenshot</th>
                            <th>Submitted At</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredData.length === 0 ? (
                            <tr>
                                <td colSpan="11" className="no-data">
                                    No registrations found
                                </td>
                            </tr>
                        ) : (
                            filteredData.map((item, index) => (
                                <tr key={item._id}>
                                    <td>{index + 1}</td>
                                    <td>{item.name}</td>
                                    <td>{item.phone}</td>
                                    <td>{item.job}</td>
                                    <td>{item.jobLocation}</td>
                                    <td>{item.address}</td>
                                    <td><span className="circle-badge">{item.circle}</span></td>
                                    <td className="payment-id">{item.paymentId}</td>
                                    <td>
                                        {item.paymentScreenshot ? (
                                            <button
                                                onClick={() => setSelectedImage(item.paymentScreenshot)}
                                                className="view-image-button"
                                                title="View payment screenshot"
                                            >
                                                🖼️ View
                                            </button>
                                        ) : (
                                            <span style={{ color: '#999' }}>No image</span>
                                        )}
                                    </td>
                                    <td>{format(new Date(item.submittedAt), 'PPp')}</td>
                                    <td>
                                        <button
                                            onClick={() => handlePrint(item)}
                                            className="print-button"
                                            title="Print this entry"
                                        >
                                            🖨️
                                        </button>
                                        <button
                                            onClick={() => handleDelete(item._id)}
                                            className="delete-button"
                                            title="Delete this entry"
                                        >
                                            🗑️
                                        </button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* Image Modal */}
            {selectedImage && (
                <div className="image-modal" onClick={() => setSelectedImage(null)}>
                    <div className="image-modal-content" onClick={(e) => e.stopPropagation()}>
                        <button className="close-modal" onClick={() => setSelectedImage(null)}>
                            ✕
                        </button>
                        <img src={selectedImage} alt="Payment Screenshot" />
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminDashboard;
