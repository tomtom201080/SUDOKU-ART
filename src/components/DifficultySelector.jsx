// src/components/DifficultySelector.jsx
import { useRef, useState } from 'react';
import './DifficultySelector.css';

const DIFFICULTY_OPTIONS = [
  { id: 'facile',    label: 'Facile',    icon: '😌' },
  { id: 'moyen',     label: 'Moyen',     icon: '🙂' },
  { id: 'complique', label: 'Compliqué', icon: '😬' },
  { id: 'enfer',     label: 'Enfer',     icon: '🔥' }
];

// Écran principal : 4 vignettes en grille 2x2
function HomeScreen({ onPick, onOpenDefi }) {
  return (
    <div className="ds-home">
      <div className="ds-logo-block">
        <h1 className="ds-title">Sudoku Art</h1>
        <p className="ds-subtitle">Résous la grille, révèle une œuvre d'art</p>
      </div>

      <div className="ds-cards">
        <button className="ds-card" onClick={() => onPick('paintings')}>
          <span className="ds-card-icon">🖼️</span>
          <span className="ds-card-label">Art</span>
          <span className="ds-card-desc">Découvre une grande œuvre cachée derrière ta grille</span>
        </button>

        <button className="ds-card" onClick={() => onPick('classic')}>
          <span className="ds-card-icon">🔢</span>
          <span className="ds-card-label">Sudoku</span>
          <span className="ds-card-desc">Le sudoku classique, sans image, pour se concentrer</span>
        </button>

        <button className="ds-card" onClick={() => onPick('photo')}>
          <span className="ds-card-icon">📷</span>
          <span className="ds-card-label">Memories</span>
          <span className="ds-card-desc">Envoie une photo à un ami à dévoiler en jouant</span>
        </button>

        <button className="ds-card" onClick={onOpenDefi}>
          <span className="ds-card-icon">🎯</span>
          <span className="ds-card-label">Défi</span>
          <span className="ds-card-desc">Configure, envoie à un ami et jouez la même grille</span>
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
          </button>
        ))}
      </div>
    </div>
  );
}

// Sous-écran : photo perso — choisir la photo, puis jouer seul ou envoyer
function PhotoScreen({ onSelectDifficulty, onSendChallenge, onBack }) {
  const [customImage, setCustomImage] = useState(null);
  const [mode, setMode] = useState(null); // null | 'play' | 'send'
  const fileInputRef = useRef(null);

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (customImage) URL.revokeObjectURL(customImage);
    setCustomImage(URL.createObjectURL(file));
    setMode(null);
  };

  // Étape 1 : choisir la photo
  if (!customImage) {
    return (
      <div className="ds-sub">
        <button className="ds-back" onClick={onBack}>← Retour</button>
        <p className="ds-sub-title">Choisis une photo</p>
        <p className="ds-sub-desc">Elle se révèlera au fur et à mesure que tu remplis la grille.</p>
        <button className="ds-photo-pick-btn" onClick={() => fileInputRef.current?.click()}>
          📷 Choisir depuis ma galerie
        </button>
        <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileChange} style={{ display: 'none' }} />
      </div>
    );
  }

  // Étape 2 : que veux-tu faire avec cette photo ?
  if (!mode) {
    return (
      <div className="ds-sub">
        <button className="ds-back" onClick={() => { URL.revokeObjectURL(customImage); setCustomImage(null); }}>← Changer de photo</button>
        <img className="ds-photo-preview" src={customImage} alt="Ta photo" />
        <p className="ds-sub-title">Que veux-tu faire ?</p>
        <div className="ds-photo-choice">
          <button className="ds-choice-btn" onClick={() => setMode('play')}>
            <span className="ds-choice-icon">🎮</span>
            <span className="ds-choice-label">Jouer seul</span>
            <span className="ds-choice-desc">Découvre ta photo en jouant pour toi</span>
          </button>
          <button className="ds-choice-btn" onClick={() => { onSendChallenge(customImage); }}>
            <span className="ds-choice-icon">📤</span>
            <span className="ds-choice-label">Envoyer à un ami</span>
            <span className="ds-choice-desc">Crée un défi avec ta photo et partage le lien WhatsApp</span>
          </button>
        </div>
      </div>
    );
  }

  // Étape 3 : choisir la difficulté (mode jouer seul)
  return (
    <DifficultyScreen
      title="Choisis la difficulté"
      customImage={customImage}
      onSelectDifficulty={(diff) => onSelectDifficulty(diff, customImage)}
      onBack={() => setMode(null)}
    />
  );
}

// Sous-écran : défi — explique le concept puis choisit la difficulté pour jouer
function ChallengeScreen({ onSelect, onBack }) {
  const [step, setStep] = useState('explain'); // 'explain' | 'difficulty'

  if (step === 'difficulty') {
    return (
      <DifficultyScreen
        title="Choisis la difficulté"
        onSelectDifficulty={(diff) => onSelect(diff, null)}
        onBack={() => setStep('explain')}
      />
    );
  }

  return (
    <div className="ds-sub">
      <button className="ds-back" onClick={onBack}>← Retour</button>
      <p className="ds-sub-title">Défi entre amis</p>
      <p className="ds-sub-desc">
        Termine une grille, puis envoie-la à un ami via WhatsApp.
        Il joue la même grille — on compare les scores et on désigne le gagnant !
      </p>
      <div className="ds-challenge-steps">
        <div className="ds-step"><span>1</span> Joue et termine une grille</div>
        <div className="ds-step"><span>2</span> Clique "Défier un ami" à la victoire</div>
        <div className="ds-step"><span>3</span> Comparez vos scores</div>
      </div>
      <button className="send-challenge-btn" onClick={() => setStep('difficulty')}>
        Commencer une partie
      </button>
    </div>
  );
}

export default function DifficultySelector({ onSelect, onRequestSendChallenge, onOpenDefi }) {
  const [screen, setScreen] = useState('home');

  if (screen === 'paintings') {
    return (
      <DifficultyScreen
        title="Choisis la difficulté"
        onSelectDifficulty={(diff) => onSelect(diff, null)}
        onBack={() => setScreen('home')}
      />
    );
  }

  if (screen === 'classic') {
    return (
      <DifficultyScreen
        title="Sudoku classique"
        onSelectDifficulty={(diff) => onSelect(diff, 'classic')}
        onBack={() => setScreen('home')}
      />
    );
  }

  if (screen === 'photo') {
    return (
      <PhotoScreen
        onSelectDifficulty={(diff, img) => onSelect(diff, img)}
        onSendChallenge={(img) => onRequestSendChallenge(img)}
        onBack={() => setScreen('home')}
      />
    );
  }

  return <HomeScreen onPick={setScreen} onOpenDefi={onOpenDefi} />;
}
