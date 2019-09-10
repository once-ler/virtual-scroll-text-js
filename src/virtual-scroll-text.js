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
  maxVp = 4 // Default viewport rows.
  maxVpMax = 0 // Maximum allowed viewport rows when recalulated.
  curVp = 0
  isVolatile = 0
  isScrolling = 0
  numOfCharPerLine = 0
  cellSz = 0
  bumpScrollTop = null // Pointer to scrollTop timeout function.
  vcontainer = null
  vcontent = null
  vbuttonPause = null
  vbuttonScrollBegin = null
  vbuttonScrollEnd = null
  vcontrolContainer = null
  vcontrolCascadeContainer = null
  consumer = null
  
  constructor(props = {}, elem) {
    this.onScrollHandler = this.onScrollHandler.bind(this)
    this.onStoppedScrolling = this.onStoppedScrolling.bind(this)
    this.onPauseButtonClickHandler = this.onPauseButtonClickHandler.bind(this)

    this.createContainer(props, elem)
      .createViewport(props)
      .createControlContainer()
      .createPauseButton()
      .createControlCascadeContainer()
      .createScrollBeginButton()
      .createScrollEndButton()
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
    // Depending on where scrollTop is, slices of viewport will be removed.
    // Tentatively calculate next scrollHeight by subtracting half of max viewport slices allowed.
    const nextScrollHeight = this.vcontent.scrollHeight - (Math.ceil(this.maxVp/2) * this.h)
    
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
        
        let nextScrollTop = nextScrollHeight
        if (nextScrollHeight > 0) {
          this.curScrollHeight = nextScrollHeight
        } else {
          // Not a lot text.  Keep curScrollHeight the same and adjust nextScrollTop to 2/3 of scrollHeight.
          nextScrollTop = Math.floor(this.vcontent.scrollHeight / 3)
        }
        this.vcontent.scrollTop = nextScrollTop        
        this.isVolatile = 0
      }
    }

    // Scrolling up.
    const shouldScrollUp = nextScrollHeight > 0 
      ? (this.curScrollHeight - this.curScrollTop + this.h > this.curScrollHeight)
      : Math.floor(0.1 * this.curScrollHeight) >= this.curScrollTop 

    if (!this.isVolatile && shouldScrollUp && this.curVp > 0) {  
      const chunk = this.fragments.slice(this.curVp - 1)
      const item = chunk[0][1]
      
      if ((1 * item.dataset.idx) < (1 * this.vcontent.firstChild.dataset.idx)) {      
        this.isVolatile = 1
        this.vcontent.insertBefore(item, this.vcontent.firstChild)
        this.vcontent.removeChild(this.vcontent.lastElementChild)      
        this.curVp = this.curVp - 1
        this.curScrollHeight = this.vcontent.scrollHeight
        
        if (this.curScrollTop === 0)
          this.vcontent.scrollTop = this.curScrollTop + 20

        this.isVolatile = 0
      }    
    }
    
    window.clearTimeout(this.onScrollTimer);    
  }

  onPauseButtonClickHandler = e => {
    const txt = this.vbuttonPause.innerText
    this.vbuttonPause.innerText = txt === 'Pause' ? 'Resume' : 'Pause'
    this.isPaused = txt === 'Pause' ? 1 : 0
    this.vcontrolCascadeContainer.classList.toggle('visible')
  }

  createContainer = (props, elem) => {
    const {elemId} = props
    this.vcontainer = elem || document.getElementById(elemId)
    this.vcontainer.setAttribute('class', 'vscrolltext-container')
    return this
  }

  resetStyle = style => {
    if (typeof style !== 'object')
      return this

    for (const prop in style)
      this.vcontent.style[prop] = style[prop]

    return this
  }

  resizeViewport = style => {
    this.resetStyle(style)

    const rect = this.vcontent.getBoundingClientRect()
    this.h = rect.height
    this.w = rect.width - 10 // 10 for padding.
    this.numOfCharPerLine = Math.ceil(this.w / this.lsz)
    this.cellSz = Math.ceil((this.w * this.h) / this.lsz)
    this.maxVpMax = 1.5 * Math.ceil(this.h / this.lsz)

    return this
  }

  createViewport = props => {
    const { style } = props
    this.vcontent = document.createElement('div')
    this.vcontent.setAttribute('class', 'vscrolltext-content')
    this.vcontent.onscroll = this.onScrollHandler
    this.vcontainer.appendChild(this.vcontent)
    
    return this.resizeViewport(style)
  }

  createControlContainer = () => {
    this.vcontrolContainer = document.createElement('div')
    this.vcontrolContainer.setAttribute('class', 'vscrolltext-control-container')    
    this.vcontainer.appendChild(this.vcontrolContainer)
    return this
  }

  createControlCascadeContainer = () => {
    this.vcontrolCascadeContainer = document.createElement('div')
    this.vcontrolCascadeContainer.setAttribute('class', 'vscrolltext-control-cascade-container')
    this.vcontrolContainer.appendChild(this.vcontrolCascadeContainer)
    return this
  }

  createPauseButton = () => {
    this.vbuttonPause = document.createElement('button')
    this.vbuttonPause.setAttribute('class', 'vscrolltext-button')
    this.vbuttonPause.appendChild(document.createTextNode('Pause'))
    this.vbuttonPause.onclick = this.onPauseButtonClickHandler
    this.vcontrolContainer.appendChild(this.vbuttonPause)
    return this
  }

  createScrollBeginButton = () => {
    this.vbuttonScrollBegin = document.createElement('button')
    this.vbuttonScrollBegin.setAttribute('class', 'vscrolltext-button')
    this.vbuttonScrollBegin.appendChild(document.createTextNode('First'))
    this.vbuttonScrollBegin.onclick = e => this.renderBegin()
    this.vcontrolCascadeContainer.appendChild(this.vbuttonScrollBegin)
    return this
  }

  createScrollEndButton = () => {
    this.vbuttonScrollEnd = document.createElement('button')
    this.vbuttonScrollEnd.setAttribute('class', 'vscrolltext-button')
    this.vbuttonScrollEnd.appendChild(document.createTextNode('Last'))
    this.vbuttonScrollEnd.onclick = e => this.renderChunk()
    this.vcontrolCascadeContainer.appendChild(this.vbuttonScrollEnd)
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
    const newlineSz = newlines * this.numOfCharPerLine    
    const reqSz = (tSz * this.lsz) + newlineSz
    const chunks = Math.ceil(reqSz / this.cellSz)
    const chunkSz = Math.ceil(tSz / chunks)
    
    // Increase viewport viewable items if text is tiny.
    if (this.cellSz >= reqSz) {
      const nextMaxVp = Math.ceil(this.cellSz/reqSz)
      this.maxVp = nextMaxVp > this.maxVpMax ? this.maxVpMax : nextMaxVp
    }
      
    return {arrStr, chunks, chunkSz}
  }

  createFragments = ({arrStr, chunks, chunkSz}) => {
    for (let i = 0; i < chunks; i++) {
      // Get last fragment in the stack.
      const count = this.fragments.length
      const lastFragment = count === 0 ? undefined : this.fragments[count - 1]
      const rm = arrStr.splice(0, chunkSz);
      const next = rm.join('')
      const nextLen = next.length

      if (lastFragment && lastFragment[0] < this.numOfCharPerLine) {
        const el = lastFragment[1]
        el.innerText += next
        lastFragment[0] = lastFragment[0] + nextLen 
      } else {
        const item = this.createRow(count, next)
        this.fragments.push([nextLen, item])
      }
      
    }
  }

  renderChunk = () => {
    setTimeout(() => {
      if (this.isScrolling)
        return

      const len = this.fragments.length

      // Remove all content.
      if (len > this.maxVp) {
        let child = this.vcontent.lastElementChild
        while (child) {
          this.vcontent.removeChild(child)
          child = this.vcontent.lastElementChild
        }
      }

      // Get the last items of the stack.
      this.curVp = len > this.maxVp ? len - this.maxVp : len
      const chunk = this.fragments.slice(this.curVp === len ? 0 : this.curVp)

      for (let i = 0; i < chunk.length; i++) {
        const item = chunk[i][1]
        this.vcontent.appendChild(item)
      }
      
      this.vcontent.scrollTop = this.vcontent.scrollHeight
    }, 100)
  }

  renderBegin = () => {
    setTimeout(() => {
      if (this.isScrolling)
        return

      const len = this.fragments.length

      // Remove all content.
      if (len > this.maxVp) {
        let child = this.vcontent.lastElementChild
        while (child) {
          this.vcontent.removeChild(child)
          child = this.vcontent.lastElementChild
        }
      }

      // Get the first items of the stack.
      const sz = len > this.maxVp ? len - this.maxVp : len
      this.curVp = 0
      
      const chunk = this.fragments.slice(0, sz)

      for (let i = 0; i < chunk.length; i++) {
        const item = chunk[i][1]
        this.vcontent.appendChild(item)
      }
      
      this.vcontent.scrollTop = 0
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
    }, 100)
  }
  
  publish = text => { this.queue.push(text) }
}

export default VirtualScrollText
