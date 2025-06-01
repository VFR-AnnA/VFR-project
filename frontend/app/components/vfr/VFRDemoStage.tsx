'use client'

import { useEffect, useRef, useState } from 'react'
import Script from 'next/script'

// SKU to GLB model mapping
const SKU_MODEL_MAP: Record<string, string> = {
  'hoodie-001': '/models/clothes/hoodie.glb',
  'tshirt-001': '/models/clothes/tshirt.glb',
  'jacket-001': '/models/clothes/jacket.glb',
  'polo-001': '/models/clothes/polo.glb',
  // Add more SKU mappings as needed
}

interface VFRDemoStageProps {
  sku: string
  initColor: string
}

export default function VFRDemoStage({ sku, initColor }: VFRDemoStageProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [scriptsLoaded, setScriptsLoaded] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const sceneRef = useRef<any>(null)
  const rendererRef = useRef<any>(null)
  const animationFrameRef = useRef<number | undefined>(undefined)

  // Get the model URL for the SKU
  const modelUrl = SKU_MODEL_MAP[sku] || '/models/clothes/tshirt.glb'

  useEffect(() => {
    if (!scriptsLoaded || !containerRef.current) return

    const initializeViewer = async () => {
      try {
        // Access global Three.js and other libraries
        const THREE = (window as any).THREE
        const OrbitControls = (window as any).THREE.OrbitControls
        const GLTFLoader = (window as any).THREE.GLTFLoader
        const ClothingManager = (window as any).ClothingManager

        if (!THREE || !OrbitControls || !GLTFLoader || !ClothingManager) {
          throw new Error('Required libraries not loaded')
        }

        // Create scene
        const scene = new THREE.Scene()
        scene.background = new THREE.Color(0xf5f5f5)
        sceneRef.current = scene

        // Add lights
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.6)
        scene.add(ambientLight)
        
        const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8)
        directionalLight.position.set(5, 5, 5)
        directionalLight.castShadow = true
        scene.add(directionalLight)

        // Create camera
        const container = containerRef.current
        if (!container) {
          throw new Error('Container not found')
        }
        
        const camera = new THREE.PerspectiveCamera(
          50,
          container.clientWidth / container.clientHeight,
          0.1,
          1000
        )
        camera.position.set(0, 1, 3)

        // Create renderer
        const renderer = new THREE.WebGLRenderer({
          antialias: true,
          alpha: true
        })
        renderer.setSize(container.clientWidth, container.clientHeight)
        renderer.setPixelRatio(window.devicePixelRatio)
        renderer.shadowMap.enabled = true
        renderer.shadowMap.type = THREE.PCFSoftShadowMap
        rendererRef.current = renderer
        container.appendChild(renderer.domElement)

        // Add controls
        const controls = new OrbitControls(camera, renderer.domElement)
        controls.enableDamping = true
        controls.dampingFactor = 0.05
        controls.minDistance = 1
        controls.maxDistance = 5
        controls.target.set(0, 1, 0)
        controls.update()

        // Initialize ClothingManager
        const clothingManager = new ClothingManager(scene)
        
        // Load mannequin
        await clothingManager.loadMannequin('/models/mannequin.glb')
        
        // Load clothing item based on SKU
        await clothingManager.loadClothing(modelUrl, initColor)

        // Animation loop
        const animate = () => {
          animationFrameRef.current = requestAnimationFrame(animate)
          controls.update()
          renderer.render(scene, camera)
        }
        animate()

        // Handle resize
        const handleResize = () => {
          if (!containerRef.current) return
          camera.aspect = containerRef.current.clientWidth / containerRef.current.clientHeight
          camera.updateProjectionMatrix()
          renderer.setSize(containerRef.current.clientWidth, containerRef.current.clientHeight)
          controls.update()
        }
        window.addEventListener('resize', handleResize)

        // Store cleanup function
        return () => {
          window.removeEventListener('resize', handleResize)
          if (animationFrameRef.current) {
            cancelAnimationFrame(animationFrameRef.current)
          }
          renderer.dispose()
          controls.dispose()
        }
      } catch (err) {
        console.error('Error initializing VFR viewer:', err)
        setError(err instanceof Error ? err.message : 'Failed to initialize 3D viewer')
      }
    }

    const cleanup = initializeViewer()

    return () => {
      cleanup.then(cleanupFn => cleanupFn?.())
    }
  }, [scriptsLoaded, modelUrl, initColor])

  if (error) {
    return (
      <div className="flex items-center justify-center h-full bg-red-50 p-4">
        <div className="text-center">
          <p className="text-red-600 mb-2">Error loading 3D viewer</p>
          <p className="text-sm text-gray-600">{error}</p>
        </div>
      </div>
    )
  }

  return (
    <>
      <Script 
        src="/lib/three.min.js" 
        strategy="afterInteractive"
        onLoad={() => {
          // Load other scripts in sequence
          const loadScript = (src: string): Promise<void> => {
            return new Promise((resolve, reject) => {
              const script = document.createElement('script')
              script.src = src
              script.onload = () => resolve()
              script.onerror = reject
              document.head.appendChild(script)
            })
          }

          Promise.all([
            loadScript('/lib/OrbitControls.js'),
            loadScript('/lib/GLTFLoader.js'),
            loadScript('/lib/ClothingManager.js')
          ]).then(() => {
            setScriptsLoaded(true)
          }).catch(err => {
            console.error('Failed to load scripts:', err)
            setError('Failed to load required libraries')
          })
        }}
      />
      <div 
        ref={containerRef} 
        className="w-full h-full"
        style={{ touchAction: 'none' }}
      />
    </>
  )
}