// src/components/DeleteAccountModal.jsx
import { useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import './LegalModal.css';

export default function DeleteAccountModal({ onClose, onDeleted }) {
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
          <h2>Supprimer mon compte</h2>
          <button className="legal-close" onClick={onClose}>✕</button>
        </div>

        {step === 1 && (
          <>
            <p style={{ fontSize: '0.88rem', lineHeight: 1.5 }}>
              Cette action est <strong>irréversible</strong>. Seront supprimés définitivement :
            </p>
            <ul>
              <li>Ton adresse email et tes identifiants</li>
              <li>Ta galerie de tableaux débloqués</li>
              <li>Ta progression (vues, statistiques)</li>
              <li>Tous les défis que tu as envoyés ou reçus</li>
            </ul>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>
              Les photos uploadées dans les défis sont déjà supprimées automatiquement après 7 jours.
            </p>
            <div style={{ display: 'flex', gap: 8, marginTop: 16 }}>
              <button className="legal-consent-reject" onClick={onClose}>Annuler</button>
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
              Dernière confirmation : tu vas supprimer définitivement ton compte Sudoku Art. Cette action ne peut pas être annulée.
            </p>
            {error && <p style={{ color: '#D32F2F', fontSize: '0.82rem' }}>{error}</p>}
            <div style={{ display: 'flex', gap: 8 }}>
              <button className="legal-consent-reject" onClick={onClose} disabled={loading}>Annuler</button>
              <button
                style={{ flex:1, padding:'10px', borderRadius:'10px', border:'none', background: loading ? '#aaa' : '#D32F2F', color:'#fff', fontWeight:700, cursor: loading ? 'default' : 'pointer' }}
                onClick={handleDelete}
                disabled={loading}
              >
                {loading ? 'Suppression…' : 'Oui, supprimer mon compte'}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
