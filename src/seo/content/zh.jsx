// src/seo/content/zh.jsx
import { Link } from 'react-router-dom';

function HowItWorksContent() {
  return (
    <>
      <h2>游戏原理</h2>
      <p>
        Sudoku Art 采用经典数独规则：在每一行、每一列和每个 3×3 宫格中填入数字 1 到 9，且不能重复。
        不同之处在于棋盘背后隐藏的内容。每正确填写一格，图片的一小部分就会显现，直到棋盘完成时，
        整张图片才完全展现。
      </p>

      <h2>三种玩法</h2>
      <p>
        您可以选择揭晓一幅来自名画画廊的艺术作品，上传一张个人照片，或者选择经典模式，不显示任何
        图片，专注于棋盘本身。
      </p>

      <h2>难度等级</h2>
      <p>
        共有四个等级，从易到难：简单、中等、困难和地狱。每个等级会调整初始已填格数以及完成所需的
        推理难度。
      </p>

      <h2>挑战好友</h2>
      <p>
        完成一局后，您可以通过链接将同一棋盘发送给一位好友或整个小组：大家玩完全相同的棋盘，排行榜
        会比较每个人的用时、错误数和使用的提示次数。请参阅<Link to="/zh/creer-un-defi-sudoku">如何创建数独挑战</Link>。
      </p>

      <h2>手机和电脑均可使用</h2>
      <p>
        Sudoku Art 直接在浏览器中运行，无需安装，无论是智能手机、平板电脑还是电脑都能使用。
      </p>
    </>
  );
}

function CreateChallengeContent() {
  return (
    <>
      <h2>什么是数独挑战？</h2>
      <p>
        数独挑战可以让您与一人或多人分享完全相同的棋盘，然后比较结果。每位参与者各自完成棋盘；
        结束后，排行榜会显示每个人的用时、错误数和使用的提示次数。
      </p>

      <h2>单人挑战或团体挑战</h2>
      <p>
        您可以向一个人发送挑战进行一对一对决，也可以开启团体模式，让整个团队、家庭或班级玩同一
        棋盘并出现在共同的排行榜上。参与者可以选择创建账号或不创建账号加入挑战。
      </p>

      <h2>用照片个性化您的挑战</h2>
      <p>
        和普通对局一样，挑战也可以揭晓一幅艺术作品、一张个人照片，或保持经典模式不显示图片。这是
        发送一份别具意义的挑战的好机会——用一段回忆或一张特别的照片，在棋盘完成时呈现。
      </p>

      <h2>比较你们的成绩</h2>
      <p>
        挑战的排行榜不仅考虑完成用时，还考虑错误数和使用的提示次数：每次错误或提示都会为最终得分
        增加两分钟的惩罚，以公平地比较速度快的玩家和谨慎的玩家。
      </p>

      <p>
        在发送自己的挑战之前，可以先<Link to="/zh/sudoku-facile">从一局简单棋盘开始</Link>，或<Link to="/zh/sudoku-difficile">尝试更有难度的挑战</Link>。
      </p>
    </>
  );
}

function FreeContent() {
  return (
    <>
      <h2>100% 免费游戏</h2>
      <p>
        Sudoku Art 完全免费：所有棋盘、所有难度等级和所有待揭晓的图片均可免费使用。没有订阅费用，
        没有需要付费才能解锁的棋盘。
      </p>

      <h2>无需账号即可游玩</h2>
      <p>
        您可以立即开始一局棋盘，无需创建账号。如果您想找回游戏进度、已解锁的图片画廊或已发送挑战
        的历史记录，一个免费账号会很有用。
      </p>

      <h2>支持所有设备</h2>
      <p>
        游戏直接在浏览器中打开，电脑和手机均可使用，无需安装任何内容。
      </p>

      <h2>每局都有奖励</h2>
      <p>
        与只关注棋盘本身的经典数独不同，Sudoku Art 上的每一局免费游戏都会揭晓一张图片：一幅待
        发现的艺术作品，或一张您自选的个人照片。
      </p>

      <p>
        想简单地开始吗？<Link to="/zh/sudoku-facile">先玩一局简单棋盘</Link>，或了解<Link to="/zh/sudoku-image-cachee">隐藏图片的原理</Link>。
      </p>
    </>
  );
}

