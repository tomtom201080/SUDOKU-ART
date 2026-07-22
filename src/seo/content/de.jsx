// src/seo/content/de.jsx
import { Link } from 'react-router-dom';

function HowItWorksContent() {
  return (
    <>
      <h2>Das Grundprinzip</h2>
      <p>
        Sudoku Art folgt den klassischen Sudoku-Regeln: Füllen Sie jede Zeile, jede Spalte und jeden
        3×3-Block mit den Ziffern 1 bis 9, ohne Wiederholung. Der Unterschied liegt darin, was sich
        hinter dem Raster verbirgt. Jedes richtig ausgefüllte Feld enthüllt ein kleines Stück eines
        Bildes, bis das gesamte Bild nach Fertigstellung des Rasters erscheint.
      </p>

      <h2>Drei Arten zu spielen</h2>
      <p>
        Sie können ein Kunstwerk aus einer Galerie berühmter Gemälde enthüllen, ein eigenes Foto
        hochladen, oder im klassischen Modus ganz ohne Bild spielen, wenn Sie sich lieber allein auf
        das Raster konzentrieren möchten.
      </p>

      <h2>Die Schwierigkeitsgrade</h2>
      <p>
        Vier Stufen stehen zur Verfügung, von leicht bis anspruchsvoll: leicht, mittel, schwer und
        Hölle. Jede Stufe passt an, wie viele Felder zu Beginn bereits ausgefüllt sind und wie viele
        Schlussfolgerungen zum Lösen nötig sind.
      </p>

      <h2>Freunde herausfordern</h2>
      <p>
        Nach Abschluss eines Rasters können Sie es per Link an einen Freund oder eine ganze Gruppe
        senden: Alle spielen genau dasselbe Raster, und eine Bestenliste vergleicht Zeit, Fehler und
        genutzte Tipps. Siehe <Link to="/de/creer-un-defi-sudoku">wie man eine Sudoku-Herausforderung erstellt</Link>.
      </p>

      <h2>Auf Handy und Computer</h2>
      <p>
        Sudoku Art läuft direkt im Browser, ohne Installation, egal ob auf dem Smartphone, Tablet
        oder Computer.
      </p>
    </>
  );
}

function CreateChallengeContent() {
  return (
    <>
      <h2>Was ist eine Sudoku-Herausforderung?</h2>
      <p>
        Eine Sudoku-Herausforderung teilt genau dasselbe Raster mit einer oder mehreren Personen und
        vergleicht anschließend die Ergebnisse. Jeder Teilnehmer spielt das Raster für sich; am Ende
        zeigt eine Bestenliste Zeit, Fehler und genutzte Tipps aller Spieler.
      </p>

      <h2>Einzel- oder Gruppen-Herausforderung</h2>
      <p>
        Sie können eine Herausforderung an eine einzelne Person für ein 1-gegen-1-Duell senden, oder
        den Gruppenmodus aktivieren, damit ein ganzes Team, eine Familie oder eine Klasse dasselbe
        Raster spielt und in einer gemeinsamen Bestenliste landet. Teilnehmer können mit oder ohne
        eigenes Konto mitmachen.
      </p>

      <h2>Ihre Herausforderung mit einem Foto personalisieren</h2>
      <p>
        Wie bei einer normalen Partie kann eine Herausforderung ein Kunstwerk, ein persönliches Foto
        enthüllen oder im klassischen Modus ohne Bild bleiben. Eine schöne Gelegenheit, eine
        originelle Herausforderung mit einer Erinnerung oder einem besonderen Foto zu versenden.
      </p>

      <h2>Vergleichen Sie Ihre Punktzahlen</h2>
      <p>
        Die Bestenliste einer Herausforderung berücksichtigt die Lösungszeit, aber auch Fehler und
        genutzte Tipps: Jeder Fehler oder Tipp fügt der Endpunktzahl eine Strafe von zwei Minuten
        hinzu, um schnelle und vorsichtige Spieler fair zu vergleichen.
      </p>

      <p>
        <Link to="/de/sudoku-facile">Mit einem leichten Raster beginnen</Link> oder <Link to="/de/sudoku-difficile">sich an etwas Schwierigerem versuchen</Link>, bevor Sie Ihre eigene Herausforderung versenden.
      </p>
    </>
  );
}

