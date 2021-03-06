import VirtualScrollText from '../src/virtual-scroll-text'
/*
const vst = new VirtualScrollText({elemId: 'app', 
  style: { width: '420px', height: '200px', color: 'green', abc: 1 }
})

const nycsubwayentrances = 'https://data.cityofnewyork.us/api/views/he7q-3hwy/rows.csv?accessType=DOWNLOAD'

fetch(nycsubwayentrances).then(function(response) {
  return response.text().then(function(text) {
    vst.publish(text)
  })
})
*/
const vst2 = new VirtualScrollText({elemId: 'app2', 
  style: { width: '320px', height: '200px', backgroundColor: 'blue' }
})

const loremIpsum = [
  'Lorem ipsum dolor sit amet, consectetur adipiscing elit...',
  'Tempus quam pellentesque nec nam aliquam sem et tortor. I...',
  'Maecenas sed enim ut sem viverra aliquet. Pellentesque d...',
  'Eu non diam phasellus vestibulum lorem sed risus ultrici...',
  'Orci eu lobortis elementum nibh tellus molestie nun...'
]

let produceCount = 1000

const producer = setInterval(() => {
  const nextIpsum = Math.round(Math.random() * loremIpsum.length - 1)
  const loremIpsum1 = loremIpsum[nextIpsum < 0 ? 0 : nextIpsum]
    
  vst2.publish(`(${1000 - produceCount})\r\n${loremIpsum1}\r\n`)
  
  if (produceCount === 0)
    clearInterval(producer)

  produceCount--
}, 100)

const vst3 = new VirtualScrollText({elemId: 'app3', 
  style: { width: '320px', height: '200px', backgroundColor: 'green' }
})

let produceCount2 = 150

const producer2 = setInterval(() => {
  vst3.publish(`(${150 - produceCount2})`)

  if (produceCount2 === 0)
    clearInterval(producer2)

  produceCount2--
}, 100)

const vst4 = new VirtualScrollText({elemId: 'app4', 
  style: { width: '320px', height: '200px', backgroundColor: 'purple' }
})

let produceCount3 = 100

const producer3 = setInterval(() => {
  vst4.publish(`Timeout\n`)

  if (produceCount3 === 0)
    clearInterval(producer3)

  produceCount3--
}, 100)
