/**
 * FlipbookViewer — the hero component. Realistic page-turn physics on a clean black stage.
 * The page-turn interaction IS the product.
 */
import {
  useRef,
  useCallback,
  useState,
  useEffect,
  forwardRef,
  type CSSProperties,
} from 'react'
import HTMLFlipBook from 'react-pageflip'

/* ── Types for react-pageflip ── */
interface FlipBookRef {
  pageFlip: () => {
    flipNext: () => void
    flipPrev: () => void
    getCurrentPageIndex: () => number
    getPageCount: () => number
    turnToPage: (page: number) => void
  }
}

interface FlipEvent {
  data: number
}

/* ── Single page component (forwarded ref required by react-pageflip) ── */
interface PageProps {
  pageIndex: number
  imageUrl: string
  totalPages: number
}

const Page = forwardRef<HTMLDivElement, PageProps>(
  ({ pageIndex, imageUrl }, ref) => {
    const isBlank = imageUrl === '__blank__'
    const isCover = pageIndex === 1

    if (isBlank) {
      return <div ref={ref}><div style={{ ...pageStyles.page, backgroundColor: '#000' }} /></div>
    }

    return (
      <div ref={ref}>
        <div style={pageStyles.page}>
          <img
            src={imageUrl}
            alt={`Page ${pageIndex + 1}`}
            style={pageStyles.pageImage}
            draggable={false}
          />
          <div style={pageStyles.paperTexture} />
          <div style={pageStyles.reflection} />
          <div style={pageStyles.gutterShadow} />
          <div style={pageStyles.thicknessEdge} />
        </div>
      </div>
    )
  },
)
Page.displayName = 'Page'

/* ── Main FlipbookViewer ── */
interface Props {
  pages: string[]
  onBack: () => void
}