function FreeContent() {
  return (
    <>
      <h2>Ein 100% kostenloses Spiel</h2>
      <p>
        Sudoku Art ist komplett kostenlos: Alle Raster, alle Schwierigkeitsgrade und alle zu
        enthüllenden Bilder sind ohne Bezahlung zugänglich. Kein Abo, kein Raster hinter einer
        Bezahlschranke.
      </p>

      <h2>Kein Konto zum Spielen nötig</h2>
      <p>
        Sie können sofort mit einem Raster beginnen, ohne ein Konto anzulegen. Ein kostenloses Konto
        ist nützlich, wenn Sie Ihren Fortschritt, Ihre freigeschaltete Bildergalerie oder den Verlauf
        Ihrer versendeten Herausforderungen wiederfinden möchten.
      </p>

      <h2>Verfügbar auf allen Ihren Geräten</h2>
      <p>
        Das Spiel öffnet sich direkt im Browser, auf Computer und Handy gleichermaßen, ohne dass
        etwas installiert werden muss.
      </p>

      <h2>Eine Belohnung für jedes fertige Raster</h2>
      <p>
        Anders als bei klassischem Sudoku, bei dem nur das Raster zählt, enthüllt jede kostenlose
        Partie auf Sudoku Art ein Bild: ein zu entdeckendes Kunstwerk oder ein persönliches Foto
        Ihrer Wahl.
      </p>

      <p>
        Möchten Sie einfach loslegen? <Link to="/de/sudoku-facile">Spielen Sie zuerst ein leichtes Raster</Link>, oder entdecken Sie <Link to="/de/sudoku-image-cachee">das Prinzip des versteckten Bildes</Link>.
      </p>
    </>
  );
}

function EasyContent() {
  return (
    <>
      <h2>Warum mit dem leichten Level beginnen</h2>
      <p>
        Das leichte Level von Sudoku Art ist für Einsteiger oder für eine entspannte Partie gedacht:
        Zu Beginn sind bereits mehr Ziffern platziert, was komplexe Schlussfolgerungen einschränkt
        und das Raster schneller lösbar macht.
      </p>

      <h2>Die Sudoku-Regeln spielerisch lernen</h2>
      <p>
        Jede Zeile, jede Spalte und jeder 3×3-Block muss die Ziffern 1 bis 9 genau einmal enthalten.
        Ein leichtes Raster hilft, dieses Prinzip zu verinnerlichen, ohne bei einem schwer
        ableitbaren Feld hängen zu bleiben.
      </p>

      <h2>In Ihrem eigenen Tempo vorankommen</h2>
      <p>
        Sobald Sie sich beim leichten Level sicher fühlen, steht Ihnen ein{' '}
        <Link to="/de/sudoku-difficile">schwereres Raster</Link> oder direkt das{' '}
        <Link to="/de/sudoku-expert">Experten-Level</Link> offen. Auch jedes leichte Raster endet mit
        der Enthüllung eines Bildes, genau wie jedes andere Level.
      </p>
    </>
  );
}

function HardContent() {
  return (
    <>
      <h2>Eine echte logische Herausforderung</h2>
      <p>
        Das schwere Level von Sudoku Art zeigt zu Beginn deutlich weniger Ziffern. Sie müssen mehrere
        Schlussfolgerungen aneinanderreihen, bevor Sie das erste Feld mit Sicherheit ausfüllen
        können.
      </p>

      <h2>Anspruchsvollere Techniken</h2>
      <p>
        Bei einem schweren Raster reichen einfache Techniken (simple Ausschlussverfahren nach Zeile
        oder Spalte) nicht immer aus. Es wird nützlich, mögliche Zahlenpaare oder -tripel innerhalb
        derselben Zone zu erkennen, um voranzukommen.
      </p>

      <h2>Ihre Grenzen ausloten</h2>
      <p>
        Wird das schwere Level zu bequem, geht das <Link to="/de/sudoku-expert">Experten-Level</Link>{' '}
        noch weiter. Umgekehrt steht ein <Link to="/de/sudoku-facile">leichtes</Link> Raster jederzeit
        für eine entspanntere Partie bereit.
      </p>
    </>
  );
}

function ExpertContent() {
  return (
    <>
      <h2>Das anspruchsvollste Level von Sudoku Art</h2>
      <p>
        Das Experten-Level bietet Raster mit den wenigsten sichtbaren Startziffern und den längsten
        Schlussfolgerungsketten. Es eignet sich am besten für Spieler, die mit klassischem Sudoku
        bereits vertraut sind.
      </p>

      <h2>Für wen dieses Level gemacht ist</h2>
      <p>
        Wenn Sie regelmäßig <Link to="/de/sudoku-difficile">schwere</Link> Raster ohne Tipp lösen, ist
        das Experten-Level der nächste Schritt: Es erfordert Geduld und eine genaue Analyse des
        Rasters vor jedem Zug.
      </p>

      <h2>Herausforderungen auf Augenhöhe mit dem Level</h2>
      <p>
        Wie bei den anderen Leveln enthüllt ein fertiges Expertenraster ein Bild und kann als{' '}
        <Link to="/de/creer-un-defi-sudoku">Herausforderung versendet</Link> werden, um zu sehen, wer
        es am schnellsten und mit den wenigsten Fehlern und Tipps löst.
      </p>
    </>
  );
}

