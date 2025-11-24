import { useState } from 'react';
import axios from 'axios';
import API_URL from '../config';

const RegistrationForm = () => {
    const [formData, setFormData] = useState({
        name: '',
        phone: '',
        job: '',
        jobLocation: '',
        address: '',
        circle: ''
    });
    const [paymentScreenshot, setPaymentScreenshot] = useState(null);
    const [previewUrl, setPreviewUrl] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
        setError('');
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            // Check file size (max 5MB)
            if (file.size > 5 * 1024 * 1024) {
                setError('File size must be less than 5MB');
                return;
            }

            // Check file type
            if (!file.type.startsWith('image/')) {
                setError('Please upload an image file');
                return;
            }

            setPaymentScreenshot(file);

            // Create preview URL
            const reader = new FileReader();
            reader.onloadend = () => {
                setPreviewUrl(reader.result);
            };
            reader.readAsDataURL(file);
            setError('');
        }
    };

    const handlePayment = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        // Validate form
        if (!formData.name || !formData.phone || !formData.job ||
            !formData.jobLocation || !formData.address || !formData.circle) {
            setError('Please fill all fields');
            setLoading(false);
            return;
        }

        if (!paymentScreenshot) {
            setError('Please upload payment screenshot');
            setLoading(false);
            return;
        }

        try {
            // For demo purposes, we'll create a mock payment ID
            // In a real app, this would come from the payment gateway integration
            const mockPaymentId = 'PAY' + Date.now();

            // Convert image to base64
            const reader = new FileReader();
            reader.readAsDataURL(paymentScreenshot);
            reader.onloadend = async () => {
                const base64Image = reader.result;

                // Submit registration
                const response = await axios.post(`${API_URL}/api/registration/submit`, {
                    ...formData,
                    paymentId: mockPaymentId,
                    paymentScreenshot: base64Image
                });

                if (response.data.success) {
                    setSuccess(true);
                    setFormData({
                        name: '',
                        phone: '',
                        job: '',
                        jobLocation: '',
                        address: '',
                        circle: ''
                    });
                    setPaymentScreenshot(null);
                    setPreviewUrl(null);

                    // Show success message for 5 seconds
                    setTimeout(() => setSuccess(false), 5000);
                }
                setLoading(false);
            };
        } catch (err) {
            setError(err.response?.data?.message || 'Registration failed. Please try again.');
            setLoading(false);
        }
    };

    return (
        <div className="registration-container">
            <div className="registration-card">
                <div className="registration-header">
                    <h1>Registration Form</h1>
                    <p>സമസ്ത പണ്ഡിത സമ്മേളനം</p>
                </div>

                {success && (
                    <div className="success-message" style={{
                        background: '#dcfce7',
                        color: '#166534',
                        padding: '16px',
                        borderRadius: '8px',
                        marginBottom: '20px',
                        textAlign: 'center',
                        border: '1px solid #bbf7d0'
                    }}>
                        Registration successful! Jazakallah Khair.
                    </div>
                )}

                {error && <div className="error-message">{error}</div>}

                <form onSubmit={handlePayment} className="registration-form">
                    <div className="form-group">
                        <label htmlFor="name">പേര് (Name) *</label>
                        <input
                            type="text"
                            id="name"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            placeholder="Enter your name"
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="phone">ഫോൺ നമ്പർ (Phone) *</label>
                        <input
                            type="tel"
                            id="phone"
                            name="phone"
                            value={formData.phone}
                            onChange={handleChange}
                            placeholder="Enter your phone number"
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="job">ജോലി (Job) *</label>
                        <input
                            type="text"
                            id="job"
                            name="job"
                            value={formData.job}
                            onChange={handleChange}
                            placeholder="Enter your job"
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="jobLocation">ജോലി സ്ഥലം (Job Location) *</label>
                        <input
                            type="text"
                            id="jobLocation"
                            name="jobLocation"
                            value={formData.jobLocation}
                            onChange={handleChange}
                            placeholder="Enter your job location"
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="address">വാസ സ്ഥലം (Address) *</label>
                        <textarea
                            id="address"
                            name="address"
                            value={formData.address}
                            onChange={handleChange}
                            placeholder="Enter your address"
                            rows="3"
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="circle">സർക്കിൾ (Circle) *</label>
                        <input
                            type="text"
                            id="circle"
                            name="circle"
                            value={formData.circle}
                            onChange={handleChange}
                            placeholder="Enter circle name"
                            required
                        />
                    </div>

                    <div className="payment-info-box">
                        <h3>Registration Fee</h3>
                        <div className="payment-amount">₹100</div>
                        <div className="payment-phone">9946608985</div>

                        <a href="upi://pay?pa=9946608985@upi&pn=Jamal%20Ustha&am=100&cu=INR" className="upi-payment-button">
                            Pay Now via UPI
                        </a>

                        <p className="payment-instruction">
                            Pay via GPay, PhonePe, or Paytm to the number above.
                            Take a screenshot and upload it below.
                        </p>
                    </div>

                    <div className="form-group">
                        <label htmlFor="paymentScreenshot">Payment Screenshot *</label>
                        <input
                            type="file"
                            id="paymentScreenshot"
                            accept="image/*"
                            onChange={handleFileChange}
                            required
                        />
                        {previewUrl && (
                            <div className="image-preview">
                                <img src={previewUrl} alt="Payment Preview" />
                            </div>
                        )}
                    </div>

                    <button
                        type="submit"
                        className="submit-button"
                        disabled={loading}
                    >
                        {loading ? 'Processing...' : 'Submit Registration'}
                    </button>

                    <div className="admin-link">
                        <a href="/admin/login">Admin Login</a>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default RegistrationForm;
