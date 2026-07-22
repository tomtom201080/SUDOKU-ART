// src/components/DifficultySelector.jsx
import { useRef, useState } from 'react';
import { useT } from '../i18n/index.jsx';
import './DifficultySelector.css';

function DifficultyScreen({ title, customImage, onSelectDifficulty, onBack }) {
  const { t } = useT();
  const opts = [
    { id: 'facile',    label: t('diff_facile'), icon: '😌' },
    { id: 'moyen',     label: t('diff_moyen'),  icon: '🙂' },
    { id: 'complique', label: t('diff_complique'), icon: '😬' },
    { id: 'enfer',     label: t('diff_enfer'),  icon: '🔥' },
  ];
  return (
    <div className="ds-sub">
      <button className="ds-back" onClick={onBack}>{t('home_back')}</button>
      <p className="ds-sub-title">{title}</p>
      {customImage && <img className="ds-photo-preview" src={customImage} alt="" />}
      <div className="difficulty-grid">
        {opts.map(opt => (
          <button key={opt.id} className={`difficulty-card difficulty-${opt.id}`} onClick={() => onSelectDifficulty(opt.id)}>
            <span className="difficulty-icon">{opt.icon}</span>
            <span className="difficulty-label">{opt.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

function PhotoScreen({ onSelectDifficulty, onSendChallenge, onBack }) {
  const { t } = useT();
  const [customImage, setCustomImage] = useState(null);
  const [mode, setMode] = useState(null);
  const fileInputRef = useRef(null);

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (customImage) URL.revokeObjectURL(customImage);
    setCustomImage(URL.createObjectURL(file));
    setMode(null);
  };

  if (!customImage) return (
    <div className="ds-sub">
      <button className="ds-back" onClick={onBack}>{t('home_back')}</button>
      <p className="ds-sub-title">{t('home_choose_photo')}</p>
      <p className="ds-sub-desc">{t('home_photo_hint')}</p>
      <button className="ds-photo-pick-btn" onClick={() => fileInputRef.current?.click()}>{t('home_photo_pick')}</button>
      <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileChange} style={{ display: 'none' }} />
    </div>
  );

  if (!mode) return (
    <div className="ds-sub">
      <button className="ds-back" onClick={() => { URL.revokeObjectURL(customImage); setCustomImage(null); }}>{t('home_back')}</button>
      <img className="ds-photo-preview" src={customImage} alt="" />
      <p className="ds-sub-title">{t('home_what_todo')}</p>
      <div className="ds-photo-choice">
        <button className="ds-choice-btn" onClick={() => setMode('play')}>
          <span className="ds-choice-icon">🎮</span>
          <span className="ds-choice-label">{t('home_play_solo')}</span>
          <span className="ds-choice-desc">{t('home_play_solo_desc')}</span>
        </button>
        <button className="ds-choice-btn" onClick={() => onSendChallenge(customImage)}>
          <span className="ds-choice-icon">📤</span>
          <span className="ds-choice-label">{t('home_send_friend')}</span>
          <span className="ds-choice-desc">{t('home_send_friend_desc')}</span>
        </button>
      </div>
    </div>
  );

  return (
    <DifficultyScreen
      title={t('home_choose_diff')}
      customImage={customImage}
      onSelectDifficulty={(diff) => onSelectDifficulty(diff, customImage)}
      onBack={() => setMode(null)}
    />
  );
}

function HomeScreen({ onPick, onOpenDefi, onOpenMemories }) {
  const { t } = useT();
  return (
    <div className="ds-home">
      <div className="ds-logo-block">
        <h1 className="ds-title">{t('home_title')}</h1>
        <p className="ds-subtitle">{t('home_subtitle')}</p>
      </div>
      <div className="ds-cards">
        <button className="ds-card" onClick={() => onPick('paintings')}>
          <span className="ds-card-icon">🖼️</span>
          <span className="ds-card-label">{t('home_art_label')}</span>
          <span className="ds-card-desc">{t('home_art_desc')}</span>
        </button>
        <button className="ds-card" onClick={() => onPick('classic')}>
          <span className="ds-card-icon">🔢</span>
          <span className="ds-card-label">{t('home_sudoku_label')}</span>
          <span className="ds-card-desc">{t('home_sudoku_desc')}</span>
        </button>
        <button className="ds-card" onClick={onOpenMemories}>
          <span className="ds-card-icon">📷</span>
          <span className="ds-card-label">{t('home_memories_label')}</span>
          <span className="ds-card-desc">{t('home_memories_desc')}</span>
        </button>
        <button className="ds-card" onClick={onOpenDefi}>
          <span className="ds-card-icon">🎯</span>
          <span className="ds-card-label">{t('home_defi_label')}</span>
          <span className="ds-card-desc">{t('home_defi_desc')}</span>
        </button>
      </div>
    </div>
  );
}

export default function DifficultySelector({ onSelect, onRequestSendChallenge, onOpenDefi, onOpenMemories }) {
  const { t } = useT();
  const [screen, setScreen] = useState('home');

  if (screen === 'paintings') return (
    <DifficultyScreen title={t('home_choose_diff')} onSelectDifficulty={(diff) => onSelect(diff, null)} onBack={() => setScreen('home')} />
  );
  if (screen === 'classic') return (
    <DifficultyScreen title={t('home_classic_title')} onSelectDifficulty={(diff) => onSelect(diff, 'classic')} onBack={() => setScreen('home')} />
  );
  if (screen === 'photo') return (
    <PhotoScreen onSelectDifficulty={(diff, img) => onSelect(diff, img)} onSendChallenge={(img) => onRequestSendChallenge(img)} onBack={() => setScreen('home')} />
  );
  return <HomeScreen onPick={setScreen} onOpenDefi={onOpenDefi} onOpenMemories={onOpenMemories} />;
}
