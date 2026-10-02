import { useEffect, useMemo, useState } from 'react';
import { bookingService, roomService } from '../services/bookingService';

const formatDate = (date) => {
    return date.toISOString().split('T')[0];
};

const getToday = () => {
    return formatDate(new Date());
};

const FrontDeskDashboard = () => {
    const [bookings, setBookings] = useState([]);
    const [rooms, setRooms] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const loadDashboard = async () => {
        try {
            setLoading(true);
            setError('');

            const [bookingResponse, roomResponse] = await Promise.all([
                bookingService.getAllBookings(),
                roomService.getAllRooms()
            ]);

            setBookings(bookingResponse?.data || []);
            setRooms(roomResponse?.data || []);
        } catch (err) {
            console.error('Dashboard error:', err);
            setError(err.message || 'Failed to load dashboard data');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadDashboard();
    }, []);

    const today = getToday();

    const statistics = useMemo(() => {
        const totalRooms = rooms.length;

        const availableRooms = rooms.filter(
            (room) => room.status === 'available'
        ).length;

        const occupiedRooms = rooms.filter(
            (room) => room.status === 'occupied'
        ).length;

        const activeBookings = bookings.filter(
            (booking) =>
                !['cancelled', 'checked_out'].includes(booking.booking_status)
        ).length;

        const todayCheckIns = bookings.filter(
            (booking) =>
                booking.check_in_date === today &&
                booking.booking_status !== 'cancelled'
        ).length;

        const todayCheckOuts = bookings.filter(
            (booking) =>
                booking.check_out_date === today &&
                booking.booking_status !== 'cancelled'
        ).length;

        return {
            totalRooms,
            availableRooms,
            occupiedRooms,
            activeBookings,
            todayCheckIns,
            todayCheckOuts
        };
    }, [rooms, bookings, today]);

    const recentBookings = useMemo(() => {
        return [...bookings]
            .filter((booking) => booking.booking_status !== 'cancelled')
            .sort(
                (a, b) =>
                    new Date(b.created_at || b.check_in_date) -
                    new Date(a.created_at || a.check_in_date)
            )
            .slice(0, 6);
    }, [bookings]);

    const getStatusClass = (status) => {
        switch (status) {
            case 'confirmed':
                return 'status-confirmed';

            case 'checked_in':
                return 'status-checked-in';

            case 'checked_out':
                return 'status-checked-out';

            case 'cancelled':
                return 'status-cancelled';

            default:
                return 'status-default';
        }
    };

    const formatStatus = (status) => {
        if (!status) return 'Unknown';

        return status
            .split('_')
            .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ');
    };

    if (loading) {
        return (
            <div style={styles.page}>
                <div style={styles.loadingCard}>
                    <div style={styles.loadingSpinner}>⟳</div>
                    <h2>Loading Front Desk Dashboard...</h2>
                    <p>Fetching rooms and booking information.</p>
                </div>
            </div>
        );
    }

    return (
        <div style={styles.page}>
            <div style={styles.header}>
                <div>
                    <div style={styles.eyebrow}>FRONT DESK</div>

                    <h1 style={styles.title}>Front Desk Dashboard</h1>

                    <p style={styles.subtitle}>
                        Monitor today's hotel operations, rooms, and guest bookings.
                    </p>
                </div>

                <button style={styles.refreshButton} onClick={loadDashboard}>
                    ↻ Refresh
                </button>
            </div>

            {error && (
                <div style={styles.errorBox}>
                    <strong>Unable to load dashboard</strong>
                    <p>{error}</p>

                    <button style={styles.retryButton} onClick={loadDashboard}>
                        Try Again
                    </button>
                </div>
            )}

            {!error && (
                <>
                    <div style={styles.statsGrid}>
                        <div style={styles.statCard}>
                            <div style={styles.statIcon}>🏨</div>
                            <div>
                                <div style={styles.statLabel}>Total Rooms</div>
                                <div style={styles.statValue}>
                                    {statistics.totalRooms}
                                </div>
                            </div>
                        </div>

                        <div style={styles.statCard}>
                            <div style={styles.statIcon}>🟢</div>
                            <div>
                                <div style={styles.statLabel}>Available Rooms</div>
                                <div style={styles.statValue}>
                                    {statistics.availableRooms}
                                </div>
                            </div>
                        </div>

                        <div style={styles.statCard}>
                            <div style={styles.statIcon}>🔴</div>
                            <div>
                                <div style={styles.statLabel}>Occupied Rooms</div>
                                <div style={styles.statValue}>
                                    {statistics.occupiedRooms}
                                </div>
                            </div>
                        </div>

                        <div style={styles.statCard}>
                            <div style={styles.statIcon}>📋</div>
                            <div>
                                <div style={styles.statLabel}>Active Bookings</div>
                                <div style={styles.statValue}>
                                    {statistics.activeBookings}
                                </div>
                            </div>
                        </div>
                    </div>

                    <div style={styles.todayGrid}>
                        <div style={styles.todayCard}>
                            <div style={styles.todayIcon}>↘</div>
                            <div>
                                <div style={styles.todayLabel}>Today's Check-ins</div>
                                <div style={styles.todayValue}>
                                    {statistics.todayCheckIns}
                                </div>
                            </div>
                        </div>

                        <div style={styles.todayCard}>
                            <div style={styles.todayIcon}>↗</div>
                            <div>
                                <div style={styles.todayLabel}>Today's Check-outs</div>
                                <div style={styles.todayValue}>
                                    {statistics.todayCheckOuts}
                                </div>
                            </div>
                        </div>
                    </div>

                    <section style={styles.section}>
                        <div style={styles.sectionHeader}>
                            <div>
                                <h2 style={styles.sectionTitle}>Recent Bookings</h2>
                                <p style={styles.sectionSubtitle}>
                                    Latest active guest reservations
                                </p>
                            </div>
                        </div>

                        {recentBookings.length === 0 ? (
                            <div style={styles.emptyState}>
                                No active bookings found.
                            </div>
                        ) : (
                            <div style={styles.tableWrapper}>
                                <table style={styles.table}>
                                    <thead>
                                        <tr>
                                            <th style={styles.th}>Booking</th>
                                            <th style={styles.th}>Guest</th>
                                            <th style={styles.th}>Room</th>
                                            <th style={styles.th}>Check-in</th>
                                            <th style={styles.th}>Check-out</th>
                                            <th style={styles.th}>Status</th>
                                        </tr>
                                    </thead>

                                    <tbody>
                                        {recentBookings.map((booking) => (
                                            <tr key={booking.id}>
                                                <td style={styles.td}>
                                                    <strong>
                                                        {booking.booking_reference || 'N/A'}
                                                    </strong>
                                                </td>

                                                <td style={styles.td}>
                                                    {booking.guests?.full_name || 'Guest'}
                                                </td>

                                                <td style={styles.td}>
                                                    {booking.rooms?.room_number || 'N/A'}
                                                </td>

                                                <td style={styles.td}>
                                                    {booking.check_in_date || 'N/A'}
                                                </td>

                                                <td style={styles.td}>
                                                    {booking.check_out_date || 'N/A'}
                                                </td>

                                                <td style={styles.td}>
                                                    <span
                                                        className={getStatusClass(
                                                            booking.booking_status
                                                        )}
                                                        style={styles.statusBadge}
                                                    >
                                                        {formatStatus(booking.booking_status)}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </section>
                </>
            )}
        </div>
    );
};

const styles = {
    page: {
        padding: '40px',
        minHeight: '100%',
        color: '#f8fafc'
    },

    header: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        gap: '20px',
        marginBottom: '32px'
    },

    eyebrow: {
        color: '#f59e0b',
        fontSize: '0.8rem',
        fontWeight: '700',
        letterSpacing: '0.12em',
        marginBottom: '8px'
    },

    title: {
        margin: 0,
        fontSize: '2.3rem',
        fontWeight: '800'
    },

    subtitle: {
        marginTop: '10px',
        color: '#94a3b8',
        fontSize: '1rem'
    },

    refreshButton: {
        background: '#172033',
        color: '#ffffff',
        border: '1px solid #334155',
        borderRadius: '10px',
        padding: '12px 20px',
        fontWeight: '700',
        cursor: 'pointer'
    },

    statsGrid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(4, minmax(0, 1fr))',
        gap: '18px',
        marginBottom: '18px'
    },

    statCard: {
        background: '#111827',
        border: '1px solid #263449',
        borderRadius: '16px',
        padding: '24px',
        display: 'flex',
        alignItems: 'center',
        gap: '16px'
    },

    statIcon: {
        width: '48px',
        height: '48px',
        borderRadius: '12px',
        background: 'rgba(245, 158, 11, 0.12)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '1.4rem'
    },

    statLabel: {
        color: '#94a3b8',
        fontSize: '0.9rem',
        marginBottom: '5px'
    },

    statValue: {
        fontSize: '1.9rem',
        fontWeight: '800'
    },

    todayGrid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
        gap: '18px',
        marginBottom: '32px'
    },

    todayCard: {
        background: '#111827',
        border: '1px solid #263449',
        borderRadius: '16px',
        padding: '24px',
        display: 'flex',
        alignItems: 'center',
        gap: '16px'
    },

    todayIcon: {
        width: '48px',
        height: '48px',
        borderRadius: '12px',
        background: 'rgba(34, 197, 94, 0.12)',
        color: '#22c55e',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '1.5rem',
        fontWeight: '800'
    },

    todayLabel: {
        color: '#94a3b8',
        fontSize: '0.9rem',
        marginBottom: '5px'
    },

    todayValue: {
        fontSize: '1.9rem',
        fontWeight: '800'
    },

    section: {
        background: '#111827',
        border: '1px solid #263449',
        borderRadius: '16px',
        overflow: 'hidden'
    },

    sectionHeader: {
        padding: '24px',
        borderBottom: '1px solid #263449'
    },

    sectionTitle: {
        margin: 0,
        fontSize: '1.4rem'
    },

    sectionSubtitle: {
        margin: '7px 0 0',
        color: '#94a3b8'
    },

    tableWrapper: {
        overflowX: 'auto'
    },

    table: {
        width: '100%',
        borderCollapse: 'collapse'
    },

    th: {
        textAlign: 'left',
        padding: '16px 20px',
        color: '#94a3b8',
        fontSize: '0.8rem',
        textTransform: 'uppercase',
        letterSpacing: '0.05em',
        background: '#172033'
    },

    td: {
        padding: '18px 20px',
        borderTop: '1px solid #263449',
        color: '#e2e8f0'
    },

    statusBadge: {
        display: 'inline-block',
        padding: '6px 10px',
        borderRadius: '999px',
        fontSize: '0.78rem',
        fontWeight: '700',
        background: '#1e293b'
    },

    errorBox: {
        background: 'rgba(239, 68, 68, 0.1)',
        border: '1px solid rgba(239, 68, 68, 0.3)',
        borderRadius: '14px',
        padding: '20px',
        color: '#fecaca'
    },

    retryButton: {
        marginTop: '10px',
        background: '#ef4444',
        color: '#ffffff',
        border: 'none',
        borderRadius: '8px',
        padding: '9px 16px',
        cursor: 'pointer',
        fontWeight: '700'
    },

    loadingCard: {
        background: '#111827',
        border: '1px solid #263449',
        borderRadius: '16px',
        padding: '50px',
        textAlign: 'center',
        color: '#94a3b8'
    },

    loadingSpinner: {
        fontSize: '2rem',
        color: '#f59e0b',
        marginBottom: '10px'
    },

    emptyState: {
        padding: '40px',
        textAlign: 'center',
        color: '#94a3b8'
    }
};

export default FrontDeskDashboard;