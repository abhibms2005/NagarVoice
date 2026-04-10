import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../services/issueService';
import { wardsList } from '../data/categories';
import './Register.css';

export default function Register() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: '',
    phone: '',
    email: '',
    ward: '',
    area: '',
    address: '',
    pincode: '',
    resident: false,
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const updateField = (key, value) => {
    setForm(prev => ({ ...prev, [key]: value }));
    setError('');
  };

  const validate = () => {
    if (form.name.trim().length < 3) return 'Please enter your full name.';
    if (!/^\d{10}$/.test(form.phone)) return 'Enter a valid 10-digit mobile number.';
    if (!form.ward) return 'Please select your Bengaluru ward.';
    if (form.area.trim().length < 3) return 'Please enter your locality/area.';
    if (form.address.trim().length < 8) return 'Please enter your complete Bengaluru address.';
    if (!/^\d{6}$/.test(form.pincode)) return 'Please enter a valid 6-digit pincode.';
    if (!form.pincode.startsWith('56')) return 'Only Bengaluru residents are allowed (pincode should start with 56).';
    if (!form.resident) return 'Please confirm that you currently reside in Bengaluru.';
    return '';
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }

    setSubmitting(true);
    try {
      authService.registerCitizen({
        name: form.name,
        phone: form.phone,
        email: form.email,
        ward: form.ward,
        area: form.area,
        address: form.address,
        pincode: form.pincode,
      });
      setSuccess('Registration successful. Please verify OTP to login.');
      setTimeout(() => {
        navigate('/login', { replace: true, state: { phone: form.phone } });
      }, 900);
    } catch (err) {
      setError(err?.message || 'Unable to register right now. Please try again.');
      setSubmitting(false);
    }
  };

  return (
    <div className="register-page">
      <div className="register-hero hero-gradient">
        <h1 className="register-title">Create Citizen Account</h1>
        <p className="register-subtitle">For residents currently living in Bengaluru</p>
      </div>

      <form className="register-form" onSubmit={handleSubmit}>
        <div className="register-grid">
          <div className="input-group">
            <label>Full Name</label>
            <input
              className="input-field"
              value={form.name}
              onChange={e => updateField('name', e.target.value)}
              placeholder="Enter your full name"
            />
          </div>

          <div className="input-group">
            <label>Mobile Number</label>
            <div className="phone-row">
              <span className="phone-prefix">+91</span>
              <input
                className="input-field phone-input"
                value={form.phone}
                onChange={e => updateField('phone', e.target.value.replace(/\D/g, ''))}
                maxLength={10}
                placeholder="10-digit number"
              />
            </div>
          </div>

          <div className="input-group">
            <label>Email (optional)</label>
            <input
              className="input-field"
              type="email"
              value={form.email}
              onChange={e => updateField('email', e.target.value)}
              placeholder="name@example.com"
            />
          </div>

          <div className="input-group">
            <label>Ward</label>
            <select
              className="input-field"
              value={form.ward}
              onChange={e => updateField('ward', e.target.value)}
            >
              <option value="">Select your ward</option>
              {wardsList.map(ward => (
                <option key={ward} value={ward}>{ward}</option>
              ))}
            </select>
          </div>

          <div className="input-group">
            <label>Area / Locality</label>
            <input
              className="input-field"
              value={form.area}
              onChange={e => updateField('area', e.target.value)}
              placeholder="e.g. 2nd Stage, Indiranagar"
            />
          </div>

          <div className="input-group">
            <label>Bengaluru Pincode</label>
            <input
              className="input-field"
              value={form.pincode}
              onChange={e => updateField('pincode', e.target.value.replace(/\D/g, ''))}
              maxLength={6}
              placeholder="5600XX"
            />
          </div>

          <div className="input-group input-group-full">
            <label>Residential Address</label>
            <textarea
              className="input-field"
              rows={3}
              value={form.address}
              onChange={e => updateField('address', e.target.value)}
              placeholder="House/flat, street, landmark"
            />
          </div>

          <label className="resident-check input-group-full">
            <input
              type="checkbox"
              checked={form.resident}
              onChange={e => updateField('resident', e.target.checked)}
            />
            <span>I confirm that I currently reside in Bengaluru and the details are correct.</span>
          </label>
        </div>

        {error && <p className="register-error">{error}</p>}
        {success && <p className="register-success">{success}</p>}

        <div className="register-actions">
          <button type="button" className="btn btn-secondary" onClick={() => navigate('/login')}>← Back to Login</button>
          <button type="submit" className="btn btn-primary" disabled={submitting}>
            {submitting ? 'Creating account...' : 'Create Account'}
          </button>
        </div>
      </form>
    </div>
  );
}
