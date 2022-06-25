'use strict';

const form = document.querySelector('.workout-form');
const formIn = document.querySelector('.form');
const entry = document.querySelector('.all_entries');
const elevationDiv = document.querySelector('.elevation');
const cadenceDiv = document.querySelector('.cadence');
const inputArea = document.querySelector('.form_input');
const durationArea = document.querySelector('.form_input-duration');
const distanceArea = document.querySelector('.form_input-distance');
const elevationArea = document.querySelector('.form_input-elevation');
const cadenceArea = document.querySelector('.form_input-cadence');
const distanceInput = document.querySelector('.form_input-distance');
const durationInput = document.querySelector('.form_input-duration');
const cadenceInput = document.querySelector('.form_input-cadence');
const elevationInput = document.querySelector('.form_input-elevation');
const inputType = document.querySelector('.form_input-type');
const workoutcontainer = document.querySelector('.workout')
let workout;
class Workout {
  date = new Date();
  id = (Date.now() + '').slice(-10);
  clicks =0
  
  constructor(coords, distance, duration) {
    this.coords = coords;
    this.distance = distance;
    this.duration = duration;
  }
  _setDescription() {
    // prettier-ignore
    const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    if (this.type === 'running') {
      this.description = `${this.type[0].toUpperCase()}${this.type.slice(1)} on ${months[this.date.getMonth()]} ${this.date.getDate()}`;
    }
    if (this.type === 'cycling') {
      this.description = `${this.type[0].toUpperCase()}${this.type.slice(1)} on ${months[this.date.getMonth()]} ${this.date.getDate()}`;
    }
  }
  // click(){
  //   this.clicks ++
  // }
}
class Running extends Workout {
  constructor(coords, distance, duration, cadence) {
    super(coords, distance, duration);
    this.type = 'running';
    this.cadence = cadence;
    this.calPace();
    this._setDescription();
  }
  calPace() {
    this.pace = this.duration / this.distance;
    return this.pace;
  }
}
class Cycling extends Workout {
  constructor(coords, distance, duration, elevation) {
    super(coords, distance, duration);
    this.type = 'cycling';
    this.elevation = elevation;
    this.calSpeed();
    this._setDescription();
  }
  calSpeed() {
    this.speed = this.distance / this.duration;
    return this.speed;
  }
}

// App structure
class App {
  #map;
  #maploc;
  #zoomLevel = 13
  #workouts = [];
  constructor() {
    // get positions
    this._getPosition();

    // get data from localstorage
    this._getLocalStorage()

    // event handlers
    inputType.addEventListener('change', this._toggleEleField);
    formIn.addEventListener('submit', this._newWorkout.bind(this));
    workoutcontainer.addEventListener('click',this._moveTopopup.bind(this))

  }

  _getPosition() {
    navigator.geolocation.getCurrentPosition(
      this._loadMap.bind(this),
      function () {
        alert('Access denied!');
      }
    );
  }

