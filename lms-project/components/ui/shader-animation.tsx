"use client"

import { useEffect, useRef } from "react"
import * as THREE from "three"

export function ShaderAnimation() {
  const containerRef = useRef<HTMLDivElement>(null)
  const sceneRef = useRef<{
    camera: THREE.Camera
    scene: THREE.Scene
    renderer: THREE.WebGLRenderer
    uniforms: {
      time: { type: string; value: number }
      resolution: { type: string; value: THREE.Vector2 }
    }
    animationId: number
  } | null>(null)

  useEffect(() => {
    if (!containerRef.current) return

    const container = containerRef.current

    // Vertex shader
    const vertexShader = `
      void main() {
        gl_Position = vec4( position, 1.0 );
      }
    `

    // Fragment shader
    const fragmentShader = `
      #define TWO_PI 6.2831853072
      #define PI 3.14159265359

      precision highp float;
      uniform vec2 resolution;
      uniform float time;

      void main(void) {
        vec2 uv = (gl_FragCoord.xy * 2.0 - resolution.xy) / min(resolution.x, resolution.y);
        float t = time*0.05;
        float lineWidth = 0.002;

        // Background color: #040e09 = rgb(4, 14, 9) / 255
        vec3 bgColor = vec3(0.016, 0.055, 0.035);

        // Base intensity calculation (same effect logic)
        float intensity = 0.0;
        for(int i=0; i < 5; i++){
          intensity += lineWidth*float(i*i) / abs(fract(t + float(i)*0.01)*5.0 - length(uv) + mod(uv.x+uv.y, 0.2));
        }
        
        // App color palette (teal/emerald greens from the theme)
        // Primary: oklch(0.696 0.17 162.48) ≈ rgb(0.16, 0.72, 0.56) - Teal green
        // Chart-2: oklch(0.60 0.15 180) ≈ rgb(0.10, 0.60, 0.60) - Cyan teal
        // Chart-4: oklch(0.55 0.14 200) ≈ rgb(0.15, 0.55, 0.70) - Blue teal
        
        vec3 color1 = vec3(0.16, 0.72, 0.56);  // Primary teal green
        vec3 color2 = vec3(0.10, 0.60, 0.60);  // Cyan teal
        vec3 color3 = vec3(0.15, 0.55, 0.70);  // Blue teal
        
        // Create color variation based on position and time
        float colorMix = sin(length(uv) * 3.0 + t * 2.0) * 0.5 + 0.5;
        float colorMix2 = cos(atan(uv.y, uv.x) + t) * 0.5 + 0.5;
        
        vec3 baseColor = mix(color1, color2, colorMix);
        baseColor = mix(baseColor, color3, colorMix2 * 0.5);
        
        // Apply intensity to the color, blend with background
        vec3 effectColor = baseColor * intensity * 1.5;
        vec3 finalColor = bgColor + effectColor;
        
        gl_FragColor = vec4(finalColor, 1.0);
      }
    `

    // Initialize Three.js scene
    const camera = new THREE.Camera()
    camera.position.z = 1

    const scene = new THREE.Scene()
    const geometry = new THREE.PlaneGeometry(2, 2)

    const uniforms = {
      time: { type: "f", value: 1.0 },
      resolution: { type: "v2", value: new THREE.Vector2() },
    }

    const material = new THREE.ShaderMaterial({
      uniforms: uniforms,
      vertexShader: vertexShader,
      fragmentShader: fragmentShader,
    })

    const mesh = new THREE.Mesh(geometry, material)
    scene.add(mesh)

    const renderer = new THREE.WebGLRenderer({ antialias: true })
    renderer.setPixelRatio(window.devicePixelRatio)

    container.appendChild(renderer.domElement)

    // Handle window resize
    const onWindowResize = () => {
      const width = container.clientWidth
      const height = container.clientHeight
      renderer.setSize(width, height)
      uniforms.resolution.value.x = renderer.domElement.width
      uniforms.resolution.value.y = renderer.domElement.height
    }

    // Initial resize
    onWindowResize()
    window.addEventListener("resize", onWindowResize, false)

    // Animation loop
    const animate = () => {
      const animationId = requestAnimationFrame(animate)
      uniforms.time.value += 0.05
      renderer.render(scene, camera)

      if (sceneRef.current) {
        sceneRef.current.animationId = animationId
      }
    }

    // Store scene references for cleanup
    sceneRef.current = {
      camera,
      scene,
      renderer,
      uniforms,
      animationId: 0,
    }

    // Start animation
    animate()

    // Cleanup function
    return () => {
      window.removeEventListener("resize", onWindowResize)

      if (sceneRef.current) {
        cancelAnimationFrame(sceneRef.current.animationId)

        if (container && sceneRef.current.renderer.domElement) {
          container.removeChild(sceneRef.current.renderer.domElement)
        }

        sceneRef.current.renderer.dispose()
        geometry.dispose()
        material.dispose()
      }
    }
  }, [])

  return (
    <div
      ref={containerRef}
      className="absolute inset-0 w-full h-full pointer-events-none"
      style={{
        background: "#040e09",
        overflow: "hidden",
      }}
    />
  )
}
