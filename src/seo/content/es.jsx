// src/seo/content/es.jsx
import { Link } from 'react-router-dom';

function HowItWorksContent() {
  return (
    <>
      <h2>El principio del juego</h2>
      <p>
        Sudoku Art sigue las reglas clásicas del Sudoku: rellena cada fila, cada columna y cada
        bloque de 3×3 con los números del 1 al 9, sin repetirlos. La diferencia está en lo que se
        esconde detrás de la cuadrícula. Cada casilla que completes correctamente revela un pequeño
        fragmento de una imagen, hasta descubrirla por completo al terminar la cuadrícula.
      </p>

      <h2>Tres formas de jugar</h2>
      <p>
        Puedes elegir revelar una obra de arte de una galería de cuadros famosos, una foto personal
        que subas tú mismo, o jugar en modo clásico sin ninguna imagen si prefieres concentrarte
        solo en la cuadrícula.
      </p>

      <h2>Los niveles de dificultad</h2>
      <p>
        Hay cuatro niveles disponibles, de más accesible a más exigente: fácil, medio, difícil e
        infierno. Cada nivel ajusta cuántas casillas están ya rellenas al empezar y qué deducciones
        se necesitan para completarlas.
      </p>

      <h2>Desafía a tus amigos</h2>
      <p>
        Al terminar una cuadrícula, puedes enviarla a un amigo o a todo un grupo mediante un simple
        enlace: juegan exactamente la misma cuadrícula, y una clasificación compara el tiempo, los
        errores y las pistas usadas por cada uno. Consulta <Link to="/es/creer-un-defi-sudoku">cómo crear un desafío de Sudoku</Link>.
      </p>

      <h2>En móvil y ordenador</h2>
      <p>
        Sudoku Art funciona directamente en el navegador, sin instalación, tanto en smartphone,
        tablet como en ordenador.
      </p>
    </>
  );
}

function CreateChallengeContent() {
  return (
    <>
      <h2>¿Qué es un desafío de Sudoku?</h2>
      <p>
        Un desafío de Sudoku permite compartir exactamente la misma cuadrícula con una o varias
        personas, y luego comparar los resultados. Cada participante juega la cuadrícula por su
        cuenta; al final, una clasificación muestra el tiempo, los errores y las pistas usadas por
        cada uno.
      </p>

      <h2>Desafío individual o de grupo</h2>
      <p>
        Puedes enviar un desafío a una sola persona para un duelo 1 contra 1, o activar el modo
        grupo para que todo un equipo, familia o clase juegue la misma cuadrícula y aparezca en una
        clasificación común. Los participantes pueden unirse con o sin crear una cuenta.
      </p>

      <h2>Personaliza tu desafío con una foto</h2>
      <p>
        Igual que en una partida normal, un desafío puede revelar una obra de arte, una foto
        personal o quedarse en modo clásico sin imagen. Es una buena forma de enviar un desafío
        original con un recuerdo o una foto que cobra sentido al terminar la cuadrícula.
      </p>

      <h2>Compara tus puntuaciones</h2>
      <p>
        La clasificación de un desafío tiene en cuenta el tiempo de resolución, pero también los
        errores y las pistas usadas: cada error o pista añade una penalización de dos minutos a la
        puntuación final, para comparar de forma justa a los jugadores rápidos con los cuidadosos.
      </p>

      <p>
        <Link to="/es/sudoku-facile">Empieza con una cuadrícula fácil</Link> o <Link to="/es/sudoku-difficile">prueba algo más difícil</Link> antes de enviar tu propio desafío.
      </p>
    </>
  );
}

