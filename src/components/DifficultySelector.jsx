// src/components/DifficultySelector.jsx
import { useRef, useState } from 'react';
import './DifficultySelector.css';

const OPTIONS = [
  { id: 'facile',    label: 'Facile',    icon: '😌', sub: 'Tableau commun' },
  { id: 'moyen',     label: 'Moyen',     icon: '🙂', sub: 'Tableau commun' },
  { id: 'complique', label: 'Compliqué', icon: '😬', sub: 'Tableau rare' },
  { id: 'enfer',     label: 'Enfer',     icon: '🔥', sub: 'Tableau légendaire' }
];

export default function DifficultySelector({ onSelect, onRequestSendChallenge }) {
  const [customImage, setCustomImage] = useState(null);
  const [customFile, setCustomFile]   = useState(null);
  const [activeSection, setActiveSection] = useState(null); // 'paintings' | 'photo' | 'challenge'
  const fileInputRef = useRef(null);

  const handlePickPhoto = () => fileInputRef.current?.click();

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (customImage) URL.revokeObjectURL(customImage);
    setCustomImage(URL.createObjectURL(file));
    setCustomFile(file);
    setActiveSection('photo');
  };

  const handleCancelCustom = () => {
    if (customImage) URL.revokeObjectURL(customImage);
    setCustomImage(null);
    setCustomFile(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
    setActiveSection(null);
  };

  return (
    <div className="difficulty-selector">
      <h1 className="ds-title">Sudoku Art</h1>
      <p className="ds-subtitle">Découvre un tableau célèbre en résolvant ta grille</p>

      {/* ─── SECTION 1 : Tableaux ───────────────────────────────── */}
      <div className={`ds-section ${activeSection === 'paintings' || !activeSection ? 'is-open' : 'is-collapsed'}`}>
        <button
          className="ds-section-header"
          onClick={() => setActiveSection(activeSection === 'paintings' ? null : 'paintings')}
        >
          <span>🖼️ Jouer avec un tableau</span>
          <span className="ds-section-chevron">{activeSection === 'paintings' ? '▲' : '▼'}</span>
        </button>
        {(activeSection === 'paintings' || !activeSection) && (
          <div className="difficulty-grid">
            {OPTIONS.map(opt => (
              <button
                key={opt.id}
                className={`difficulty-card difficulty-${opt.id}`}
                onClick={() => onSelect(opt.id, null)}
              >
                <span className="difficulty-icon">{opt.icon}</span>
                <span className="difficulty-label">{opt.label}</span>
                <span className="difficulty-tier">{opt.sub}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* ─── SECTION 2 : Photo personnelle ─────────────────────── */}
      <div className={`ds-section ${activeSection === 'photo' ? 'is-open' : 'is-collapsed'}`}>
        <button
          className="ds-section-header"
          onClick={() => {
            if (activeSection === 'photo') { setActiveSection(null); }
            else { setActiveSection('photo'); if (!customImage) handlePickPhoto(); }
          }}
        >
          <span>📷 Jouer avec ma photo</span>
          <span className="ds-section-chevron">{activeSection === 'photo' ? '▲' : '▼'}</span>
        </button>
        {activeSection === 'photo' && (
          <div className="ds-photo-section">
            {customImage ? (
              <>
                <img className="ds-photo-preview" src={customImage} alt="Photo choisie" />
                <p className="ds-photo-hint">Choisis la difficulté :</p>
                <div className="difficulty-grid">
                  {OPTIONS.map(opt => (
                    <button
                      key={opt.id}
                      className={`difficulty-card difficulty-${opt.id}`}
                      onClick={() => onSelect(opt.id, customImage)}
                    >
                      <span className="difficulty-icon">{opt.icon}</span>
                      <span className="difficulty-label">{opt.label}</span>
                    </button>
                  ))}
                </div>
                <button className="ds-photo-cancel" onClick={handleCancelCustom}>✕ Retirer la photo</button>
              </>
            ) : (
              <button className="ds-photo-pick-btn" onClick={handlePickPhoto}>
                📷 Choisir une photo
              </button>
            )}
            <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileChange} style={{ display: 'none' }} />
          </div>
        )}
      </div>

      {/* ─── SECTION 3 : Défi ───────────────────────────────────── */}
      <div className={`ds-section ${activeSection === 'challenge' ? 'is-open' : 'is-collapsed'}`}>
        <button
          className="ds-section-header"
          onClick={() => setActiveSection(activeSection === 'challenge' ? null : 'challenge')}
        >
          <span>🎯 Défier un ami</span>
          <span className="ds-section-chevron">{activeSection === 'challenge' ? '▲' : '▼'}</span>
        </button>
        {activeSection === 'challenge' && (
          <div className="ds-challenge-section">
            <p className="ds-challenge-desc">
              Joue une grille, puis envoie-la à un ami avec ton score.<br/>
              Il joue la même grille — on compare et on désigne le gagnant !
            </p>
            <button className="send-challenge-btn" onClick={onRequestSendChallenge}>
              Envoyer une grille maintenant
            </button>
            <p className="send-challenge-note">Connexion requise</p>
          </div>
        )}
      </div>
    </div>
  );
}
