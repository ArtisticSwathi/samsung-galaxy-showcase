import { useEffect, useRef } from 'react'

export default function FloatingBackground() {
  const canvasRef = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let animationId
    let width = (canvas.width = window.innerWidth)
    let height = (canvas.height = window.innerHeight)

    // Cursor coordinates (with target and smoothed values for parallax)
    const mouse = { x: 0, y: 0, targetX: 0, targetY: 0 }

    const handleResize = () => {
      if (!canvas) return
      width = canvas.width = window.innerWidth
      height = canvas.height = window.innerHeight
    }

    const handleMouseMove = (e) => {
      // Normalize cursor coordinate to [-1, 1] relative to viewport
      mouse.targetX = (e.clientX / window.innerWidth) * 2 - 1
      mouse.targetY = -(e.clientY / window.innerHeight) * 2 + 1
    }

    window.addEventListener('resize', handleResize)
    window.addEventListener('mousemove', handleMouseMove)

    // 1. Generate Realistic Stars with varying depths & twinkle parameters
    const numStars = 600
    const stars = []
    
    for (let i = 0; i < numStars; i++) {
      // Depth parameter between 1.0 (close) and 4.5 (deep background)
      const depth = 1.0 + Math.random() * 3.5
      
      // Sizes proportional to proximity (closer stars are larger)
      const baseSize = 1.5 / depth
      const size = baseSize + Math.random() * 0.4
      
      // Opacity proportional to proximity
      const baseOpacity = (0.9 / depth) * (Math.random() * 0.5 + 0.5)

      // Twinkle cycles
      const twinkleSpeed = 0.6 + Math.random() * 1.8
      const twinklePhase = Math.random() * Math.PI * 2

      // Star color tinting (mostly pure white, with faint icy blue and space purple)
      let color = 'rgba(255, 255, 255,'
      const colorChance = Math.random()
      if (colorChance < 0.12) {
        color = 'rgba(224, 242, 254,' // Faint icy blue tint
      } else if (colorChance < 0.18) {
        color = 'rgba(250, 245, 255,' // Faint violet tint
      }

      stars.push({
        x: Math.random() * width,
        y: Math.random() * height,
        depth,
        size,
        baseOpacity,
        twinkleSpeed,
        twinklePhase,
        color
      })
    }

    // 2. Define Nebula Cloud parameters (Coordinates, Colors, sizes, and slow orbits)
    const nebulae = [
      {
        centerX: 0.28,
        centerY: 0.35,
        radiusMult: 0.42,
        color: 'rgba(46, 16, 101, 0.12)', // Deep purple/violet
        orbitSpeed: 0.012,
        driftRadiusX: 40,
        driftRadiusY: 25,
        phase: 0
      },
      {
        centerX: 0.72,
        centerY: 0.62,
        radiusMult: 0.48,
        color: 'rgba(30, 27, 75, 0.15)', // Dark space navy/blue
        orbitSpeed: 0.008,
        driftRadiusX: 50,
        driftRadiusY: 35,
        phase: Math.PI / 3
      },
      {
        centerX: 0.5,
        centerY: 0.48,
        radiusMult: 0.36,
        color: 'rgba(8, 47, 73, 0.08)', // Faint celestial teal/cyan
        orbitSpeed: 0.016,
        driftRadiusX: 30,
        driftRadiusY: 20,
        phase: Math.PI * 1.2
      }
    ]

    // Base drift speed of the starfield
    const baseDriftSpeed = 0.04

    const animate = (timestamp) => {
      const time = timestamp * 0.001 // Convert to seconds

      // Clear screen with solid dark base
      ctx.fillStyle = '#020204'
      ctx.fillRect(0, 0, width, height)

      // Smoothly interpolate cursor position (elastic lerp)
      mouse.x += (mouse.targetX - mouse.x) * 0.05
      mouse.y += (mouse.targetY - mouse.y) * 0.05

      // A. Draw Shifting Nebula Clouds (Radial Gradients rendered behind the stars)
      nebulae.forEach((neb) => {
        // Orbit coordinates based on elapsed time
        const nx = (neb.centerX * width) + Math.sin(time * neb.orbitSpeed + neb.phase) * neb.driftRadiusX
        const ny = (neb.centerY * height) + Math.cos(time * neb.orbitSpeed + neb.phase) * neb.driftRadiusY
        const radius = Math.min(width, height) * neb.radiusMult

        const grad = ctx.createRadialGradient(nx, ny, 0, nx, ny, radius)
        grad.addColorStop(0, neb.color)
        grad.addColorStop(1, 'rgba(0, 0, 0, 0)')

        ctx.fillStyle = grad
        ctx.fillRect(0, 0, width, height)
      })

      // B. Draw Twinkling Starfield with 3D Depth Parallax
      for (let i = 0; i < numStars; i++) {
        const star = stars[i]

        // Slowly drift stars to the left (closer stars move faster)
        star.x -= baseDriftSpeed / star.depth

        // Wrap star back to right edge when it moves off-screen
        if (star.x < -10) {
          star.x = width + 10
          star.y = Math.random() * height
        }

        // Mouse Parallax Offset: closer stars translate more (depth parallax)
        // Divide translation by star.depth
        const mx = mouse.x * (32 / star.depth)
        const my = mouse.y * (24 / star.depth)

        const drawX = star.x + mx
        const drawY = star.y - my

        // Twinkle effect (sinusoidal modulation of base opacity)
        const twinkle = 0.25 + 0.75 * Math.sin(time * star.twinkleSpeed + star.twinklePhase)
        const currentOpacity = Math.max(0.1, Math.min(1.0, star.baseOpacity * twinkle))

        // Render star if on screen
        if (drawX >= -2 && drawX <= width + 2 && drawY >= -2 && drawY <= height + 2) {
          ctx.beginPath()
          ctx.arc(drawX, drawY, star.size, 0, Math.PI * 2)
          ctx.fillStyle = `${star.color}${currentOpacity})`
          ctx.fill()
        }
      }

      // Draw faint center glow behind heading text for extra premium depth
      const centerGrad = ctx.createRadialGradient(
        width / 2 + mouse.x * 20, 
        height / 2 - mouse.y * 15, 
        0, 
        width / 2 + mouse.x * 20, 
        height / 2 - mouse.y * 15, 
        width * 0.25
      )
      centerGrad.addColorStop(0, 'rgba(14, 116, 144, 0.08)') // Cyan-700 glow
      centerGrad.addColorStop(1, 'rgba(2, 2, 4, 0)')
      ctx.fillStyle = centerGrad
      ctx.fillRect(0, 0, width, height)

      animationId = requestAnimationFrame(animate)
    }

    // Start loop
    animationId = requestAnimationFrame(animate)

    return () => {
      cancelAnimationFrame(animationId)
      window.removeEventListener('resize', handleResize)
      window.removeEventListener('mousemove', handleMouseMove)
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 w-full h-full -z-10 block pointer-events-none select-none bg-[#020204]"
    />
  )
}
