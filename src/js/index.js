import { Loading } from 'notiflix/build/notiflix-loading-aio';
import { Report } from 'notiflix/build/notiflix-report-aio';
import { Notify } from 'notiflix/build/notiflix-notify-aio';
import SimpleLightbox from 'simplelightbox';
import 'simplelightbox/dist/simple-lightbox.min.css';
import { createMarkup } from './markup';
import { fetchImg } from './api';

const form = document.querySelector('#search-form');
const gallery = document.querySelector('.gallery');
const markup = document.querySelector('.js-markup');

const simpleLightbox = new SimpleLightbox('.gallery a');

form.addEventListener('submit', onSubmit);

let searchValue;
let page = 1;
let errorTimeout;

// ф-ція відобр завантаження
function showLoading() {
  Loading.arrows();
}

// ф-ція приховування завантаження
function hideLoading() {
  Loading.remove();
}

// ф-ція очищення галереї
function clearGallery() {
  gallery.innerHTML = '';
}

// ф-ція скидання сторінки
function resetPage() {
  page = 1;
}

function handleInvalidInput() {
  Report.warning('Invalid input');
  hideLoading();
}

// перевірка ивалідності введення
function isValidInput(input) {
  return /^[a-zA-Z0-9\s]+$/.test(input);
}

//пошук та відображення зображень при відправці форми
async function onSubmit(evt) {
  try {
    evt.preventDefault();
    observer.unobserve(markup); // призупиняє спостереження
    clearGallery();
    resetPage();
    showLoading();
    searchValue = form.elements.searchQuery.value.trim();//отримання значення, введене користувачем в поле пошуку
    if (!isValidInput(searchValue) || searchValue === '') {
      handleInvalidInput();
      return;
    } else {
      const { hits, totalHits } = await fetchImg(searchValue);
      if (totalHits === 0) {
        throw new Error('Nothing has defined');
      }
      Notify.success(`Hooray! We found ${totalHits} images`);
      gallery.innerHTML = createMarkup(hits);
      simpleLightbox.refresh();
      evt.target.reset();
    }
  } catch (error) {
    clearTimeout(errorTimeout);
    Report.warning(`Error: ${error.message}`);
    errorTimeout = setTimeout(() => {
      Report.remove();
    }, 3000);
    // Report.warning('Please enter a valid search query.');
    console.log(error);
  } finally {
    hideLoading();
  }
  observer.observe(markup);
}

function scrollToTop() {
  window.scrollTo({
    top: 0,
    behavior: 'smooth',
  });
}

let options = {
  root: null,
  rootMargin: '10px',
  threshold: 0,
};

//для завантаження додаткових зображень, коли користувач прокручує сторінку вниз.
let observer = new IntersectionObserver(handlerPagination, options);

// завантаження додаткових зображень
async function handlerPagination(entries) {
  for (let entry of entries) {
    if (entry.isIntersecting) {
      try {
        showLoading();
        page += 1;
        const { hits, totalHits } = await fetchImg(searchValue, page);
        gallery.insertAdjacentHTML('beforeend', createMarkup(hits));
        simpleLightbox.refresh();
        console.log(hits);
        if (hits.length === 0 && entry.isIntersecting) {
          Report.failure(
            "We're sorry, but you've reached the end of search results."
          );
        }
      } catch (error) {
        clearTimeout(errorTimeout);
        Report.failure(
          "We're sorry, but you've reached the end of search results."
        );
      } finally {
        hideLoading();
      }
    }
  }
}
