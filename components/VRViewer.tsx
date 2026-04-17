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
      skyboxMaterial.emissiveTexture.uScale = 1;
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

      // Create left-side panel container with improved styling
      const leftPanel = new BABYLON.GUI.StackPanel();
      leftPanel.width = '280px';
      leftPanel.paddingLeftInPixels = 30;
      leftPanel.paddingTopInPixels = 30;
      leftPanel.paddingRightInPixels = 20;
      leftPanel.paddingBottomInPixels = 30;
      leftPanel.horizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_LEFT;
      leftPanel.verticalAlignment = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_TOP;
      leftPanel.spacing = 12;
      advancedTexture.addControl(leftPanel);

      // Background panel for left UI
      const bgPanel = new BABYLON.GUI.Rectangle('vrbg');
      bgPanel.width = '280px';
      bgPanel.paddingLeftInPixels = 30;
      bgPanel.paddingTopInPixels = 30;
      bgPanel.paddingRightInPixels = 20;
      bgPanel.paddingBottomInPixels = 30;
      bgPanel.background = '#1a1a2e';
      bgPanel.thickness = 2;
      bgPanel.borderColor = '#7c3aed';
      bgPanel.cornerRadius = 12;
      bgPanel.horizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_LEFT;
      bgPanel.verticalAlignment = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_TOP;
      bgPanel.zIndex = -1;
      advancedTexture.addControl(bgPanel);

      // Title
      const title = new BABYLON.GUI.TextBlock('vrTitle', 'Room Selection');
      title.fontSize = 18;
      title.fontWeight = 'bold';
      title.color = 'white';
      title.height = '50px';
      title.textHorizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_LEFT;
      leftPanel.addControl(title);

      // Divider line
      const divider = new BABYLON.GUI.Rectangle('divider');
      divider.height = '1px';
      divider.background = '#7c3aed';
      divider.thickness = 0;
      leftPanel.addControl(divider);

      // Room selector buttons
      ROOMS.forEach((room) => {
        const btn = BABYLON.GUI.Button.CreateSimpleButton(`vrRoom-${room.id}`, room.name);
        btn.width = '240px';
        btn.height = '55px';
        btn.color = currentRoomId === room.id ? 'white' : '#d1d5db';
        btn.background = currentRoomId === room.id ? '#2563eb' : '#374151';
        btn.fontSize = 14;
        btn.cornerRadius = 8;
        btn.thickness = 2;
        btn.borderColor = currentRoomId === room.id ? '#1d4ed8' : 'transparent';
        btn.paddingLeftInPixels = 12;
        btn.textHorizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_LEFT;
        
        btn.onPointerUpObservable.add(() => {
          console.log('[v0] VR room selected:', room.id);
          setCurrentRoomId(room.id);
          // Update button styles
          ROOMS.forEach((r) => {
            const button = advancedTexture.getControlByName(`vrRoom-${r.id}`) as BABYLON.GUI.Button;
            if (button) {
              if (r.id === room.id) {
                button.color = 'white';
                button.background = '#2563eb';
                button.borderColor = '#1d4ed8';
              } else {
                button.color = '#d1d5db';
                button.background = '#374151';
                button.borderColor = 'transparent';
              }
            }
          });
          onRoomChange?.(room.id);
        });
        leftPanel.addControl(btn);
      });

      // Spacer
      const spacer = new BABYLON.GUI.TextBlock('vrSpacer', '');
      spacer.height = '16px';
      leftPanel.addControl(spacer);

      // Exit VR button with prominent styling
      const exitBtn = BABYLON.GUI.Button.CreateSimpleButton('vrExitBtn', 'Exit VR');
      exitBtn.width = '240px';
      exitBtn.height = '55px';
      exitBtn.color = 'white';
      exitBtn.background = '#dc2626';
      exitBtn.fontSize = 14;
      exitBtn.cornerRadius = 8;
      exitBtn.thickness = 2;
      exitBtn.borderColor = '#991b1b';
      exitBtn.fontWeight = 'bold';
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
        <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
          {/* Top Control Bar */}
          <div className="absolute top-0 left-0 right-0 pointer-events-auto bg-gradient-to-b from-black/80 via-black/40 to-transparent p-6 z-10">
            <div className="flex justify-between items-center max-w-7xl mx-auto">
              <h1 className="text-2xl font-bold text-white">Architectural Visualization</h1>
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${webXRSupported ? 'bg-green-500/20 text-green-300' : 'bg-gray-500/20 text-gray-300'}`}>
                {webXRSupported ? '✓ VR Ready' : 'Desktop Mode'}
              </span>
            </div>
          </div>

          {/* Center VR Button */}
          {webXRSupported && (
            <button
              onClick={handleEnterVR}
              onFocus={(e) => e.currentTarget.classList.add('ring-4', 'ring-purple-400')}
              onBlur={(e) => e.currentTarget.classList.remove('ring-4', 'ring-purple-400')}
              className="pointer-events-auto group relative px-8 py-4 bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-xl font-semibold text-lg transition-all duration-300 hover:from-purple-500 hover:to-purple-600 active:scale-95 shadow-lg hover:shadow-xl hover:shadow-purple-500/50 focus:outline-none"
              aria-label="Enter VR mode for Meta Quest 3"
            >
              <span className="flex items-center gap-3">
                <svg className="w-6 h-6 group-hover:scale-110 transition-transform" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
                </svg>
                Enter VR (Meta Quest 3)
              </span>
              <div className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 bg-white/10 transition-opacity duration-300" />
            </button>
          )}

          {/* Bottom Control Panel */}
          <div className="absolute bottom-0 left-0 right-0 pointer-events-auto bg-gradient-to-t from-black via-black/80 to-transparent p-8 z-10">
            <div className="flex flex-col gap-6 items-center max-w-4xl mx-auto">
              {/* Room Name Display */}
              <div className="text-center">
                <p className="text-sm text-gray-400 uppercase tracking-widest">Currently viewing</p>
                <h2 className="text-2xl font-semibold text-white mt-2">
                  {ROOMS.find((r) => r.id === currentRoomId)?.name}
                </h2>
              </div>

              {/* Room Selection Buttons */}
              <div className="flex gap-3 justify-center flex-wrap">
                {ROOMS.map((room) => (
                  <button
                    key={room.id}
                    onClick={() => setCurrentRoomId(room.id)}
                    onFocus={(e) => e.currentTarget.classList.add('ring-2', 'ring-blue-400')}
                    onBlur={(e) => e.currentTarget.classList.remove('ring-2', 'ring-blue-400')}
                    className={`px-6 py-2.5 rounded-lg font-medium transition-all duration-200 focus:outline-none ${
                      currentRoomId === room.id
                        ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/50'
                        : 'bg-slate-700/60 text-gray-100 hover:bg-slate-600 backdrop-blur-sm'
                    }`}
                    aria-current={currentRoomId === room.id ? 'page' : undefined}
                  >
                    {room.name}
                  </button>
                ))}
              </div>

              {/* Helper Text */}
              <p className="text-gray-400 text-sm text-center max-w-md">
                Use your mouse or touch to explore the space. Drag to look around 360°.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
