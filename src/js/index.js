import { Loading } from 'notiflix/build/notiflix-loading-aio';
import { Report } from 'notiflix/build/notiflix-report-aio';
import { Notify } from 'notiflix/build/notiflix-notify-aio';import SimpleLightbox from 'simplelightbox';
import 'simplelightbox/dist/simple-lightbox.min.css';
import { createMarkup } from './markup';
import { fetchImg } from './api';

const form = document.querySelector('#search-form');
const gallery = document.querySelector('.gallery');
const btnLoad = (document.querySelector('.load-more').hidden = true);
const markup = document.querySelector('.js-markup');

const simpleLightbox = new SimpleLightbox('.gallery a');

form.addEventListener('submit', onSubmit);

let searchValue;
let page = 1;

async function onSubmit(evt) {
  try {
    evt.preventDefault();
    observer.unobserve(markup);
    gallery.innerHTML = '';
    page = 1;
    Loading.arrows();
    searchValue = form.elements.searchQuery.value.trim();
    const validInput = /^[a-zA-Z0-9\s]+$/.test(searchValue);
    if (!validInput || searchValue === '') {
      Report.warning('Invalid input');
      Loading.remove();
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
    Report.warning('Please enter a valid search query.');
    console.log(error);
  } finally {
    Loading.remove();
  }
  observer.observe(markup);
}

function scrollUp() {
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

let observer = new IntersectionObserver(handlerPagination, options);

async function handlerPagination(entries, observer) {
    for (let entry of entries) {
      if (entry.isIntersecting) {
        try {
          Loading.hourglass();
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
        } catch (err) {
          console.log(err);
  
          Report.failure(
            "We're sorry, but you've reached the end of search results."
          );
        } finally {
          Loading.remove();
        }
      }
    }
  }