function HiddenImageContent() {
  return (
    <>
      <h2>Das Prinzip des versteckten Bildes</h2>
      <p>
        Bei Sudoku Art verbirgt sich hinter jedem Raster ein Bild. Es bleibt zu Beginn der Partie
        verschwommen oder verdeckt und enthüllt sich dann nach und nach mit jedem korrekt
        ausgefüllten Feld, bis es bei Fertigstellung des Rasters vollständig erscheint.
      </p>

      <h2>Ein persönliches Foto oder ein Kunstwerk</h2>
      <p>
        Das zu enthüllende Bild kann ein selbst hochgeladenes Foto sein — eine Erinnerung, ein
        Porträt, ein Urlaubsfoto — oder ein Kunstwerk aus einer Galerie berühmter Gemälde. Siehe die
        eigene Seite zu <Link to="/de/sudoku-art">Sudoku Art und den zu entdeckenden Kunstwerken</Link>.
      </p>

      <h2>Ein Spiel, das bis zum Schluss spannend bleibt</h2>
      <p>
        Anders als bei einem klassischen Sudoku-Raster, bei dem nur das letzte Feld zählt, gibt das
        versteckte Bild einen guten Grund, auch bei zunehmender Schwierigkeit weiterzuspielen: Jede
        gesetzte Ziffer bringt die vollständige Enthüllung ein Stück näher.
      </p>

      <p>
        Es ist auch eine originelle Art, <Link to="/de/creer-un-defi-sudoku">eine persönliche Herausforderung</Link>{' '}
        für einen Freund oder ein Familienmitglied vorzubereiten.
      </p>
    </>
  );
}

function SudokuArtContent() {
  return (
    <>
      <h2>Eine Galerie freizuschaltender Kunstwerke</h2>
      <p>
        Im Modus „Kunstwerk" enthüllt jedes fertige Sudoku-Raster ein Gemälde aus einer Galerie
        berühmter Werke. Je mehr Sie spielen, desto mehr füllt sich Ihre persönliche Galerie mit
        entdeckten Kunstwerken.
      </p>

      <h2>Spielerisch lernen</h2>
      <p>
        Sobald das Kunstwerk enthüllt ist, erhalten Sie ein paar Informationen dazu: Titel, Künstler
        und manchmal ein Detail oder eine Anekdote zum Gemälde. Eine unaufdringliche Art, zwischen
        zwei Rastern etwas Kunstgeschichte zu entdecken.
      </p>

      <h2>Level wählen, Überraschung bewahren</h2>
      <p>
        Welches Kunstwerk enthüllt wird, hängt vom gewählten Level ab: <Link to="/de/sudoku-facile">leicht</Link>,{' '}
        <Link to="/de/sudoku-difficile">schwer</Link> oder <Link to="/de/sudoku-expert">Experte</Link>. Das
        Prinzip bleibt bei jedem Level gleich: Je weiter das Raster fortschreitet, desto mehr enthüllt
        sich das Gemälde.
      </p>

      <p>
        Möchten Sie lieber ein persönliches Foto statt eines Kunstwerks enthüllen? Das Prinzip wird
        auf der Seite <Link to="/de/sudoku-image-cachee">Sudoku mit versteckten Bild</Link> erklärt.
      </p>
    </>
  );
}

