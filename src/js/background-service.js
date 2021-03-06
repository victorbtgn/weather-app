import refs from './refs';
import axios from 'axios';
import weatherService from './weather-service';

const pixabayApiKey = '16159179-9a5d2f4d64cb4ee75e82dc2d4';

export default {
  background: function (query) {
    if (weatherService.apiResponse) {
      axios
        .get(
          `https://cors-anywhere.herokuapp.com/https://pixabay.com/api?key=${pixabayApiKey}&q=${query}&image_type=photo&orientation=horizontal&category=places+travel&per_page=10`,
        )
        .then(res => {
          const image =
            res.data.hits[this.randomIndex(0, res.data.hits.length - 1)];
          if (window.matchMedia('(min-width: 1280px)').matches) {
            this.backgroundImage(image.largeImageURL);
          } else {
            this.backgroundImage(image.webformatURL);
          }
        })
        .catch(() => {
          this.background('sky');
        });
    }
  },

  backgroundImage: function (source) {
    refs.body.style.backgroundImage = `linear-gradient(#0a05054d, #0a0505bf), url('${source}')`;
  },

  randomIndex: function (min, max) {
    return Math.floor(Math.random() * (max - min + 1) + min);
  },
};
