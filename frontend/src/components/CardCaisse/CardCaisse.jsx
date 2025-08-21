import React, { useState, useEffect } from 'react';
import NationalSimulator from './NationalSimulator';
import RegionalSimulator from './RegionalSimulator';
import ClotureMensuelle from './ClotureMensuelle';
import ConfigurationManager from './ConfigurationManager';
import DepenseManager from './DepenseManager';
import ExpenseSummary from './ExpenseSummary';
import ExpenseManagementDisplay from './ExpenseManagementDisplay';
import { 
    FaCashRegister, 
    FaCalculator, 
    FaCalendarAlt, 
    FaChartLine, 
    FaUsers, 
    FaCog, 
    FaMoneyBillWave, 
    FaHome,
    FaBars,
    FaTimes,
    FaChevronRight,
    FaBell,
    FaSearch,
    FaAngleRight,
    FaArrowLeft
} from 'react-icons/fa';
import './CardCaisse.css';

const CardCaisse = ({ initialMenu }) => {
    // États pour la gestion du sidebar
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const [isMobile, setIsMobile] = useState(false);
    const [isCollapsed, setIsCollapsed] = useState(false);
    
    // Charger l'état initial depuis localStorage ou utiliser des valeurs par défaut
    const [activeMenu, setActiveMenu] = useState(() => {
        if (initialMenu) {
            return initialMenu;
        }
        return localStorage.getItem('cardCaisse_activeMenu') || 'national';
    });
    const [periode, setPeriode] = useState(() => {
        return localStorage.getItem('cardCaisse_periode') || 'matin';
    });

    // Détecter la taille de l'écran
    useEffect(() => {
        const checkScreenSize = () => {
            const width = window.innerWidth;
            setIsMobile(width < 1024);
            if (width < 1024) {
                setIsSidebarOpen(false);
                setIsCollapsed(false);
            } else {
                setIsSidebarOpen(true);
                setIsCollapsed(false);
            }
        };

        checkScreenSize();
        window.addEventListener('resize', checkScreenSize);
        return () => window.removeEventListener('resize', checkScreenSize);
    }, []);

    // Sauvegarder l'état dans localStorage
    useEffect(() => {
        localStorage.setItem('cardCaisse_activeMenu', activeMenu);
    }, [activeMenu]);

    useEffect(() => {
        localStorage.setItem('cardCaisse_periode', periode);
    }, [periode]);

    const handleMenuSelect = (menu) => {
        setActiveMenu(menu);
        if (isMobile) {
            setIsSidebarOpen(false);
        }
    };

    const toggleSidebar = () => {
        if (isMobile) {
            setIsSidebarOpen(!isSidebarOpen);
        } else {
            setIsCollapsed(!isCollapsed);
        }
    };

    const menuItems = [
        {
            id: 'national',
            icon: FaCalculator,
            label: 'Simulateur National',
            description: 'TNR/A-BE',
            color: 'blue',
            badge: 'Nouveau'
        },
        {
            id: 'regional',
            icon: FaCalculator,
            label: 'Simulateur Régional',
            description: 'Manakara',
            color: 'blue'
        },
        {
            id: 'cloture_mensuelle',
            icon: FaCalendarAlt,
            label: 'Clôture Mensuelle',
            description: 'Gestion des clôtures',
            color: 'blue',
            badge: 'Important'
        },
        {
            id: 'depenses',
            icon: FaMoneyBillWave,
            label: 'Gestion Dépenses',
            description: 'Suivi des dépenses',
            color: 'blue'
        },
        {
            id: 'expense_management',
            icon: FaChartLine,
            label: 'Analyse Complète',
            description: 'Gestion avancée',
            color: 'blue',
            badge: 'Pro'
        },
        {
            id: 'configuration',
            icon: FaCog,
            label: 'Configuration',
            description: 'Paramètres système',
            color: 'blue'
        }
    ];

    return (
        <div className="card-caisse-container">
            {/* Bouton toggle amélioré style DeepSeek */}
            <button 
                onClick={toggleSidebar}
                className={`sidebar-toggle-btn ${isSidebarOpen ? 'active' : ''} ${isCollapsed ? 'collapsed' : ''}`}
                aria-label="Toggle sidebar"
            >
                <div className="toggle-icon">
                    {isMobile ? (
                        isSidebarOpen ? <FaTimes /> : <FaBars />
                    ) : (
                        <FaAngleRight className={`toggle-arrow ${isCollapsed ? 'rotated' : ''}`} />
                    )}
                </div>
            </button>

            {/* Overlay pour mobile */}
            {isMobile && isSidebarOpen && (
                <div 
                    className="sidebar-overlay"
                    onClick={() => setIsSidebarOpen(false)}
                />
            )}

            {/* Sidebar unifié compact */}
            <div className={`sidebar-unified ${isSidebarOpen ? 'sidebar-open' : 'sidebar-closed'} ${isCollapsed ? 'sidebar-collapsed' : ''}`}>
                {/* En-tête du sidebar */}
                <div className="sidebar-header">
                    <div className="header-content">
                        <div className="icon-container">
                            <FaCashRegister className="text-xl text-white" />
                        </div>
                        {!isCollapsed && (
                            <div className="header-text">
                                <h2 className="title">CAISSE</h2>
                                <p className="subtitle">Gestion financière</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Bouton retour au dashboard */}
                <div className="return-dashboard-section">
                    <button 
                        onClick={() => window.location.href = '/'}
                        className="return-dashboard-btn"
                        title={isCollapsed ? "Retour au dashboard" : undefined}
                    >
                        <div className="return-icon">
                            <FaArrowLeft className="text-lg" />
                        </div>
                        {!isCollapsed && (
                            <span className="return-text">Retour au Dashboard</span>
                        )}
                    </button>
                </div>

                {/* Sélecteur de période compact */}
                {!isCollapsed && (
                    <div className="period-selector">
                        <label className="period-label">Période</label>
                        <div className="period-buttons">
                            <button 
                                className={`period-btn ${periode === 'matin' ? 'active' : ''}`}
                                onClick={() => setPeriode('matin')}
                            >
                                <span className="period-icon">🌅</span>
                                <span className="period-text">Matin</span>
                            </button>
                            <button 
                                className={`period-btn ${periode === 'soir' ? 'active' : ''}`}
                                onClick={() => setPeriode('soir')}
                            >
                                <span className="period-icon">🌙</span>
                                <span className="period-text">Soir</span>
                            </button>
                        </div>
                    </div>
                )}

                {/* Menu de navigation compact */}
                <nav className="sidebar-nav">
                    {!isCollapsed && (
                        <div className="nav-header">
                            <h3 className="nav-title">Navigation</h3>
                            <div className="nav-search">
                                <FaSearch className="search-icon" />
                                <input 
                                    type="text" 
                                    placeholder="Rechercher..." 
                                    className="search-input"
                                />
                            </div>
                        </div>
                    )}
                    
                    <ul className="nav-menu">
                        {menuItems.map((item) => {
                            const IconComponent = item.icon;
                            const isActive = activeMenu === item.id;
                            return (
                                <li key={item.id} className="nav-item">
                                    <button
                                        onClick={() => handleMenuSelect(item.id)}
                                        className={`nav-button ${isActive ? 'active' : ''}`}
                                        title={isCollapsed ? item.label : undefined}
                                    >
                                        <div className="nav-icon">
                                            <IconComponent className="text-lg" />
                                        </div>
                                        {!isCollapsed && (
                                            <>
                                                <div className="nav-content">
                                                    <div className="nav-label">
                                                        {item.label}
                                                        {item.badge && (
                                                            <span className={`nav-badge badge-${item.color}`}>
                                                                {item.badge}
                                                            </span>
                                                        )}
                                                    </div>
                                                    <div className="nav-description">
                                                        {item.description}
                                                    </div>
                                                </div>
                                                <FaChevronRight className="nav-arrow" />
                                            </>
                                        )}
                                    </button>
                                </li>
                            );
                        })}
                    </ul>
                </nav>

                {/* Section statistiques compacte */}
                {!isCollapsed && (
                    <div className="stats-section">
                        <div className="stats-container">
                            <div className="stats-header">
                                <h3 className="stats-title">📊 Aujourd'hui</h3>
                                <FaBell className="stats-notification" />
                            </div>
                            <div className="stats-grid">
                                <div className="stat-item">
                                    <div className="stat-icon">💰</div>
                                    <div className="stat-info">
                                        <span className="stat-label">Transactions</span>
                                        <span className="stat-value">24</span>
                                    </div>
                                </div>
                                <div className="stat-item">
                                    <div className="stat-icon">📈</div>
                                    <div className="stat-info">
                                        <span className="stat-label">Montant</span>
                                        <span className="stat-value">2.4M Ar</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Section raccourcis compacte */}
                {!isCollapsed && (
                    <div className="shortcuts-section">
                        <h3 className="shortcuts-title">Raccourcis</h3>
                        <div className="shortcuts-grid">
                            <button className="shortcut-button">
                                <FaUsers className="shortcut-icon" />
                                <span>Clients en attente</span>
                            </button>
                            <button className="shortcut-button">
                                <FaCog className="shortcut-icon" />
                                <span>Paramètres</span>
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* Contenu principal */}
            <div className={`main-content ${!isSidebarOpen ? 'content-expanded' : ''} ${isCollapsed ? 'content-with-collapsed-sidebar' : ''}`}>
                {/* Header du contenu */}
                <div className="content-header">
                    <div className="content-title">
                        <h1 className="page-title">
                            {menuItems.find(item => item.id === activeMenu)?.label || 'Tableau de bord'}
                        </h1>
                        <p className="page-subtitle">
                            {menuItems.find(item => item.id === activeMenu)?.description || 'Gestion de la caisse'}
                        </p>
                    </div>
                    <div className="content-actions">
                        <div className="period-display">
                            <span className="period-label">Période:</span>
                            <span className={`period-value period-${periode}`}>
                                {periode === 'matin' ? '🌅 Matin' : '🌙 Soir'}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Contenu dynamique */}
                <div className="content-body">
                    {activeMenu === 'national' && (
                        <div className="national-layout">
                            <div className="simulator-section">
                                <div className="content-card">
                                    <NationalSimulator periode={periode} />
                                </div>
                            </div>
                            <div className="summary-section">
                                <div className="content-card">
                                    <ExpenseSummary />
                                </div>
                            </div>
                        </div>
                    )}
                    {activeMenu === 'regional' && (
                        <div className="content-card">
                            <RegionalSimulator periode={periode} />
                        </div>
                    )}
                    {activeMenu === 'cloture_mensuelle' && (
                        <div className="content-card">
                            <ClotureMensuelle />
                        </div>
                    )}
                    {activeMenu === 'configuration' && (
                        <div className="content-card">
                            <ConfigurationManager />
                        </div>
                    )}
                    {activeMenu === 'depenses' && (
                        <div className="content-card">
                            <DepenseManager />
                        </div>
                    )}
                    {activeMenu === 'expense_management' && (
                        <div className="content-card">
                            <ExpenseManagementDisplay />
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default CardCaisse;
