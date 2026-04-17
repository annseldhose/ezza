'use client';

import { useEffect, useRef, useState } from 'react';
import * as BABYLON from 'babylonjs';
import 'babylonjs/babylon.max';

interface VRViewerProps {
  roomId: string;
  onExit?: () => void;
  onRoomChange?: (roomId: string) => void;
}

const ROOMS = [
  {
    id: 'demo-room-1',
    name: 'Main Living Space',
    image: '/rooms/demo-room-1.jpg',
  },
  {
    id: 'demo-room-2',
    name: 'Alternate View',
    image: '/rooms/demo-room-2.jpg',
  },
];

export default function VRViewer({ roomId = 'demo-room-1', onExit, onRoomChange }: VRViewerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const sceneRef = useRef<BABYLON.Scene | null>(null);
  const engineRef = useRef<BABYLON.Engine | null>(null);
  const xrExperienceRef = useRef<any>(null);
  const [isInVR, setIsInVR] = useState(false);
  const [currentRoomId, setCurrentRoomId] = useState(roomId);
  const [webXRSupported, setWebXRSupported] = useState(false);
  const [vrUISetup, setVRUISetup] = useState(false);

  useEffect(() => {
    if (!canvasRef.current) return;

    // Initialize Babylon Engine
    const engine = new BABYLON.Engine(canvasRef.current, true);
    engineRef.current = engine;

    // Create Scene
    const scene = new BABYLON.Scene(engine);
    sceneRef.current = scene;
    scene.clearColor = new BABYLON.Color3(0, 0, 0);

    // Set up camera for panoramic viewing
    const camera = new BABYLON.UniversalCamera('camera1', BABYLON.Vector3.Zero());
    camera.attachControl(canvasRef.current, true);
    camera.inertia = 0.7;
    camera.angularSensibility = 500;

    // Load the panoramic image as a skybox
    const loadRoom = (roomId: string) => {
      const room = ROOMS.find((r) => r.id === roomId);
      if (!room) return;

      console.log('[v0] Loading room:', room.name);

      // Remove existing skybox
      scene.meshes.forEach((mesh) => {
        if (mesh.name === 'panoramaSkybox') {
          mesh.dispose();
        }
      });

      // Create skybox from equirectangular image
      const skybox = BABYLON.MeshBuilder.CreateSphere(
        'panoramaSkybox',
        { segments: 64, diameter: 1000 },
        scene
      );

      const skyboxMaterial = new BABYLON.StandardMaterial('skyboxMat', scene);
      skyboxMaterial.emissiveTexture = new BABYLON.Texture(room.image, scene);
      skyboxMaterial.backFaceCulling = false;
      skybox.material = skyboxMaterial;

      // Camera stays at center of sphere
      camera.position = BABYLON.Vector3.Zero();
    };

    loadRoom(currentRoomId);

    // Setup WebXR
    const initXR = async () => {
      try {
        const xrSupported = await BABYLON.WebXRSessionManager.IsSessionSupportedAsync(
          'immersive-vr'
        );
        console.log('[v0] WebXR supported:', xrSupported);
        setWebXRSupported(xrSupported);

        if (xrSupported) {
          const xrHelper = await scene.createDefaultXRExperienceAsync({
            uiOptions: {
              sessionMode: 'immersive-vr',
            },
          });

          xrExperienceRef.current = xrHelper;

          // Handle XR session events
          xrHelper.baseExperience.onStateChangedObservable.add((state) => {
            console.log('[v0] XR state changed:', state);
            if (state === BABYLON.WebXRState.IN_XR) {
              setIsInVR(true);
            } else if (state === BABYLON.WebXRState.NOT_IN_XR) {
              setIsInVR(false);
            }
          });
        } else {
          console.log('[v0] WebXR immersive-vr not supported');
        }
      } catch (error) {
        console.log('[v0] WebXR initialization error:', error);
      }
    };

    initXR();

    // Render loop
    const renderLoop = () => {
      scene.render();
    };

    engine.runRenderLoop(renderLoop);

    // Handle window resize
    const handleResize = () => {
      engine.resize();
    };
    window.addEventListener('resize', handleResize);

    // Cleanup
    return () => {
      window.removeEventListener('resize', handleResize);
      scene.dispose();
      engine.dispose();
    };
  }, [currentRoomId]);

  const handleEnterVR = async () => {
    if (xrExperienceRef.current) {
      try {
        console.log('[v0] Entering VR mode');
        await xrExperienceRef.current.baseExperience.enterXRAsync(
          'immersive-vr',
          'local'
        );
        // Setup VR UI after entering VR
        setTimeout(() => {
          setupVRUI();
        }, 500);
      } catch (error) {
        console.log('[v0] Error entering VR:', error);
      }
    }
  };

  const handleExitVR = async () => {
    if (xrExperienceRef.current) {
      try {
        await xrExperienceRef.current.baseExperience.exitXRAsync();
      } catch (error) {
        console.log('[v0] Error exiting VR:', error);
      }
    }
  };

  const setupVRUI = () => {
    if (!sceneRef.current || vrUISetup) return;

    try {
      console.log('[v0] Setting up VR UI panel');
      const scene = sceneRef.current;

      // Create advanced texture for VR UI
      const advancedTexture = BABYLON.GUI.AdvancedDynamicTexture.CreateFullscreenUI(
        'VRUI',
        true,
        scene
      );

      // Create left-side panel container
      const leftPanel = new BABYLON.GUI.StackPanel();
      leftPanel.width = '220px';
      leftPanel.paddingLeftInPixels = 20;
      leftPanel.paddingTopInPixels = 20;
      leftPanel.paddingRightInPixels = 10;
      leftPanel.horizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_LEFT;
      leftPanel.verticalAlignment = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_TOP;
      leftPanel.spacing = 8;
      advancedTexture.addControl(leftPanel);

      // Title
      const title = new BABYLON.GUI.TextBlock('vrTitle', 'Room Selection');
      title.fontSize = 16;
      title.fontWeight = 'bold';
      title.color = 'white';
      title.height = '40px';
      leftPanel.addControl(title);

      // Room selector buttons
      ROOMS.forEach((room) => {
        const btn = BABYLON.GUI.Button.CreateSimpleButton(`vrRoom-${room.id}`, room.name);
        btn.width = '200px';
        btn.height = '50px';
        btn.color = 'white';
        btn.background = currentRoomId === room.id ? '#2563eb' : '#4b5563';
        btn.fontSize = 12;
        btn.cornerRadius = 4;
        btn.onPointerUpObservable.add(() => {
          console.log('[v0] VR room selected:', room.id);
          setCurrentRoomId(room.id);
          onRoomChange?.(room.id);
        });
        leftPanel.addControl(btn);
      });

      // Spacer
      const spacer = new BABYLON.GUI.TextBlock('vrSpacer', '');
      spacer.height = '20px';
      leftPanel.addControl(spacer);

      // Exit VR button
      const exitBtn = BABYLON.GUI.Button.CreateSimpleButton('vrExitBtn', 'Exit VR');
      exitBtn.width = '200px';
      exitBtn.height = '50px';
      exitBtn.color = 'white';
      exitBtn.background = '#dc2626';
      exitBtn.fontSize = 12;
      exitBtn.cornerRadius = 4;
      exitBtn.onPointerUpObservable.add(() => {
        console.log('[v0] Exit VR button clicked');
        handleExitVR();
      });
      leftPanel.addControl(exitBtn);

      setVRUISetup(true);
    } catch (error) {
      console.log('[v0] Error setting up VR UI:', error);
    }
  };

  return (
    <div className="w-full h-screen bg-black relative">
      <canvas
        ref={canvasRef}
        className="w-full h-full"
        style={{ display: 'block' }}
      />
      
      {/* Desktop/Mobile Controls - visible when NOT in VR */}
      {!isInVR && (
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black via-black/80 to-transparent p-6 z-10">
          <div className="flex flex-col gap-4 items-center">
            {/* Current room name */}
            <h2 className="text-xl font-semibold text-white">
              {ROOMS.find((r) => r.id === currentRoomId)?.name}
            </h2>

            {/* Room Navigation Controls */}
            <div className="flex gap-3 justify-center flex-wrap">
              <button
                onClick={() => {
                  const currentIndex = ROOMS.findIndex((r) => r.id === currentRoomId);
                  const newIndex =
                    currentIndex === 0 ? ROOMS.length - 1 : currentIndex - 1;
                  setCurrentRoomId(ROOMS[newIndex].id);
                }}
                className="px-6 py-2 bg-slate-600 hover:bg-slate-700 text-white rounded-lg transition"
              >
                ← Previous Room
              </button>
              {ROOMS.map((room) => (
                <button
                  key={room.id}
                  onClick={() => setCurrentRoomId(room.id)}
                  className={`px-4 py-2 rounded-lg font-medium transition ${
                    currentRoomId === room.id
                      ? 'bg-blue-600 text-white'
                      : 'bg-slate-600 text-gray-100 hover:bg-slate-700'
                  }`}
                >
                  {room.name}
                </button>
              ))}
              <button
                onClick={() => {
                  const currentIndex = ROOMS.findIndex((r) => r.id === currentRoomId);
                  const newIndex = (currentIndex + 1) % ROOMS.length;
                  setCurrentRoomId(ROOMS[newIndex].id);
                }}
                className="px-6 py-2 bg-slate-600 hover:bg-slate-700 text-white rounded-lg transition"
              >
                Next Room →
              </button>
            </div>

            {/* VR Entry Button */}
            {webXRSupported && (
              <button
                onClick={handleEnterVR}
                className="px-8 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition font-semibold flex items-center gap-2"
              >
                <span>🥽</span> Enter VR (Meta Quest 3)
              </button>
            )}

            {/* Help text */}
            <p className="text-gray-300 text-sm text-center">
              Drag to look around • Select a room or enter VR mode
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
