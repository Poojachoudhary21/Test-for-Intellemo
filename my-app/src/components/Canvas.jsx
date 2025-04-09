import React, { useRef, useState, useEffect } from 'react';
import { Stage, Layer, Image as KonvaImage, Text, Transformer } from 'react-konva';
import useImage from 'use-image';
import demoImage from '../assets/demo.jpeg';

// Image Component
const URLImage = ({ src, showTransformer, onTransformSave, imageProps, setImageProps }) => {
  const [image] = useImage(src);
  const shapeRef = useRef();
  const trRef = useRef();

  useEffect(() => {
    if (showTransformer && trRef.current && shapeRef.current) {
      trRef.current.nodes([shapeRef.current]);
      trRef.current.getLayer().batchDraw();
    } else if (trRef.current) {
      trRef.current.nodes([]);
    }
  }, [showTransformer]);

  return (
    <>
      <KonvaImage
        image={image}
        ref={shapeRef}
        {...imageProps}
        draggable
        onTransformEnd={() => {
          const node = shapeRef.current;
          const scaleX = node.scaleX();
          const scaleY = node.scaleY();
          node.scaleX(1);
          node.scaleY(1);
          const updatedProps = {
            ...imageProps,
            x: node.x(),
            y: node.y(),
            width: node.width() * scaleX,
            height: node.height() * scaleY,
            rotation: node.rotation(),
          };
          setImageProps(updatedProps);
          onTransformSave();
        }}
        onDragEnd={(e) => {
          const updatedProps = { ...imageProps, x: e.target.x(), y: e.target.y() };
          setImageProps(updatedProps);
          onTransformSave();
        }}
      />
      <Transformer ref={trRef} />
    </>
  );
};

// Text Component
const ResizableText = ({ text, showTransformer, textProps, setTextProps, onTransformSave }) => {
  const textRef = useRef();
  const trRef = useRef();

  useEffect(() => {
    if (showTransformer && trRef.current && textRef.current) {
      trRef.current.nodes([textRef.current]);
      trRef.current.getLayer().batchDraw();
    } else if (trRef.current) {
      trRef.current.nodes([]);
    }
  }, [showTransformer]);

  return (
    <>
      <Text
        text={text}
        {...textProps}
        ref={textRef}
        draggable
        onTransformEnd={() => {
          const node = textRef.current;
          const scaleY = node.scaleY();
          node.scaleX(1);
          node.scaleY(1);
          const newProps = {
            ...textProps,
            x: node.x(),
            y: node.y(),
            width: node.width(),
            fontSize: node.fontSize() * scaleY,
          };
          setTextProps(newProps);
          onTransformSave();
        }}
        onDragEnd={(e) => {
          const newProps = { ...textProps, x: e.target.x(), y: e.target.y() };
          setTextProps(newProps);
          onTransformSave();
        }}
      />
      <Transformer ref={trRef} rotateEnabled={false} />
    </>
  );
};

