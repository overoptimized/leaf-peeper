const map = new maplibregl.Map({
  container: 'map',
  style: '../esri_extremely_basic.json',
  center: [-96, 37.8],
  zoom: 3.5,
  maxBounds: [[-130.0,19.0],[-63.5,53.0]],
  pitchWithRotate: false,
  dragRotate: false,
});

document.addEventListener("DOMContentLoaded", () => {
  // Load right-ad-container (always, regardless of screen size)
  const rightAdDiv = document.getElementById("right-ad-container");
  if (rightAdDiv && !window.matchMedia("(max-width: 1024px)").matches) {
    console.log('Desktop ad')
    rightAdDiv.innerHTML = `
      <ins class="adsbygoogle"
           style="display:block"
           data-ad-client="ca-pub-7741939386451882"
           data-ad-slot="1498629862"
           data-ad-format="auto"
           data-full-width-responsive="true"></ins>
    `;
    (adsbygoogle = window.adsbygoogle || []).push({});
  } else {
    console.log('Mobile ad')
    rightAdDiv.innerHTML = `
      <ins class="adsbygoogle"
           style="display:block"
           data-ad-client="ca-pub-7741939386451882"
           data-ad-slot="8860380992"
           data-ad-format="horizontal"
           data-full-width-responsive="false"></ins>
    `;
    (adsbygoogle = window.adsbygoogle || []).push({});

    document.getElementById('right-ad-container').insertAdjacentHTML('beforebegin', '<hr style="margin: 5vh 0;">');
    document.getElementById('right-ad-container').insertAdjacentHTML('afterend', '<hr style="margin: 5vh 0;">');
  }

  // Load left-ad-container (only if screen width > 1024px)
  if (!window.matchMedia("(max-width: 1024px)").matches) {
    const leftAdDiv = document.getElementById("left-ad-container");
    if (leftAdDiv) {
      leftAdDiv.innerHTML = `
        <ins class="adsbygoogle"
             style="display:block"
             data-ad-client="ca-pub-7741939386451882"
             data-ad-slot="7549882951"
             data-ad-format="auto"
             data-full-width-responsive="true"></ins>
      `;
      (adsbygoogle = window.adsbygoogle || []).push({});
    }
  } else {
    document.getElementById('mobile').innerHTML = `
    <div class="search-container">
        <input type="text" id="location-input" placeholder="Search a location...">
        <div class="autocomplete-container" id="suggestionsContainer"></div>
    </div>
    <div class="mobile-layer-controls">
      <div class="layer-container">
        <div class="controls-toggle active-layer" id="colorreport">
          <p>Color Report</p>
        </div>
        <div class="controls-toggle" id="confidence">
          <p>Peak Timing</p>
        </div>
      </div>
      <div class="layer-container">
        <div class="controls-toggle active-layer" id="lowres">
          <p>Low-Res</p>
        </div>
        <div class="controls-toggle" id="highres">
          <p>High-Res</p>
        </div>
      </div>
      <div class="layer-container">
        <div class="controls-toggle active-layer" id="verified">
          <p>Reports</p>
        </div>
      </div>
    </div>`
  }
});