function EasyContent() {
  return (
    <>
      <h2>为什么从简单等级开始</h2>
      <p>
        Sudoku Art 的简单等级专为新手玩家或轻松对局设计：开局时已填入更多数字，减少了复杂推理，
        让棋盘更快完成。
      </p>

      <h2>在游戏中学习数独规则</h2>
      <p>
        每一行、每一列和每个 3×3 宫格都必须恰好包含一次数字 1 到 9。简单棋盘可以帮助您掌握这一
        原理，而不会卡在难以推理的格子上。
      </p>

      <h2>按自己的节奏进步</h2>
      <p>
        一旦您对简单等级感到得心应手，随时可以直接挑战<Link to="/zh/sudoku-difficile">更难的棋盘</Link>，
        或者一路挑战到<Link to="/zh/sudoku-expert">专家</Link>等级。每局简单棋盘也和其他等级一样，
        以揭晓图片结束。
      </p>
    </>
  );
}

function HardContent() {
  return (
    <>
      <h2>真正的逻辑挑战</h2>
      <p>
        Sudoku Art 的困难等级在开局时显示的数字少得多。您需要连续进行多次推理，才能有把握地填入
        第一个格子。
      </p>

      <h2>更进阶的技巧</h2>
      <p>
        在困难棋盘中，基础技巧（简单的行列排除法）往往不再够用。学会在同一区域内找出可能的候选
        数字对或三元组，会对推进游戏很有帮助。
      </p>

      <h2>挑战自我极限</h2>
      <p>
        如果困难等级变得太轻松，<Link to="/zh/sudoku-expert">专家</Link>等级会将挑战推向更高层次。
        反过来，<Link to="/zh/sudoku-facile">简单</Link>棋盘也随时可用于一局更轻松的游戏。
      </p>
    </>
  );
}

function ExpertContent() {
  return (
    <>
      <h2>Sudoku Art 最具挑战性的等级</h2>
      <p>
        专家等级提供开局可见数字最少、推理链最长的棋盘。最适合已经熟悉经典数独的玩家。
      </p>

      <h2>适合谁来挑战</h2>
      <p>
        如果您经常在不使用提示的情况下完成<Link to="/zh/sudoku-difficile">困难</Link>棋盘，专家等级
        就是您的下一步：它需要耐心，以及在每一步之前对棋盘进行细致的分析。
      </p>

      <h2>与等级相匹配的挑战</h2>
      <p>
        和其他等级一样，完成的专家棋盘会揭晓一张图片，并可以<Link to="/zh/creer-un-defi-sudoku">作为挑战发送</Link>给
        其他玩家，看看谁能以最快速度、最少错误和提示完成它。
      </p>
    </>
  );
}

function HiddenImageContent() {
  return (
    <>
      <h2>隐藏图片的原理</h2>
      <p>
        在 Sudoku Art 中，每个棋盘背后都隐藏着一张图片。游戏开始时它模糊不清或被遮盖，随着每个
        格子被正确填写而逐渐显现，直到棋盘完成时完全呈现。
      </p>

      <h2>个人照片或艺术作品</h2>
      <p>
        待揭晓的图片可以是您自己上传的照片——一段回忆、一张肖像、一张假期照片——也可以是从名画
        画廊中挑选的艺术作品。请参阅专门介绍<Link to="/zh/sudoku-art">Sudoku Art 及待发现作品</Link>的页面。
      </p>

      <h2>让游戏保持趣味直到最后</h2>
      <p>
        与只在意最后一格的经典数独棋盘不同，隐藏图片给了您一个充分的理由，即使棋盘变得更难也要
        继续玩下去：每填入一个数字，都让您离完整揭晓更近一步。
      </p>

      <p>
        这也是为好友或家人准备<Link to="/zh/creer-un-defi-sudoku">个性化挑战</Link>的独特方式。
      </p>
    </>
  );
}

function SudokuArtContent() {
  return (
    <>
      <h2>可解锁的艺术作品画廊</h2>
      <p>
        在「艺术作品」模式下，每完成一局数独棋盘，就会揭晓一幅来自名画画廊的作品。玩得越多，您的
        个人画廊中收集到的作品就越多。
      </p>

      <h2>边玩边学</h2>
      <p>
        作品揭晓后，会附带一些信息：标题、艺术家，有时还有关于这幅画的细节或趣闻。这是在棋盘之间
        悄悄了解艺术史的一种方式。
      </p>

      <h2>选择等级，保留惊喜</h2>
      <p>
        揭晓的作品取决于所选等级：<Link to="/zh/sudoku-facile">简单</Link>、
        <Link to="/zh/sudoku-difficile">困难</Link>或<Link to="/zh/sudoku-expert">专家</Link>。原理在每个
        等级都是一样的：棋盘完成得越多，画作揭晓得也越多。
      </p>

      <p>
        您更想揭晓个人照片而不是艺术作品？相关原理详见<Link to="/zh/sudoku-image-cachee">隐藏图片数独</Link>页面。
      </p>
    </>
  );
}