function FreeContent() {
  return (
    <>
      <h2>Un juego 100% gratuito</h2>
      <p>
        Sudoku Art es totalmente gratuito: todas las cuadrículas, todos los niveles de dificultad y
        todas las imágenes por revelar son accesibles sin pagar. Sin suscripción, sin cuadrículas
        bloqueadas tras un pago.
      </p>

      <h2>No hace falta cuenta para jugar</h2>
      <p>
        Puedes empezar una cuadrícula al instante, sin crear una cuenta. Una cuenta gratuita resulta
        útil si quieres recuperar tu progreso, tu galería de imágenes desbloqueadas o el historial de
        los desafíos que has enviado.
      </p>

      <h2>Disponible en todos tus dispositivos</h2>
      <p>
        El juego se abre directamente en el navegador, tanto en ordenador como en móvil, sin
        necesidad de instalar nada.
      </p>

      <h2>Una recompensa en cada cuadrícula terminada</h2>
      <p>
        A diferencia de un Sudoku clásico donde solo importa la cuadrícula, cada partida gratuita en
        Sudoku Art revela una imagen: una obra de arte por descubrir, o una foto personal de tu
        elección.
      </p>

      <p>
        ¿Quieres empezar de forma sencilla? <Link to="/es/sudoku-facile">Juega primero una cuadrícula fácil</Link>, o descubre <Link to="/es/sudoku-image-cachee">cómo funciona la imagen oculta</Link>.
      </p>
    </>
  );
}

function EasyContent() {
  return (
    <>
      <h2>Por qué empezar por el nivel fácil</h2>
      <p>
        El nivel fácil de Sudoku Art está pensado para jugadores principiantes o para una partida
        relajada: hay más números ya colocados al empezar, lo que limita las deducciones complejas y
        hace la cuadrícula más rápida de completar.
      </p>

      <h2>Aprende las reglas del Sudoku jugando</h2>
      <p>
        Cada fila, cada columna y cada bloque de 3×3 debe contener una sola vez los números del 1 al
        9. Una cuadrícula fácil permite asimilar este principio sin quedarse atascado en una casilla
        difícil de deducir.
      </p>

      <h2>Progresa a tu ritmo</h2>
      <p>
        Una vez que te sientas cómodo con el nivel fácil, nada impide intentar directamente una
        cuadrícula <Link to="/es/sudoku-difficile">más difícil</Link> o subir hasta el nivel{' '}
        <Link to="/es/sudoku-expert">experto</Link>. Cada cuadrícula fácil también termina con la
        revelación de una imagen, como cualquier otro nivel.
      </p>
    </>
  );
}

function HardContent() {
  return (
    <>
      <h2>Un verdadero desafío lógico</h2>
      <p>
        El nivel difícil de Sudoku Art deja muchos menos números visibles al empezar. Hay que
        encadenar varias deducciones antes de poder rellenar la primera casilla con certeza.
      </p>

      <h2>Técnicas más avanzadas</h2>
      <p>
        En una cuadrícula difícil, las técnicas básicas (eliminación simple por fila o columna) no
        siempre bastan. Se vuelve útil detectar pares o tríos de números candidatos posibles en una
        misma zona para avanzar.
      </p>

      <h2>Supera tus límites</h2>
      <p>
        Si el nivel difícil te resulta demasiado cómodo, el nivel <Link to="/es/sudoku-expert">experto</Link>{' '}
        lleva el ejercicio aún más lejos. Al contrario, una cuadrícula <Link to="/es/sudoku-facile">fácil</Link>{' '}
        siempre está disponible para una partida más relajada.
      </p>
    </>
  );
}

function ExpertContent() {
  return (
    <>
      <h2>El nivel más exigente de Sudoku Art</h2>
      <p>
        El nivel experto ofrece las cuadrículas con menos números visibles al empezar y las cadenas
        de deducciones más largas. Es el nivel más adecuado para jugadores ya cómodos con el Sudoku
        clásico.
      </p>

      <h2>Para quién es este nivel</h2>
      <p>
        Si terminas regularmente las cuadrículas <Link to="/es/sudoku-difficile">difíciles</Link> sin
        pistas, el nivel experto es el siguiente paso: exige paciencia y una lectura minuciosa de la
        cuadrícula antes de cada movimiento.
      </p>

      <h2>Desafíos a la altura del nivel</h2>
      <p>
        Como en los demás niveles, una cuadrícula experta terminada revela una imagen y puede{' '}
        <Link to="/es/creer-un-defi-sudoku">enviarse como desafío</Link> a otros jugadores, para ver
        quién la termina más rápido, con menos errores y pistas.
      </p>
    </>
  );
}

