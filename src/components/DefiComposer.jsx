// src/components/DefiComposer.jsx
import { useRef, useState } from 'react';
import { useT } from '../i18n/index.jsx';
import { generateSudoku } from '../sudoku/generator';
import { uploadSharedPhoto } from '../lib/sharedPhoto';
import { createRematch, regenerateRematch, buildRematchLink } from '../lib/rematches';
import { isMobileDevice } from '../utils/device';
import './ChallengeComposer.css';
import './DefiComposer.css';



// regenerateFrom : un défi existant (ligne "rematches") à recréer sous un
// nouveau lien — même grille, même difficulté, même limite d'indices et
// même score déjà enregistré du challenger. L'ancien défi n'est jamais
// modifié : handleSend crée toujours une TOUTE NOUVELLE ligne. Seuls le
// mode (perso/groupe) et l'image restent modifiables dans ce cas.
export default function DefiComposer({ onClose, onStartGame, userId, userEmail, defaultImageUrl = null, regenerateFrom = null }) {
  const { t } = useT();
  const DIFFICULTY_OPTIONS = [
    { id: 'facile',    label: t('diff_facile'), icon: '😌' },
    { id: 'moyen',     label: t('diff_moyen'),  icon: '🙂' },
    { id: 'complique', label: t('diff_complique'), icon: '😬' },
    { id: 'enfer',     label: t('diff_enfer'),  icon: '🔥' },
  ];
  const DIFFICULTY_KEYS = { facile: 'diff_facile', moyen: 'diff_moyen', complique: 'diff_complique', enfer: 'diff_enfer' };
  const [step, setStep]             = useState('config');
  const [difficulty, setDifficulty] = useState(regenerateFrom?.difficulty ?? null);
  const [hintsLimit, setHintsLimit] = useState(regenerateFrom?.hints_limit ?? null);
  const [groupMode, setGroupMode]   = useState(regenerateFrom?.group_mode ?? false); // false = perso, true = groupe
  const [photoFile, setPhotoFile]   = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [imageChoice, setImageChoice] = useState(defaultImageUrl ? 'keep' : 'none'); // 'keep' | 'new' | 'none'
  const [challengerName, setChallengerName] = useState('');
  const [error, setError]           = useState(null);
  const [shareLink, setShareLink]   = useState(null);
  const [linkCopied, setLinkCopied] = useState(false);
  const [pendingGameStart, setPendingGameStart] = useState(null);
  const fileInputRef = useRef(null);

  const handleCopyLink = async () => {
    if (!shareLink) return;
    try {
      await navigator.clipboard.writeText(shareLink);
      setLinkCopied(true);
    } catch {
      // presse-papiers indisponible : le lien reste visible à l'écran
    }
  };

  const handleContinueToGame = () => {
    if (pendingGameStart) onStartGame(pendingGameStart);
  };

  const handlePickPhoto = () => fileInputRef.current?.click();
  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (photoPreview) URL.revokeObjectURL(photoPreview);
    setPhotoFile(file);
    setPhotoPreview(URL.createObjectURL(file));
    setImageChoice('new');
  };

  const handleSend = async () => {
    if (!difficulty) return;
    setStep('sending');
    setError(null);
    try {
      const puzzleData = regenerateFrom
        ? {
            puzzle: typeof regenerateFrom.puzzle === 'string' ? JSON.parse(regenerateFrom.puzzle) : regenerateFrom.puzzle,
            solution: typeof regenerateFrom.solution === 'string' ? JSON.parse(regenerateFrom.solution) : regenerateFrom.solution
          }
        : generateSudoku(difficulty);
      let photoPath = null;
      if (imageChoice === 'new' && photoFile) {
        photoPath = await uploadSharedPhoto(photoFile);
      } else if (imageChoice === 'keep' && defaultImageUrl) {
        const response = await fetch(defaultImageUrl);
        const blob = await response.blob();
        const file = new File([blob], 'photo-defi.jpg', { type: blob.type || 'image/jpeg' });
        photoPath = await uploadSharedPhoto(file);
      }
      const photoUrl = imageChoice === 'new' ? photoPreview : (imageChoice === 'keep' ? defaultImageUrl : null);
      const classicMode = imageChoice === 'none';
      const senderIdentity = {
        challengerName:   userEmail ?? (challengerName.trim() || 'Un ami'),
        challengerUserId: userId ?? null
      };

      const rematch = regenerateFrom
        ? await regenerateRematch(regenerateFrom, { ...senderIdentity, photoPath, groupMode, classicMode })
        : await createRematch({
            puzzle:           puzzleData.puzzle,
            solution:         puzzleData.solution,
            difficulty,
            photoPath,
            ...senderIdentity,
            challengerErrors: 0,
            challengerSeconds: 0,
            challengerHints:  0,
            hintsLimit,
            groupMode,
            classicMode });

      const link      = buildRematchLink(rematch.id);
      const diffLabel = DIFFICULTY_KEYS[difficulty] ? t(DIFFICULTY_KEYS[difficulty]) : difficulty;
      const limiteTxt = hintsLimit != null ? `\n💡 Max ${t('defi_hint_count', { v: hintsLimit, s: hintsLimit > 1 ? 's' : '' })}` : '';
      const regleTxt  = `${t('defi_rule_msg')}${limiteTxt}`;

      // Avertissement photo UNIQUEMENT en mode groupe avec photo perso
      const photoGroupWarning = groupMode && photoPath
        ? `\n\n${t('defi_group_photo_warning')}`
        : !groupMode && photoPath
        ? `\n${t('defi_photo_personal_warning')}`
        : '';

      const groupTxt = groupMode ? `${t('defi_group_msg')}` : '';

      const senderName = userEmail ?? (challengerName.trim() || t('defi_a_friend'));
      const message =
        t('defi_share_intro', { name: senderName }) +
        t('defi_share_diff_line', { diff: diffLabel }) +
        t('defi_share_body', { photoNote: photoPath ? t('defi_share_photo_note') : '', groupNote: groupTxt }) +
        `${link}${regleTxt}${photoGroupWarning}`;

      // navigator.share()/window.open() arrivent ici après deux await réseau
      // (upload photo + création du défi) : le navigateur ne considère plus
      // cet appel comme directement issu du clic utilisateur, donc le
      // partage natif ou la popup WhatsApp peuvent être bloqués
      // silencieusement (NotAllowedError, popup blocker qui renvoie null).
      // On tente quand même le partage natif, mais on affiche toujours un
      // lien de secours copiable en dessous, sans jamais rediriger
      // automatiquement — l'utilisateur garde la main pour partager avant
      // de lancer sa propre partie.
      if (isMobileDevice() && navigator.share) {
        try {
          await navigator.share({ title: t('defi_title'), text: message });
        } catch {
          // partage annulé ou bloqué : le lien de secours ci-dessous prend le relais
        }
      } else {
        window.open(`https://wa.me/?text=${encodeURIComponent(message)}`, '_blank');
      }

      setShareLink(link);
      setPendingGameStart({ rematch, puzzleData, photoUrl });
      setStep('done');

    } catch (err) {
      console.error(err);
      setError(t('defi_send_failed'));
      setStep('config');
    }
  };

  return (
    <div className="challenge-overlay">
      <div className="challenge-panel">
        <div className="challenge-header">
          <h2>{regenerateFrom ? t('defi_resend_title') : t('defi_title')}</h2>
          <button className="challenge-close" onClick={onClose}>✕</button>
        </div>

        {step === 'done' && (
          <div className="defi-done">
            <p className="challenge-success">{t('defi_done')}</p>
            {shareLink && (
              <div className="challenge-link-fallback">
                <p>{t('cc_whatsapp_fallback')}</p>
                <button className="challenge-copy-btn" onClick={handleCopyLink}>
                  {linkCopied ? t('cc_link_copied') : t('cc_copy_link_btn')}
                </button>
              </div>
            )}
            <button className="challenge-btn-primary" onClick={handleContinueToGame}>
              {t('defi_play_now_btn')}
            </button>
          </div>
        )}

        {(step === 'config' || step === 'sending') && (
          <>
            {/* Mode : Perso ou Groupe */}
            <p className="challenge-step-title">{t('defi_step1_label')}</p>
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

            {/* Difficulté : verrouillée en mode "renvoyer" (même grille) */}
            <p className="challenge-step-title">{t('defi_step2_label')}</p>
            {regenerateFrom ? (
              <p className="defi-locked-value">
                {DIFFICULTY_OPTIONS.find(o => o.id === difficulty)?.icon} {DIFFICULTY_OPTIONS.find(o => o.id === difficulty)?.label}
              </p>
            ) : (
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
            )}

            {/* Limite d'indices : verrouillée en mode "renvoyer" */}
            <p className="challenge-step-title">{t('defi_hint_limit_label')}</p>
            {regenerateFrom ? (
              <p className="defi-locked-value">
                {hintsLimit == null ? t('defi_hint_unlimited') : t('defi_hint_count', { v: hintsLimit, s: hintsLimit > 1 ? 's' : '' })}
              </p>
            ) : (
              <div className="defi-hints-row">
                {[null, 1, 2, 3].map(v => (
                  <button
                    key={String(v)}
                    className={`defi-hint-limit-btn ${hintsLimit === v ? 'is-selected' : ''}`}
                    onClick={() => setHintsLimit(v)}
                  >
                    {v == null ? t('defi_hint_unlimited') : t('defi_hint_count', { v, s: v > 1 ? 's' : '' })}
                  </button>
                ))}
              </div>
            )}

            {/* Règle de scoring */}
            <div className="defi-scoring-rule">
              {t('defi_scoring_hint')}
            </div>

            {/* Choix de l'image : garder / nouvelle / aucune */}
            <p className="challenge-step-title">{t('defi_step4_label')}</p>
            <div className="defi-mode-toggle-3">
              <button
                className={`defi-mode-btn ${imageChoice === 'keep' ? 'is-selected' : ''}`}
                onClick={() => setImageChoice('keep')}
                disabled={!defaultImageUrl}
              >
                <span className="defi-mode-icon">🖼️</span>
                <span className="defi-mode-label">{t('share_image_keep')}</span>
              </button>
              <button
                className={`defi-mode-btn ${imageChoice === 'new' ? 'is-selected' : ''}`}
                onClick={() => { setImageChoice('new'); handlePickPhoto(); }}
              >
                <span className="defi-mode-icon">📷</span>
                <span className="defi-mode-label">{t('share_image_new')}</span>
              </button>
              <button
                className={`defi-mode-btn ${imageChoice === 'none' ? 'is-selected' : ''}`}
                onClick={() => setImageChoice('none')}
              >
                <span className="defi-mode-icon">🔢</span>
                <span className="defi-mode-label">{t('share_image_none')}</span>
              </button>
            </div>
            {imageChoice === 'keep' && defaultImageUrl && (
              <div className="defi-photo-row">
                <img className="defi-photo-thumb" src={defaultImageUrl} alt={t('cc_photo_selected_alt')} />
              </div>
            )}
            {imageChoice === 'new' && photoPreview && (
              <div className="defi-photo-row">
                <img className="defi-photo-thumb" src={photoPreview} alt={t('cc_photo_selected_alt')} />
                <button className="challenge-link-btn" onClick={handlePickPhoto}>{t('defi_photo_change')}</button>
              </div>
            )}
            <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileChange} style={{ display: 'none' }} />

            {/* Avertissement photo en mode groupe */}
            {groupMode && imageChoice !== 'none' && (photoPreview || (imageChoice === 'keep' && defaultImageUrl)) && (
              <div className="defi-group-photo-warning">
                {t('defi_group_photo_warning')}
              </div>
            )}

            {/* Prénom si pas connecté */}
            {!userEmail && (
              <>
                <p className="challenge-step-title">{t('defi_step5_label')}</p>
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
                {t('defi_no_account')}
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
