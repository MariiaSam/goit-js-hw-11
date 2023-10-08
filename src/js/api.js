import axios from 'axios';

const BASE_URL = 'https://pixabay.com/api/'; // базовий урл для всіх запитів Pixabay 

export async function fetchImg (searchValue, page = 1) {
    const params = new URLSearchParams({
        key: '39912694-61df371fe923d6a404cf5e9ff',
        q: searchValue,
        image_type:'photo' ,
        orientation: 'horizontal',
        safesearch: true,
        per_page: 40,
        page: `${page}`,
    })
    const { data } = await axios.get(`${BASE_URL} ${params}`);
    return data
}
