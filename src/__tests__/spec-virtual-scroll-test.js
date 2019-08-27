import VirtualScrollText from '../virtual-scroll-text'

describe('Virtual Scroll Text Suite', () => {
  beforeEach(() => {
    document.body.innerHTML = `
      <div id="app"></div>
    `

    new VirtualScrollText({elemId: 'app'})
  })

  afterAll(() => {
    
  })

  test('The container for vscrolltext will be created', () => {
    expect(document.querySelector('#app')).toBeInTheDocument()
  })
})
