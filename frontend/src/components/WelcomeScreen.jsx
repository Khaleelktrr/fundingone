import { useNavigate } from 'react-router-dom';

const WelcomeScreen = () => {
    const navigate = useNavigate();

    return (
        <div className="welcome-container">
            <div className="welcome-card">
                <div className="welcome-header">
                    <h1>സമസ്ത പണ്ഡിത സമ്മേളനം</h1>
                    <h2>കുമ്പള മേഖല</h2>
                </div>

                <div className="welcome-details">
                    <div className="detail-item">
                        <span className="icon">📅</span>
                        <p>16/12/2025</p>
                    </div>
                    <div className="detail-item">
                        <span className="icon">⏰</span>
                        <p>രാവിലെ 10:30 മുതൽ ഉച്ചയ്ക്ക് 2.30 വരേ</p>
                    </div>
                    <div className="detail-item">
                        <span className="icon">📍</span>
                        <p>ഊജം പദവ്</p>
                    </div>

                    <div className="detail-section">
                        <h3>വിഷയം:</h3>
                        <p className="highlight">ആധുനിക സാമ്പത്തിക വിനിമയം</p>
                    </div>

                    <div className="detail-section">
                        <h3>നേതൃത്വം:</h3>
                        <p className="leader-name">മുഹമ്മദ് അലി സഖാഫി തൃക്കരിപ്പൂർ ഉസ്താദ്</p>
                    </div>
                </div>

                <button
                    className="start-button"
                    onClick={() => navigate('/register')}
                >
                    ENTER
                </button>
            </div>
        </div>
    );
};

export default WelcomeScreen;
