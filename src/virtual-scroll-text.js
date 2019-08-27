class VirtualScrollText {
  w = 0
  h = 0
  isPaused = 0
  lsz = 13
  fragments = []
  queue = []
  onScrollTimer = null
  curScrollTop = 0
  curScrollHeight = 0
  maxVp = 4
  curVp = 0
  bumpScrollTop = null
  isVolatile = 0
  isScrolling = 0
  vcontainer = null
  vcontent = null
  vbutton = null
  consumer = null
  
  constructor(props = {}, elem) {
    this.onScrollHandler = this.onScrollHandler.bind(this)
    this.onStoppedScrolling = this.onStoppedScrolling.bind(this)
    this.onPauseButtonClickHandler = this.onPauseButtonClickHandler.bind(this)

    this.createContainer(props, elem)
      .createViewport(props)
      .createPauseButton()
      .removeWhitespaceFromViewport()

    this.listen()
  }

  onScrollHandler = e => {
    this.isScrolling = 1
    window.clearTimeout(this.bumpScrollTop)

    const st = e.target.scrollTop
    
    this.curScrollTop = st
    this.curScrollHeight = e.target.scrollHeight
    
    this.onScrollTimer = setTimeout(this.onStoppedScrolling, 100);
  }

  onStoppedScrolling = () => {
    this.isScrolling = 0

    // Scrolling down.
    if ((this.curScrollTop + this.h + 20 > this.curScrollHeight)) {
      const lastVp = parseInt(this.vcontent.lastElementChild.dataset.idx)
      
      if (!this.isVolatile && this.fragments.length > (lastVp + 1)) {
        this.isVolatile = 1
        
        const chunk = this.fragments.slice(lastVp + 1)
        const item = chunk[0][1]
        this.vcontent.appendChild(item)
        this.vcontent.removeChild(this.vcontent.firstChild)
        this.curVp = this.curVp + 1
        this.curScrollHeight = this.vcontent.scrollHeight - (2 * this.h)
        this.vcontent.scrollTop = this.curScrollHeight
        
        this.isVolatile = 0
      }
    }

    // Scrolling up.
    if (!this.isVolatile && (this.curScrollHeight - this.curScrollTop + this.h > this.curScrollHeight) && this.curVp > 0) {      
      this.isVolatile = 1
      
      const chunk = this.fragments.slice(this.curVp - 1)
      const item = chunk[0][1]      
      this.vcontent.insertBefore(item, this.vcontent.firstChild)
      this.vcontent.removeChild(this.vcontent.lastElementChild)      
      this.curVp = this.curVp - 1
      this.curScrollHeight = this.vcontent.scrollHeight
      
      if (this.curScrollTop === 0) {
        this.bumpScrollTop = setTimeout(() => { 
          this.vcontent.scrollTop = this.curScrollTop + 20
          this.isVolatile = 0   
        }, 100)
      } else {
        this.isVolatile = 0
      }    
    }
    
    window.clearTimeout(this.onScrollTimer);    
  }

  onPauseButtonClickHandler = e => {
    const txt = this.vbutton.innerText
    this.vbutton.innerText = txt === 'Pause' ? 'Resume' : 'Pause'
    this.isPaused = txt === 'Pause' ? 1 : 0
  }

  createContainer = (props, elem) => {
    const {elemId} = props
    this.vcontainer = elem || document.getElementById(elemId)
    this.vcontainer.setAttribute('class', 'vscrolltext-container')
    return this
  }

  createViewport = props => {
    const { style } = props
    this.vcontent = document.createElement('div')
    this.vcontent.setAttribute('class', 'vscrolltext-content')
    this.vcontent.onscroll = this.onScrollHandler
    this.vcontainer.appendChild(this.vcontent)
    
    if (typeof style === 'object') {
      for (const prop in style)
        this.vcontent.style[prop] = style[prop]
    } 

    const rect = this.vcontent.getBoundingClientRect()
    this.h = rect.height
    this.w = rect.width - 10 // 10 for padding.
    return this
  }

  createPauseButton = () => {
    this.vbutton = document.createElement('button')
    this.vbutton.setAttribute('class', 'vscrolltext-button')
    this.vbutton.appendChild(document.createTextNode('Pause'))
    this.vbutton.onclick = this.onPauseButtonClickHandler
    this.vcontainer.appendChild(this.vbutton)
    return this
  }

  removeWhitespaceFromViewport = () => {
    setTimeout(() => {
      this.vcontent.lastChild && this.vcontent.lastChild.nodeType === 3 && (this.vcontent.lastChild.nodeValue = '')
    }, 100)
  }

  createRow = (idx, data) => {
    var itemText = document.createTextNode(data);
    const item = document.createElement('span');
    item.setAttribute('class', 'cell');
    item.dataset.idx = idx 
    item.appendChild(itemText);
    return item
  }

  recalc = text => {
    const tSz = text.length;
    const arrStr = text.split('')    
    const newlines = (text.match(/\n/g) || []).length
    const newlineSz = newlines * Math.ceil(this.w / this.lsz)    
    const reqSz = (tSz * this.lsz) + newlineSz
    const cellSz = Math.ceil((this.w * this.h) / this.lsz)
    const chunks = Math.ceil(reqSz / cellSz)
    const chunkSz = Math.ceil(tSz / chunks)
    return {arrStr, chunks, chunkSz}
  }

  createFragments = ({arrStr, chunks, chunkSz}) => {
    for (let i = 0; i < chunks; i++) {
      const rm = arrStr.splice(0, chunkSz);
      const len = this.fragments.length
      const next = rm.join('')
      const item = this.createRow(len, next)
      this.fragments.push([len, item])
    }
  }

  renderChunk = () => {
    setTimeout(() => {
      if (this.isScrolling)
        return

      // Remove all content.
      let child = this.vcontent.lastElementChild
      while (child) {
        this.vcontent.removeChild(child)
        child = this.vcontent.lastElementChild
      }

      // Get the last items of the stack.
      this.curVp = this.fragments.length > this.maxVp ? this.fragments.length - this.maxVp : this.fragments.length
      const chunk = this.fragments.slice(this.curVp === 1 ? 0 : this.curVp)
      
      for (let i = 0; i < chunk.length; i++) {
        const item = chunk[i][1]
        this.vcontent.appendChild(item)
      }
      
      this.vcontent.scrollTop = this.vcontent.scrollHeight
    }, 100)
  }

  listen = () => {
    this.consumer = setInterval(() => {
      if (this.isPaused || this.queue.length === 0)
        return

      const next = this.queue.shift()
      const task = this.recalc(next)
      this.createFragments(task)
      this.renderChunk()
    }, 500)
  }
  
  publish = text => { this.queue.push(text) }
}

export default VirtualScrollText
