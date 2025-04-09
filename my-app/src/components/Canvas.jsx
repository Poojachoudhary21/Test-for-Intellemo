import React, { useRef, useState, useEffect } from 'react';
import { Stage, Layer, Image as KonvaImage, Text, Transformer } from 'react-konva';
import useImage from 'use-image';
import demoImage from '../assets/demo.jpeg';

// Image Component
const URLImage = ({ src, showTransformer, onTransformSave }) => {
  const [image] = useImage(src);
  const shapeRef = useRef();
  const trRef = useRef();
  const [props, setProps] = useState({
    x: 150,
    y: 150,
    width: 200,
    height: 200,
    rotation: 0,
  });

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
        {...props}
        draggable
        onTransformEnd={() => {
          const node = shapeRef.current;
          const scaleX = node.scaleX();
          const scaleY = node.scaleY();
          node.scaleX(1);
          node.scaleY(1);
          const updatedProps = {
            ...props,
            x: node.x(),
            y: node.y(),
            width: node.width() * scaleX,
            height: node.height() * scaleY,
            rotation: node.rotation(),
          };
          setProps(updatedProps);
          onTransformSave();
        }}
        onDragEnd={(e) => {
          const updatedProps = { ...props, x: e.target.x(), y: e.target.y() };
          setProps(updatedProps);
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

// Combined Canvas Component
const Canvas = () => {
  const videoRef = useRef(null);
  const konvaVideoRef = useRef(null);
  const layerRef = useRef(null);

  const [isPlaying, setIsPlaying] = useState(false);
  const [inputText, setInputText] = useState('');
  const [canvasText, setCanvasText] = useState('');
  const [textProps, setTextProps] = useState({ x: 100, y: 100, width: 200, fontSize: 20 });
  const [showTransformer, setShowTransformer] = useState(true);

  const [history, setHistory] = useState([]);
  const [redoStack, setRedoStack] = useState([]);

  // Video frame refresh
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

    return () => {
      videoRef.current?.pause();
    };
  }, [isPlaying]);

  const saveToHistory = () => {
    setHistory((prev) => [...prev, { textProps, canvasText }]);
  };

  const undo = () => {
    if (history.length === 0) return;
    const last = history[history.length - 1];
    setRedoStack((prev) => [...prev, { textProps, canvasText }]);
    setTextProps(last.textProps);
    setCanvasText(last.canvasText);
    setHistory((prev) => prev.slice(0, -1));
  };

  const redo = () => {
    if (redoStack.length === 0) return;
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
        case 'up':
          return { ...prev, y: prev.y - offset };
        case 'down':
          return { ...prev, y: prev.y + offset };
        case 'left':
          return { ...prev, x: prev.x - offset };
        case 'right':
          return { ...prev, x: prev.x + offset };
        default:
          return prev;
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

  return (
    <div style={{ padding: '10px' }}>
      <input
        type="text"
        placeholder="Enter your text"
        value={inputText}
        onChange={(e) => setInputText(e.target.value)}
        style={{ padding: '5px', borderRadius: '5px' }}
      />
      <button onClick={handleAddText} style={{margin:'0 10px'}}>Add Text</button>
      <button onClick={() => setShowTransformer((prev) => !prev)} style={{ margin: '0 10px' }}>
        {showTransformer ? 'Hide Resize' : 'Show Resize'}
      </button>
      <div style={{ marginTop: '10px', display: 'flex', gap: '10px' }}>
        <button onClick={() => moveText('up')} style={{marginTop:'10px', marginRight:'10px'}}>⬆ Move Up</button>
        <button onClick={() => moveText('down')} style={{marginTop:'10px', marginRight:'10px'}}>⬇ Move Down</button>
        <button onClick={() => moveText('left')} style={{marginTop:'10px', marginRight:'10px'}}>⬅ Move Left</button>
        <button onClick={() => moveText('right')} style={{marginTop:'10px', marginRight:'10px'}}>➡ Move Right</button>
      
      <button onClick={undo} disabled={history.length === 0}>↩ Undo</button>
      <button onClick={redo} disabled={redoStack.length === 0} style={{ margin: '0 10px' }}>↪ Redo</button>
      <button onClick={() => setIsPlaying(!isPlaying)}>{isPlaying ? 'Pause Video' : 'Play Video'}</button>
      <button onClick={handleStop} style={{ marginLeft: '10px' }}>Stop Video</button>
        </div>

      <Stage width={window.innerWidth} height={600}>
        <Layer ref={layerRef}>
          <URLImage src={demoImage} showTransformer={showTransformer} onTransformSave={saveToHistory} />
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
            x={100}
            y={300}
            width={480}
            height={270}
            draggable
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