// document.addEventListener("DOMContentLoaded", () => {
//   // Function to check if ads are blocked
//   function areAdsBlocked(containerId, callback) {
//     const container = document.getElementById(containerId);
//     const ins = container.querySelector('.adsbygoogle');
//     setTimeout(() => {
//       const isBlocked = !ins || ins.offsetHeight === 0 || !window.adsbygoogle;
//       callback(isBlocked);
//     }, 100); // Short delay to allow ad blocker to act
//   }
//
//   // Load right-ad-container
//   const rightAdDiv = document.getElementById("right-ad-container");
//   if (rightAdDiv) {
//     rightAdDiv.innerHTML = `
//       <ins class="adsbygoogle"
//            style="display:block"
//            data-ad-client="ca-pub-7741939386451882"
//            data-ad-slot="1498629862"
//            data-ad-format="auto"
//            data-full-width-responsive="true"></ins>
//     `;
//     areAdsBlocked('right-ad-container', (isBlocked) => {
//       if (isBlocked) {
//         rightAdDiv.style.backgroundImage = 'url(./images/side_banner.jpg)';
//         rightAdDiv.style.backgroundSize = 'cover';
//         rightAdDiv.style.backgroundPosition = 'right';
//         rightAdDiv.style.opacity = 0.9;
//         rightAdDiv.innerHTML = ''; // Clear the ins element
//       } else {
//         (window.adsbygoogle = window.adsbygoogle || []).push({});
//       }
//     });
//   }
//
//   // Load left-ad-container (only if screen width > 1024px)
//   if (!window.matchMedia("(max-width: 1024px)").matches) {
//     const leftAdDiv = document.getElementById("left-ad-container");
//     if (leftAdDiv) {
//       leftAdDiv.innerHTML = `
//         <ins class="adsbygoogle"
//              style="display:block"
//              data-ad-client="ca-pub-7741939386451882"
//              data-ad-slot="7549882951"
//              data-ad-format="auto"
//              data-full-width-responsive="true"></ins>
//       `;
//       areAdsBlocked('left-ad-container', (isBlocked) => {
//         if (isBlocked) {
//           leftAdDiv.style.backgroundImage = 'url(./images/side_banner.jpg)';
//           leftAdDiv.style.backgroundSize = 'cover';
//           leftAdDiv.style.backgroundPosition = 'left';
//           leftAdDiv.style.opacity = 0.9;
//           leftAdDiv.innerHTML = ''; // Clear the ins element
//         } else {
//           (window.adsbygoogle = window.adsbygoogle || []).push({});
//         }
//       });
//     }
//   } else {
//     // Mobile layout
//     document.getElementById('mobile').innerHTML = `
//       <div class="search-container">
//           <input type="text" id="location-input" placeholder="Search a location...">
//           <div class="autocomplete-container" id="suggestionsContainer"></div>
//       </div>
//       <div class="mobile-layer-controls">
//         <div class="layer-container">
//           <div class="controls-toggle active-layer" id="colorreport">
//             <p>Color Report</p>
//           </div>
//           <div class="controls-toggle" id="confidence">
//             <p>Peak Timing</p>
//           </div>
//         </div>
//         <div class="layer-container">
//           <div class="controls-toggle active-layer" id="verified">
//             <p>Reports</p>
//           </div>
//         </div>
//       </div>`;
//   }
// });



const dates = [
  '20260901', '20260902', '20260903', '20260904', '20260905', '20260906', '20260907', '20260908', '20260909', '20260910',
  '20260911', '20260912', '20260913', '20260914', '20260915', '20260916', '20260917', '20260918', '20260919', '20260920',
  '20260921', '20260922', '20260923', '20260924', '20260925', '20260926', '20260927', '20260928', '20260929', '20260930',
  '20261001', '20261002', '20261003', '20261004', '20261005', '20261006', '20261007', '20261008', '20261009', '20261010',
  '20261011', '20261012', '20261013', '20261014', '20261015', '20261016', '20261017', '20261018', '20261019', '20261020',
  '20261021', '20261022', '20261023', '20261024', '20261025', '20261026', '20261027', '20261028', '20261029', '20261030',
  '20261031', '20261101', '20261102', '20261103', '20261104', '20261105', '20261106', '20261107', '20261108', '20261109',
  '20261110', '20261111', '20261112', '20261113', '20261114', '20261115', '20261116', '20261117', '20261118', '20261119',
  '20261120', '20261121', '20261122', '20261123', '20261124', '20261125', '20261126', '20261127', '20261128', '20261129',
  '20261130', '20261201', '20261202', '20261203', '20261204', '20261205', '20261206', '20261207', '20261208', '20261209',
  '20261210', '20261211', '20261212', '20261213', '20261214', '20261215', '20261216', '20261217', '20261218', '20261219',
  '20261220', '20261221', '20261222', '20261223', '20261224', '20261225', '20261226', '20261227', '20261228', '20261229',
  '20261230', '20261231'
];

