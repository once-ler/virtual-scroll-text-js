import VirtualScrollText from '../src/virtual-scroll-text'

const vst = new VirtualScrollText({elemId: 'app', 
  style: { width: '420px', height: '200px', color: 'green', abc: 1 }
})

const nycsubwayentrances = 'https://data.cityofnewyork.us/api/views/he7q-3hwy/rows.csv?accessType=DOWNLOAD'

fetch(nycsubwayentrances).then(function(response) {
  return response.text().then(function(text) {
    vst.publish(text)
  })
})

const vst2 = new VirtualScrollText({elemId: 'app2', 
  style: { width: '320px', height: '200px', backgroundColor: 'blue' }
})

var loremIpsum1 = 
`
Lorem ipsum dolor sit amet, consectetur adipiscing elit, ...
`

let produceCount = 1000

const producer = setInterval(() => {
  vst2.publish(`\r\n(${1000 - produceCount})` + loremIpsum1)
  
  if (produceCount === 0)
    clearInterval(producer)

  produceCount--
}, 100)