export const PAGES = [
  {
    key: 'comment-ca-marche',
    navLabel: 'So funktioniert\'s',
    title: 'Wie funktioniert Sudoku Art? – Kompletter Leitfaden',
    description: 'Entdecken Sie, wie Sudoku Art funktioniert: Enthüllen Sie ein Kunstwerk oder ein verstecktes Foto, indem Sie Ihr Raster lösen, allein oder mit Freunden.',
    h1: 'Wie funktioniert Sudoku Art?',
    intro: 'Kurz gesagt: Lösen Sie ein klassisches Sudoku-Raster und enthüllen Sie dahinter ein verstecktes Bild, Feld für Feld.',
    Content: HowItWorksContent,
    cta: { label: 'Jetzt spielen', href: '/?jouer=facile' }
  },
  {
    key: 'creer-un-defi-sudoku',
    navLabel: 'Herausforderung erstellen',
    title: 'Eine personalisierte Sudoku-Herausforderung erstellen – Sudoku Art',
    description: 'Erstellen Sie eine kostenlose Sudoku-Herausforderung für Freunde oder eine Gruppe: gleiches Raster, Punkte-Bestenliste, optionales eigenes Bild.',
    h1: 'Erstellen Sie eine personalisierte Sudoku-Herausforderung',
    intro: 'Senden Sie dasselbe Raster an einen Freund oder eine ganze Gruppe und sehen Sie, wer es am schnellsten mit den wenigsten Fehlern und Tipps löst.',
    Content: CreateChallengeContent,
    cta: { label: 'Meine Herausforderung erstellen', href: '/?jouer=defi' }
  },
  {
    key: 'sudoku-gratuit',
    navLabel: 'Kostenloses Sudoku',
    title: 'Kostenloses Sudoku online – Ohne Konto spielen | Sudoku Art',
    description: 'Spielen Sie Sudoku kostenlos, ohne Konto, auf Handy oder Computer. Jedes fertige Raster enthüllt ein verstecktes Bild.',
    h1: 'Spielen Sie Sudoku kostenlos',
    intro: 'Alle Raster, alle Schwierigkeitsgrade und alle zu enthüllenden Bilder sind kostenlos, ohne Abo.',
    Content: FreeContent,
    cta: { label: 'Kostenlos spielen', href: '/?jouer=facile' }
  },
  {
    key: 'sudoku-facile',
    navLabel: 'Leichtes Sudoku',
    title: 'Leichtes Sudoku – Raster für Anfänger | Sudoku Art',
    description: 'Spielen Sie leichte Sudoku-Raster, ideal für Anfänger oder eine entspannte Partie, und enthüllen Sie mit jedem gelösten Raster ein verstecktes Bild.',
    h1: 'Leichtes Sudoku für den guten Einstieg',
    intro: 'Raster mit mehr bereits platzierten Ziffern, perfekt um die Regeln zu lernen oder entspannt zu spielen.',
    Content: EasyContent,
    cta: { label: 'Leicht spielen', href: '/?jouer=facile' }
  },
  {
    key: 'sudoku-difficile',
    navLabel: 'Schweres Sudoku',
    title: 'Schweres Sudoku – Raster für erfahrene Spieler',
    description: 'Nehmen Sie die schweren Sudoku-Raster auf Sudoku Art an: weniger Startziffern, mehr Schlussfolgerungen, und ein Bild zum Enthüllen.',
    h1: 'Schweres Sudoku für erfahrene Spieler',
    intro: 'Weniger sichtbare Ziffern zu Beginn, längere Schlussfolgerungsketten: eine echte Denksportaufgabe.',
    Content: HardContent,
    cta: { label: 'Schwer spielen', href: '/?jouer=complique' }
  },
  {
    key: 'sudoku-expert',
    navLabel: 'Experten-Sudoku',
    title: 'Experten-Sudoku – Das schwerste Level | Sudoku Art',
    description: 'Testen Sie das Experten-Level von Sudoku Art, den maximalen Schwierigkeitsgrad für erfahrene Spieler, mit einem Bild zum Enthüllen Raster für Raster.',
    h1: 'Sudoku Experten-Level: die ultimative Herausforderung',
    intro: 'Das anspruchsvollste Level von Sudoku Art, für Spieler, die sich mit schweren Rastern bereits wohlfühlen.',
    Content: ExpertContent,
    cta: { label: 'Als Experte spielen', href: '/?jouer=enfer' }
  },
  {
    key: 'sudoku-image-cachee',
    navLabel: 'Verstecktes Bild',
    title: 'Sudoku mit versteckten Bild – Sudoku Art',
    description: 'Spielen Sie Sudoku und enthüllen Sie nach und nach ein verstecktes Bild: ein persönliches Foto oder ein Kunstwerk, mit jedem Raster.',
    h1: 'Sudoku mit versteckten Bild: spielen und enthüllen',
    intro: 'Ein Bild bleibt hinter dem Raster verborgen und enthüllt sich nach und nach, während Sie die richtigen Ziffern platzieren.',
    Content: HiddenImageContent,
    cta: { label: 'Ein Bild entdecken', href: '/?jouer=facile' }
  },
  {
    key: 'sudoku-art',
    navLabel: 'Sudoku Art',
    title: 'Sudoku Art – Enthüllen Sie berühmte Kunstwerke beim Spielen',
    description: 'Entdecken Sie eine Galerie berühmter Kunstwerke, indem Sie Ihre Sudoku-Raster auf Sudoku Art lösen, kostenlos und ohne Konto.',
    h1: 'Sudoku Art: Kunstwerke beim Spielen entdecken',
    intro: 'Jedes im Modus „Kunstwerk" gelöste Raster enthüllt ein berühmtes Gemälde für Ihre persönliche Galerie.',
    Content: SudokuArtContent,
    cta: { label: 'Ein Kunstwerk entdecken', href: '/?jouer=facile' }
  }
];
