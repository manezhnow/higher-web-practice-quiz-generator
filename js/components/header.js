import logoUrl from '../../assets/logo.svg';
import menuIconUrl from '../../assets/icons/menu.svg';
import closeIconUrl from '../../assets/icons/close.svg';

/**
 * На десктопе показываем действие страницы, в мобильном меню — оба раздела.
 */
const ACTIONS = {
  'index.html': {
    href: './quizzes.html',
    text: 'Посмотреть сохранённые квизы',
    modifier: 'button_secondary',
  },
  'quizzes.html': {
    href: './index.html',
    text: 'Добавить квиз',
    modifier: '',
  },
  'quiz.html': {
    href: './quizzes.html',
    text: 'Посмотреть сохранённые квизы',
    modifier: 'button_secondary',
  },
};

const MOBILE_QUERY = '(width < 768px)';

function getCurrentPage() {
  const page = window.location.pathname.split('/').pop();

  return page in ACTIONS ? page : 'index.html';
}

function createLogo() {
  const logo = document.createElement('a');
  logo.className = 'header__logo';
  logo.href = './index.html';
  logo.setAttribute('aria-label', 'Генератор квизов, на главную');

  const image = document.createElement('img');
  image.className = 'header__logo-image';
  image.src = logoUrl;
  image.alt = '';
  logo.append(image);

  return logo;
}

function createNav(action) {
  const nav = document.createElement('nav');
  nav.className = 'header__nav';
  nav.id = 'header-nav';
  nav.setAttribute('aria-label', 'Основная навигация');

  const link = document.createElement('a');
  link.className = `header__action button ${action.modifier}`.trim();
  link.href = action.href;
  link.textContent = action.text;
  nav.append(link);

  const mobileLinks = document.createElement('div');
  mobileLinks.className = 'header__mobile-links';
  for (const [href, text] of [
    ['./index.html', 'Добавить квиз'],
    ['./quizzes.html', 'Сохранённые квизы'],
  ]) {
    const mobileLink = document.createElement('a');
    mobileLink.className = 'header__mobile-link';
    mobileLink.href = href;
    mobileLink.textContent = text;
    mobileLinks.append(mobileLink);
  }
  nav.append(mobileLinks);

  return nav;
}

/**
 * Наполняет семантический <header> логотипом и навигацией.
 * На мобильной ширине навигация прячется за бургер.
 */
export function renderHeader(headerElement) {
  const action = ACTIONS[getCurrentPage()];

  const inner = document.createElement('div');
  inner.className = 'header__inner container';

  const nav = createNav(action);

  const burger = document.createElement('button');
  burger.type = 'button';
  burger.className = 'header__burger';
  burger.setAttribute('aria-controls', nav.id);
  const burgerImage = document.createElement('img');
  burgerImage.className = 'header__burger-image';
  burgerImage.alt = '';
  burger.append(burgerImage);

  const mobileQuery = window.matchMedia(MOBILE_QUERY);

  const setMenuOpen = (isOpen) => {
    nav.hidden = !isOpen;
    burgerImage.src = isOpen ? closeIconUrl : menuIconUrl;
    burger.setAttribute('aria-expanded', String(isOpen));
    burger.setAttribute('aria-label', isOpen ? 'Закрыть меню' : 'Открыть меню');
  };

  const syncMenuToViewport = () => setMenuOpen(!mobileQuery.matches);

  burger.addEventListener('click', () => setMenuOpen(nav.hidden));
  headerElement.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && mobileQuery.matches && !nav.hidden) {
      setMenuOpen(false);
      burger.focus();
    }
  });
  mobileQuery.addEventListener('change', syncMenuToViewport);

  inner.append(createLogo(), nav, burger);
  headerElement.classList.add('header');
  headerElement.replaceChildren(inner);

  syncMenuToViewport();
}
