import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
// FIX: Import the single, shared client instance instead of creating a new one
import { supabase } from '../supabaseClient';

import {
    ArrowLeft, Moon, Sun, User, Bell, Shield, LogOut, ChevronRight,
    CreditCard, Globe, Ticket, Calendar, X,
    Lock, HelpCircle, Plus, Trash2, Check, ChevronDown
} from 'lucide-react';
import '../css/settings.css';

// DELETED LINES: Removed the const supabaseUrl/supabaseKey/createClient(...) block

// --- Reusable Components ---

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

// --- Modals ---

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
                <input className="form-input" value={user.email} disabled style={{opacity: 0.6, cursor: 'not-allowed'}} />
            </div>
            <div className="form-group">
                <label className="form-label">Location / City</label>
                <input
                    className="form-input"
                    value={formData.city}
                    onChange={e => setFormData({...formData, city: e.target.value})}
                />
            </div>
            <button className="primary-modal-btn" style={{width: '100%', marginTop: '10px'}} onClick={handleSubmit}>
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
        <button className="primary-modal-btn" style={{width: '100%', marginTop: '10px'}} onClick={onClose}>
            Update Password
        </button>
    </BaseModal>
);

const NotificationSettingsModal = ({ onClose, settings, onToggle }) => (
    <BaseModal title="Notification Preferences" onClose={onClose}>
        <div className="notification-row">
            <div className="notification-info">
                <h4>New Releases</h4>
                <p>Get notified when movies in your watchlist are released.</p>
            </div>
            <ToggleSwitch active={settings.releases} onToggle={() => onToggle('releases')} />
        </div>
        <div className="notification-row">
            <div className="notification-info">
                <h4>Ticket Reminders</h4>
                <p>Receive a reminder 2 hours before your showtime.</p>
            </div>
            <ToggleSwitch active={settings.reminders} onToggle={() => onToggle('reminders')} />
        </div>
        <div className="notification-row">
            <div className="notification-info">
                <h4>Exclusive Offers</h4>
                <p>Discounts, coupons, and premium member deals.</p>
            </div>
            <ToggleSwitch active={settings.offers} onToggle={() => onToggle('offers')} />
        </div>
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
                <div style={{display:'flex', gap:'10px', marginTop:'10px'}}>
                    <button className="secondary-modal-btn" style={{flex:1}} onClick={() => setView('list')}>Cancel</button>
                    <button className="primary-modal-btn" style={{flex:1}} onClick={() => setView('list')}>Save Card</button>
                </div>
            </BaseModal>
        )
    }

    return (
        <BaseModal title="Payment Methods" onClose={onClose}>
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
            <button className="settings-item" style={{border:'1px dashed var(--border-color)', justifyContent:'center', marginTop:'20px'}} onClick={() => setView('add')}>
                <Plus size={20} style={{marginRight:'8px'}}/> Add New Payment Method
            </button>
        </BaseModal>
    );
};

