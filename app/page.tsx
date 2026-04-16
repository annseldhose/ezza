'use client';

import { useEffect, useState } from 'react';
import PanoramaViewer from '@/components/PanoramaViewer';
import RoomPanel from '@/components/RoomPanel';
import type { Room } from '@/lib/rooms';

export default function Home() {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [activeRoom, setActiveRoom] = useState<string>('living-room');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRooms = async () => {
      try {
        const res = await fetch('/api/rooms');
        const data = await res.json();
        setRooms(data.rooms);
        setLoading(false);
      } catch (error) {
        console.error('Failed to fetch rooms:', error);
        setLoading(false);
      }
    };

    fetchRooms();
  }, []);

  const currentRoom = rooms.find((room) => room.id === activeRoom) || rooms[0];

  if (loading) {
    return (
      <div className="w-full h-screen flex items-center justify-center bg-gray-900">
        <div className="text-white text-xl">Loading rooms...</div>
      </div>
    );
  }

  return (
    <main className="w-full h-screen relative bg-gray-900">
      {currentRoom && (
        <PanoramaViewer imageUrl={currentRoom.imageUrl} roomName={currentRoom.name} />
      )}
      <RoomPanel
        rooms={rooms}
        activeRoom={activeRoom}
        onRoomChange={setActiveRoom}
      />
    </main>
  );
}
