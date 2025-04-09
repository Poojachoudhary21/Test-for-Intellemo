import React, { useRef, useState, useEffect } from 'react';
import { Stage, Layer, Image as KonvaImage } from 'react-konva';

const VideoOnCanvas = () => {
  const videoRef = useRef(null); // HTMLVideoElement
  const konvaVideoRef = useRef(null); // Konva.Image
  const layerRef = useRef(null); // For redrawing

  const [isPlaying, setIsPlaying] = useState(false);

  // Update Konva with video frames
  useEffect(() => {
    const anim = () => {
      if (videoRef.current && !videoRef.current.paused) {
        if (konvaVideoRef.current) {
          konvaVideoRef.current.getLayer().batchDraw();
        }
        requestAnimationFrame(anim);
      }
    };

    if (isPlaying) {
      videoRef.current.play();
      anim(); // Start animation loop
    }

    return () => {
      if (videoRef.current) {
        videoRef.current.pause();
      }
    };
  }, [isPlaying]);

  const handleStop = () => {
    const video = videoRef.current;
    if (video) {
      video.pause();
      video.currentTime = 0;
      setIsPlaying(false);
      if (layerRef.current) layerRef.current.batchDraw();
    }
  };

  return (
    <div>
      <button onClick={() => setIsPlaying(!isPlaying)} style={{margin:'10px'}}>
        {isPlaying ? 'Pause Video' : 'Play Video'}
      </button>
      <button onClick={handleStop}>Stop Video</button>

      <Stage width={window.innerWidth} height={500}>
        <Layer ref={layerRef}>
          <KonvaImage
            ref={konvaVideoRef}
            image={videoRef.current}
            x={100}
            y={100}
            width={480}
            height={270}
            draggable
          />
        </Layer>
      </Stage>

      {/* Hidden HTML Video */}
      <video
        ref={videoRef}
        src="https://upload.wikimedia.org/wikipedia/commons/transcoded/c/c4/Physicsworks.ogv/Physicsworks.ogv.240p.vp9.webm" // You can use local video if needed
        style={{ display: 'none' }}
        crossOrigin="anonymous"
      />
    </div>
  );
};

export default VideoOnCanvas;
