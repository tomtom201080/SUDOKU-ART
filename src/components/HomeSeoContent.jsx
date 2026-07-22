// src/components/HomeSeoContent.jsx
// Contenu SEO de l'accueil : texte réel, visible sans interaction, avec des
// h2 (le h1 de la page est celui du bloc logo dans DifficultySelector).
// Rendu par App.jsx APRÈS le bandeau AdSlot (pas dans DifficultySelector) :
// placé avant, il repoussait la pub loin sous les vignettes. Utilise
// useT() comme le reste de l'app — contrairement aux pages SEO dédiées
// (src/seo/pages.jsx), ce contenu fait partie de l'app elle-même, toujours
// rendue côté client, jamais pré-rendue.
import { Link } from 'react-router-dom';
import { useT } from '../i18n/index.jsx';
import './HomeSeoContent.css';

export default function HomeSeoContent() {
  const { t } = useT();
  return (
    <div className="ds-seo-content">
      <section>
        <h2>{t('home_seo_free_title')}</h2>
        <p>{t('home_seo_free_body')}</p>
      </section>
      <section>
        <h2>{t('home_seo_reveal_title')}</h2>
        <p>{t('home_seo_reveal_body')}</p>
      </section>
      <section>
        <h2>{t('home_seo_image_title')}</h2>
        <p>{t('home_seo_image_body')} <Link to="/sudoku-image-cachee">{t('home_seo_art_link')}</Link></p>
      </section>
      <section>
        <h2>{t('home_seo_challenge_title')}</h2>
        <p>{t('home_seo_challenge_body')} <Link to="/creer-un-defi-sudoku">{t('home_seo_challenge_link')}</Link></p>
      </section>
      <section>
        <h2>{t('home_seo_friends_title')}</h2>
        <p>{t('home_seo_friends_body')}</p>
      </section>
      <section>
        <h2>{t('home_seo_devices_title')}</h2>
        <p>{t('home_seo_devices_body')}</p>
      </section>
      <section>
        <h2>{t('home_seo_howto_title')}</h2>
        <p>{t('home_seo_howto_body')} <Link to="/comment-ca-marche">{t('home_seo_howto_link')}</Link></p>
      </section>
    </div>
  );
}
