// src/seo/content/en.jsx
import { Link } from 'react-router-dom';

function HowItWorksContent() {
  return (
    <>
      <h2>The basic idea</h2>
      <p>
        Sudoku Art uses the classic Sudoku rules: fill every row, column and 3×3 block with the
        digits 1 to 9, with no repeats. The difference is what's hiding behind the grid. Every cell
        you fill correctly reveals a small piece of a picture, until the whole image appears once the
        grid is complete.
      </p>

      <h2>Three ways to play</h2>
      <p>
        You can reveal an artwork from a gallery of famous paintings, a personal photo you upload
        yourself, or play in classic mode with no image at all if you'd rather focus purely on the
        grid.
      </p>

      <h2>Difficulty levels</h2>
      <p>
        Four levels are available, from easiest to hardest: easy, medium, hard and hell. Each level
        adjusts how many cells are already filled at the start, and how many deductions you'll need
        to complete it.
      </p>

      <h2>Challenge your friends</h2>
      <p>
        Once you finish a grid, you can send it to a friend or a whole group with a simple link: they
        play the exact same grid, and a leaderboard compares completion time, errors and hints used
        by everyone. See <Link to="/en/creer-un-defi-sudoku">how to create a Sudoku challenge</Link>.
      </p>

      <h2>On mobile and desktop</h2>
      <p>
        Sudoku Art runs straight in your browser, with nothing to install, on phone, tablet or
        computer alike.
      </p>
    </>
  );
}

function CreateChallengeContent() {
  return (
    <>
      <h2>What is a Sudoku challenge?</h2>
      <p>
        A Sudoku challenge shares the exact same grid with one or several people, then compares
        results. Each participant plays the grid on their own; at the end, a leaderboard shows
        completion time, errors and hints used by everyone.
      </p>

      <h2>One-on-one or group challenge</h2>
      <p>
        You can send a challenge to a single person for a 1-vs-1 duel, or turn on group mode so a
        whole team, family or class plays the same grid and lands on a shared leaderboard.
        Participants can join with or without creating an account.
      </p>

      <h2>Personalize your challenge with a photo</h2>
      <p>
        Just like a regular game, a challenge can reveal an artwork, a personal photo, or stay in
        classic mode with no image. It's a great way to send an original challenge built around a
        memory or a photo that means something once the grid is solved.
      </p>

      <h2>Compare your scores</h2>
      <p>
        A challenge's leaderboard factors in completion time, but also errors and hints used: each
        error or hint adds a two-minute penalty to the final score, to fairly rank fast players
        against careful ones.
      </p>

      <p>
        <Link to="/en/sudoku-facile">Start with an easy grid</Link> or <Link to="/en/sudoku-difficile">try something tougher</Link> before sending your own challenge.
      </p>
    </>
  );
}

function FreeContent() {
  return (
    <>
      <h2>A 100% free game</h2>
      <p>
        Sudoku Art is entirely free: every grid, every difficulty level and every image to reveal is
        available at no cost. No subscription, no grid locked behind a paywall.
      </p>

      <h2>No account required to play</h2>
      <p>
        You can start a grid right away, with no account needed. A free account is still handy if you
        want to keep track of your progress, your unlocked image gallery, or the history of
        challenges you've sent.
      </p>

      <h2>Available on all your devices</h2>
      <p>
        The game opens straight in your browser, on desktop and mobile alike, with nothing to
        install.
      </p>

      <h2>A reward with every finished grid</h2>
      <p>
        Unlike a classic Sudoku where only the grid matters, every free game on Sudoku Art reveals a
        picture too: an artwork to discover, or a personal photo of your choice.
      </p>

      <p>
        Want the simplest way to start? <Link to="/en/sudoku-facile">Play an easy grid first</Link>, or check out <Link to="/en/sudoku-image-cachee">how the hidden picture works</Link>.
      </p>
    </>
  );
}

function EasyContent() {
  return (
    <>
      <h2>Why start with the easy level</h2>
      <p>
        Sudoku Art's easy level is built for beginners, or for a relaxed game: more digits are
        already placed at the start, which limits complex deductions and makes the grid faster to
        complete.
      </p>

      <h2>Learn the rules of Sudoku while playing</h2>
      <p>
        Every row, column and 3×3 block must contain the digits 1 to 9 exactly once. An easy grid
        lets you get comfortable with this principle without getting stuck on a hard-to-deduce cell.
      </p>

      <h2>Progress at your own pace</h2>
      <p>
        Once you're comfortable with easy, nothing stops you from jumping straight to a{' '}
        <Link to="/en/sudoku-difficile">harder grid</Link> or all the way up to{' '}
        <Link to="/en/sudoku-expert">expert</Link> level. Every easy grid also ends with an image
        reveal, just like any other level.
      </p>
    </>
  );
}

