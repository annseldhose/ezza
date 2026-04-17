'use client';

import { useState } from 'react';
import Image from 'next/image';

interface RoomSelectorProps {
  onSelectRoom: (roomId: string) => void;
}

const ROOMS = [
  {
    id: 'modern-living-room',
    name: 'Modern Living Room',
    image: '/rooms/modern-living-room-360.jpg',
    description: 'Experience a contemporary living space with natural light and minimalist design',
  },
  {
    id: 'luxury-bedroom',
    name: 'Luxury Bedroom',
    image: '/rooms/luxury-bedroom-360.jpg',
    description: 'Explore an elegantly designed bedroom with premium finishes',
  },
  {
    id: 'modern-kitchen',
    name: 'Modern Kitchen',
    image: '/rooms/modern-kitchen-360.jpg',
    description: 'Discover a state-of-the-art kitchen with luxury appliances',
  },
];

export default function RoomSelector({ onSelectRoom }: RoomSelectorProps) {
  const [selectedRoom, setSelectedRoom] = useState<string | null>(null);

  const handleEnterVR = (roomId: string) => {
    setSelectedRoom(roomId);
    onSelectRoom(roomId);
  };

  return (
    <div className="w-full min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 flex flex-col items-center justify-center p-4 md:p-8">
      <div className="w-full max-w-6xl">
        {/* Header */}
        <div className="text-center mb-12 md:mb-16">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            360° Architectural Visualization
          </h1>
          <p className="text-lg text-slate-300">
            Explore beautiful spaces in immersive 360° panoramic views
          </p>
          <p className="text-sm text-slate-400 mt-3">
            Works on desktop, mobile, and Meta Quest 3
          </p>
        </div>

        {/* Room Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
          {ROOMS.map((room) => (
            <div
              key={room.id}
              className="group cursor-pointer"
              onClick={() => handleEnterVR(room.id)}
            >
              <div className="relative overflow-hidden rounded-xl bg-slate-700 aspect-square mb-4 shadow-lg hover:shadow-xl transition-shadow">
                <Image
                  src={room.image}
                  alt={room.name}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-300"
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  loading="eager"
                  priority
                />
                
                {/* Overlay with button */}
                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 transition-all flex items-center justify-center">
                  <button
                    className="opacity-0 group-hover:opacity-100 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-all transform scale-90 group-hover:scale-100"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleEnterVR(room.id);
                    }}
                  >
                    Enter VR
                  </button>
                </div>
              </div>

              {/* Room Info */}
              <div className="px-2">
                <h3 className="text-xl font-semibold text-white group-hover:text-blue-400 transition-colors">
                  {room.name}
                </h3>
                <p className="text-sm text-slate-400 mt-2">{room.description}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Footer Info */}
        <div className="mt-12 md:mt-16 text-center text-slate-400 text-sm">
          <p>Choose a room to explore in 360° immersive view</p>
          <p className="mt-2">Supports WebXR for Meta Quest 3 and browser-based viewing</p>
        </div>
      </div>
    </div>
  );
}
