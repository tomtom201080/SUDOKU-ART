import { translate as t, useT } from '../i18n/index.jsx';
// src/components/HelpModal.jsx
import './HelpModal.css';

export default function HelpModal({ onClose }) {
  return (
    <div className="help-overlay" onClick={onClose}>
      <div className="help-panel" onClick={(e) => e.stopPropagation()}>
        <div className="help-header">
          <h2>{t('help_rules_title')}</h2>
          <button className="help-close" onClick={onClose}>✕</button>
        </div>

        <section className="help-section">
          <h3>🧩 Le principe du Sudoku</h3>
          <p>
            La grille fait 9x9 cases, divisée en 9 carrés de 3x3. Il faut la
            remplir avec les chiffres de 1 à 9, en respectant 3 règles :
          </p>
          <ul>
            <li>{t('help_rule1')}</li>
            <li>{t('help_rule2')}</li>
            <li>{t('help_rule3')}</li>
          </ul>
          <p>
            Certaines cases sont déjà remplies au départ ; il faut compléter
            les cases vides en respectant ces règles.
          </p>
        </section>

        <section className="help-section">
          <h3>🖼 La photo à dévoiler</h3>
          <p>
            Une photo (un tableau célèbre, ou une photo personnelle) se cache
            derrière la grille, et se révèle au fil de la partie :
          </p>
          <ul>
            <li>{t('help_center_cell')}</li>
            <li>{t('help_correct_cell')}</li>
            <li>
              {t('help_given_cell')}
              lorsque sa ligne, sa colonne ou son carré est entièrement
              complété — avec une petite animation ✨
            </li>
          </ul>
          <p>
            Le curseur "Intensité du filigrane" règle à quel point la photo
            est visible derrière les chiffres pendant que tu joues (tu peux
            même le mettre à 0 pour la masquer complètement). Une fois la
            grille terminée, la photo s'affiche toujours en entier, avec son
            nom, son peintre et quelques infos si c'est un tableau.
          </p>
        </section>

        <section className="help-section">
          <h3>{lang === 'fr' ? '🎮 Les boutons sous la grille' : '🎮 Buttons below the grid'}</h3>
          <ul>
            <li><strong>Chiffres 1-9</strong> : pose la valeur dans la case sélectionnée (un chiffre disparaît du pavé une fois ses 9 occurrences placées)</li>
            <li><strong>✕ Effacer</strong> : vide la case sélectionnée</li>
            <li><strong>✏️ Notes</strong> {lang === 'fr' ? ': bascule en mode annotations' : ': toggle annotation mode'} sans valider, pour t'aider à réfléchir</li>
            <li>{t('help_undo')}</li>
            <li>{t('help_hint_desc')}</li>
          </ul>
        </section>

        <section className="help-section">
          <h3>{t('help_diff_title')}</h3>
          <p>
            4 niveaux : Facile, Moyen, Compliqué, Enfer — plus c'est dur,
            {t('help_diff_desc')}
            correspond aussi à une rareté d'image (commune, rare, légendaire)
            quand tu joues avec la bibliothèque de tableaux.
          </p>
        </section>

        <section className="help-section">
          <h3>{lang === 'fr' ? '📷 Photo personnelle & défis' : '📷 Personal photo & challenges'}</h3>
          <p>
            Tu peux choisir une photo de ton appareil au lieu d'un tableau.
            Tu peux aussi envoyer une grille personnalisée à un ami (avec sa
            propre photo à découvrir), en choisissant la difficulté, un
            {t('help_challenge_desc')}
            faire un vrai défi.
          </p>
        </section>

        <button className="help-done-btn" onClick={onClose}>Compris, je me lance !</button>
      </div>
    </div>
  );
}
