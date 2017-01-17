
// State lists
var states = new Array();

states['India'] = new Array('Karnataka','Uttar Pradesh');


// City lists
var cities = new Array();

cities['India'] = new Array();
cities['India']['Karnataka'] = new Array('Bangalore','Mysore');
cities['India']['Uttar Pradesh'] = new Array('Bulandshahr','Ghaziabad');


// Locality lists
var localities = new Array();
localities['India'] = new Array();
localities['India']['Karnataka'] = new Array('Bangalore','Mysore');
localities['India']['Karnataka']['Bangalore'] = new Array('J P Nagar','Jayanagar');
localities['India']['Karnataka']['Mysore'] = new Array('Mysore City','Mysore Village');


function setStates() {
  cntrySel = document.getElementById('country');
  stateList = states[cntrySel.value];
  changeSelect('state', stateList, stateList);
  setCities();
  setLocality();
}

function setCities() {
  cntrySel = document.getElementById('country');
  stateSel = document.getElementById('state');
  cityList = cities[cntrySel.value][stateSel.value];
  changeSelect('city', cityList, cityList);
}

function setLocality() {
  cntrySel = document.getElementById('country');
  stateSel = document.getElementById('state');
  citySel = document.getElementById('city');
  localityList = localities[cntrySel.value][stateSel.value][citySel.value];
  changeSelect('locality', localityList, localityList);
}

function changeSelect(fieldID, newOptions, newValues) {
  selectField = document.getElementById(fieldID);
  selectField.options.length = 0;
  for (i=0; i<newOptions.length; i++) {
    selectField.options[selectField.length] = new Option(newOptions[i], newValues[i]);
  }
}

function addLoadEvent(func) {
  var oldonload = window.onload;
  if (typeof window.onload != 'function') {
    window.onload = func;
  } else {
    window.onload = function() {
      if (oldonload) {
        oldonload();
      }
      func();
    }
  }
}

addLoadEvent(function() {
  setStates();
});