const formatDate = (date) => {
  if (date) {
    const year = date.slice(0, 4);
    const month = new Date(date.slice(4, 6) + '/01/2000').toLocaleString('default', { month: 'long' });
    const day = date.slice(6);
    return `${month} ${day}, ${year}`;
  }
  return '';
}

const year = 2026
const mapImageVersion = Date.now();
const preloadedMapImages = new Map();
const preloadingResolutions = new Set();
const MAP_PRELOAD_CONCURRENCY = 3;
const mapImageDirectories = {
  lowres: '2026',
  highres: '2026-highres'
};
let mapResolution = 'lowres';

const getImageUrl = (date, year, resolution = mapResolution) => {
  return `../maps/${mapImageDirectories[resolution]}/${date}.png?v=${mapImageVersion}`;
}

const getPeakTimingImageUrl = (resolution = mapResolution) => {
  return `../maps/${mapImageDirectories[resolution]}/peakdate.png?v=${mapImageVersion}`;
}

const preloadMapImages = (selectedIndex, resolution = mapResolution) => {
  if (preloadingResolutions.has(resolution)) {
    return;
  }

  preloadingResolutions.add(resolution);

  const preloadOrder = dates
    .map((date, index) => ({ date, index }))
    .filter(({ index }) => index !== selectedIndex)
    .sort((a, b) => Math.abs(a.index - selectedIndex) - Math.abs(b.index - selectedIndex));

  let nextImageIndex = 0;

  const loadNextImage = () => {
    if (nextImageIndex >= preloadOrder.length) {
      return;
    }

    const { date } = preloadOrder[nextImageIndex++];
    const image = new Image();

    const imageKey = `${resolution}:${date}`;

    preloadedMapImages.set(imageKey, image);
    image.onload = loadNextImage;
    image.onerror = () => {
      preloadedMapImages.delete(imageKey);
      loadNextImage();
    };
    image.src = getImageUrl(date, year, resolution);
  };

  for (let i = 0; i < MAP_PRELOAD_CONCURRENCY; i++) {
    loadNextImage();
  }
}