function HardContent() {
  return (
    <>
      <h2>A real logic challenge</h2>
      <p>
        Sudoku Art's hard level leaves far fewer digits visible at the start. You'll need to chain
        several deductions before you can fill the very first cell with certainty.
      </p>

      <h2>More advanced techniques</h2>
      <p>
        On a hard grid, basic techniques (simple elimination by row or column) aren't always enough
        anymore. Spotting candidate pairs or triples within the same zone becomes genuinely useful to
        move forward.
      </p>

      <h2>Push your limits</h2>
      <p>
        If hard starts feeling too comfortable, <Link to="/en/sudoku-expert">expert</Link> level pushes
        the exercise even further. Conversely, an <Link to="/en/sudoku-facile">easy</Link> grid is
        always there for a more relaxed game.
      </p>
    </>
  );
}

function ExpertContent() {
  return (
    <>
      <h2>Sudoku Art's most demanding level</h2>
      <p>
        Expert level offers grids with the fewest starting digits and the longest deduction chains.
        It's best suited to players already comfortable with classic Sudoku.
      </p>

      <h2>Who this level is for</h2>
      <p>
        If you regularly finish <Link to="/en/sudoku-difficile">hard</Link> grids without a single hint,
        expert is your next step: it demands patience and a careful reading of the grid before every
        move.
      </p>

      <h2>Challenges worthy of the level</h2>
      <p>
        Just like other levels, a finished expert grid reveals a picture and can be{' '}
        <Link to="/en/creer-un-defi-sudoku">sent as a challenge</Link> to other players, to see who
        finishes it fastest, with the fewest errors and hints.
      </p>
    </>
  );
}

function HiddenImageContent() {
  return (
    <>
      <h2>How the hidden picture works</h2>
      <p>
        On Sudoku Art, a picture hides behind every grid. It stays blurred or masked at the start of
        the game, then reveals itself little by little with every correctly filled cell, until it
        appears in full once the grid is complete.
      </p>

      <h2>A personal photo or an artwork</h2>
      <p>
        The picture to reveal can be a photo you upload yourself — a memory, a portrait, a holiday
        snapshot — or an artwork picked from a gallery of famous paintings. See the dedicated page on{' '}
        <Link to="/en/sudoku-art">Sudoku Art and the artworks to discover</Link>.
      </p>

      <h2>A game that stays interesting until the end</h2>
      <p>
        Unlike a classic Sudoku grid where only the last cell matters, the hidden picture gives you a
        good reason to keep playing even as the grid gets harder: every digit placed brings you a
        little closer to the full reveal.
      </p>

      <p>
        It's also an original way to prepare <Link to="/en/creer-un-defi-sudoku">a custom challenge</Link>{' '}
        for a friend or family member.
      </p>
    </>
  );
}

function SudokuArtContent() {
  return (
    <>
      <h2>A gallery of artworks to unlock</h2>
      <p>
        In "artwork" mode, every finished Sudoku grid reveals a painting from a gallery of famous
        works. The more you play, the more your personal gallery fills up with discovered artworks.
      </p>

      <h2>Learn while you play</h2>
      <p>
        Once the artwork is revealed, a bit of information comes with it: the title, the artist, and
        sometimes a detail or a fun fact about the painting. A quiet way to pick up some art history
        between grids.
      </p>

      <h2>Pick your level, keep the surprise</h2>
      <p>
        The artwork revealed depends on the level you choose: <Link to="/en/sudoku-facile">easy</Link>,{' '}
        <Link to="/en/sudoku-difficile">hard</Link> or <Link to="/en/sudoku-expert">expert</Link>. The
        principle stays the same at every level: the further the grid progresses, the more the
        painting unveils itself.
      </p>

      <p>
        Would you rather reveal a personal photo instead of an artwork? The concept is explained on
        the <Link to="/en/sudoku-image-cachee">Sudoku with a hidden picture</Link> page.
      </p>
    </>
  );
}

