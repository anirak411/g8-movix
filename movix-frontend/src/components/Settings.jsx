import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../supabaseClient';

import {
    ArrowLeft, Moon, Sun, User, LogOut, ChevronRight,
    CreditCard, Globe, Ticket, Calendar, X,
    Lock, HelpCircle, Trash2
} from 'lucide-react';
import '../css/settings.css';

const BaseModal = ({ title, onClose, children, maxWidth = '500px' }) => (
    <div className="settings-modal-overlay" onClick={onClose}>
        <div
            className="settings-modal-content"
            style={{ maxWidth }}
            onClick={e => e.stopPropagation()}
        >
            <div className="modal-header">
                <h2>{title}</h2>
                <button onClick={onClose} className="modal-close-btn"><X size={24} /></button>
            </div>
            <div className="modal-body">{children}</div>
        </div>
    </div>
);

const SettingsListItem = ({ icon: Icon, title, subtitle, onClick, rightElement, isDanger }) => (
    <button className="settings-item" onClick={onClick}>
        <div className="item-left">
            <div className={`icon-wrapper ${isDanger ? 'danger' : ''}`}>
                <Icon size={20} />
            </div>
            <div>
                <span className={`item-text-primary ${isDanger ? 'danger' : ''}`}>{title}</span>
                <span className="item-text-secondary">{subtitle}</span>
            </div>
        </div>
        {rightElement ? rightElement : <ChevronRight size={18} />}
    </button>
);

const ToggleSwitch = ({ active, onToggle }) => (
    <button onClick={(e) => { e.stopPropagation(); onToggle(); }} className={`toggle-switch ${active ? 'active' : ''}`}>
        <div className="toggle-knob" />
    </button>
);

// ====================================================================
// --- Modals (Feature Implementation) ---
// ====================================================================

const AccountInfoModal = ({ onClose, user, onUpdate }) => {
    const [formData, setFormData] = useState({ name: user.name || '', city: user.city || '' });

    const handleSubmit = () => {
        onUpdate(formData);
        onClose();
    };

    return (
        <BaseModal title="Edit Profile" onClose={onClose}>
            <div className="form-group">
                <label className="form-label">Full Name</label>
                <input
                    className="form-input"
                    value={formData.name}
                    onChange={e => setFormData({...formData, name: e.target.value})}
                />
            </div>
            <div className="form-group">
                <label className="form-label">Email Address</label>
                <input className="form-input" value={user.email} disabled />
            </div>
            <div className="form-group">
                <label className="form-label">Location / City</label>
                <input
                    className="form-input"
                    value={formData.city}
                    onChange={e => setFormData({...formData, city: e.target.value})}
                />
            </div>
            <button className="primary-modal-btn" style={{width: '100%', marginTop: '20px'}} onClick={handleSubmit}>
                Save Changes
            </button>
        </BaseModal>
    );
};

const ChangePasswordModal = ({ onClose }) => (
    <BaseModal title="Change Password" onClose={onClose}>
        <div className="form-group">
            <label className="form-label">Current Password</label>
            <input className="form-input" type="password" placeholder="Enter current password" />
        </div>
        <div className="form-group">
            <label className="form-label">New Password</label>
            <input className="form-input" type="password" placeholder="Enter new password" />
        </div>
        <div className="form-group">
            <label className="form-label">Confirm New Password</label>
            <input className="form-input" type="password" placeholder="Confirm new password" />
        </div>
        <button className="primary-modal-btn" style={{width: '100%', marginTop: '20px'}} onClick={onClose}>
            Update Password
        </button>
    </BaseModal>
);

const LanguageModal = ({ onClose }) => (
    <BaseModal title="Language Settings" onClose={onClose}>
        <p>Language selection interface.</p>
    </BaseModal>
);

