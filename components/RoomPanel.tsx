'use client';

interface Room {
  id: string;
  name: string;
  imageUrl: string;
}

interface RoomPanelProps {
  rooms: Room[];
  activeRoom: string;
  onRoomChange: (roomId: string) => void;
}

export default function RoomPanel({
  rooms,
  activeRoom,
  onRoomChange,
}: RoomPanelProps) {
  return (
    <div className="absolute bottom-6 left-6 right-6 bg-black bg-opacity-70 rounded-lg p-4 max-h-32 overflow-y-auto z-10">
      <h3 className="text-white text-sm font-semibold mb-3">Rooms</h3>
      <div className="flex gap-3 flex-wrap">
        {rooms.map((room) => (
          <button
            key={room.id}
            onClick={() => onRoomChange(room.id)}
            className={`px-4 py-2 rounded-lg font-medium transition-all ${
              activeRoom === room.id
                ? 'bg-blue-600 text-white'
                : 'bg-gray-600 text-gray-100 hover:bg-gray-500'
            }`}
          >
            {room.name}
          </button>
        ))}
      </div>
    </div>
  );
}
