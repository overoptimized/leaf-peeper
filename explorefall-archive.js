const map = new maplibregl.Map({
  container: 'map',
  style: '../esri_extremely_basic.json',
  center: [-96, 37.8],
  zoom: 3.5,
  maxBounds: [[-130.0,19.0],[-63.5,53.0]],
  pitchWithRotate: false,
  dragRotate: false,
});

const dates = [
  '0901', '0902', '0903', '0904', '0905', '0906', '0907', '0908', '0909', '0910',
  '0911', '0912', '0913', '0914', '0915', '0916', '0917', '0918', '0919', '0920',
  '0921', '0922', '0923', '0924', '0925', '0926', '0927', '0928', '0929', '0930',
  '1001', '1002', '1003', '1004', '1005', '1006', '1007', '1008', '1009', '1010',
  '1011', '1012', '1013', '1014', '1015', '1016', '1017', '1018', '1019', '1020',
  '1021', '1022', '1023', '1024', '1025', '1026', '1027', '1028', '1029', '1030',
  '1031', '1101', '1102', '1103', '1104', '1105', '1106', '1107', '1108', '1109',
  '1110', '1111', '1112', '1113', '1114', '1115', '1116', '1117', '1118', '1119',
  '1120', '1121', '1122', '1123', '1124', '1125', '1126', '1127', '1128', '1129',
  '1130'
];

const formatDate = (date, inYear="2024") => {
  if (date) {
    date = `${inYear}${date}`
    const year = date.slice(0, 4);
    const month = new Date(date.slice(4, 6) + '/01/2000').toLocaleString('default', { month: 'long' });
    const day = date.slice(6);
    return `${month} ${day}, ${year}`;
  }
  return '';
}

const getImageUrl = (date, year) => {
  return `../maps/${year}/${year}${date}.png`;
}

let year = 2024

map.on('load', function() {
  var detailsElement = document.querySelector('.mapboxgl-compact-show');
  if (detailsElement) {
        detailsElement.removeAttribute('open');
        detailsElement.classList.remove('maplibregl-compact-show', 'mapboxgl-compact-show');
    }

  document.getElementById('slider-date').addEventListener('input', function(event) {
    let endDate = event.target.max
    let selectedDate = event.target.value;
    let currentDate = document.getElementById('slider-title');
    map.getSource('color-source').updateImage({ url: getImageUrl(dates[selectedDate], year) });
    currentDate.textContent = formatDate(dates[selectedDate], year);
  });
});

document.addEventListener('DOMContentLoaded', function() {
    var input = document.getElementById('location-input');
    var suggestionsContainer = document.getElementById('suggestionsContainer');

    input.addEventListener('input', function() {
        var query = input.value.trim();
        if (query === '') {
            suggestionsContainer.innerHTML = '';
            suggestionsContainer.style.display = 'none';
            return;
        }

        fetchSuggestions(query)
            .then(function(suggestions) {
                displaySuggestions(suggestions);
            })
            .catch(function(error) {
                console.error('Error fetching suggestions:', error);
            });
    });

    function fetchSuggestions(query) {
        return fetch('//geocode.arcgis.com/arcgis/rest/services/World/GeocodeServer/suggest?text=' + query + '&f=json&countryCode=USA&category=&maxSuggestions=5')
            .then(function(response) {
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                return response.json();
            })
            .then(function(data) {
                return data.suggestions.map(function(item) {
                    return item.text;
                });
            });
    }

    function displaySuggestions(suggestions) {
        suggestionsContainer.innerHTML = '';
        suggestions.forEach(function(suggestion) {
            var suggestionItem = document.createElement('div');
            suggestionItem.textContent = suggestion;
            suggestionItem.classList.add('autocomplete-item');
            suggestionItem.addEventListener('click', function() {
                input.value = suggestion;
                suggestionsContainer.style.display = 'none';
                fetchLocationDetails(suggestion);
            });
            suggestionsContainer.appendChild(suggestionItem);
        });
        suggestionsContainer.style.display = 'block';
    }

    function fetchLocationDetails(suggestion) {
        fetch(`//geocode.arcgis.com/arcgis/rest/services/World/GeocodeServer/find?text=${suggestion}&f=json`)
            .then(function(response) {
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                return response.json();
            })
            .then(function(data) {
                if (data.locations && data.locations.length > 0) {
                    var location = data.locations[0];
                    console.log("Latitude:", location.feature.geometry.y);
                    console.log("Longitude:", location.feature.geometry.x);
                    map.flyTo({
                      center: [location.feature.geometry.x, location.feature.geometry.y],
                      zoom: 9,
                      speed: 0.5,
                      essential: true
                    });
                } else {
                    console.error('No location details found');
                }
            })
            .catch(function(error) {
                console.error('Error fetching location details:', error);
            });
    }

    document.addEventListener('click', function(event) {
        if (!event.target.matches('#location-input') && !event.target.closest('.autocomplete-container')) {
            suggestionsContainer.style.display = 'none';
        }
    });
});

document.getElementById('expand-controls').addEventListener('click', () => {
  if (document.getElementById('expand-controls').textContent == 'Expand Map Controls') {
    document.getElementById('expand-controls').textContent = 'Hide Map Controls'
    document.getElementById('info-container').style.display = 'block'
  } else {
    document.getElementById('expand-controls').textContent = 'Expand Map Controls'
    document.getElementById('info-container').style.display = 'none'
  }
})

// Function to save map as PNG
const saveMapAsPNG = () => {
  // Wait for the map to be fully loaded
  map.resize();
  map.once('render', function() {
      // Get the map canvas
      var canvas = map.getCanvas();

      // Convert canvas to data URL
      var dataURL = canvas.toDataURL('image/png');

      // Create a temporary link element
      var link = document.createElement('a');
      link.href = dataURL;
      link.download = 'fallfoliagemap.png'; // Specify the filename
      link.click();
  });
}

// Add click event listener to the save button
document.getElementById('save-map-button').addEventListener('click', saveMapAsPNG);

// Add click event listener to the map
map.on('click', function(e) {
  // Use queryRenderedFeatures to get all features at the click point
  const features = map.queryRenderedFeatures(e.point);

  // Log the layers beneath the click
  if (features.length) {
      const layers = features.map(feature => feature.layer.id);
      console.log('Layers beneath the click:', layers);
  } else {
      console.log('No layers found beneath the click.');
  }
});

document.getElementById('year-select').addEventListener('input', (e) => {
  changeYear(Number(e.target.value) - year)
})

const changeYear = (dif) => {
  let newYear = year + dif
  if (newYear < 2024 && newYear > 1990) {
    year = year + Number(dif)
    document.getElementById('year-select').value = year

    let selectedDate = document.getElementById('slider-date').value
    map.getSource('color-source').updateImage({ url: getImageUrl(dates[selectedDate], year) });
    document.getElementById('slider-title').textContent = formatDate(dates[selectedDate], year)
  }
}
