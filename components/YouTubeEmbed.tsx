'use client'

import React, { useEffect, useId, useRef } from 'react'

type YTPlayerEvent = {
  target: YTPlayerInstance
  data: number
}

type YTStateChangeEvent = {
  data: number
}

type YTPlayerInstance = {
  destroy?: () => void
  getIframe?: () => HTMLIFrameElement | null
  getCurrentTime?: () => number
  getDuration?: () => number
  pauseVideo?: () => void
  playVideo?: () => void
  seekTo?: (seconds: number) => void
  unMute?: () => void
}

type YTPlayerOptions = {
  videoId: string
  playerVars: {
    autoplay: number
    mute: number
    rel: number
    playsinline: number
    controls: number
  }
  events: {
    onStateChange: (event: YTPlayerEvent) => void
    onReady: (event: YTPlayerEvent) => void
  }
}

type YouTubeWindow = Window & {
  YT?: {
    Player: new (containerId: string, options: YTPlayerOptions) => YTPlayerInstance
    PlayerState: { ENDED: number }
  }
  onYouTubeIframeAPIReady?: () => void
}

interface YouTubeEmbedProps {
  url: string
  autoplay?: boolean
  onEnd?: () => void
  compact?: boolean
  onReady?: (player: YTPlayerInstance) => void
}

function getYouTubeId(url: string): string | null {
  try {
    const u = new URL(url)
    const host = u.hostname.replace(/^www\./, '')

    if (host === 'youtu.be') {
      return u.pathname.split('/').filter(Boolean)[0] ?? null
    }

    if (host === 'youtube.com' || host === 'm.youtube.com' || host === 'music.youtube.com' || host === 'youtube-nocookie.com') {
      const v = u.searchParams.get('v')
      if (v) return v

      const parts = u.pathname.split('/').filter(Boolean)
      const knownRoutes = ['embed', 'shorts', 'live', 'v']
      for (const route of knownRoutes) {
        const index = parts.indexOf(route)
        if (index !== -1 && parts[index + 1]) return parts[index + 1]
      }

      if (parts.length === 1 && /^[a-zA-Z0-9_-]{11}$/.test(parts[0])) {
        return parts[0]
      }
    }
  } catch {
    // fallthrough
  }
  return null
}

export default function YouTubeEmbed({ url, autoplay = false, onEnd, compact = false, onReady }: YouTubeEmbedProps) {
  const id = getYouTubeId(url)
  const playerRef = useRef<YTPlayerInstance | null>(null)
  const reactId = useId()
  const containerId = `yt-player-${reactId.replace(/:/g, '')}`

  useEffect(() => {
    // If neither onEnd nor onReady handler is provided, we can keep the simple iframe embed behavior.
    if (!id || (!onEnd && !onReady)) return

    let mounted = true

    function createPlayer() {
      console.log('[YouTubeEmbed] createPlayer', containerId)
      try {
        const youtubeWindow = window as YouTubeWindow
        if (!youtubeWindow.YT?.Player) {
          return
        }

        playerRef.current = new youtubeWindow.YT.Player(containerId, {
          videoId: id,
          playerVars: {
            autoplay: autoplay ? 1 : 0,
            mute: autoplay ? 1 : 0,
            rel: 0,
            playsinline: 1,
            controls: compact ? 0 : 1,
          },
          events: {
            onStateChange: (e: YTStateChangeEvent) => {
              // 0 is ended
              const youtubeWindow = window as YouTubeWindow
              if (e.data === youtubeWindow.YT?.PlayerState.ENDED) {
                if (onEnd) onEnd()
              }
            },
            onReady: (e: YTPlayerEvent) => {
              try {
                if (typeof onReady === 'function') onReady(e.target)
              } catch {
                // ignore
              }
            },
          },
        })
      } catch {
        // ignore
      }
    }

    // Load YT API if needed
    if (typeof window !== 'undefined') {
      const youtubeWindow = window as YouTubeWindow
      if (youtubeWindow.YT?.Player) {
        console.log('[YouTubeEmbed] YT API already loaded')
        createPlayer()
      } else {
        console.log('[YouTubeEmbed] injecting YouTube iframe API script')
        // Attach global ready handler
        const prev = youtubeWindow.onYouTubeIframeAPIReady
        window.onYouTubeIframeAPIReady = function () {
          if (prev) prev()
          if (!mounted) return
          createPlayer()
        }

        const script = document.createElement('script')
        script.src = 'https://www.youtube.com/iframe_api'
        script.async = true
        script.onload = () => console.log('[YouTubeEmbed] iframe_api script loaded')
        document.body.appendChild(script)
      }
    }

    return () => {
      mounted = false
      try {
        if (playerRef.current && typeof playerRef.current.destroy === 'function') playerRef.current.destroy()
      } catch {
        // ignore
      }
    }
  }, [id, containerId, autoplay, compact, onEnd, onReady])

  if (!id) {
    return (
      <div className="mt-3 rounded-2xl border border-dashed border-zinc-700 bg-zinc-950 px-4 py-3 text-sm text-zinc-300">
        This link is not a supported YouTube URL. Paste a watch, share, shorts, or embed link.
      </div>
    )
  }

  // If onEnd isn't provided, use a simple nocookie iframe. If it is provided, the API will replace the container.
  const playerParams = new URLSearchParams()
  playerParams.set('enablejsapi', '1')
  playerParams.set('rel', '0')
  playerParams.set('modestbranding', '1')
  playerParams.set('playsinline', '1')
  playerParams.set('controls', '1')
  if (autoplay) {
    playerParams.set('autoplay', '1')
    // do not force mute here; let user control audio when compact
  }

  const src = `https://www.youtube-nocookie.com/embed/${id}?${playerParams.toString()}`

  if (compact) {
    return (
      <div className="mt-3">
        <div className="relative w-full h-14">
          <div id={containerId} className="absolute left-0 top-0 h-full w-full rounded">
            <iframe
              title={`youtube-${id}`}
              src={src}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              className="h-full w-full"
              style={{ border: '0', opacity: 0, pointerEvents: 'none' }}
            />
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="mt-3">
      <div className="relative w-full" style={{ paddingTop: '56.25%' }}>
        {/* If the IFrame API initializes it will replace this div with a player instance */}
        <div id={containerId} className="absolute left-0 top-0 h-full w-full rounded">
          {/* Fallback iframe for browsers without JS or before API loads */}
          <iframe
            title={`youtube-${id}`}
            src={src}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            className="h-full w-full"
            style={{ border: '0' }}
          />
        </div>
      </div>
    </div>
  )
}