export const PAGES = [
  {
    key: 'comment-ca-marche',
    navLabel: '玩法介绍',
    title: 'Sudoku Art 如何运作？——完整指南',
    description: '了解如何玩 Sudoku Art：通过独自或与好友一起完成棋盘，揭晓隐藏的艺术作品或照片。',
    h1: 'Sudoku Art 如何运作？',
    intro: '简而言之：完成一局经典数独棋盘，逐格揭晓背后隐藏的图片。',
    Content: HowItWorksContent,
    cta: { label: '开始游戏', href: '/?jouer=facile' }
  },
  {
    key: 'creer-un-defi-sudoku',
    navLabel: '创建挑战',
    title: '创建个性化数独挑战 – Sudoku Art',
    description: '创建免费数独挑战，发送给好友或团体：相同棋盘，成绩排行榜，可选个性化图片。',
    h1: '创建个性化数独挑战',
    intro: '将同一棋盘发送给好友或整个团体，比较谁用最少的错误和提示，最快完成挑战。',
    Content: CreateChallengeContent,
    cta: { label: '创建我的挑战', href: '/?jouer=defi' }
  },
  {
    key: 'sudoku-gratuit',
    navLabel: '免费数独',
    title: '在线免费数独——无需账号即可游玩 | Sudoku Art',
    description: '免费玩数独，无需账号，手机电脑均可使用。每完成一局棋盘就会揭晓一张隐藏图片。',
    h1: '免费玩数独',
    intro: '所有棋盘、所有难度等级和所有待揭晓图片均免费提供，无需订阅。',
    Content: FreeContent,
    cta: { label: '免费游戏', href: '/?jouer=facile' }
  },
  {
    key: 'sudoku-facile',
    navLabel: '简单数独',
    title: '简单数独——适合新手的棋盘 | Sudoku Art',
    description: '玩简单数独棋盘，适合新手或轻松游戏，每完成一局都会揭晓一张隐藏图片。',
    h1: '简单数独，轻松上手',
    intro: '开局已填入更多数字的棋盘，非常适合学习规则或轻松游戏。',
    Content: EasyContent,
    cta: { label: '玩简单模式', href: '/?jouer=facile' }
  },
  {
    key: 'sudoku-difficile',
    navLabel: '困难数独',
    title: '困难数独——适合资深玩家的棋盘',
    description: '在 Sudoku Art 挑战困难数独棋盘：更少的初始数字，更多的推理，以及一张待揭晓的图片。',
    h1: '困难数独，献给资深玩家',
    intro: '开局可见数字更少，推理链更长：一次真正的逻辑训练。',
    Content: HardContent,
    cta: { label: '玩困难模式', href: '/?jouer=complique' }
  },
  {
    key: 'sudoku-expert',
    navLabel: '专家数独',
    title: '专家数独——最高难度 | Sudoku Art',
    description: '挑战 Sudoku Art 专家等级，为资深玩家准备的最高难度，每局棋盘都揭晓一张图片。',
    h1: '数独专家等级：终极挑战',
    intro: 'Sudoku Art 最具挑战性的等级，专为已经熟练掌握困难棋盘的玩家准备。',
    Content: ExpertContent,
    cta: { label: '玩专家模式', href: '/?jouer=enfer' }
  },
  {
    key: 'sudoku-image-cachee',
    navLabel: '隐藏图片',
    title: '隐藏图片数独 – Sudoku Art',
    description: '玩数独，逐步揭晓隐藏的图片：一张个人照片，或一幅艺术作品，每局棋盘都有惊喜。',
    h1: '隐藏图片数独：边玩边揭晓',
    intro: '一张图片隐藏在棋盘背后，随着您填入正确的数字而逐渐显现。',
    Content: HiddenImageContent,
    cta: { label: '揭晓图片', href: '/?jouer=facile' }
  },
  {
    key: 'sudoku-art',
    navLabel: 'Sudoku Art',
    title: 'Sudoku Art——边玩边揭晓名画作品',
    description: '通过完成 Sudoku Art 上的数独棋盘，免费且无需账号，探索一座名画画廊。',
    h1: 'Sudoku Art：边玩边发现艺术作品',
    intro: '在「艺术作品」模式下完成的每局棋盘，都会揭晓一幅名画，加入您的个人画廊。',
    Content: SudokuArtContent,
    cta: { label: '发现一幅作品', href: '/?jouer=facile' }
  }
];