document.addEventListener('DOMContentLoaded', function() {
  const lowResToggle = document.getElementById('lowres');
  const highResToggle = document.getElementById('highres');

  const setMapResolution = (resolution) => {
    if (mapResolution === resolution) {
      return;
    }

    mapResolution = resolution;
    lowResToggle.classList.toggle('active-layer', resolution === 'lowres');
    highResToggle.classList.toggle('active-layer', resolution === 'highres');

    const selectedIndex = Number(document.getElementById('slider-date').value);
    const colorSource = map.getSource('color-source');
    const confidenceSource = map.getSource('confidence-source');

    if (colorSource) {
      colorSource.updateImage({ url: getImageUrl(dates[selectedIndex]) });
      preloadMapImages(selectedIndex, resolution);
    }

    if (confidenceSource) {
      confidenceSource.updateImage({ url: getPeakTimingImageUrl() });
    }
  };

  lowResToggle.addEventListener('click', () => setMapResolution('lowres'));
  highResToggle.addEventListener('click', () => setMapResolution('highres'));
});

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
    // if (selectedDate > endDate - 10){
    //   map.getSource('color-source').updateImage({ url: getImageUrl(dates[selectedDate]) });
    //   currentDate.textContent = formatDate(dates[selectedDate]) + ': Forecast';
    // } else {
    //   map.getSource('color-source').updateImage({ url: getImageUrl(dates[selectedDate]) });
    //   currentDate.textContent = formatDate(dates[selectedDate]) + ': Observed';
    // }
    map.getSource('color-source').updateImage({ url: getImageUrl(dates[selectedDate]) });
    currentDate.textContent = formatDate(dates[selectedDate]) + ': Estimate';
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
            suggestionItem.addEventListener('click', function(event) {
                input.value = suggestion;
                suggestionsContainer.style.display = 'none';
                event.preventDefault();
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
                    fetchConstants([location.feature.geometry.x, location.feature.geometry.y])
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

const confidenceOn = () => {
  toggle_colorreport.checked = false
  map.addSource('confidence-source', {
    'type': 'image',
    'url': getPeakTimingImageUrl(),
    'coordinates': [
      // [-126.07, 51.98],
      // [-64.97, 51.98],
      // [-64.97, 23.04],
      // [-126.07, 23.04]
      [-126, 52],
      [-65, 52],
      [-65, 23],
      [-126, 23]
    ],
  });

  map.addLayer({
    'id': 'confidence-layer',
    'type': 'raster',
    'source': 'confidence-source',
    'paint': {
      'raster-opacity': 0.9,
      'raster-fade-duration': 0,
      'raster-resampling': "nearest"
    }
  },'terrain');

  document.getElementById('legend-container').innerHTML = `
    <div class="legend-subcontainer">
      <div class="legend-pair"><span style="background-color:#2a3a55;"></span><p>September</p></div>
      <div class="legend-pair"><span style="background-color:#306341;"></span><p>Early Oct</p></div>
      <div class="legend-pair"><span style="background-color:#4b915c;"></span><p>Mid Oct</p></div>
      <div class="legend-pair"><span style="background-color:#95b36c;"></span><p>Late Oct</p></div>
    </div>
    <div class="legend-subcontainer">
      <div class="legend-pair"><span style="background-color:#e2ce76;"></span><p>Early Nov</p></div>
      <div class="legend-pair"><span style="background-color:#ba8c49;"></span><p>Mid Nov</p></div>
      <div class="legend-pair"><span style="background-color:#825533;"></span><p>Late Nov</p></div>
      <div class="legend-pair"><span style="background-color:#e6e6e6;"></span><p>December</p></div>
    </div>
  `

  document.getElementById('slider-controls').style.opacity = 0.3
  document.getElementById('slider-controls').style.pointerEvents = 'none'
  document.getElementById('slider-date').style.opacity = 0.3
  document.getElementById('slider-date').style.pointerEvents = 'none'
}

const confidenceOff = () => {
  toggle_colorreport.checked = true
  document.getElementById('map').style.opacity = 1
  document.getElementById('blank-text').style.display = 'none'
  map.removeLayer('confidence-layer')
  map.removeSource('confidence-source')
}

const colorOn = () => {
  toggle_confidence.checked = false
  map.addSource('color-source', {
    'type': 'image',
    'url': getImageUrl(dates[document.getElementById('slider-date').value]), // Initial date
    'coordinates': [
      // [-126.07, 51.98],
      // [-64.97, 51.98],
      // [-64.97, 23.04],
      // [-126.07, 23.04]
      [-126, 52],
      [-65, 52],
      [-65, 23],
      [-126, 23]
    ]
    // 'coordinates': [
    //   [-124.76666663366667, 49.39999999966666],
    //   [-67.08333330033335, 49.39999999966666],
    //   [-67.08333330033335, 25.066666666333337],
    //   [-124.76666663366667, 25.066666666333337]
    // ],
  });

  map.addLayer({
    'id': 'color-layer',
    'type': 'raster',
    'source': 'color-source',
    'paint': {
      'raster-opacity': 0.95,
      'raster-fade-duration': 0,
      'raster-resampling': "nearest"
    }
  },'terrain');

  preloadMapImages(Number(document.getElementById('slider-date').value), mapResolution);

  document.getElementById('legend-container').innerHTML =  `
    <div class="legend-subcontainer">
      <div class="legend-pair"><span style="background-color:#689C4B;"></span><p>Little to No Color</p></div>
      <div class="legend-pair"><span style="background-color:#F6ED5F;"></span><p>Low Color</p></div>
      <div class="legend-pair"><span style="background-color:#FFA228;"></span><p>Moderate Color</p></div>
    </div>
    <div class="legend-subcontainer">
      <div class="legend-pair"><span style="background-color:#D45C17;"></span><p>High Color</p></div>
      <div class="legend-pair"><span style="background-color:#a30f10;"></span><p>Peak Color</p></div>
      <div class="legend-pair"><span style="background-color:#4d2b0f;"></span><p>Past Peak Color</p></div>
    </div>
  `

  document.getElementById('slider-controls').style.opacity = 1
  document.getElementById('slider-controls').style.pointerEvents = 'auto'
  document.getElementById('slider-date').style.opacity = 1
  document.getElementById('slider-date').style.pointerEvents = 'auto'

}

const colorOff = () => {
  toggle_confidence.checked = true
  map.removeLayer('color-layer')
  map.removeSource('color-source')
}

let toggle_colorreport;
let toggle_confidence;
document.addEventListener('DOMContentLoaded', function() {
  toggle_colorreport = document.getElementById('colorreport')
  toggle_confidence = document.getElementById('confidence')

  toggle_colorreport.addEventListener('click', () => {
    if (toggle_colorreport.checked || !toggle_colorreport.classList.contains('active-layer')) {
      colorOn()
      confidenceOff()
      toggle_colorreport.classList.add('active-layer')
      toggle_confidence.classList.remove('active-layer')
    }
    else {
      colorOff()
      confidenceOn()
      toggle_colorreport.classList.remove('active-layer')
      toggle_confidence.classList.add('active-layer')
    }
  })

  toggle_confidence.addEventListener('click', () => {
    if (toggle_colorreport.checked || toggle_colorreport.classList.contains('active-layer')) {
      colorOff()
      confidenceOn()
      toggle_colorreport.classList.remove('active-layer')
      toggle_confidence.classList.add('active-layer')
    }
    else {
      colorOn()
      confidenceOff()
      toggle_colorreport.classList.add('active-layer')
      toggle_confidence.classList.remove('active-layer')
    }
  })
});

if (document.getElementById('expand-controls')) {
  document.getElementById('expand-controls').addEventListener('click', () => {
    if (document.getElementById('expand-controls').textContent == 'Expand Map Controls') {
      document.getElementById('expand-controls').textContent = 'Hide Map Controls'
      document.getElementById('info-container').style.display = 'block'
    } else {
      document.getElementById('expand-controls').textContent = 'Expand Map Controls'
      document.getElementById('info-container').style.display = 'none'
    }
  })
}

const saveMapAsPNG = () => {
  const overlayImage = new Image();
  overlayImage.src = '../images/download-legend-3.png';

  const overlayLogo = new Image();
  overlayLogo.src = '../images/square-logo-transparent.png';

  // Wait for the map to be fully loaded
  map.resize();
  map.once('render', function() {
    // Get the map canvas
    var canvas = map.getCanvas();
    var originalWidth = canvas.width;
    var originalHeight = canvas.height;

    // Create a temporary canvas to trim 20px from the top and bottom
    var trimmedCanvas = document.createElement('canvas');
    var trimmedHeight = originalHeight - 60;
    trimmedCanvas.width = originalWidth;
    trimmedCanvas.height = trimmedHeight;
    var trimmedCtx = trimmedCanvas.getContext('2d');

    // Draw the relevant portion of the original canvas onto the temporary canvas
    trimmedCtx.drawImage(canvas, 0, 30, originalWidth, trimmedHeight, 0, 0, originalWidth, trimmedHeight);

    // Create an off-screen canvas with padding
    var newCanvas = document.createElement('canvas');
    var newCanvasWidth = originalWidth + 30;
    var newCanvasHeight = trimmedHeight + 90;
    newCanvas.width = newCanvasWidth;
    newCanvas.height = newCanvasHeight;
    var ctx = newCanvas.getContext('2d');

    // Fill the new canvas with a white background
    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, newCanvasWidth, newCanvasHeight);

    // Draw the trimmed canvas onto the center of the new canvas
    ctx.drawImage(trimmedCanvas, 15, 35);

    // Add a black border around the map canvas
    ctx.strokeStyle = 'black';
    ctx.lineWidth = 1; // Thickness of the border
    ctx.strokeRect(15, 35, originalWidth, originalHeight - 60);

    // Draw the overlay image in the lower left corner
    overlayImage.onload = function() {
      const overlayWidth = 300; // Set the width of the overlay image
      const overlayHeight = 13; // Set the height of the overlay image
      ctx.drawImage(overlayImage, 15, newCanvasHeight - overlayHeight - 30, overlayWidth, overlayHeight);

      ctx.drawImage(overlayLogo, newCanvasWidth - 70, newCanvasHeight - overlayHeight - 97, 50, 50)

      // Add text in the upper left corner
      let text = 'Estimated Fall Foliage Conditions';
      ctx.font = "20px Montserrat, sans-serif";
      ctx.fillStyle = "black";
      ctx.fillText(text, 15, 35 - 10);

      text = document.getElementById('slider-title').innerText.split(':')[0];
      ctx.textAlign = 'right';
      ctx.fillText(text, newCanvasWidth - 15, 35 - 10);

      text = 'Extended Forecast';
      ctx.font = "italic 20px Montserrat, sans-serif";
      ctx.fillText(text, newCanvasWidth - 10, newCanvasHeight - 33);

      text = 'Visit ExploreFall.com to learn more';
      ctx.font = "20px Montserrat, sans-serif";
      ctx.fillText(text, newCanvasWidth - 10, newCanvasHeight - 7);

      ctx.font = "17px Montserrat, sans-serif";

      text = 'None';
      ctx.textAlign = 'center';
      ctx.fillText(text, 33, newCanvasHeight - 8);
      text = 'Low';
      ctx.fillText(text, 86, newCanvasHeight - 8);
      text = 'Mod.';
      ctx.fillText(text, 141, newCanvasHeight - 8);
      text = 'High';
      ctx.fillText(text, 191, newCanvasHeight - 8);
      text = 'Peak';
      ctx.fillText(text, 244, newCanvasHeight - 8);
      text = 'Past';
      ctx.fillText(text, 297, newCanvasHeight - 8);

      // Convert new canvas to data URL
      var dataURL = newCanvas.toDataURL('image/png');

      // Create a temporary link element
      var link = document.createElement('a');
      link.href = dataURL;
      link.download = 'fallfoliagemap.png'; // Specify the filename
      link.click();
    };
  });
}

// Add click event listener to the save button
document.getElementById('download').addEventListener('click', saveMapAsPNG);

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

document.getElementById('date-info-icon').addEventListener('mouseenter', () => {
  document.getElementById('date-info-text').style.display = 'block'
})

document.getElementById('date-info-icon').addEventListener('mouseleave', () => {
  document.getElementById('date-info-text').style.display = 'none'
})

const updateAtt = (data) => {
  let att_str = ''
  let att_lst = []
  for (let key in data.contributors) {
    let att_obj = data.contributors[key]
    let text = att_obj.attribution
    let bbox = att_obj.coverageAreas[0].bbox
    let zoomMax = att_obj.coverageAreas[0].zoomMax
    let zoomMin = att_obj.coverageAreas[0].zoomMin
    let zoomMap = map.getZoom()
    let centerMap = map.getCenter()
    if (zoomMap >= zoomMin && zoomMap <= zoomMax && centerMap.lng > bbox[1] && centerMap.lng < bbox[3] && centerMap.lat > bbox[0] && centerMap.lat < bbox[2] && (!att_lst.includes(text))) {
      att_str += text + ', '
      att_lst.push(text)
    }
  }
  document.getElementById("attribution-left").innerText = att_str.slice(0, -2)
}

if (document.getElementById("attribution-left")) {
  fetch('../esri_attributions.json')
  .then(response => {
    if (!response.ok) {
      throw new Error('Network response was not ok');
    }
    return response.json();
  })
  .then(data => {
    updateAtt(data)
    map.on('moveend', function() {
      updateAtt(data)
    });
  })
  .catch(error => {
    console.error('There was a problem with the fetch operation:', error);
  });
}