export default function FlipbookViewer({ pages: rawPages, onBack }: Props) {
  // Pad with blank pages so cover/back appear as single centered pages.
  // showCover is off (it forces hard density), so we fake it with blanks.
  const pages = ['__blank__', ...rawPages, ...(rawPages.length % 2 === 0 ? ['__blank__'] : [])]
  const bookRef = useRef<FlipBookRef>(null)
  const [currentPage, setCurrentPage] = useState(0)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [hasInteracted, setHasInteracted] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  // Track user interaction — resets on each idle period
  const lastInteraction = useRef(Date.now())
  const attractorRunning = useRef(false)
  const currentPageRef = useRef(0)

  useEffect(() => {
    const mark = () => {
      lastInteraction.current = Date.now()
      setHasInteracted(true)
    }
    window.addEventListener('mousedown', mark)
    window.addEventListener('mousemove', mark)
    window.addEventListener('touchstart', mark)
    window.addEventListener('keydown', mark)
    return () => {
      window.removeEventListener('mousedown', mark)
      window.removeEventListener('mousemove', mark)
      window.removeEventListener('touchstart', mark)
      window.removeEventListener('keydown', mark)
    }
  }, [])

  // Attractor: after 3s of inactivity, smoothly curl the bottom-right corner.
  // Uses many small mousemove steps for a fluid peel-and-release animation.
  useEffect(() => {
    const interval = setInterval(() => {
      const idle = Date.now() - lastInteraction.current > 3000
      if (!idle || attractorRunning.current || currentPageRef.current > 1) return

      const wrapper = containerRef.current?.querySelector('.stf__wrapper')
      if (!wrapper) return
      const rect = wrapper.getBoundingClientRect()

      const startX = rect.right - 10
      const startY = rect.bottom - 10
      const peelX = rect.right - rect.width * 0.15
      const peelY = rect.bottom - rect.height * 0.1

      attractorRunning.current = true

      // Grab the corner
      wrapper.dispatchEvent(new MouseEvent('mousedown', { bubbles: true, clientX: startX, clientY: startY }))

      // Smooth peel: interpolate from start to peak over ~400ms, then back over ~300ms
      const totalSteps = 30
      const peelSteps = 18 // steps to reach peak
      const returnSteps = totalSteps - peelSteps
      let step = 0

      const animate = () => {
        step++
        let t: number
        let cx: number
        let cy: number

        if (step <= peelSteps) {
          // Eased peel outward
          t = step / peelSteps
          const ease = t < 0.5 ? 2 * t * t : 1 - (-2 * t + 2) ** 2 / 2 // ease-in-out
          cx = startX + (peelX - startX) * ease
          cy = startY + (peelY - startY) * ease
        } else {
          // Eased return to start
          t = (step - peelSteps) / returnSteps
          const ease = t < 0.5 ? 2 * t * t : 1 - (-2 * t + 2) ** 2 / 2
          cx = peelX + (startX - peelX) * ease
          cy = peelY + (startY - peelY) * ease
        }

        wrapper.dispatchEvent(new MouseEvent('mousemove', { bubbles: true, clientX: cx, clientY: cy }))

        if (step < totalSteps) {
          setTimeout(animate, step <= peelSteps ? 22 : 16)
        } else {
          // Release at the return position
          wrapper.dispatchEvent(new MouseEvent('mouseup', { bubbles: true, clientX: startX, clientY: startY }))
          attractorRunning.current = false
        }
      }

      setTimeout(animate, 50)
    }, 5000)

    return () => clearInterval(interval)
  }, [])

  // Flip threshold is patched in page-flip library (scripts/patch-pageflip.sh)
  // — requires dragging 30% past center to complete a flip.

  // Keyboard navigation
  useEffect(() => {
    const handle = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight' || e.key === ' ') {
        e.preventDefault()
        bookRef.current?.pageFlip()?.flipNext()
      }
      if (e.key === 'ArrowLeft') {
        e.preventDefault()
        bookRef.current?.pageFlip()?.flipPrev()
      }
      if (e.key === 'Home') {
        bookRef.current?.pageFlip()?.turnToPage(0)
      }
      if (e.key === 'f' || e.key === 'F') {
        toggleFullscreen()
      }
      if (e.key === 'Escape' && isFullscreen) {
        document.exitFullscreen?.()
      }
    }
    window.addEventListener('keydown', handle)
    return () => window.removeEventListener('keydown', handle)
  }, [isFullscreen])

  const onFlip = useCallback((e: FlipEvent) => {
    setCurrentPage(e.data)
    currentPageRef.current = e.data
    setHasInteracted(true)
  }, [])

  const toggleFullscreen = useCallback(() => {
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen?.()
      setIsFullscreen(true)
    } else {
      document.exitFullscreen?.()
      setIsFullscreen(false)
    }
  }, [])

  useEffect(() => {
    const handler = () => setIsFullscreen(!!document.fullscreenElement)
    document.addEventListener('fullscreenchange', handler)
    return () => document.removeEventListener('fullscreenchange', handler)
  }, [])

  // Compute book dimensions — exact Ralph Magazine aspect ratio
  const PAGE_RATIO = 829 / 1148
  const isNarrow = window.innerWidth < 600
  const maxH = window.innerHeight * (isNarrow ? 0.8 : 0.85)
  const maxW = isNarrow
    ? window.innerWidth * 0.85
    : (window.innerWidth - 80) / 2
  const widthFromHeight = Math.round(Math.min(maxH, 750) * PAGE_RATIO)
  const bookWidth = Math.min(widthFromHeight, maxW)
  const bookHeight = Math.round(bookWidth / PAGE_RATIO)

  return (
    <div
      ref={containerRef}
      style={viewerStyles.container}
      onDoubleClick={toggleFullscreen}
    >
      {/* The flipbook — centered, floating 2.5D object */}
      <div style={viewerStyles.stage}>
        <div style={{
          ...viewerStyles.floatingWrapper,
          // Shift left when on cover so the visible cover page is centered
          marginLeft: (currentPage <= 1) ? -bookWidth : 0,
          marginRight: (currentPage >= pages.length - 2) ? -bookWidth : 0,
          transition: 'margin 0.8s ease-in-out',
        }}>
        {/* @ts-expect-error react-pageflip types are loose */}
        <HTMLFlipBook
          ref={bookRef}
          width={bookWidth}
          height={bookHeight}
          size="fixed"
          minWidth={200}
          maxWidth={500}
          minHeight={280}
          maxHeight={700}
          showCover={false}
          mobileScrollSupport={true}
          onFlip={onFlip}
          flippingTime={1200}
          usePortrait={isNarrow}
          startPage={0}
          drawShadow={true}
          maxShadowOpacity={0.5}
          useMouseEvents={true}
          swipeDistance={Math.round(bookWidth * 0.4)}
          clickEventForward={false}
          style={{}}
          className=""
          startZIndex={0}
          autoSize={true}
          showPageCorners={true}
        >
          {pages.map((url, i) => (
            <Page
              key={i}
              pageIndex={i}
              imageUrl={url}
              totalPages={pages.length}
            />
          ))}
        </HTMLFlipBook>
        </div>

        {/* Soft shadow underneath the floating magazine */}
        <div style={viewerStyles.floatShadow} />
      </div>
    </div>
  )
}

