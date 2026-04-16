'use client';

interface PanoramaViewerProps {
  imageUrl: string;
  roomName: string;
}

export default function PanoramaViewer({
  imageUrl,
  roomName,
}: PanoramaViewerProps) {
  return (
    <div className="w-full h-full">
      <a-scene embedded>
        <a-sky src={imageUrl} rotation="0 -90 0"></a-sky>
        <a-entity camera look-controls></a-entity>
      </a-scene>
      <div className="absolute top-4 left-4 bg-black bg-opacity-50 text-white px-4 py-2 rounded">
        <p className="text-lg font-semibold">{roomName}</p>
      </div>
    </div>
  );
}
