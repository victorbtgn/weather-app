import axios from 'axios';
import getCurrentTime from './get-current-time';

axios.defaults.baseURL = 'https://api.openweathermap.org/data/2.5/';
const apiKey = 'c112c800340c3f1ee2fad83b32fe690c';

export default {
  searchQuery: 'Kyiv',
  apiResponse: false,
  todayResponse: [],
  fiveDaysResponse: [],
  fiveDaysResponseCity: [],
  /* Это в шаблон на пять дней */
  forecastFiveDays: [],
  /* Это в шаблон для more info */
  firstDayForecast: [],
  secondDayForecast: [],
  thirdDayForecast: [],
  fourthDayForecast: [],
  fifthDayForecast: [],
  fetchTodayWeather: async function () {
    try {
      const { data } = await axios.get(
        `weather?q=${this.query}&units=metric&appid=${apiKey}`,
      );
      this.apiResponse = true;
      this.todayResponse = data;
      this.roundTodayTemperature();
      this.createIconLink();
      return data;
    } catch (error) {
      this.apiResponse = false;
      console.log(error);
    }
  },
  fetchFiveDaysWeather: async function () {
    try {
      const { data } = await axios.get(
        `forecast?q=${this.query}&units=metric&appid=${apiKey}`,
      );
      this.apiResponse = true;
      this.fiveDaysResponse = data.list;
      this.fiveDaysResponseCity = data.city;
      this.changeForecastTime(this.fiveDaysResponse);
      this.sortResponseOnArrays(this.fiveDaysResponse);
      console.log(this.fiveDaysResponse);
      console.log(this.secondDayForecast);
      this.getForecastFiveDays(
        this.firstDayForecast,
        this.secondDayForecast,
        this.thirdDayForecast,
        this.fourthDayForecast,
        this.fifthDayForecast,
      );
      // this.changeMoreInfo([
      //   this.firstDayForecast,
      //   this.secondDayForecast,
      //   this.thirdDayForecast,
      //   this.fourthDayForecast,
      //   this.fifthDayForecast,
      // ]);
    } catch (error) {
      this.apiResponse = true;
      console.log(error);
    }
  },
  roundTodayTemperature() {
    this.todayResponse.main.temp = Math.round(this.todayResponse.main.temp);
    this.todayResponse.main.temp_min = Math.round(
      this.todayResponse.main.temp_min,
    );
    this.todayResponse.main.temp_max = Math.round(
      this.todayResponse.main.temp_max,
    );
  },
  createIconLink() {
    this.todayResponse.weather = `https://openweathermap.org/img/w/${this.todayResponse.weather[0].icon}.png`;
  },
  changeForecastTime(array) {
    array.forEach(el => {
      const { total } = getCurrentTime(
        this.fiveDaysResponseCity.timezone,
        el.dt,
      );
      el.dt = total;
    });
  },
  sortResponseOnArrays(array) {
    const dayOne = array[0].dt_txt.slice(0, 10);
    const dayTwo = array[8].dt_txt.slice(0, 10);
    const dayThree = array[16].dt_txt.slice(0, 10);
    const dayFour = array[24].dt_txt.slice(0, 10);
    const dayFive = array[32].dt_txt.slice(0, 10);
    array.forEach(element => {
      switch (element.dt_txt.slice(0, 10)) {
        case dayOne:
          this.firstDayForecast = array.filter(
            el => el.dt_txt.slice(0, 10) === dayOne,
          );
          break;
        case dayTwo:
          this.secondDayForecast = array.filter(
            el => el.dt_txt.slice(0, 10) === dayTwo,
          );
          break;
        case dayThree:
          this.thirdDayForecast = array.filter(
            el => el.dt_txt.slice(0, 10) === dayThree,
          );
          break;
        case dayFour:
          this.fourthDayForecast = array.filter(
            el => el.dt_txt.slice(0, 10) === dayFour,
          );
          break;
        case dayFive:
          this.fifthDayForecast = array.filter(
            el => el.dt_txt.slice(0, 10) === dayFive,
          );
          break;

        default:
      }
    });
  },
  calcMinMaxTemp(array) {
    let minTempArray = [];
    let maxTempArray = [];
    array.forEach(el => {
      minTempArray = [...minTempArray, ...el.main.temp_min];
    });
    array.forEach(el => {
      maxTempArray = [...maxTempArray, ...el.main.temp_max];
    });
    let temp_min = minTempArray[0];
    let temp_max = maxTempArray[0];
    for (let i = 1; i < minTempArray.length; ++i) {
      if (minTempArray[i] < temp_min) temp_min = minTempArray[i];
    }
    for (let i = 1; i < maxTempArray.length; ++i) {
      if (maxTempArray[i] > temp_max) temp_max = maxTempArray[i];
    }
    temp_min = Math.round(temp_min);
    temp_max = Math.round(temp_max);
    return { temp_min, temp_max };
  },
  calcDate(array) {
    const time = new Date(array[0].dt * 1000);
    // time.setTime(time.getTime() +
    // (time.getTimezoneOffset() * 60 + this.fiveDaysResponseCity.timezone) * 1000,)
    const locales = 'en-US';
    const month = time.toLocaleString(locales, { month: 'short' });
    const day = time.toLocaleString(locales, { weekday: 'long' });
    const date = time.toLocaleString(locales, { day: 'numeric' });
    return {
      month,
      day,
      date,
    };
  },
  getForecastFiveDays(one, two, three, four, five) {
    this.forecastFiveDays = {
      firstDay: {
        date: this.calcDate(one),
        icon: `https://openweathermap.org/img/w/${one[0].weather[0].icon}.png`,
        description: one[0].weather[0].descrition,
        temp: this.calcMinMaxTemp(one),
      },
      secondDay: {
        date: this.calcDate(two),
        icon: `https://openweathermap.org/img/w/${
          two[8 - one.length].weather[0].icon
        }.png`,
        description: two[8 - one.length].weather[0].descrition,
        temp: this.calcMinMaxTemp(two),
      },
      thirdDay: {
        date: this.calcDate(three),
        icon: `https://openweathermap.org/img/w/${
          three[8 - one.length].weather[0].icon
        }.png`,
        description: three[8 - one.length].weather[0].descrition,
        temp: this.calcMinMaxTemp(three),
      },
      fourthDay: {
        date: this.calcDate(four),
        icon: `https://openweathermap.org/img/w/${
          four[8 - one.length].weather[0].icon
        }.png`,
        description: four[8 - one.length].weather[0].descrition,
        temp: this.calcMinMaxTemp(four),
      },
      fifthDay: {
        date: this.calcDate(five),
        icon: `https://openweathermap.org/img/w/${
          five[8 - one.length].weather[0].icon
        }.png`,
        description: five[8 - one.length].weather[0].descrition,
        temp: this.calcMinMaxTemp(five),
      },
    };
  },
  changeMoreInfo(array) {
    array.forEach(i => {
      i.forEach(j => {
        j.dt_txt = j.dt_txt.slice(11, 16);
      });
    });
  },
  get query() {
    return this.searchQuery;
  },
  set query(value) {
    return (this.searchQuery = value);
  },
};
