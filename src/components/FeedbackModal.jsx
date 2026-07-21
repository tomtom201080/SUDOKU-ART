// src/components/FeedbackModal.jsx
import { useEffect, useState } from 'react';
import { useT } from '../i18n/index.jsx';
import { submitFeedback, FEEDBACK_MESSAGE_MAX_LENGTH } from '../lib/feedback';
import { trackFeedbackOpened, trackFeedbackSubmitted } from '../lib/tracking';
import './FeedbackModal.css';

const FEEDBACK_TYPES = ['bug', 'confusion', 'difficulty', 'suggestion', 'other'];

export default function FeedbackModal({ onClose, feedbackContext = 'menu', difficulty = null, progressPercent = null, puzzleId = null, page = 'home' }) {
  const { t, lang } = useT();
  const [type, setType] = useState(null);
  const [message, setMessage] = useState('');
  const [status, setStatus] = useState('idle'); // idle | sending | done | error

  useEffect(() => {
    trackFeedbackOpened({ feedbackContext, progressPercent, difficulty });
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handleSubmit = async () => {
    if (!type) return;
    setStatus('sending');
    const { error } = await submitFeedback({
      feedbackType: type,
      message,
      page,
      language: lang,
      difficulty,
      progressPercent,
      puzzleId
    });
    if (error) {
      setStatus('error');
      return;
    }
    trackFeedbackSubmitted({ feedbackType: type, feedbackContext, progressPercent, difficulty });
    setStatus('done');
  };

  return (
    <div className="feedback-overlay" onClick={onClose}>
      <div className="feedback-panel" onClick={(e) => e.stopPropagation()}>
        <div className="feedback-header">
          <h2>{t('feedback_title')}</h2>
          <button className="feedback-close" onClick={onClose}>✕</button>
        </div>

        {status === 'done' ? (
          <>
            <p className="feedback-success">{t('feedback_thanks')}</p>
            <button className="feedback-btn-primary" onClick={onClose}>{t('feedback_close_btn')}</button>
          </>
        ) : (
          <>
            <div className="feedback-types">
              {FEEDBACK_TYPES.map((ft) => (
                <button
                  key={ft}
                  className={`feedback-type-btn ${type === ft ? 'is-selected' : ''}`}
                  onClick={() => setType(ft)}
                >
                  {t(`feedback_type_${ft}`)}
                </button>
              ))}
            </div>

            <textarea
              className="feedback-message"
              value={message}
              onChange={(e) => setMessage(e.target.value.slice(0, FEEDBACK_MESSAGE_MAX_LENGTH))}
              placeholder={t('feedback_message_placeholder')}
              rows={4}
            />

            {status === 'error' && <p className="feedback-error">{t('feedback_error')}</p>}

            <button
              className="feedback-btn-primary"
              onClick={handleSubmit}
              disabled={!type || status === 'sending'}
            >
              {status === 'sending' ? t('common_one_moment') : t('feedback_send_btn')}
            </button>
          </>
        )}
      </div>
    </div>
  );
}
