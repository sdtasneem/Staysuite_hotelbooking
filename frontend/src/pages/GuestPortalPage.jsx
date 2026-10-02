import React, { useEffect, useState } from 'react';

import {
    User,
    Mail,
    Phone,
    MapPin,
    Globe,
    CreditCard,
    Star,
    CalendarDays,
    BedDouble,
    Users,
    IndianRupee,
    RefreshCw,
    ChevronRight,
    X
} from 'lucide-react';

import { guestService } from '../services/guestService';

function GuestPortalPage() {
    const [guests, setGuests] = useState([]);
    const [selectedGuest, setSelectedGuest] = useState(null);

    const [loading, setLoading] = useState(true);
    const [detailsLoading, setDetailsLoading] = useState(false);
    const [error, setError] = useState(null);

    // =========================================================
    // FETCH ALL GUESTS
    // =========================================================

    const fetchGuests = async () => {
        setLoading(true);
        setError(null);

        try {
            const response = await guestService.getAllGuests();

            setGuests(response?.data || []);
        } catch (err) {
            console.error('Failed to fetch guests:', err);

            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    // =========================================================
    // FETCH SINGLE GUEST
    // =========================================================

    const openGuestDetails = async (guestId) => {
        setDetailsLoading(true);
        setError(null);

        try {
            const response =
                await guestService.getGuestById(guestId);

            setSelectedGuest(response?.data || null);
        } catch (err) {
            console.error(
                'Failed to fetch guest details:',
                err
            );

            setError(err.message);
        } finally {
            setDetailsLoading(false);
        }
    };

    // =========================================================
    // LOAD GUESTS WHEN PAGE OPENS
    // =========================================================

    useEffect(() => {
        fetchGuests();
    }, []);

    // =========================================================
    // FORMAT DATE
    // =========================================================

    const formatDate = (date) => {
        if (!date) {
            return '-';
        }

        return new Date(date).toLocaleDateString('en-IN', {
            day: '2-digit',
            month: 'short',
            year: 'numeric'
        });
    };

    // =========================================================
    // FORMAT AMOUNT
    // =========================================================

    const formatAmount = (amount) => {
        if (amount === null || amount === undefined) {
            return '-';
        }

        return `₹${Number(amount).toLocaleString('en-IN')}`;
    };

    // =========================================================
    // LOADING STATE
    // =========================================================

    if (loading) {
        return (
            <div style={styles.page}>
                <div style={styles.loadingContainer}>
                    <RefreshCw
                        size={28}
                        className="animate-spin"
                        color="#f59e0b"
                    />

                    <p>Loading guests...</p>
                </div>
            </div>
        );
    }

    // =========================================================
    // MAIN PAGE
    // =========================================================

    return (
        <div style={styles.page}>

            {/* =====================================================
          PAGE HEADER
      ===================================================== */}

            <section style={styles.header}>

                <div>
                    <p style={styles.eyebrow}>
                        Guest Operations
                    </p>

                    <h2 style={styles.title}>
                        Guest Portal
                    </h2>

                    <p style={styles.subtitle}>
                        View guest profiles, preferences, and booking history.
                    </p>
                </div>

                <button
                    onClick={fetchGuests}
                    style={styles.refreshButton}
                >
                    <RefreshCw size={15} />

                    Refresh
                </button>

            </section>


            {/* =====================================================
          ERROR
      ===================================================== */}

            {error && (
                <div style={styles.errorBox}>

                    <span>
                        {error}
                    </span>

                    <button
                        onClick={() => setError(null)}
                        style={styles.closeErrorButton}
                    >
                        <X size={16} />
                    </button>

                </div>
            )}


            {/* =====================================================
          SUMMARY CARDS
      ===================================================== */}

            <section style={styles.summaryGrid}>

                {/* Total Guests */}

                <div
                    className="glass-panel"
                    style={styles.summaryCard}
                >
                    <div style={styles.summaryIcon}>
                        <User size={20} />
                    </div>

                    <div>
                        <p style={styles.summaryLabel}>
                            Total Guests
                        </p>

                        <h3 style={styles.summaryValue}>
                            {guests.length}
                        </h3>
                    </div>
                </div>


                {/* VIP Guests */}

                <div
                    className="glass-panel"
                    style={styles.summaryCard}
                >
                    <div style={styles.summaryIcon}>
                        <Star size={20} />
                    </div>

                    <div>
                        <p style={styles.summaryLabel}>
                            VIP Guests
                        </p>

                        <h3 style={styles.summaryValue}>
                            {
                                guests.filter(
                                    (guest) =>
                                        guest.vip_status === true
                                ).length
                            }
                        </h3>
                    </div>
                </div>


                {/* Total Bookings */}

                <div
                    className="glass-panel"
                    style={styles.summaryCard}
                >
                    <div style={styles.summaryIcon}>
                        <CalendarDays size={20} />
                    </div>

                    <div>
                        <p style={styles.summaryLabel}>
                            Total Bookings
                        </p>

                        <h3 style={styles.summaryValue}>
                            {
                                guests.reduce(
                                    (total, guest) =>
                                        total +
                                        (guest.bookings?.length || 0),
                                    0
                                )
                            }
                        </h3>
                    </div>
                </div>

            </section>


            {/* =====================================================
          GUEST DIRECTORY
      ===================================================== */}

            <section
                className="glass-panel"
                style={styles.tablePanel}
            >

                <div style={styles.tableHeader}>

                    <div>
                        <h3 style={styles.sectionTitle}>
                            Guest Directory
                        </h3>

                        <p style={styles.sectionSubtitle}>
                            Select a guest to view complete profile details.
                        </p>
                    </div>

                </div>


                {/* No Guests */}

                {guests.length === 0 ? (

                    <div style={styles.emptyState}>

                        <User size={40} />

                        <h3>
                            No guests found
                        </h3>

                        <p>
                            There are currently no guest records available.
                        </p>

                    </div>

                ) : (

                    <div style={styles.tableWrapper}>

                        <table style={styles.table}>

                            <thead>

                                <tr>

                                    <th style={styles.th}>
                                        Guest
                                    </th>

                                    <th style={styles.th}>
                                        Contact
                                    </th>

                                    <th style={styles.th}>
                                        Location
                                    </th>

                                    <th style={styles.th}>
                                        VIP
                                    </th>

                                    <th style={styles.th}>
                                        Bookings
                                    </th>

                                    <th style={styles.th}>
                                        Action
                                    </th>

                                </tr>

                            </thead>


                            <tbody>

                                {guests.map((guest) => (

                                    <tr key={guest.id}>

                                        {/* Guest */}

                                        <td style={styles.td}>

                                            <div style={styles.guestCell}>

                                                <div style={styles.avatar}>
                                                    {guest.full_name
                                                        ?.charAt(0)
                                                        ?.toUpperCase() || '?'}
                                                </div>

                                                <div>

                                                    <div style={styles.guestName}>
                                                        {guest.full_name}
                                                    </div>

                                                    <div style={styles.guestId}>
                                                        {guest.nationality ||
                                                            'Guest'}
                                                    </div>

                                                </div>

                                            </div>

                                        </td>


                                        {/* Contact */}

                                        <td style={styles.td}>

                                            <div style={styles.contactText}>

                                                <span
                                                    style={
                                                        styles.contactTextSpan
                                                    }
                                                >
                                                    <Mail size={13} />

                                                    {guest.email || '-'}
                                                </span>

                                                <span
                                                    style={
                                                        styles.contactTextSpan
                                                    }
                                                >
                                                    <Phone size={13} />

                                                    {guest.phone || '-'}
                                                </span>

                                            </div>

                                        </td>


                                        {/* Location */}

                                        <td style={styles.td}>

                                            <div style={styles.locationText}>

                                                <MapPin size={14} />

                                                <span>
                                                    {guest.city || '-'}

                                                    {guest.country
                                                        ? `, ${guest.country}`
                                                        : ''}
                                                </span>

                                            </div>

                                        </td>


                                        {/* VIP */}

                                        <td style={styles.td}>

                                            {guest.vip_status ? (

                                                <span style={styles.vipBadge}>

                                                    <Star size={12} />

                                                    VIP

                                                </span>

                                            ) : (

                                                <span
                                                    style={
                                                        styles.regularBadge
                                                    }
                                                >
                                                    Regular
                                                </span>

                                            )}

                                        </td>


                                        {/* Bookings */}

                                        <td style={styles.td}>

                                            <span
                                                style={
                                                    styles.bookingCount
                                                }
                                            >
                                                {guest.bookings?.length || 0}
                                            </span>

                                        </td>


                                        {/* Action */}

                                        <td style={styles.td}>

                                            <button
                                                onClick={() =>
                                                    openGuestDetails(
                                                        guest.id
                                                    )
                                                }
                                                style={styles.viewButton}
                                            >
                                                View

                                                <ChevronRight
                                                    size={14}
                                                />
                                            </button>

                                        </td>

                                    </tr>

                                ))}

                            </tbody>

                        </table>

                    </div>

                )}

            </section>


            {/* =====================================================
          GUEST DETAILS MODAL
      ===================================================== */}

            {selectedGuest && (

                <div
                    style={styles.modalOverlay}
                    onClick={() =>
                        setSelectedGuest(null)
                    }
                >

                    <div
                        style={styles.modal}
                        onClick={(event) =>
                            event.stopPropagation()
                        }
                    >

                        {/* Modal Header */}

                        <div style={styles.modalHeader}>

                            <div>

                                <p style={styles.eyebrow}>
                                    Guest Profile
                                </p>

                                <h2 style={styles.modalTitle}>
                                    {selectedGuest.full_name}
                                </h2>

                            </div>

                            <button
                                onClick={() =>
                                    setSelectedGuest(null)
                                }
                                style={
                                    styles.modalCloseButton
                                }
                            >
                                <X size={20} />
                            </button>

                        </div>


                        {/* Loading Guest Details */}

                        {detailsLoading ? (

                            <div
                                style={
                                    styles.loadingContainer
                                }
                            >

                                <RefreshCw
                                    size={25}
                                    className="animate-spin"
                                    color="#f59e0b"
                                />

                                <p>
                                    Loading guest details...
                                </p>

                            </div>

                        ) : (

                            <>

                                {/* =================================================
                    PROFILE INFORMATION
                ================================================= */}

                                <div
                                    style={styles.profileGrid}
                                >

                                    <div
                                        style={styles.profileItem}
                                    >
                                        <Mail size={16} />

                                        <div>

                                            <span
                                                style={
                                                    styles.profileLabel
                                                }
                                            >
                                                Email
                                            </span>

                                            <span
                                                style={
                                                    styles.profileValue
                                                }
                                            >
                                                {selectedGuest.email ||
                                                    '-'}
                                            </span>

                                        </div>
                                    </div>


                                    <div
                                        style={styles.profileItem}
                                    >
                                        <Phone size={16} />

                                        <div>

                                            <span
                                                style={
                                                    styles.profileLabel
                                                }
                                            >
                                                Phone
                                            </span>

                                            <span
                                                style={
                                                    styles.profileValue
                                                }
                                            >
                                                {selectedGuest.phone ||
                                                    '-'}
                                            </span>

                                        </div>
                                    </div>


                                    <div
                                        style={styles.profileItem}
                                    >
                                        <MapPin size={16} />

                                        <div>

                                            <span
                                                style={
                                                    styles.profileLabel
                                                }
                                            >
                                                Address
                                            </span>

                                            <span
                                                style={
                                                    styles.profileValue
                                                }
                                            >
                                                {selectedGuest.address ||
                                                    '-'}
                                            </span>

                                        </div>
                                    </div>


                                    <div
                                        style={styles.profileItem}
                                    >
                                        <Globe size={16} />

                                        <div>

                                            <span
                                                style={
                                                    styles.profileLabel
                                                }
                                            >
                                                Nationality
                                            </span>

                                            <span
                                                style={
                                                    styles.profileValue
                                                }
                                            >
                                                {selectedGuest.nationality ||
                                                    '-'}
                                            </span>

                                        </div>
                                    </div>


                                    <div
                                        style={styles.profileItem}
                                    >
                                        <CreditCard size={16} />

                                        <div>

                                            <span
                                                style={
                                                    styles.profileLabel
                                                }
                                            >
                                                Identification
                                            </span>

                                            <span
                                                style={
                                                    styles.profileValue
                                                }
                                            >
                                                {selectedGuest.identification_number ||
                                                    '-'}
                                            </span>

                                        </div>
                                    </div>


                                    <div
                                        style={styles.profileItem}
                                    >
                                        <Star size={16} />

                                        <div>

                                            <span
                                                style={
                                                    styles.profileLabel
                                                }
                                            >
                                                Guest Status
                                            </span>

                                            <span
                                                style={
                                                    styles.profileValue
                                                }
                                            >
                                                {selectedGuest.vip_status
                                                    ? 'VIP Guest'
                                                    : 'Regular Guest'}
                                            </span>

                                        </div>
                                    </div>

                                </div>


                                {/* =================================================
                    PREFERENCES
                ================================================= */}

                                {selectedGuest.preferences && (

                                    <div
                                        style={
                                            styles.preferencesSection
                                        }
                                    >

                                        <h3
                                            style={
                                                styles.subsectionTitle
                                            }
                                        >
                                            Guest Preferences
                                        </h3>

                                        <div
                                            style={
                                                styles.preferenceGrid
                                            }
                                        >

                                            {Object.entries(
                                                selectedGuest.preferences
                                            ).map(
                                                ([key, value]) => (

                                                    <div
                                                        key={key}
                                                        style={
                                                            styles.preferenceItem
                                                        }
                                                    >

                                                        <span
                                                            style={
                                                                styles.preferenceKey
                                                            }
                                                        >
                                                            {key.replace(
                                                                /_/g,
                                                                ' '
                                                            )}
                                                        </span>

                                                        <span
                                                            style={
                                                                styles.preferenceValue
                                                            }
                                                        >
                                                            {String(value)}
                                                        </span>

                                                    </div>

                                                )
                                            )}

                                        </div>

                                    </div>

                                )}


                                {/* =================================================
                    NOTES
                ================================================= */}

                                {selectedGuest.notes && (

                                    <div
                                        style={
                                            styles.notesSection
                                        }
                                    >

                                        <h3
                                            style={
                                                styles.subsectionTitle
                                            }
                                        >
                                            Notes
                                        </h3>

                                        <p
                                            style={
                                                styles.notesText
                                            }
                                        >
                                            {selectedGuest.notes}
                                        </p>

                                    </div>

                                )}


                                {/* =================================================
                    BOOKING HISTORY
                ================================================= */}

                                <div
                                    style={
                                        styles.bookingSection
                                    }
                                >

                                    <div
                                        style={
                                            styles.bookingSectionHeader
                                        }
                                    >

                                        <div>

                                            <h3
                                                style={
                                                    styles.subsectionTitle
                                                }
                                            >
                                                Booking History
                                            </h3>

                                            <p
                                                style={
                                                    styles.sectionSubtitle
                                                }
                                            >
                                                {selectedGuest.bookings
                                                    ?.length || 0}{' '}
                                                booking(s)
                                            </p>

                                        </div>

                                    </div>


                                    {selectedGuest.bookings?.length ? (

                                        <div
                                            style={
                                                styles.bookingList
                                            }
                                        >

                                            {selectedGuest.bookings.map(
                                                (booking) => (

                                                    <div
                                                        key={booking.id}
                                                        style={
                                                            styles.bookingCard
                                                        }
                                                    >

                                                        {/* Reference */}

                                                        <div
                                                            style={
                                                                styles.bookingMain
                                                            }
                                                        >

                                                            <div
                                                                style={
                                                                    styles.bookingReference
                                                                }
                                                            >
                                                                {booking.booking_reference ||
                                                                    booking.id}
                                                            </div>

                                                            <div
                                                                style={
                                                                    styles.bookingRoom
                                                                }
                                                            >

                                                                <BedDouble
                                                                    size={14}
                                                                />

                                                                Room{' '}

                                                                {booking.rooms
                                                                    ?.room_number ||
                                                                    '-'}

                                                            </div>

                                                        </div>


                                                        {/* Dates */}

                                                        <div
                                                            style={
                                                                styles.bookingDates
                                                            }
                                                        >

                                                            <div>

                                                                <span
                                                                    style={
                                                                        styles.bookingLabel
                                                                    }
                                                                >
                                                                    Check-in
                                                                </span>

                                                                <span>
                                                                    {formatDate(
                                                                        booking.check_in_date
                                                                    )}
                                                                </span>

                                                            </div>


                                                            <div>

                                                                <span
                                                                    style={
                                                                        styles.bookingLabel
                                                                    }
                                                                >
                                                                    Check-out
                                                                </span>

                                                                <span>
                                                                    {formatDate(
                                                                        booking.check_out_date
                                                                    )}
                                                                </span>

                                                            </div>

                                                        </div>


                                                        {/* Guests */}

                                                        <div
                                                            style={
                                                                styles.bookingGuests
                                                            }
                                                        >

                                                            <Users
                                                                size={14}
                                                            />

                                                            {booking.number_of_guests ||
                                                                0}

                                                        </div>


                                                        {/* Amount */}

                                                        <div
                                                            style={
                                                                styles.bookingAmount
                                                            }
                                                        >

                                                            <IndianRupee
                                                                size={14}
                                                            />

                                                            {formatAmount(
                                                                booking.total_amount
                                                            )}

                                                        </div>


                                                        {/* Status */}

                                                        <div>

                                                            <span
                                                                style={
                                                                    styles.statusBadge
                                                                }
                                                            >
                                                                {booking.booking_status ||
                                                                    '-'}
                                                            </span>

                                                        </div>

                                                    </div>

                                                )
                                            )}

                                        </div>

                                    ) : (

                                        <div
                                            style={
                                                styles.noBookings
                                            }
                                        >
                                            No booking history available.
                                        </div>

                                    )}

                                </div>

                            </>

                        )}

                    </div>

                </div>

            )}

        </div>
    );
}


/* =========================================================
   STYLES
========================================================= */

const styles = {

    page: {
        padding: '32px',
        maxWidth: '1400px',
        margin: '0 auto'
    },

    header: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-end',
        marginBottom: '24px'
    },

    eyebrow: {
        margin: '0 0 6px',
        color: '#f59e0b',
        fontSize: '0.75rem',
        fontWeight: 700,
        letterSpacing: '0.1em',
        textTransform: 'uppercase'
    },

    title: {
        margin: 0,
        fontFamily: 'var(--font-serif)',
        fontSize: '2rem',
        color: '#ffffff'
    },

    subtitle: {
        margin: '8px 0 0',
        color: 'var(--color-text-secondary)',
        fontSize: '0.9rem'
    },

    refreshButton: {
        display: 'flex',
        alignItems: 'center',
        gap: '7px',
        padding: '9px 15px',
        borderRadius: '8px',
        border: '1px solid var(--color-border)',
        background: 'var(--color-surface-hover)',
        color: 'var(--color-text-primary)',
        cursor: 'pointer',
        fontWeight: 600
    },

    errorBox: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '12px 15px',
        marginBottom: '20px',
        borderRadius: '8px',
        background: 'rgba(239, 68, 68, 0.1)',
        border: '1px solid rgba(239, 68, 68, 0.25)',
        color: '#f87171'
    },

    closeErrorButton: {
        border: 'none',
        background: 'transparent',
        color: '#f87171',
        cursor: 'pointer'
    },

    summaryGrid: {
        display: 'grid',
        gridTemplateColumns:
            'repeat(3, minmax(0, 1fr))',
        gap: '16px',
        marginBottom: '24px'
    },

    summaryCard: {
        padding: '18px',
        display: 'flex',
        alignItems: 'center',
        gap: '14px'
    },

    summaryIcon: {
        width: '42px',
        height: '42px',
        borderRadius: '10px',
        background:
            'rgba(245, 158, 11, 0.12)',
        color: '#fbbf24',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
    },

    summaryLabel: {
        margin: 0,
        color: 'var(--color-text-secondary)',
        fontSize: '0.8rem'
    },

    summaryValue: {
        margin: '4px 0 0',
        color: '#ffffff',
        fontSize: '1.5rem'
    },

    tablePanel: {
        overflow: 'hidden'
    },

    tableHeader: {
        padding: '20px',
        borderBottom:
            '1px solid var(--color-border)'
    },

    sectionTitle: {
        margin: 0,
        color: '#ffffff',
        fontSize: '1.05rem'
    },

    sectionSubtitle: {
        margin: '5px 0 0',
        color: 'var(--color-text-secondary)',
        fontSize: '0.8rem'
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
        padding: '13px 16px',
        color: 'var(--color-text-muted)',
        fontSize: '0.72rem',
        textTransform: 'uppercase',
        letterSpacing: '0.05em',
        borderBottom:
            '1px solid var(--color-border)'
    },

    td: {
        padding: '15px 16px',
        borderBottom:
            '1px solid rgba(148, 163, 184, 0.08)',
        verticalAlign: 'middle',
        color: 'var(--color-text-primary)',
        fontSize: '0.85rem'
    },

    guestCell: {
        display: 'flex',
        alignItems: 'center',
        gap: '10px'
    },

    avatar: {
        width: '36px',
        height: '36px',
        borderRadius: '50%',
        background:
            'rgba(245, 158, 11, 0.15)',
        color: '#fbbf24',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontWeight: 700
    },

    guestName: {
        color: '#ffffff',
        fontWeight: 600
    },

    guestId: {
        marginTop: '3px',
        color: 'var(--color-text-muted)',
        fontSize: '0.72rem'
    },

    contactText: {
        display: 'flex',
        flexDirection: 'column',
        gap: '5px'
    },

    contactTextSpan: {
        display: 'flex',
        alignItems: 'center',
        gap: '5px'
    },

    locationText: {
        display: 'flex',
        alignItems: 'center',
        gap: '6px'
    },

    vipBadge: {
        display: 'inline-flex',
        alignItems: 'center',
        gap: '4px',
        padding: '4px 8px',
        borderRadius: '999px',
        background:
            'rgba(245, 158, 11, 0.12)',
        border:
            '1px solid rgba(245, 158, 11, 0.25)',
        color: '#fbbf24',
        fontSize: '0.7rem',
        fontWeight: 700
    },

    regularBadge: {
        display: 'inline-flex',
        padding: '4px 8px',
        borderRadius: '999px',
        background:
            'rgba(148, 163, 184, 0.1)',
        color: '#94a3b8',
        fontSize: '0.7rem'
    },

    bookingCount: {
        display: 'inline-flex',
        minWidth: '26px',
        height: '26px',
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: '7px',
        background:
            'rgba(59, 130, 246, 0.1)',
        color: '#93c5fd',
        fontWeight: 700
    },

    viewButton: {
        display: 'inline-flex',
        alignItems: 'center',
        gap: '3px',
        padding: '7px 10px',
        borderRadius: '7px',
        border:
            '1px solid var(--color-border)',
        background: 'transparent',
        color: '#fbbf24',
        cursor: 'pointer',
        fontSize: '0.78rem',
        fontWeight: 600
    },

    emptyState: {
        padding: '60px 20px',
        textAlign: 'center',
        color: 'var(--color-text-secondary)'
    },

    loadingContainer: {
        minHeight: '300px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '12px',
        color: 'var(--color-text-secondary)'
    },

    modalOverlay: {
        position: 'fixed',
        inset: 0,
        background: 'rgba(0, 0, 0, 0.7)',
        backdropFilter: 'blur(5px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px',
        zIndex: 1000
    },

    modal: {
        width: '100%',
        maxWidth: '1000px',
        maxHeight: '90vh',
        overflowY: 'auto',
        background: '#111827',
        border:
            '1px solid var(--color-border)',
        borderRadius: '14px',
        boxShadow:
            '0 25px 60px rgba(0, 0, 0, 0.45)'
    },

    modalHeader: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        padding: '24px',
        borderBottom:
            '1px solid var(--color-border)'
    },

    modalTitle: {
        margin: 0,
        color: '#ffffff',
        fontFamily: 'var(--font-serif)',
        fontSize: '1.6rem'
    },

    modalCloseButton: {
        width: '34px',
        height: '34px',
        borderRadius: '8px',
        border:
            '1px solid var(--color-border)',
        background: 'transparent',
        color: '#94a3b8',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
    },

    profileGrid: {
        display: 'grid',
        gridTemplateColumns:
            'repeat(2, minmax(0, 1fr))',
        gap: '14px',
        padding: '22px 24px',
        borderBottom:
            '1px solid var(--color-border)'
    },

    profileItem: {
        display: 'flex',
        alignItems: 'flex-start',
        gap: '10px',
        color: '#94a3b8'
    },

    profileLabel: {
        display: 'block',
        fontSize: '0.7rem',
        color: 'var(--color-text-muted)',
        textTransform: 'uppercase',
        letterSpacing: '0.05em'
    },

    profileValue: {
        display: 'block',
        marginTop: '3px',
        color: '#ffffff',
        fontSize: '0.85rem'
    },

    preferencesSection: {
        padding: '20px 24px',
        borderBottom:
            '1px solid var(--color-border)'
    },

    subsectionTitle: {
        margin: 0,
        color: '#ffffff',
        fontSize: '0.95rem'
    },

    preferenceGrid: {
        display: 'grid',
        gridTemplateColumns:
            'repeat(2, minmax(0, 1fr))',
        gap: '10px',
        marginTop: '14px'
    },

    preferenceItem: {
        display: 'flex',
        justifyContent: 'space-between',
        gap: '15px',
        padding: '10px 12px',
        borderRadius: '8px',
        background:
            'rgba(148, 163, 184, 0.05)'
    },

    preferenceKey: {
        color: 'var(--color-text-muted)',
        fontSize: '0.78rem',
        textTransform: 'capitalize'
    },

    preferenceValue: {
        color: '#ffffff',
        fontSize: '0.78rem',
        fontWeight: 600
    },

    notesSection: {
        padding: '20px 24px',
        borderBottom:
            '1px solid var(--color-border)'
    },

    notesText: {
        margin: '10px 0 0',
        color: 'var(--color-text-secondary)',
        fontSize: '0.85rem',
        lineHeight: 1.6
    },

    bookingSection: {
        padding: '20px 24px 24px'
    },

    bookingSectionHeader: {
        marginBottom: '14px'
    },

    bookingList: {
        display: 'flex',
        flexDirection: 'column',
        gap: '8px'
    },

    bookingCard: {
        display: 'grid',
        gridTemplateColumns:
            '1.3fr 1.5fr 0.7fr 0.8fr 0.8fr',
        alignItems: 'center',
        gap: '12px',
        padding: '13px',
        borderRadius: '9px',
        border:
            '1px solid rgba(148, 163, 184, 0.1)',
        background:
            'rgba(148, 163, 184, 0.04)'
    },

    bookingMain: {
        display: 'flex',
        flexDirection: 'column',
        gap: '5px'
    },

    bookingReference: {
        color: '#ffffff',
        fontSize: '0.8rem',
        fontWeight: 700
    },

    bookingRoom: {
        display: 'flex',
        alignItems: 'center',
        gap: '5px',
        color: '#94a3b8',
        fontSize: '0.72rem'
    },

    bookingDates: {
        display: 'flex',
        gap: '16px',
        fontSize: '0.78rem',
        color: '#ffffff'
    },

    bookingLabel: {
        display: 'block',
        color: '#64748b',
        fontSize: '0.65rem',
        marginBottom: '3px'
    },

    bookingGuests: {
        display: 'flex',
        alignItems: 'center',
        gap: '5px',
        color: '#cbd5e1',
        fontSize: '0.78rem'
    },

    bookingAmount: {
        display: 'flex',
        alignItems: 'center',
        gap: '2px',
        color: '#ffffff',
        fontWeight: 600,
        fontSize: '0.78rem'
    },

    statusBadge: {
        display: 'inline-flex',
        padding: '4px 8px',
        borderRadius: '999px',
        fontSize: '0.65rem',
        fontWeight: 700,
        textTransform: 'capitalize',
        background:
            'rgba(148, 163, 184, 0.1)',
        color: '#cbd5e1'
    },

    noBookings: {
        padding: '25px',
        borderRadius: '8px',
        background:
            'rgba(148, 163, 184, 0.04)',
        color: 'var(--color-text-secondary)',
        textAlign: 'center',
        fontSize: '0.82rem'
    }

};

export default GuestPortalPage;