export const PAGES = [
  {
    key: 'comment-ca-marche',
    navLabel: 'How it works',
    title: 'How Does Sudoku Art Work? – Full Guide',
    description: 'Discover how to play Sudoku Art: reveal a hidden artwork or photo by solving your grid, alone or by challenging your friends.',
    h1: 'How Does Sudoku Art Work?',
    intro: 'The idea in short: solve a classic Sudoku grid and reveal a hidden picture behind it, cell by cell.',
    Content: HowItWorksContent,
    cta: { label: 'Start playing', href: '/?jouer=facile' }
  },
  {
    key: 'creer-un-defi-sudoku',
    navLabel: 'Create a challenge',
    title: 'Create a Custom Sudoku Challenge – Sudoku Art',
    description: 'Create a free Sudoku challenge to send to your friends or a group: same grid, score leaderboard, optional custom image.',
    h1: 'Create a Custom Sudoku Challenge',
    intro: 'Send the same grid to a friend or an entire group, and see who finishes it fastest, with the fewest errors and hints.',
    Content: CreateChallengeContent,
    cta: { label: 'Create my challenge', href: '/?jouer=defi' }
  },
  {
    key: 'sudoku-gratuit',
    navLabel: 'Free Sudoku',
    title: 'Free Sudoku Online – Play Without an Account | Sudoku Art',
    description: 'Play Sudoku for free, no account required, on mobile or desktop. Every finished grid reveals a hidden picture.',
    h1: 'Play Sudoku for Free',
    intro: 'Every grid, every difficulty level and every image to reveal is free, with no subscription.',
    Content: FreeContent,
    cta: { label: 'Play for free', href: '/?jouer=facile' }
  },
  {
    key: 'sudoku-facile',
    navLabel: 'Easy Sudoku',
    title: 'Easy Sudoku – Grids for Beginners | Sudoku Art',
    description: 'Play easy Sudoku grids, perfect for beginners or a relaxed game, and reveal a hidden picture with every grid you finish.',
    h1: 'Easy Sudoku to Get Started',
    intro: 'Grids with more digits already placed, perfect for learning the rules or playing without the pressure.',
    Content: EasyContent,
    cta: { label: 'Play easy', href: '/?jouer=facile' }
  },
  {
    key: 'sudoku-difficile',
    navLabel: 'Hard Sudoku',
    title: 'Hard Sudoku – Grids for Experienced Players',
    description: 'Take on hard Sudoku grids on Sudoku Art: fewer starting digits, more deductions, and a picture to reveal.',
    h1: 'Hard Sudoku for Experienced Players',
    intro: 'Fewer digits visible at the start, longer chains of deductions: a genuine logic exercise.',
    Content: HardContent,
    cta: { label: 'Play hard', href: '/?jouer=complique' }
  },
  {
    key: 'sudoku-expert',
    navLabel: 'Expert Sudoku',
    title: 'Expert Sudoku – The Hardest Level | Sudoku Art',
    description: 'Try Sudoku Art\'s expert level, the maximum difficulty for seasoned players, with a picture to reveal grid after grid.',
    h1: 'Expert Sudoku: the Ultimate Challenge',
    intro: 'Sudoku Art\'s most demanding level, reserved for players already comfortable with hard grids.',
    Content: ExpertContent,
    cta: { label: 'Play expert', href: '/?jouer=enfer' }
  },
  {
    key: 'sudoku-image-cachee',
    navLabel: 'Hidden picture',
    title: 'Sudoku With a Hidden Picture – Sudoku Art',
    description: 'Play Sudoku and progressively reveal a hidden picture: a personal photo, or an artwork, with every grid.',
    h1: 'Sudoku With a Hidden Picture: Play and Reveal',
    intro: 'A picture stays hidden behind the grid and unveils itself little by little, as you place the right digits.',
    Content: HiddenImageContent,
    cta: { label: 'Discover a picture', href: '/?jouer=facile' }
  },
  {
    key: 'sudoku-art',
    navLabel: 'Sudoku Art',
    title: 'Sudoku Art – Reveal Famous Artworks While You Play',
    description: 'Discover a gallery of famous artworks by solving your Sudoku grids on Sudoku Art, free and with no account required.',
    h1: 'Sudoku Art: Discover Artworks While You Play',
    intro: 'Every grid finished in "artwork" mode reveals a famous painting to add to your personal gallery.',
    Content: SudokuArtContent,
    cta: { label: 'Discover an artwork', href: '/?jouer=facile' }
  }
];
