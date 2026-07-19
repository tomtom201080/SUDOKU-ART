// src/components/DefiComposer.jsx
import { useRef, useState } from 'react';
import { useT } from '../i18n/index.jsx';
import { generateSudoku } from '../sudoku/generator';
import { uploadSharedPhoto } from '../lib/sharedPhoto';
import { createRematch, buildRematchLink } from '../lib/rematches';
import { isMobileDevice } from '../utils/device';
import './ChallengeComposer.css';
import './DefiComposer.css';



export default function DefiComposer({ onClose, onStartGame, userId, userEmail }) {
  const { t } = useT();
  const DIFFICULTY_OPTIONS = [
    { id: 'facile',    label: t('diff_facile'), icon: '😌' },
    { id: 'moyen',     label: t('diff_moyen'),  icon: '🙂' },
    { id: 'complique', label: t('diff_complique'), icon: '😬' },
    { id: 'enfer',     label: t('diff_enfer'),  icon: '🔥' },
  ];
  const [step, setStep]             = useState('config');
  const [difficulty, setDifficulty] = useState(null);
  const [hintsLimit, setHintsLimit] = useState(null);
  const [groupMode, setGroupMode]   = useState(false); // false = perso, true = groupe
  const [photoFile, setPhotoFile]   = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [challengerName, setChallengerName] = useState('');
  const [error, setError]           = useState(null);
  const fileInputRef = useRef(null);

  const handlePickPhoto = () => fileInputRef.current?.click();
  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (photoPreview) URL.revokeObjectURL(photoPreview);
    setPhotoFile(file);
    setPhotoPreview(URL.createObjectURL(file));
  };

  const handleSend = async () => {
    if (!difficulty) return;
    setStep('sending');
    setError(null);
    try {
      const puzzleData = generateSudoku(difficulty);
      const photoPath  = photoFile ? await uploadSharedPhoto(photoFile) : null;
      const photoUrl   = photoPreview ?? null;

      const rematch = await createRematch({
        puzzle:           puzzleData.puzzle,
        solution:         puzzleData.solution,
        difficulty,
        photoPath,
        challengerName:   userEmail ?? (challengerName.trim() || 'Un ami'),
        challengerUserId: userId ?? null,
        challengerErrors: 0,
        challengerSeconds:0,
        challengerHints:  0,
        hintsLimit,
        groupMode,
      });

      const link      = buildRematchLink(rematch.id);
      const limiteTxt = hintsLimit != null ? `\n💡 Max ${hintsLimit} indice${hintsLimit > 1 ? 's' : ''}` : '';
      const regleTxt  = `\n⏱ Règle : +2 min par erreur ou indice utilisé${limiteTxt}`;

      // Avertissement photo UNIQUEMENT en mode groupe avec photo perso
      const photoGroupWarning = groupMode && photoPath
        ? `\n\n⚠️ Ce lien peut être joué par plusieurs personnes. Si tu le transfères, ta photo sera visible par tous ceux qui cliqueront dessus.`
        : !groupMode && photoPath
        ? `\n⚠️ Ce lien est réservé à une seule personne — ne le transfère pas, sinon quelqu'un d'autre pourrait le prendre à ta place.`
        : '';

      const groupTxt = groupMode
        ? `\nPlusieurs personnes peuvent jouer — partagez le lien !`
        : '';

      const senderName = userEmail ?? (challengerName.trim() || t('defi_a_friend'));
      const message =
        `🎯 ${senderName} te défie sur Sudoku Art !\n` +
        `Résous cette grille${photoPath ? ' et découvre ma photo cachée' : ''} — qui finira avec le meilleur score ?${groupTxt}\n` +
        `${link}${regleTxt}${photoGroupWarning}`;

      if (isMobileDevice() && navigator.share) {
        try { await navigator.share({ title: t('defi_title'), text: message }); }
        catch {}
      } else {
        window.open(`https://wa.me/?text=${encodeURIComponent(message)}`, '_blank');
      }

      setStep('done');
      setTimeout(() => onStartGame({ rematch, puzzleData, photoUrl }), 1200);

    } catch (err) {
      console.error(err);
      setError("L'envoi a échoué. Réessaie dans un instant.");
      setStep('config');
    }
  };

  return (
    <div className="challenge-overlay">
      <div className="challenge-panel">
        <div className="challenge-header">
          <h2>🎯 Créer un défi</h2>
          <button className="challenge-close" onClick={onClose}>✕</button>
        </div>

        {step === 'done' && (
          <div className="defi-done">
            <p className="challenge-success">✅ Défi envoyé ! La grille se lance…</p>
          </div>
        )}

        {(step === 'config' || step === 'sending') && (
          <>
            {/* Mode : Perso ou Groupe */}
            <p className="challenge-step-title">1. Mode du défi</p>
            <div className="defi-mode-toggle">
              <button
                className={`defi-mode-btn ${!groupMode ? 'is-selected' : ''}`}
                onClick={() => setGroupMode(false)}
              >
                <span className="defi-mode-icon">🎯</span>
                <span className="defi-mode-label">{t('defi_mode_perso_label')}</span>
                <span className="defi-mode-desc">{t('defi_mode_perso_desc')}</span>
              </button>
              <button
                className={`defi-mode-btn ${groupMode ? 'is-selected' : ''}`}
                onClick={() => setGroupMode(true)}
              >
                <span className="defi-mode-icon">👨‍👩‍👧</span>
                <span className="defi-mode-label">{t('defi_mode_group_label')}</span>
                <span className="defi-mode-desc">{t('defi_mode_group_desc')}</span>
              </button>
            </div>

            {/* Difficulté */}
            <p className="challenge-step-title">2. Difficulté</p>
            <div className="defi-difficulty-grid">
              {DIFFICULTY_OPTIONS.map(opt => (
                <button
                  key={opt.id}
                  className={`defi-diff-btn ${difficulty === opt.id ? 'is-selected' : ''}`}
                  onClick={() => setDifficulty(opt.id)}
                >
                  <span>{opt.icon}</span>
                  <span>{opt.label}</span>
                </button>
              ))}
            </div>

            {/* Limite d'indices */}
            <p className="challenge-step-title">3. Limite d'indices</p>
            <div className="defi-hints-row">
              {[null, 1, 2, 3].map(v => (
                <button
                  key={String(v)}
                  className={`defi-hint-limit-btn ${hintsLimit === v ? 'is-selected' : ''}`}
                  onClick={() => setHintsLimit(v)}
                >
                  {v == null ? '∞ Libre' : `${v} indice${v > 1 ? 's' : ''}`}
                </button>
              ))}
            </div>

            {/* Règle de scoring */}
            <div className="defi-scoring-rule">
              ⏱ Score = temps réel <strong>+2 min</strong> par erreur ou indice. Le plus bas gagne.
            </div>

            {/* Photo optionnelle */}
            <p className="challenge-step-title">4. Photo (optionnel)</p>
            {photoPreview ? (
              <div className="defi-photo-row">
                <img className="defi-photo-thumb" src={photoPreview} alt="Photo choisie" />
                <button className="challenge-link-btn" onClick={handlePickPhoto}>{t('defi_photo_change')}</button>
                <button className="challenge-link-btn" onClick={() => { URL.revokeObjectURL(photoPreview); setPhotoFile(null); setPhotoPreview(null); }}>{t('defi_photo_remove')}</button>
              </div>
            ) : (
              <button className="challenge-pick-btn" onClick={handlePickPhoto}>
                📷 Choisir une photo
              </button>
            )}
            <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileChange} style={{ display: 'none' }} />

            {/* Avertissement photo en mode groupe */}
            {groupMode && photoPreview && (
              <div className="defi-group-photo-warning">
                ⚠️ En mode Groupe, ta photo sera visible par toutes les personnes qui cliqueront sur le lien, même si le message est retransféré.
              </div>
            )}

            {/* Prénom si pas connecté */}
            {!userEmail && (
              <>
                <p className="challenge-step-title">5. Ton prénom</p>
                <input
                  className="challenge-name-input"
                  type="text"
                  value={challengerName}
                  onChange={e => setChallengerName(e.target.value)}
                  placeholder={t('defi_prenom_placeholder')}
                />
              </>
            )}

            {error && <p className="challenge-error-note">{error}</p>}

            {!userId && (
              <div className="defi-no-account-warning">
                💡 Sans compte, tu ne sauras pas qui a joué ni les résultats.
              </div>
            )}

            <button
              className="challenge-btn-primary"
              disabled={!difficulty || step === 'sending'}
              onClick={handleSend}
            >
              {step === 'sending' ? t('defi_sending') : t('defi_send')}
            </button>
          </>
        )}
      </div>
    </div>
  );
}
