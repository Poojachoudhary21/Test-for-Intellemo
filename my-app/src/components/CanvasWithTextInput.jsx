import React, { useRef, useState, useEffect } from 'react';
import { Stage, Layer, Text, Transformer } from 'react-konva';

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
          const scaleX = node.scaleX();
          const scaleY = node.scaleY();
          node.scaleX(1);
          node.scaleY(1);
          const newProps = {
            ...textProps,
            x: node.x(),
            y: node.y(),
            width: node.width() * scaleX,
            fontSize: node.fontSize() * scaleY,
          };
          setTextProps(newProps);
          onTransformSave(newProps);
        }}
        onDragEnd={(e) => {
          const newProps = {
            ...textProps,
            x: e.target.x(),
            y: e.target.y(),
          };
          setTextProps(newProps);
          onTransformSave(newProps);
        }}
      />
      <Transformer ref={trRef} rotateEnabled={false} />
    </>
  );
};

const CanvasWithTextInput = () => {
  const [inputText, setInputText] = useState('');
  const [canvasText, setCanvasText] = useState('');
  const [showTransformer, setShowTransformer] = useState(true);
  const [textProps, setTextProps] = useState({
    x: 100,
    y: 100,
    width: 200,
    fontSize: 20,
  });

  const [history, setHistory] = useState([]);
  const [redoStack, setRedoStack] = useState([]);

  const handleAddText = () => {
    if (!inputText) return;
    saveToHistory();
    setCanvasText(inputText);
    setRedoStack([]); // Clear redo on new change
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

  const saveToHistory = () => {
    setHistory((prev) => [...prev, { textProps, canvasText }]);
  };

  const undo = () => {
    if (history.length === 0) return;
    const lastState = history[history.length - 1];
    setRedoStack((prev) => [...prev, { textProps, canvasText }]);
    setTextProps(lastState.textProps);
    setCanvasText(lastState.canvasText);
    setHistory((prev) => prev.slice(0, prev.length - 1));
  };

  const redo = () => {
    if (redoStack.length === 0) return;
    const nextState = redoStack[redoStack.length - 1];
    setHistory((prev) => [...prev, { textProps, canvasText }]);
    setTextProps(nextState.textProps);
    setCanvasText(nextState.canvasText);
    setRedoStack((prev) => prev.slice(0, prev.length - 1));
  };

  return (
    <div>
      <input
        type="text"
        placeholder="Enter your text"
        value={inputText}
        onChange={(e) => setInputText(e.target.value)}
        style={{height:'30px' , backgroundColor:'white', color:'grey', borderRadius:'5px', padding:'5px'}}
      />
      <button onClick={handleAddText} style={{ margin:'0 10px'}}>Add Text</button>
      <button onClick={() => setShowTransformer(!showTransformer)} style={{ margin:'0 10px'}}>
        {showTransformer ? 'Hide Resize' : 'Show Resize'}
      </button>
      <button onClick={undo} disabled={history.length === 0} style={{ margin:'0 10px'}}>↩ Undo</button>
      <button onClick={redo} disabled={redoStack.length === 0} style={{ margin:'0 10px'}}>↪ Redo</button>

      <div style={{ marginTop: '10px' }}>
        <button onClick={() => moveText('up')} style={{marginTop:'10px', marginRight:'10px'}}>⬆ Move Up</button>
        <button onClick={() => moveText('down')} style={{marginTop:'10px', marginRight:'10px'}}>⬇ Move Down</button>
        <button onClick={() => moveText('left')} style={{marginTop:'10px', marginRight:'10px'}}>⬅ Move Left</button>
        <button onClick={() => moveText('right')} style={{marginTop:'10px', marginRight:'10px'}}>➡ Move Right</button>
      </div>

      <Stage width={window.innerWidth} height={500}>
        <Layer>
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
        </Layer>
      </Stage>
    </div>
  );
};

export default CanvasWithTextInput;