function HiddenImageContent() {
  return (
    <>
      <h2>El principio de la imagen oculta</h2>
      <p>
        En Sudoku Art, una imagen se esconde detrás de cada cuadrícula. Permanece borrosa u oculta al
        principio de la partida, y luego se revela poco a poco con cada casilla correctamente
        rellenada, hasta aparecer por completo al terminar la cuadrícula.
      </p>

      <h2>Una foto personal o una obra de arte</h2>
      <p>
        La imagen a revelar puede ser una foto que subas tú mismo — un recuerdo, un retrato, una
        foto de vacaciones — o una obra de arte elegida de una galería de cuadros famosos. Consulta
        la página dedicada a <Link to="/es/sudoku-art">Sudoku Art y las obras por descubrir</Link>.
      </p>

      <h2>Un juego que mantiene el interés hasta el final</h2>
      <p>
        A diferencia de una cuadrícula de Sudoku clásica donde solo importa la última casilla, la
        imagen oculta da una buena razón para seguir jugando incluso cuando la cuadrícula se
        complica: cada número colocado acerca un poco más a la revelación completa.
      </p>

      <p>
        Es también una forma original de preparar <Link to="/es/creer-un-defi-sudoku">un desafío personalizado</Link>{' '}
        para un amigo o un familiar.
      </p>
    </>
  );
}

function SudokuArtContent() {
  return (
    <>
      <h2>Una galería de obras de arte por desbloquear</h2>
      <p>
        En el modo «obra de arte», cada cuadrícula de Sudoku terminada revela un cuadro de una
        galería de obras famosas. Cuanto más juegues, más se llenará tu galería personal de obras
        descubiertas.
      </p>

      <h2>Aprende jugando</h2>
      <p>
        Una vez revelada la obra, la acompañan algunos datos: el título, el artista, y a veces un
        detalle o una anécdota sobre el cuadro. Una forma discreta de descubrir historia del arte
        entre cuadrícula y cuadrícula.
      </p>

      <h2>Elige tu nivel, mantén la sorpresa</h2>
      <p>
        La obra revelada depende del nivel elegido: <Link to="/es/sudoku-facile">fácil</Link>,{' '}
        <Link to="/es/sudoku-difficile">difícil</Link> o <Link to="/es/sudoku-expert">experto</Link>. El
        principio es el mismo en cada nivel: cuanto más avanza la cuadrícula, más se revela el
        cuadro.
      </p>

      <p>
        ¿Prefieres revelar una foto personal en lugar de una obra de arte? El principio se explica
        en la página <Link to="/es/sudoku-image-cachee">Sudoku con imagen oculta</Link>.
      </p>
    </>
  );
}