const LanguageModal = ({ onClose, currentLang, setLang }) => {
    const languages = [
        { code: 'en', name: 'English (US)', flag: '🇺🇸' },
        { code: 'es', name: 'Español', flag: '🇪🇸' },
        { code: 'fr', name: 'Français', flag: '🇫🇷' },
        { code: 'de', name: 'Deutsch', flag: '🇩🇪' },
        { code: 'jp', name: '日本語', flag: '🇯🇵' },
        { code: 'ph', name: 'Filipino', flag: '🇵🇭' },
    ];

    return (
        <BaseModal title="Select Language" onClose={onClose}>
            <div className="language-grid">
                {languages.map(lang => (
                    <div
                        key={lang.code}
                        className={`language-option ${currentLang === lang.code ? 'selected' : ''}`}
                        onClick={() => { setLang(lang.code); onClose(); }}
                    >
                        <span style={{fontSize: '1.5rem'}}>{lang.flag}</span>
                        <span style={{fontWeight: currentLang === lang.code ? 'bold' : 'normal'}}>{lang.name}</span>
                        {currentLang === lang.code && <Check size={16} color="var(--accent)" style={{marginLeft:'auto'}} />}
                    </div>
                ))}
            </div>
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
            <div style={{marginBottom: '20px'}}>
                <div className="form-group">
                    <input className="form-input" placeholder="Search for help..." />
                </div>
            </div>
            <div>
                {faqs.map((faq, index) => (
                    <div key={index} className="faq-item">
                        <div className="faq-question" onClick={() => setOpenIndex(openIndex === index ? null : index)}>
                            {faq.q}
                            <ChevronDown size={16} style={{transform: openIndex === index ? 'rotate(180deg)' : 'rotate(0)', transition:'0.2s'}} />
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

// --- Booking History Modal ---
const BookingHistoryModal = ({ onClose, userId }) => {
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchBookings = async () => {
            if (!userId) {
                setLoading(false);
                return;
            }

            try {
                // Uses the imported 'supabase' instance
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

    const formatSeats = (seats) => {
        if (!seats) return 'No seats';
        // Handle arrays or strings that look like arrays
        let cleanSeats = Array.isArray(seats) ? seats.join(', ') : seats.toString().replace(/[\[\]"]/g, '').replace(/,/g, ', ');
        return cleanSeats;
    };

    const formatDateTime = (dateStr, timeStr) => {
        if (!dateStr) return 'Date N/A';
        const date = new Date(dateStr).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
        // Clean time (remove seconds if present)
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
                        // Assuming a ticket_id field exists, using a fallback key
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

// --- Main Settings Page ---

const SettingsPage = () => {
    const { theme, toggleTheme } = useTheme();
    const { logout, user: contextUser } = useAuth();
    const navigate = useNavigate();

    const [userProfile, setUserProfile] = useState({ id: null, name: '', email: '', city: '' });
    const [loading, setLoading] = useState(true);
    const [activeModal, setActiveModal] = useState(null);
    const [language, setLanguage] = useState('en');

    const [notifSettings, setNotifSettings] = useState({
        releases: true,
        reminders: true,
        offers: false,
        email: true
    });

    useEffect(() => {
        const fetchUserData = async () => {
            if (!contextUser) return;

            try {
                // Uses the imported 'supabase' instance
                const { data, error } = await supabase
                    .from('users')
                    .select('*')
                    .eq('email', contextUser.email)
                    .single();

                if (data) {
                    setUserProfile(data);
                } else {
                    setUserProfile({
                        id: null,
                        email: contextUser.email,
                        name: 'Guest',
                    });
                }
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        fetchUserData();
    }, [contextUser, navigate]);

    const handleUpdateProfile = async (updates) => {
        setUserProfile(prev => ({ ...prev, ...updates }));
        try {
            // Uses the imported 'supabase' instance
            await supabase.from('users').update(updates).eq('email', userProfile.email);
        } catch (err) {
            console.error('Save failed', err);
        }
    };

    const toggleNotification = (key) => {
        setNotifSettings(prev => ({ ...prev, [key]: !prev[key] }));
    };

    const renderModal = () => {
        if (!activeModal) return null;
        const commonProps = { onClose: () => setActiveModal(null) };

        switch (activeModal) {
            case 'accountInfo':
                return <AccountInfoModal {...commonProps} user={userProfile} onUpdate={handleUpdateProfile} />;
            case 'security':
                return <ChangePasswordModal {...commonProps} />;
            case 'notifications':
                return <NotificationSettingsModal {...commonProps} settings={notifSettings} onToggle={toggleNotification} />;
            case 'payment':
                return <PaymentMethodsModal {...commonProps} />;
            case 'language':
                return <LanguageModal {...commonProps} currentLang={language} setLang={setLanguage} />;
            case 'help':
                return <HelpCenterModal {...commonProps} />;
            case 'bookingHistory':
                // Passing the correct user ID (which should be an integer)
                return <BookingHistoryModal {...commonProps} userId={userProfile.id} />;
            case 'subscription':
                return (
                    <BaseModal title="Subscription" onClose={() => setActiveModal(null)}>
                        <div style={{background: 'linear-gradient(135deg, #facc15 0%, #eab308 100%)', borderRadius:'12px', padding:'20px', color:'black', marginBottom:'20px'}}>
                            <h3 style={{fontSize:'1.5rem', fontWeight:'800'}}>Premium Member</h3>
                            <p>Next billing date: Dec 20, 2025</p>
                        </div>
                        <SettingsListItem icon={CreditCard} title="Update Payment Method" subtitle="Visa **** 4567" />
                        <button className="secondary-modal-btn" style={{marginTop:'10px', width:'100%', borderColor:'#ef4444', color:'#ef4444'}}>Cancel Subscription</button>
                    </BaseModal>
                )
            default: return null;
        }
    };

    if (loading) return <div className="settings-loading">Loading...</div>;

    const userInitial = userProfile.name ? userProfile.name.charAt(0).toUpperCase() : (contextUser.email ? contextUser.email.charAt(0).toUpperCase() : 'U');

    return (
        <div className="settings-page" data-theme={theme}>
            <div className="settings-container">
                <div className="settings-header-group">
                    <button onClick={() => navigate(-1)} className="settings-back-btn">
                        <ArrowLeft size={18} /> Back
                    </button>
                    <h1 className="settings-title">Settings</h1>
                </div>

                <div className="profile-section">
                    <div className="profile-avatar-large">{userInitial}</div>
                    <div className="profile-info">
                        <h2>{userProfile.name || 'Movie Buff'}</h2>
                        <p>{userProfile.email}</p>
                        <span className="profile-badge">Premium Member</span>
                    </div>
                </div>

                <div className="settings-grid">
                    <div className="settings-card">
                        <div className="card-header">Account</div>
                        <SettingsListItem
                            icon={User} title="Personal Info" subtitle="Name, City"
                            onClick={() => setActiveModal('accountInfo')}
                        />
                        <SettingsListItem
                            icon={Lock} title="Security" subtitle="Password, 2FA"
                            onClick={() => setActiveModal('security')}
                        />
                        <SettingsListItem
                            icon={Globe} title="Language & Region" subtitle={language === 'en' ? 'English (US)' : 'Changed'}
                            onClick={() => setActiveModal('language')}
                        />
                    </div>

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

                        <SettingsListItem
                            icon={Bell} title="Notifications" subtitle="Email, Push"
                            onClick={() => setActiveModal('notifications')}
                        />
                        <SettingsListItem
                            icon={Ticket} title="My Subscription" subtitle="Manage plan"
                            onClick={() => setActiveModal('subscription')}
                        />
                    </div>

                    <div className="settings-card">
                        <div className="card-header">Wallet & Support</div>
                        <SettingsListItem
                            icon={CreditCard} title="Payment Methods" subtitle="Visa, Mastercard"
                            onClick={() => setActiveModal('payment')}
                        />
                        <SettingsListItem
                            icon={Calendar} title="Booking History" subtitle="View tickets"
                            onClick={() => setActiveModal('bookingHistory')}
                        />
                        <SettingsListItem
                            icon={HelpCircle} title="Help Center" subtitle="FAQ, Contact Us"
                            onClick={() => setActiveModal('help')}
                        />

                        <div style={{marginTop: 'auto', paddingTop: '15px', borderTop:'1px solid var(--border-color)'}}>
                            <SettingsListItem
                                icon={LogOut} title="Log Out" subtitle="Sign out of device"
                                onClick={logout} isDanger={true} rightElement={<span></span>}
                            />
                        </div>
                    </div>
                </div>

            </div>
            {renderModal()}
        </div>
    );
};

export default SettingsPage;