/* ── Page styles ── */
const pageStyles: Record<string, CSSProperties> = {
  page: {
    position: 'absolute',
    inset: 0,
    backgroundColor: '#000',
    overflow: 'hidden',
  },
  paperTexture: {
    // Removed SVG turbulence filter — too expensive during page flip transforms.
    // The reflection gradient provides enough visual texture.
    display: 'none',
  },
  pageImage: {
    width: '100%',
    height: '100%',
    objectFit: 'fill',
    display: 'block',
    pointerEvents: 'none',
    userSelect: 'none',
  },
  gutterShadow: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: 25,
    height: '100%',
    background: 'linear-gradient(90deg, rgba(0,0,0,0.12) 0%, transparent 100%)',
    pointerEvents: 'none',
    zIndex: 1,
  },
  thicknessEdge: {
    position: 'absolute',
    top: 0,
    right: -1,
    width: 3,
    height: '100%',
    background: 'linear-gradient(180deg, rgba(0,0,0,0.06) 0%, rgba(0,0,0,0.15) 50%, rgba(0,0,0,0.06) 100%)',
    pointerEvents: 'none',
    zIndex: 1,
  },
  reflection: {
    position: 'absolute',
    inset: 0,
    // Static vignette + gentle sheen — no animation to avoid jank during page flip
    background: `
      linear-gradient(135deg, transparent 35%, rgba(255,255,255,0.06) 48%, rgba(255,255,255,0.02) 55%, transparent 65%),
      radial-gradient(ellipse at center, transparent 50%, rgba(0,0,0,0.12) 100%)
    `,
    pointerEvents: 'none',
    zIndex: 2,
    willChange: 'auto',
  },
}

/* ── Viewer layout styles ── */
const viewerStyles: Record<string, CSSProperties> = {
  container: {
    width: '100%',
    height: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'transparent',
    cursor: 'default',
    perspective: '1800px',
    position: 'relative',
    zIndex: 2,
  },
  stage: {
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'column',
  },
  floatingWrapper: {
    animation: 'magazine-float 24s cubic-bezier(0.37, 0, 0.63, 1) infinite',
    transformStyle: 'preserve-3d',
    position: 'relative',
    willChange: 'transform',
  },
  floatShadow: {
    width: '80%',
    height: 18,
    marginTop: 16,
    borderRadius: '50%',
    background: 'radial-gradient(ellipse, rgba(255,255,255,0.035) 0%, transparent 70%)',
    animation: 'shadow-pulse 24s cubic-bezier(0.37, 0, 0.63, 1) infinite',
    pointerEvents: 'none',
  },
}