const PaymentMethodsModal = ({ onClose }) => {
    const [view, setView] = useState('list');

    if (view === 'add') {
        return (
            <BaseModal title="Add New Card" onClose={() => setView('list')}>
                <div className="form-group">
                    <label className="form-label">Card Number</label>
                    <input className="form-input" placeholder="0000 0000 0000 0000" />
                </div>
                <div className="form-row">
                    <div className="form-group" style={{flex: 1}}>
                        <label className="form-label">Expiry</label>
                        <input className="form-input" placeholder="MM/YY" />
                    </div>
                    <div className="form-group" style={{flex: 1}}>
                        <label className="form-label">CVC</label>
                        <input className="form-input" placeholder="123" type="password" />
                    </div>
                </div>
                <button className="primary-modal-btn" style={{width: '100%', marginTop: '20px'}} onClick={() => setView('list')}>
                    Save Card
                </button>
            </BaseModal>
        )
    }

    return (
        <BaseModal title="Payment Methods" onClose={onClose}>
            <div className="modal-section-group">
                <div className="payment-item">
                    <div style={{display:'flex', alignItems:'center', gap:'15px'}}>
                        <div className="icon-wrapper" style={{background: '#f0f4f8', color: '#1a1a1a'}}>
                            <CreditCard size={20} />
                        </div>
                        <div>
                            <span style={{display:'block', fontWeight:'bold'}}>Visa ending in 4567</span>
                            <span style={{fontSize:'0.8rem', color:'var(--text-secondary)'}}>Expires 12/26</span>
                        </div>
                    </div>
                    <button className="secondary-modal-btn" style={{padding:'6px 10px'}}><Trash2 size={16}/></button>
                </div>
            </div>
            <button className="settings-item" style={{border:'1px dashed var(--border-color)', justifyContent:'center', marginTop:'20px'}} onClick={() => setView('add')}>
                Add New Payment Method
            </button>
        </BaseModal>
    );
};

const HelpCenterModal = ({ onClose }) => {
    const [openIndex, setOpenIndex] = useState(null);

    const faqs = [
        { q: "How do I cancel a booking?", a: "Cancel tickets via the Booking History tab up to 2 hours before showtime." },
        { q: "Where can I find my tickets?", a: "Your tickets are stored in the 'Booking History' section and are also emailed to you." },
        { q: "How do I change my password?", a: "Go to Account & General > Security to update your password securely." },
    ];

    return (
        <BaseModal title="Help Center" onClose={onClose}>
            <div className="modal-section-group">
                <div className="form-group">
                    <input className="form-input" placeholder="Search for help..." />
                </div>
            </div>
            <div className="modal-section-group">
                {faqs.map((faq, index) => (
                    <div key={index} className="faq-item">
                        <div className="faq-question" onClick={() => setOpenIndex(openIndex === index ? null : index)}>
                            {faq.q}
                            <ChevronRight size={16} style={{transform: openIndex === index ? 'rotate(90deg)' : 'rotate(0)', transition:'0.2s'}} />
                        </div>
                        {openIndex === index && <div className="faq-answer">{faq.a}</div>}
                    </div>
                ))}
            </div>
            <div style={{marginTop: '20px', textAlign: 'center'}}>
                <button className="secondary-modal-btn" style={{marginTop: '10px'}}>Contact Support</button>
            </div>
        </BaseModal>
    );
};

