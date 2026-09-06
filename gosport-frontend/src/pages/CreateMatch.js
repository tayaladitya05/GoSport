import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../utils/api';

export default function CreateMatch() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    matchName: '', sportType: 'cricket', venue: '', matchDate: '', matchTime: '',
    team1: '', team2: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const today = new Date().toLocaleDateString('en-CA');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(''); setLoading(true);
    try {
      const kickoff = new Date(`${form.matchDate}T${form.matchTime}`);
      if (Number.isNaN(kickoff.getTime())) {
        setError('Please choose a valid date and start time');
        setLoading(false);
        return;
      }
      if (kickoff.getTime() < Date.now()) {
        setError('Match start time cannot be in the past');
        setLoading(false);
        return;
      }
      await api.post('/matches', {
        matchName: form.matchName,
        sportType: form.sportType,
        venue: form.venue,
        matchDate: kickoff.toISOString(),
        teams: [form.team1, form.team2].filter(Boolean),
      });
      navigate('/matches');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create match');
    } finally { setLoading(false); }
  };

  return (
    <div className="container page-fade" style={{ paddingTop: 36, paddingBottom: 60 }}>
      <Link to="/matches" style={{ color: 'var(--text-muted)', fontSize: 13, fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: 4, marginBottom: 24 }}>
        ← Back
      </Link>
      <h2 className="section-title" style={{ marginBottom: 4 }}>Create Match</h2>
      <p className="section-sub">Set up a new cricket or football match</p>

      <div style={{ maxWidth: 560 }}>
        <div className="card">
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="label">Match Name</label>
              <input className="input" placeholder="e.g. Champions League Final" value={form.matchName} onChange={e => set('matchName', e.target.value)} required />
            </div>

            <div className="grid-2">
              <div className="form-group">
                <label className="label">Sport</label>
                <select className="select" value={form.sportType} onChange={e => set('sportType', e.target.value)}>
                  <option value="cricket">Cricket</option>
                  <option value="football">Football</option>
                </select>
              </div>
              <div className="form-group">
                <label className="label">Venue</label>
                <input className="input" placeholder="e.g. Wankhede Stadium" value={form.venue} onChange={e => set('venue', e.target.value)} required />
              </div>
            </div>

            <div className="grid-2">
              <div className="form-group">
                <label className="label">Match Date</label>
                <input className="input" type="date" min={today} value={form.matchDate} onChange={e => set('matchDate', e.target.value)} required />
              </div>
              <div className="form-group">
                <label className="label">Start Time</label>
                <input className="input" type="time" value={form.matchTime} onChange={e => set('matchTime', e.target.value)} required />
              </div>
            </div>
            <p style={{ color: 'var(--text-muted)', fontSize: 12, marginTop: -8, marginBottom: 16 }}>
              Status becomes live at this time, then completed 5 hours later.
            </p>

            <div className="divider" />
            <p style={{ color: 'var(--orange)', fontWeight: 700, fontSize: 13, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 16 }}>Teams</p>

            <div className="grid-2">
              <div className="form-group">
                <label className="label">Team 1</label>
                <input className="input" placeholder="Team Alpha" value={form.team1} onChange={e => set('team1', e.target.value)} required />
              </div>
              <div className="form-group">
                <label className="label">Team 2</label>
                <input className="input" placeholder="Team Beta" value={form.team2} onChange={e => set('team2', e.target.value)} required />
              </div>
            </div>

            {error && <p className="error-msg" style={{ marginBottom: 12 }}>{error}</p>}
            <button type="submit" className="btn btn-primary btn-full" disabled={loading}>
              {loading ? 'Creating...' : 'Create Match'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