export const PAGES = [
  {
    key: 'comment-ca-marche',
    navLabel: 'Cómo funciona',
    title: '¿Cómo funciona Sudoku Art? – Guía completa',
    description: 'Descubre cómo jugar a Sudoku Art: revela una obra de arte o una foto oculta resolviendo tu cuadrícula, solo o desafiando a tus amigos.',
    h1: '¿Cómo funciona Sudoku Art?',
    intro: 'La idea en resumen: resuelve una cuadrícula de Sudoku clásico y revela una imagen oculta tras ella, casilla a casilla.',
    Content: HowItWorksContent,
    cta: { label: 'Empezar a jugar', href: '/?jouer=facile' }
  },
  {
    key: 'creer-un-defi-sudoku',
    navLabel: 'Crear un desafío',
    title: 'Crear un desafío de Sudoku personalizado – Sudoku Art',
    description: 'Crea un desafío de Sudoku gratuito para enviar a tus amigos o a un grupo: misma cuadrícula, clasificación de puntuaciones, imagen personalizada opcional.',
    h1: 'Crea un desafío de Sudoku personalizado',
    intro: 'Envía la misma cuadrícula a un amigo o a todo un grupo, y compara quién la termina más rápido, con menos errores y pistas.',
    Content: CreateChallengeContent,
    cta: { label: 'Crear mi desafío', href: '/?jouer=defi' }
  },
  {
    key: 'sudoku-gratuit',
    navLabel: 'Sudoku gratis',
    title: 'Sudoku gratis online – Juega sin cuenta | Sudoku Art',
    description: 'Juega al Sudoku gratis, sin necesidad de cuenta, en móvil u ordenador. Cada cuadrícula terminada revela una imagen oculta.',
    h1: 'Juega al Sudoku gratis',
    intro: 'Todas las cuadrículas, todos los niveles y todas las imágenes por revelar son gratuitas, sin suscripción.',
    Content: FreeContent,
    cta: { label: 'Jugar gratis', href: '/?jouer=facile' }
  },
  {
    key: 'sudoku-facile',
    navLabel: 'Sudoku fácil',
    title: 'Sudoku fácil – Cuadrículas para principiantes | Sudoku Art',
    description: 'Juega a cuadrículas de Sudoku fácil, ideales para empezar o jugar con calma, y revela una imagen oculta con cada cuadrícula terminada.',
    h1: 'Sudoku fácil para empezar bien',
    intro: 'Cuadrículas con más números ya colocados, perfectas para aprender las reglas o jugar sin complicaciones.',
    Content: EasyContent,
    cta: { label: 'Jugar en fácil', href: '/?jouer=facile' }
  },
  {
    key: 'sudoku-difficile',
    navLabel: 'Sudoku difícil',
    title: 'Sudoku difícil – Cuadrículas para jugadores avanzados',
    description: 'Acepta el reto de las cuadrículas de Sudoku difícil en Sudoku Art: menos números iniciales, más deducciones, y una imagen por revelar.',
    h1: 'Sudoku difícil para jugadores avanzados',
    intro: 'Menos números visibles al empezar, cadenas de deducción más largas: un verdadero ejercicio de lógica.',
    Content: HardContent,
    cta: { label: 'Jugar en difícil', href: '/?jouer=complique' }
  },
  {
    key: 'sudoku-expert',
    navLabel: 'Sudoku experto',
    title: 'Sudoku experto – El nivel más difícil | Sudoku Art',
    description: 'Prueba el nivel experto de Sudoku Art, la dificultad máxima para jugadores curtidos, con una imagen por revelar cuadrícula tras cuadrícula.',
    h1: 'Sudoku nivel experto: el desafío definitivo',
    intro: 'El nivel más exigente de Sudoku Art, reservado a jugadores ya cómodos con las cuadrículas difíciles.',
    Content: ExpertContent,
    cta: { label: 'Jugar en experto', href: '/?jouer=enfer' }
  },
  {
    key: 'sudoku-image-cachee',
    navLabel: 'Imagen oculta',
    title: 'Sudoku con imagen oculta – Sudoku Art',
    description: 'Juega al Sudoku y revela progresivamente una imagen oculta: una foto personal, o una obra de arte, con cada cuadrícula.',
    h1: 'Sudoku con imagen oculta: juega y revela',
    intro: 'Una imagen permanece oculta tras la cuadrícula y se va revelando poco a poco a medida que colocas los números correctos.',
    Content: HiddenImageContent,
    cta: { label: 'Descubrir una imagen', href: '/?jouer=facile' }
  },
  {
    key: 'sudoku-art',
    navLabel: 'Sudoku Art',
    title: 'Sudoku Art – Revela obras de arte famosas mientras juegas',
    description: 'Descubre una galería de obras de arte famosas resolviendo tus cuadrículas de Sudoku en Sudoku Art, gratis y sin necesidad de cuenta.',
    h1: 'Sudoku Art: descubre obras de arte mientras juegas',
    intro: 'Cada cuadrícula terminada en modo «obra de arte» revela un cuadro famoso para añadir a tu galería personal.',
    Content: SudokuArtContent,
    cta: { label: 'Descubrir una obra', href: '/?jouer=facile' }
  }
];