const Canvas = () => {
  const videoRef = useRef(null);
  const konvaVideoRef = useRef(null);
  const layerRef = useRef(null);

  const [isPlaying, setIsPlaying] = useState(false);
  const [inputText, setInputText] = useState('');
  const [canvasText, setCanvasText] = useState('');
  const [textProps, setTextProps] = useState({ x: 100, y: 100, width: 200, fontSize: 20 });
  const [imageProps, setImageProps] = useState({ x: 150, y: 150, width: 200, height: 200, rotation: 0 });
  const [videoProps, setVideoProps] = useState({ x: 100, y: 300, width: 480, height: 270 });
  const [showTransformer, setShowTransformer] = useState(true);

  const [history, setHistory] = useState([]);
  const [redoStack, setRedoStack] = useState([]);

  useEffect(() => {
    const anim = () => {
      if (videoRef.current && !videoRef.current.paused && konvaVideoRef.current) {
        konvaVideoRef.current.getLayer().batchDraw();
        requestAnimationFrame(anim);
      }
    };
    if (isPlaying) {
      videoRef.current.play();
      anim();
    }
    return () => videoRef.current?.pause();
  }, [isPlaying]);

  const saveToHistory = () => {
    setHistory((prev) => [...prev, { textProps, canvasText }]);
  };

  const undo = () => {
    if (!history.length) return;
    const last = history[history.length - 1];
    setRedoStack((prev) => [...prev, { textProps, canvasText }]);
    setTextProps(last.textProps);
    setCanvasText(last.canvasText);
    setHistory((prev) => prev.slice(0, -1));
  };

  const redo = () => {
    if (!redoStack.length) return;
    const next = redoStack[redoStack.length - 1];
    setHistory((prev) => [...prev, { textProps, canvasText }]);
    setTextProps(next.textProps);
    setCanvasText(next.canvasText);
    setRedoStack((prev) => prev.slice(0, -1));
  };

  const handleAddText = () => {
    if (!inputText) return;
    saveToHistory();
    setCanvasText(inputText);
    setRedoStack([]);
  };

  const moveText = (dir) => {
    const offset = 10;
    saveToHistory();
    setRedoStack([]);
    setTextProps((prev) => {
      switch (dir) {
        case 'up': return { ...prev, y: prev.y - offset };
        case 'down': return { ...prev, y: prev.y + offset };
        case 'left': return { ...prev, x: prev.x - offset };
        case 'right': return { ...prev, x: prev.x + offset };
        default: return prev;
      }
    });
  };

  const handleStop = () => {
    const video = videoRef.current;
    if (video) {
      video.pause();
      video.currentTime = 0;
      setIsPlaying(false);
      layerRef.current?.batchDraw();
    }
  };

  const handleSaveCanvas = () => {
    const canvasState = { textProps, canvasText, imageProps, videoProps };
    localStorage.setItem('canvasState', JSON.stringify(canvasState));
    alert('Canvas saved!');
  };

  const handleLoadCanvas = () => {
    const saved = localStorage.getItem('canvasState');
    if (saved) {
      const { textProps, canvasText, imageProps, videoProps } = JSON.parse(saved);
      setTextProps(textProps);
      setCanvasText(canvasText);
      setImageProps(imageProps);
      setVideoProps(videoProps);
      alert('Canvas loaded!');
    } else {
      alert('No saved canvas found.');
    }
  };

  return (
    <div style={{ padding: '10px' }}>
      <input
        type="text"
        placeholder="Enter your text"
        value={inputText}
        onChange={(e) => setInputText(e.target.value)}
        style={{ padding: '5px', borderRadius: '5px' }}
      />
      <button onClick={handleAddText} style={{ margin: '0 10px' }}>Add Text</button>
      <button onClick={() => setShowTransformer((prev) => !prev)}>
        {showTransformer ? 'Hide Resize' : 'Show Resize'}
      </button>
      <div style={{ marginTop: '10px', display: 'flex', gap: '10px' }}>
        <button onClick={() => moveText('up')}>⬆ Up</button>
        <button onClick={() => moveText('down')}>⬇ Down</button>
        <button onClick={() => moveText('left')}>⬅ Left</button>
        <button onClick={() => moveText('right')}>➡ Right</button>
        <button onClick={undo} disabled={!history.length}>↩ Undo</button>
        <button onClick={redo} disabled={!redoStack.length}>↪ Redo</button>
        <button onClick={() => setIsPlaying(!isPlaying)}>
          {isPlaying ? 'Pause Video' : 'Play Video'}
        </button>
        <button onClick={handleStop}>Stop Video</button>
        <button onClick={handleSaveCanvas}>💾 Save</button>
        <button onClick={handleLoadCanvas}>📂 Load</button>
      </div>

      <Stage width={window.innerWidth} height={600}>
        <Layer ref={layerRef}>
          <URLImage
            src={demoImage}
            showTransformer={showTransformer}
            onTransformSave={saveToHistory}
            imageProps={imageProps}
            setImageProps={setImageProps}
          />
          {canvasText && (
            <ResizableText
              text={canvasText}
              showTransformer={showTransformer}
              textProps={textProps}
              setTextProps={setTextProps}
              onTransformSave={() => {
                saveToHistory();
                setRedoStack([]);
              }}
            />
          )}
          <KonvaImage
            ref={konvaVideoRef}
            image={videoRef.current}
            {...videoProps}
            draggable
            onDragEnd={(e) =>
              setVideoProps((prev) => ({ ...prev, x: e.target.x(), y: e.target.y() }))
            }
          />
        </Layer>
      </Stage>

      <video
        ref={videoRef}
        src="https://upload.wikimedia.org/wikipedia/commons/transcoded/c/c4/Physicsworks.ogv/Physicsworks.ogv.240p.vp9.webm"
        style={{ display: 'none' }}
        crossOrigin="anonymous"
      />
    </div>
  );
};

export default Canvas;