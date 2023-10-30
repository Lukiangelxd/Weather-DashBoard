var WeatherDashboard = (function () {
    // Private variables
    var apiKey = "3bdc417e78dfd8db03774da5b237d55a";
  
    // Grabbing cities from local storage
    function getCities() {
      var cities = localStorage.getItem("cities");
      if (!cities) {
        return [];
      }
      return JSON.parse(cities);
    }
  //Display cities from local storage
    function displayCities() {
      var cityListEl = $("#cityList");
      // Prevented duplication
      cityListEl.empty();
  
      getCities().forEach(function (city) {
        var cityEl = $("<button class='col-12 btn btn-secondary'>");
        cityEl.on("click", function () {
          getCityFromApi(city);
        });
        cityEl.text(city);
        cityListEl.append(cityEl);
      });
    }
  
    // Grabbing city weather from the api
    function getCityFromApi(city) {
      var currentCityEl = $("#currentCity");
      var iconEl = $("#icon");
      var tempEl = $("#temp");
      var windEl = $("#wind");
      var humidityEl = $("#humidity");
  
      $.ajax({
        url: `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=imperial`,
        method: 'GET',
        dataType: 'json',
        success: function (response) {
          if (!getCities().includes(city)) {
            localStorage.setItem("cities", JSON.stringify([...getCities(), city]));
            displayCities();
          }
  
          currentCityEl.text(`${response.name}, ${dayjs.unix(response.dt).format('MMM D, YYYY')}`);
          var icon = $(`<img src='https://openweathermap.org/img/wn/${response.weather[0].icon}.png' alt='${response.weather[0].description}'/>`);
          iconEl.empty();
          iconEl.append(icon);
          tempEl.text(`Temp: ${response.main.temp} °F`);
          windEl.text(`Wind: ${response.wind.speed} MPH`);
          humidityEl.text(`Humidity: ${response.main.humidity} %`);
  
          getFiveDayForecast(response.coord.lat, response.coord.lon);
        },
      });
    }
  
    //Get a 5 day forecast of current city
    function getFiveDayForecast(lat, lon) {
      var currentDate = dayjs();
      $.ajax({
        url: `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&units=imperial&appid=${apiKey}`,
        method: 'GET',
        dataType: 'JSON',
        success: function (fiveday) {
            //Doesnt include items from today
          var filteredDays = $.grep(fiveday.list, function (el) {
            return !currentDate.startOf("d").isSame(dayjs.unix(el.dt).startOf("d"), "day");
          });
          var fiveDayBoxEl = $("#fiveDayBox");
  // Every 8 record to the 1st record for the duration of the 5 days
          fiveDayBoxEl.empty();
          for (let i = 0; i < filteredDays.length; i += 8) {
            var fiveDayChild = $(`
              <div class="col-xl col-lg col-md col-sm-12 col-xs-12 col-12 card">
                  <h4>${dayjs.unix(filteredDays[i].dt).format('MMM D, YYYY')}</h4>
                  <img src='https://openweathermap.org/img/wn/${filteredDays[i].weather[0].icon}.png' alt='${filteredDays[i].weather[0].description}'/>
                  <div>Temp: ${filteredDays[i].main.temp} °F</div>
                  <div>Wind: ${filteredDays[i].wind.speed} MPH</div>
                  <div>Humidity: ${filteredDays[i].main.humidity} %</div>
              </div>
            `);
            fiveDayBoxEl.append(fiveDayChild);
          }
        }
      });
    }
  
    // Public methods
    return {
      init: function () {
        $(document).ready(function () {
          $("#search-btn").on("click", function () {
            var searchBox = $("#search-input");
            getCityFromApi(searchBox.val());
          });
  
          displayCities();
        });
      }
    };
  })();
  
  // Initialize the Weather Dashboard
  WeatherDashboard.init();