// src/components/DifficultySelector.jsx
import { useRef, useState } from 'react';
import './DifficultySelector.css';

const DIFFICULTY_OPTIONS = [
  { id: 'facile',    label: 'Facile',    icon: '😌', sub: 'Tableau commun' },
  { id: 'moyen',     label: 'Moyen',     icon: '🙂', sub: 'Tableau commun' },
  { id: 'complique', label: 'Compliqué', icon: '😬', sub: 'Tableau rare' },
  { id: 'enfer',     label: 'Enfer',     icon: '🔥', sub: 'Tableau légendaire' }
];

// Écran principal : 3 vignettes homogènes
function HomeScreen({ onPick }) {
  return (
    <div className="ds-home">
      <div className="ds-logo-block">
        <h1 className="ds-title">Sudoku Art</h1>
        <p className="ds-subtitle">Résous la grille, révèle une œuvre d'art</p>
      </div>

      <div className="ds-cards">
        <button className="ds-card" onClick={() => onPick('paintings')}>
          <span className="ds-card-icon">🖼️</span>
          <span className="ds-card-label">Tableau</span>
          <span className="ds-card-desc">Découvre une grande œuvre cachée derrière ta grille</span>
        </button>

        <button className="ds-card" onClick={() => onPick('photo')}>
          <span className="ds-card-icon">📷</span>
          <span className="ds-card-label">Ma photo</span>
          <span className="ds-card-desc">Utilise l'une de tes photos comme fond à dévoiler</span>
        </button>

        <button className="ds-card" onClick={() => onPick('challenge')}>
          <span className="ds-card-icon">🎯</span>
          <span className="ds-card-label">Défi</span>
          <span className="ds-card-desc">Joue puis envoie la même grille à un ami — qui gagne ?</span>
        </button>
      </div>
    </div>
  );
}

// Sous-écran : choix de la difficulté (tableau ou photo)
function DifficultyScreen({ title, customImage, onSelectDifficulty, onBack }) {
  return (
    <div className="ds-sub">
      <button className="ds-back" onClick={onBack}>← Retour</button>
      <p className="ds-sub-title">{title}</p>
      {customImage && (
        <img className="ds-photo-preview" src={customImage} alt="Ta photo" />
      )}
      <div className="difficulty-grid">
        {DIFFICULTY_OPTIONS.map(opt => (
          <button
            key={opt.id}
            className={`difficulty-card difficulty-${opt.id}`}
            onClick={() => onSelectDifficulty(opt.id)}
          >
            <span className="difficulty-icon">{opt.icon}</span>
            <span className="difficulty-label">{opt.label}</span>
            <span className="difficulty-tier">{opt.sub}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

// Sous-écran : photo perso — d'abord choisir la photo, puis la difficulté
function PhotoScreen({ onSelectDifficulty, onBack }) {
  const [customImage, setCustomImage] = useState(null);
  const fileInputRef = useRef(null);

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (customImage) URL.revokeObjectURL(customImage);
    setCustomImage(URL.createObjectURL(file));
  };

  if (customImage) {
    return (
      <DifficultyScreen
        title="Choisis la difficulté"
        customImage={customImage}
        onSelectDifficulty={(diff) => onSelectDifficulty(diff, customImage)}
        onBack={() => { URL.revokeObjectURL(customImage); setCustomImage(null); }}
      />
    );
  }

  return (
    <div className="ds-sub">
      <button className="ds-back" onClick={onBack}>← Retour</button>
      <p className="ds-sub-title">Choisis une photo</p>
      <p className="ds-sub-desc">Elle se révèlera au fur et à mesure que tu remplis la grille.</p>
      <button className="ds-photo-pick-btn" onClick={() => fileInputRef.current?.click()}>
        📷 Choisir depuis ma galerie
      </button>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        style={{ display: 'none' }}
      />
    </div>
  );
}

// Sous-écran : défi
function ChallengeScreen({ onRequestSendChallenge, onBack }) {
  return (
    <div className="ds-sub">
      <button className="ds-back" onClick={onBack}>← Retour</button>
      <p className="ds-sub-title">Défi entre amis</p>
      <p className="ds-sub-desc">
        Termine une grille, puis envoie-la à un ami via WhatsApp.
        Il joue exactement la même grille — on compare les scores et on désigne le gagnant !
      </p>
      <div className="ds-challenge-steps">
        <div className="ds-step"><span>1</span> Joue et termine une grille</div>
        <div className="ds-step"><span>2</span> Envoie-la à un ami</div>
        <div className="ds-step"><span>3</span> Comparez vos scores</div>
      </div>
      <button className="send-challenge-btn" onClick={onRequestSendChallenge}>
        Commencer maintenant
      </button>
      <p className="send-challenge-note">Connexion requise pour cette option</p>
    </div>
  );
}

export default function DifficultySelector({ onSelect, onRequestSendChallenge }) {
  const [screen, setScreen] = useState('home'); // 'home' | 'paintings' | 'photo' | 'challenge'

  if (screen === 'paintings') {
    return (
      <DifficultyScreen
        title="Choisis la difficulté"
        onSelectDifficulty={(diff) => onSelect(diff, null)}
        onBack={() => setScreen('home')}
      />
    );
  }

  if (screen === 'photo') {
    return (
      <PhotoScreen
        onSelectDifficulty={(diff, img) => onSelect(diff, img)}
        onBack={() => setScreen('home')}
      />
    );
  }

  if (screen === 'challenge') {
    return (
      <ChallengeScreen
        onRequestSendChallenge={onRequestSendChallenge}
        onBack={() => setScreen('home')}
      />
    );
  }

  return <HomeScreen onPick={setScreen} />;
}
