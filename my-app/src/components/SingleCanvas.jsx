// import React, { useRef, useState, useEffect } from 'react';
// import { Stage, Layer, Image as KonvaImage, Transformer } from 'react-konva';
// import useImage from 'use-image';
// import demoImage from '../assets/demo.jpeg';

// const URLImage = ({ src, showTransformer }) => {
//   const [image] = useImage(src);
//   const shapeRef = useRef();
//   const trRef = useRef();

//   const [props, setProps] = useState({
//     x: 150,
//     y: 150,
//     width: 200,
//     height: 200,
//     rotation: 0,
//   });

//   useEffect(() => {
//     if (showTransformer && trRef.current && shapeRef.current) {
//       trRef.current.nodes([shapeRef.current]);
//       trRef.current.getLayer().batchDraw();
//     } else if (trRef.current) {
//       trRef.current.nodes([]); // Remove transformer when toggled off
//     }
//   }, [showTransformer]);

//   return (
//     <>
//       <KonvaImage
//         image={image}
//         ref={shapeRef}
//         {...props}
//         draggable
//         onTransformEnd={() => {
//           const node = shapeRef.current;
//           const scaleX = node.scaleX();
//           const scaleY = node.scaleY();

//           node.scaleX(1);
//           node.scaleY(1);

//           setProps({
//             ...props,
//             x: node.x(),
//             y: node.y(),
//             width: node.width() * scaleX,
//             height: node.height() * scaleY,
//             rotation: node.rotation(),
//           });
//         }}
//         onDragEnd={(e) => {
//           setProps({
//             ...props,
//             x: e.target.x(),
//             y: e.target.y(),
//           });
//         }}
//       />
//       <Transformer
//         ref={trRef}
//         borderEnabled={true}
//         anchorSize={6}
//       />
//     </>
//   );
// };

// const Canvas = () => {
//   const [showTransformer, setShowTransformer] = useState(true);

//   return (
//     <div className="imageSet">
//       <button onClick={() => setShowTransformer(!showTransformer)}>
//         {showTransformer ? 'Hide Resize' : 'Show Resize'}
//       </button>

//       <Stage width={window.innerWidth} height={600}>
//         <Layer>
//           <URLImage src={demoImage} showTransformer={showTransformer} />
//         </Layer>
//       </Stage>
//     </div>
//   );
// };

// export default Canvas;
