'use client';

import { useEffect, useRef, useState } from 'react';

interface PanoramaViewerProps {
  imageUrl: string;
  roomName: string;
}

export default function PanoramaViewer({
  imageUrl,
  roomName,
}: PanoramaViewerProps) {
  const sceneRef = useRef<HTMLDivElement>(null);
  const [aframeLoaded, setAframeLoaded] = useState(false);

  useEffect(() => {
    // Load A-Frame script
    if (!window.AFRAME) {
      const script = document.createElement('script');
      script.src = 'https://aframe.io/releases/1.4.2/aframe.min.js';
      script.async = true;
      script.onload = () => {
        setAframeLoaded(true);
      };
      document.head.appendChild(script);
    } else {
      setAframeLoaded(true);
    }
  }, []);

  useEffect(() => {
    if (aframeLoaded && sceneRef.current) {
      const sky = sceneRef.current.querySelector('a-sky');
      if (sky) {
        sky.setAttribute('src', imageUrl);
      }
    }
  }, [imageUrl, aframeLoaded]);

  if (!aframeLoaded) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-slate-950">
        <div className="text-white">Loading panorama viewer...</div>
      </div>
    );
  }

  return (
    <div className="w-full h-full relative" ref={sceneRef}>
      <a-scene embedded style={{ width: '100%', height: '100%' }}>
        <a-sky src={imageUrl} rotation="0 -90 0"></a-sky>
        <a-entity camera look-controls></a-entity>
      </a-scene>
      <div className="absolute top-4 left-4 bg-black bg-opacity-50 text-white px-4 py-2 rounded-lg z-10 pointer-events-none">
        <p className="text-lg font-semibold">{roomName}</p>
      </div>
    </div>
  );
}