  _loadMap(position) {
    const latitude = position.coords.latitude;
    const longitude = position.coords.longitude;
    const coord = [latitude, longitude];
    this.#map = L.map('Map').setView(coord, this.#zoomLevel);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution:
        '&copy; <a href="https://www.openstreetmap.fr/hot/">OpenStreetMap</a> contributors',
    }).addTo(this.#map);

    this.#map.on('click', this._showForm.bind(this));

    
    this.#workouts.forEach(work => {
      this._renderMarkerOnMap(work)
    })
  }

  _showForm(mapE) {
    this.#maploc = mapE;
    form.classList.remove('hidden-form');
    form.classList.add('animate__animated','animate__fadeInDown');
    distanceInput.focus();
  }

  _toggleEleField() {
    cadenceDiv.classList.toggle('hidden');
    elevationDiv.classList.toggle('hidden');
  }

  _newWorkout(e) {
    e.preventDefault();
    const [lat, long] = [this.#maploc.latlng.lat, this.#maploc.latlng.lng];
    const checkPositive = (...ins) => ins.every(inp => inp > 0);
    const checkNo = (...ins) => ins.every(i => typeof i === 'number');

    // Get data form
    const type = inputType.value;
    const distance = +distanceInput.value;
    const duration = +durationInput.value;

    // if running , create running
    const cadence = +cadenceInput.value;
    // check data validity
    if (type === 'running') {
      if (
        !checkNo(distance, duration, cadence) ||
        !checkPositive(distance, duration, cadence)
      ) {
        return alert('Invalid input!');
      }
      // add new obj to workout array
      workout = new Running([lat, long], distance, duration, cadence);
      this.#workouts.push(workout);
    }

    // if cycling , create cycling
    const ele = +elevationInput.value;
    // check data validity
    if (type === 'cycling') {
      if (
        !checkNo(distance, duration, ele) ||
        !checkPositive(distance, duration)
      ) {
        return alert('Invalid input!');
      }
      // add new obj to workout array
      workout = new Cycling([lat, long], distance, duration, ele);
      this.#workouts.push(workout);
    }

    // render workout on map
    this._renderMarkerOnMap(workout);

    // render workout on list
    this._renderWorkout(workout); 

    // hide form + clear input fields
    this._hideForm()


    // store data in local storage
    this._setLocalStorage()

    // get data from local storage
  }
  
  _setLocalStorage(){
    localStorage.setItem('Workouts',JSON.stringify(this.#workouts))
  }



      _getLocalStorage(){
        const data = JSON.parse(localStorage.getItem('Workouts'))
        if(!data) return
        this.#workouts = data
        this.#workouts.forEach(work => {
          this._renderWorkout(work)
          // this._renderMarkerOnMap(work)
        })
      }
  




  _hideForm(){
    form.classList.add('hidden-form');
    durationArea.value =
      distanceArea.value =
      cadenceArea.value =
      elevationArea.value =
      '';
  }
  _renderWorkout(workout) {
    let html = `<div class="entry">
    <li class="workOUT workout-${workout.type}" data-id="${workout.id}">
      <p class="workout_title">${workout.description}</p>
      <div class="row">
        <div class="col-3">
          <div class="workout_details">
            <span class="workout_icon">${
              workout.type === 'running' ? '🏃‍♂️' : '🚴‍♀️'
            }</span>
            <span class="workout_value">${workout.distance}</span>
            <span class="workout_unit">km</span>
          </div>
        </div>
        <div class="col-3">
          <div class="workout_details">
            <span class="workout_icon">⏱</span>
            <span class="workout_value">${workout.duration}</span>
            <span class="workout_unit">min</span>
          </div>
        </div>`;
    if (workout.type === 'running') {
      html += ` <div class="col-3">
          <div class="workout_details">
            <span class="workout_icon hello">⚡️</span>
            <span class="workout_value">${workout.pace.toFixed(1)}</span>
            <span class="workout_unit">m/km</span>
          </div>
        </div>
        <div class="col-3">
                  <div class="workout_details">
                    <span class="workout_icon">🦶🏼</span>
                    <span class="workout_value">${workout.cadence.toFixed(1)}</span>
                    <span class="workout_unit">spm</span>
                  </div>
                </div>
        </div>
    </li>
  </div>`
  entry.classList.add('entry');
    form.insertAdjacentHTML('afterend', html);
  
  
  ;
    }
    if (workout.type === 'cycling') {
      html += `<div class="col-3">
          <div class="workout_details">
            <span class="workout_icon">⚡️</span>
            <span class="workout_value">${workout.speed.toFixed(1)}</span>
            <span class="workout_unit">km/h</span>
          </div>
        </div>
        <div class="col-3">
        <div class="workout_details">
          <span class="workout_icon">⛰</span>
          <span class="workout_value">${workout.elevation.toFixed(1)}</span>
          <span class="workout_unit">m</span>
        </div>
      </div>
      </div>
    </li>
  </div>`
  entry.classList.add('entry');
    form.insertAdjacentHTML('afterend', html);
  ;
    }
  }

  _renderMarkerOnMap(workout) {
    const latlngs = workout.coords
    L.marker(latlngs)
      .addTo(this.#map)
      .bindPopup(
        L.popup({
          maxWidth: 150,
          minWidth: 50,
          autoClose: false,
          closeOnClick: false,
          className: `leaflet-${workout.type}`,
        })
      )
      .setPopupContent(`${workout.type === 'running' ? '🏃‍♂️' : '🚴‍♀️'}${workout.description}`)
      .openPopup();
  }

  _moveTopopup(e){
    if(!this.#map) return
    const workoutEl = e.target.closest('.workOUT')
    if(!workoutEl) return
    const workout = this.#workouts.find(work=> work.id === workoutEl.dataset.id)
    this.#map.setView(workout.coords,this.#zoomLevel,{
      animate:true,
      pan:{
        duration:1

      }
    })
    // workout.click()
  }
  reset(){
    localStorage.removeItem('Workouts')
    location.reload()
  }

}

const app = new App();
// app.reset()
