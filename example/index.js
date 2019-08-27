import VirtualScrollText from '../src/virtual-scroll-text'

const vst = new VirtualScrollText({elemId: 'app'})

// https://jsonplaceholder.typicode.com/comments

const nycsubwayentrances = 'https://data.cityofnewyork.us/api/views/he7q-3hwy/rows.csv?accessType=DOWNLOAD'

fetch(nycsubwayentrances).then(function(response) {
  return response.text().then(function(text) {
    vst.publish(text)
  })
})