const BookingHistoryModal = ({ onClose, userId }) => {
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);

    // Fetches booking data when the modal is opened and userId is available
    useEffect(() => {
        const fetchBookings = async () => {
            if (!userId) {
                setLoading(false);
                return;
            }
            try {
                const { data, error } = await supabase
                    .from('book_ticket')
                    .select('*')
                    .eq('user_id', userId)
                    .order('show_date', { ascending: false });

                if (error) throw error;
                setBookings(data || []);
            } catch (err) {
                console.error("Fetch Error:", err.message);
            } finally {
                setLoading(false);
            }
        };
        fetchBookings();
    }, [userId]);

    const formatSeats = (seats) => Array.isArray(seats) ? seats.join(', ') : (seats ? seats.toString().replace(/[\[\]"]/g, '').replace(/,/g, ', ') : 'No seats');

    const formatDateTime = (dateStr, timeStr) => {
        if (!dateStr) return 'Date N/A';
        const date = new Date(dateStr).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
        const time = timeStr ? timeStr.substring(0, 5) : '';
        return time ? `${date} • ${time}` : date;
    };

    return (
        <BaseModal title="Booking History" onClose={onClose}>
            {loading ? (
                <div style={{textAlign:'center', padding:'30px', color:'var(--text-secondary)'}}>
                    <p>Loading your tickets...</p>
                </div>
            ) : bookings.length > 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                    {bookings.map((booking) => (
                        <div key={booking.ticket_id || Math.random()} className="payment-item">
                            <div style={{display:'flex', alignItems:'center', gap:'15px', width: '100%'}}>
                                <div className="icon-wrapper" style={{ minWidth: '40px' }}>
                                    <Ticket size={20} />
                                </div>
                                <div style={{ flex: 1 }}>
                                    <span style={{display:'block', fontWeight:'bold', fontSize:'1rem', marginBottom:'2px'}}>
                                        {booking.moviename}
                                    </span>
                                    <div style={{ display:'flex', gap:'15px', fontSize:'0.85rem', color:'var(--text-secondary)' }}>
                                        <span style={{ display:'flex', alignItems:'center', gap:'4px' }}>
                                            <Calendar size={14} />
                                            {formatDateTime(booking.show_date, booking.show_time)}
                                        </span>
                                    </div>
                                    <div style={{ fontSize:'0.85rem', color:'var(--accent)', marginTop:'4px', fontWeight:'600' }}>
                                        Seats: {formatSeats(booking.seats)}
                                    </div>
                                </div>
                            </div>
                            <span className="booking-status success" style={{fontSize: '0.75rem'}}>Confirmed</span>
                        </div>
                    ))}
                </div>
            ) : (
                <div style={{textAlign:'center', padding:'30px', color:'var(--text-secondary)'}}>
                    <Ticket size={48} style={{marginBottom:'15px', opacity:0.3, margin:'0 auto', display:'block'}}/>
                    <p style={{fontSize: '1rem', fontWeight: '500'}}>No recent bookings found</p>
                    <button className="primary-modal-btn" style={{marginTop:'20px'}} onClick={onClose}>
                        Browse Movies
                    </button>
                </div>
            )}
        </BaseModal>
    );
};

const ProfileSection = ({ userProfile, contextUser }) => {
    const userInitial = userProfile.name ? userProfile.name.charAt(0).toUpperCase() : (contextUser.email ? contextUser.email.charAt(0).toUpperCase() : 'U');

    return (
        <div className="profile-section">
            <div className="profile-avatar-large">{userInitial}</div>
            <div className="profile-info">
                <h2>{userProfile.name || 'Movie Buff'}</h2>
                <p>{userProfile.email}</p>
            </div>
        </div>
    );
};

const AccountCard = ({ setActiveModal }) => (
    <div className="settings-card">
        <div className="card-header">Account</div>
        <SettingsListItem icon={User} title="Personal Info" subtitle="Name, City" onClick={() => setActiveModal('accountInfo')} />
        <SettingsListItem icon={Lock} title="Security" subtitle="Password, 2FA" onClick={() => setActiveModal('security')} />
    </div>
);

const ExperienceCard = ({ theme, toggleTheme, setActiveModal }) => (
    <div className="settings-card">
        <div className="card-header">Experience</div>
        <div className="settings-item" onClick={toggleTheme}>
            <div className="item-left">
                <div className="icon-wrapper">
                    {theme === 'dark' ? <Moon size={20} /> : <Sun size={20} />}
                </div>
                <div>
                    <span className="item-text-primary">Appearance</span>
                    <span className="item-text-secondary">{theme === 'dark' ? 'Dark Mode' : 'Light Mode'}</span>
                </div>
            </div>
            <ToggleSwitch active={theme === 'dark'} onToggle={toggleTheme} />
        </div>
        <SettingsListItem icon={Globe} title="Language" subtitle="English (US)" onClick={() => setActiveModal('language')} />
    </div>
);

const WalletSupportCard = ({ setActiveModal, logout }) => (
    <div className="settings-card">
        <div className="card-header">Wallet & Support</div>
        <SettingsListItem icon={CreditCard} title="Payment Methods" subtitle="Visa, Mastercard" onClick={() => setActiveModal('payment')} />
        <SettingsListItem icon={HelpCircle} title="Help Center" subtitle="FAQs and support" onClick={() => setActiveModal('help')} />

        <div style={{marginTop: 'auto', paddingTop: '15px', borderTop:'1px solid var(--border-color)'}}>
            <SettingsListItem
                icon={LogOut} title="Log Out" subtitle="Sign out of device"
                onClick={logout} isDanger={true} rightElement={<span></span>}
            />
        </div>
    </div>
);

const SettingsPage = () => {
    // 1. Hooks and Context
    const { theme, toggleTheme } = useTheme();
    const { logout, user: contextUser } = useAuth();
    const navigate = useNavigate();

    // 2. State
    const [userProfile, setUserProfile] = useState({ id: null, name: '', email: '', city: '' });
    const [loading, setLoading] = useState(true);
    const [activeModal, setActiveModal] = useState(null);

    // 3. Data & Handlers
    useEffect(() => {
        const fetchUserData = async () => {
            if (!contextUser) return setLoading(false);
            try {
                // Fetch user profile data from the 'users' table
                const { data } = await supabase
                    .from('users')
                    .select('id, name, city, email')
                    .eq('email', contextUser.email)
                    .single();
                setUserProfile(data || { id: null, email: contextUser.email, name: 'Guest' });
            } catch (err) {
                console.error("User data fetch error:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchUserData();
    }, [contextUser, navigate]);

    const handleUpdateProfile = async (updates) => {
        setUserProfile(prev => ({ ...prev, ...updates }));
        try {
            // Update profile data in the 'users' table
            await supabase.from('users').update(updates).eq('email', userProfile.email);
        } catch (err) {
            console.error('Profile save failed', err);
        }
    };

    // 4. Render Modal Function
    const renderModal = () => {
        if (!activeModal) return null;
        const commonProps = { onClose: () => setActiveModal(null) };

        switch (activeModal) {
            case 'accountInfo': return <AccountInfoModal {...commonProps} user={userProfile} onUpdate={handleUpdateProfile} />;
            case 'security': return <ChangePasswordModal {...commonProps} />;
            case 'payment': return <PaymentMethodsModal {...commonProps} />;
            case 'language': return <LanguageModal {...commonProps} />;
            case 'help': return <HelpCenterModal {...commonProps} />;
            case 'bookingHistory':
                // Pass the user's ID to the modal to fetch specific history
                return <BookingHistoryModal {...commonProps} userId={userProfile.id} />;
            default: return null;
        }
    };

    // 5. Main Render
    if (loading) return <div className="settings-loading">Loading...</div>;

    const userInitial = userProfile.name ? userProfile.name.charAt(0).toUpperCase() : (contextUser.email ? contextUser.email.charAt(0).toUpperCase() : 'U');

    return (
        <div className="settings-page" data-theme={theme}>
            <div className="settings-container">
                {/* Header */}
                <div className="settings-header-group">
                    <button onClick={() => navigate(-1)} className="settings-back-btn">
                        <ArrowLeft size={18} /> Back
                    </button>
                    <h1 className="settings-title">Settings</h1>
                    {/* Theme Toggle (Moved from Card to Header) */}
                    <div className="settings-item" style={{ width: 'auto', padding: '0 10px' }} onClick={toggleTheme}>
                        <div className="icon-wrapper">
                            {theme === 'dark' ? <Moon size={20} /> : <Sun size={20} />}
                        </div>
                        <ToggleSwitch active={theme === 'dark'} onToggle={toggleTheme} />
                    </div>
                </div>

                <ProfileSection userProfile={userProfile} contextUser={contextUser} />

                {/* Settings Grid */}
                <div className="settings-grid">
                    <AccountCard setActiveModal={setActiveModal} />
                    <ExperienceCard theme={theme} toggleTheme={toggleTheme} setActiveModal={setActiveModal} />
                    <WalletSupportCard setActiveModal={setActiveModal} logout={logout} />
                </div>

            </div>
            {renderModal()}
        </div>
    );
};

export default SettingsPage;