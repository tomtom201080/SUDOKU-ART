import { useT, getLang } from '../i18n/index.jsx';
import './HelpModal.css';

export default function HelpModal({ onClose }) {
  const { t } = useT();
  const fr = getLang() === 'fr';

  return (
    <div className="help-overlay" onClick={onClose}>
      <div className="help-panel" onClick={(e) => e.stopPropagation()}>
        <div className="help-header">
          <h2>{t('help_rules_title')}</h2>
          <button className="help-close" onClick={onClose}>✕</button>
        </div>

        <section className="help-section">
          <h3>{fr ? '🧩 Le principe du Sudoku' : '🧩 How Sudoku works'}</h3>
          <p>{fr
            ? 'La grille fait 9×9 cases, divisée en 9 carrés de 3×3. Remplis-la avec les chiffres de 1 à 9 en respectant 3 règles :'
            : 'The grid is 9×9, divided into nine 3×3 squares. Fill it with digits 1–9 following 3 rules:'
          }</p>
          <ul>
            <li>{t('help_rule1')}</li>
            <li>{t('help_rule2')}</li>
            <li>{t('help_rule3')}</li>
          </ul>
          <p>{fr
            ? 'Certaines cases sont déjà remplies ; complète les cases vides.'
            : 'Some cells are pre-filled; complete the empty ones.'
          }</p>
        </section>

        <section className="help-section">
          <h3>{fr ? '🖼 La photo à dévoiler' : '🖼 The hidden photo'}</h3>
          <p>{fr
            ? 'Une photo ou un tableau célèbre se cache derrière la grille et se révèle au fil de la partie :'
            : 'A photo or famous artwork hides behind the grid and reveals itself as you play:'
          }</p>
          <ul>
            <li>{t('help_center_cell')}</li>
            <li>{t('help_correct_cell')}</li>
            <li>{fr
              ? 'Une case pré-remplie se révèle quand sa ligne, colonne ou carré est complété ✨'
              : 'A pre-filled cell reveals when its row, column or square is completed ✨'
            }</li>
          </ul>
          <p>{fr
            ? 'Le curseur « Intensité du filigrane » règle la visibilité de la photo pendant la partie.'
            : 'The "Watermark intensity" slider controls how visible the photo is during play.'
          }</p>
        </section>

        <section className="help-section">
          <h3>{fr ? '🎮 Les boutons sous la grille' : '🎮 Buttons below the grid'}</h3>
          <ul>
            <li>{fr
              ? <><strong>Chiffres 1–9</strong> : pose le chiffre dans la case sélectionnée</>
              : <><strong>Digits 1–9</strong>: place the digit in the selected cell</>
            }</li>
            <li>{fr
              ? <><strong>✕ Effacer</strong> : vide la case sélectionnée</>
              : <><strong>✕ Erase</strong>: clears the selected cell</>
            }</li>
            <li>{fr
              ? <><strong>✏️ Notes</strong> : bascule en mode annotations</>
              : <><strong>✏️ Notes</strong>: toggle annotation mode</>
            }</li>
            <li>{t('help_undo')}</li>
            <li>{t('help_hint_desc')}</li>
          </ul>
        </section>

        <section className="help-section">
          <h3>{t('help_diff_title')}</h3>
          <p>{fr
            ? "4 niveaux : Facile, Moyen, Compliqué, Enfer. Plus c'est dur, moins il y a de chiffres au départ."
            : '4 levels: Easy, Medium, Hard, Hell. The harder the level, the fewer starting digits.'
          }</p>
        </section>

        <section className="help-section">
          <h3>{fr ? '📷 Photo personnelle & défis' : '📷 Personal photo & challenges'}</h3>
          <p>{fr
            ? "Tu peux choisir une photo de ton appareil. Tu peux aussi envoyer un défi à un ami avec une photo cachée et une limite d'erreurs ou d'indices."
            : 'You can pick a photo from your device. You can also send a challenge to a friend with a hidden photo and a limit on errors or hints.'
          }</p>
        </section>

        <button className="help-done-btn" onClick={onClose}>{t('help_go')}</button>
      </div>
    </div>
  );
}
