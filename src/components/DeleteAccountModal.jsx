import { useT } from '../i18n/index.jsx';
// src/components/DeleteAccountModal.jsx
import { useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import './LegalModal.css';

export default function DeleteAccountModal({ onClose, onDeleted }) {
  const { t } = useT();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleDelete = async () => {
    setLoading(true);
    setError(null);
    try {
      // Supprimer les données utilisateur via edge function
      // (Supabase ne permet pas à un client de supprimer son propre auth.user
      // directement — il faut une edge function ou un admin API call)
      const { error: fnError } = await supabase.functions.invoke('delete-account');
      if (fnError) throw fnError;
      onDeleted();
    } catch (err) {
      setError("Une erreur s'est produite. Réessaie dans un instant.");
      setLoading(false);
    }
  };

  return (
    <div className="legal-overlay" onClick={onClose}>
      <div className="legal-panel" onClick={e => e.stopPropagation()} style={{ maxWidth: 400 }}>
        <div className="legal-header">
          <h2>{t('del_title')}</h2>
          <button className="legal-close" onClick={onClose}>✕</button>
        </div>

        {step === 1 && (
          <>
            <p style={{ fontSize: '0.88rem', lineHeight: 1.5 }}>
              {t('del_warning')}
            </p>
            <ul>
              <li>{t('del_item1')}</li>
              <li>{t('del_item2')}</li>
              <li>{t('del_item3')}</li>
              <li>{t('del_item4')}</li>
            </ul>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>
              {t('del_note')}
            </p>
            <div style={{ display: 'flex', gap: 8, marginTop: 16 }}>
              <button className="legal-consent-reject" onClick={onClose}>{t('del_cancel')}</button>
              <button
                style={{ flex:1, padding:'10px', borderRadius:'10px', border:'none', background:'#D32F2F', color:'#fff', fontWeight:700, cursor:'pointer' }}
                onClick={() => setStep(2)}
              >
                Supprimer quand même
              </button>
            </div>
          </>
        )}

        {step === 2 && (
          <>
            <p style={{ fontSize: '0.88rem', lineHeight: 1.5, marginBottom: 16 }}>
              {t('del_final')} Cette action ne peut pas être annulée.
            </p>
            {error && <p style={{ color: '#D32F2F', fontSize: '0.82rem' }}>{error}</p>}
            <div style={{ display: 'flex', gap: 8 }}>
              <button className="legal-consent-reject" onClick={onClose} disabled={loading}>{t('del_cancel')}</button>
              <button
                style={{ flex:1, padding:'10px', borderRadius:'10px', border:'none', background: loading ? '#aaa' : '#D32F2F', color:'#fff', fontWeight:700, cursor: loading ? 'default' : 'pointer' }}
                onClick={handleDelete}
                disabled={loading}
              >
                {loading ? t('del_deleting') : 'Oui, supprimer mon compte'}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
