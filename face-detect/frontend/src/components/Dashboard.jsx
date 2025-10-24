// // src/pages/Dashboard.js
// import { useNavigate, Link } from 'react-router-dom';
// import React, { useState, useRef, useCallback } from 'react';
// import Webcam from 'react-webcam';

// const Dashboard = () => {
//   const navigate = useNavigate();
//   const webcamRef = useRef(null);
//   const [faceCount, setFaceCount] = useState(null);
//   const [loading, setLoading] = useState(false);
//   const [uploadedImage, setUploadedImage] = useState(null);
//   const [imagePreview, setImagePreview] = useState(null);

//   const videoConstraints = {
//     width: 640,
//     height: 480,
//     facingMode: "user",
//   };

//   const detectFaces = async (base64Image) => {
//     setLoading(true);
//     try {
//       const response = await fetch('http://localhost:5000/api/facedetect', {
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/json',
//           'Authorization': `Bearer ${localStorage.getItem('token')}`
//         },
//         body: JSON.stringify({ image: base64Image }),
//       });

//       const data = await response.json();
//       setFaceCount(data.faces?.length || 0);
//     } catch (err) {
//       console.error('Face detection failed', err);
//       setFaceCount(0);
//     }
//     setLoading(false);
//   };

//   // For Webcam
//   const captureFromWebcam = useCallback(() => {
//     const imageSrc = webcamRef.current.getScreenshot();
//     if (imageSrc) detectFaces(imageSrc);
//   }, []);

//   // For Uploaded Image
//   const handleImageUpload = (e) => {
//     const file = e.target.files[0];
//     if (!file) return;

//     const reader = new FileReader();
//     reader.onloadend = () => {
//       setUploadedImage(reader.result); // base64 image
//       setImagePreview(reader.result);  // for preview
//     };
//     reader.readAsDataURL(file);
//   };

//   const handleUploadedImageDetect = () => {
//     if (uploadedImage) {
//       detectFaces(uploadedImage);
//     }
//   };

//   return (
//     <div className="min-h-screen bg-gray-100">
//       {/* Navbar */}
//       <nav className="bg-zinc-700 shadow-md px-6 py-4 flex justify-between items-center">
//         <div className="text-xl font-bold text-white">
//           Face Detection Web App
//         </div>
//         <div className="space-x-4">
//           <Link to="/login">
//             <button className="px-4 py-2 text-blue-600 border border-blue-600 rounded hover:bg-blue-600 hover:text-white transition">
//               Login
//             </button>
//           </Link>
//           <Link to="/register">
//             <button className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition">
//               Register
//             </button>
//           </Link>
//         </div>
//       </nav>

//       {/* Main Content */}
//       <div className="flex flex-col items-center justify-center p-6">
//         <h1 className="text-3xl font-bold mb-6">Welcome to Face Detection Dashboard</h1>

//         <div className="grid md:grid-cols-2 gap-8 w-full max-w-4xl">
//           {/* Webcam Section */}
//           <div className="border border-gray-400 rounded shadow-lg p-4 bg-white flex flex-col items-center">
//             <h2 className="text-xl font-semibold mb-2">Webcam</h2>
//             <Webcam
//               audio={false}
//               ref={webcamRef}
//               screenshotFormat="image/jpeg"
//               videoConstraints={videoConstraints}
//               className="rounded"
//             />
//             <button
//               onClick={captureFromWebcam}
//               className="mt-4 px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
//               disabled={loading}
//             >
//               {loading ? "Detecting..." : "Detect Face (Webcam)"}
//             </button>
//           </div>

//           {/* Upload Section */}
//           <div className="border border-gray-400 rounded shadow-lg p-4 bg-white flex flex-col items-center">
//             <h2 className="text-xl font-semibold mb-2">Upload Image</h2>
//             <input
//               type="file"
//               accept="image/*"
//               onChange={handleImageUpload}
//               className="mb-4"
//             />
//             {imagePreview && (
//               <img src={imagePreview} alt="Uploaded Preview" className="w-64 h-auto rounded shadow mb-2" />
//             )}
//             <button
//               onClick={handleUploadedImageDetect}
//               className="mt-2 px-6 py-2 bg-green-600 text-white rounded hover:bg-green-700"
//               disabled={!uploadedImage || loading}
//             >
//               {loading ? "Detecting..." : "Detect Face (Upload)"}
//             </button>
//           </div>
//         </div>

//         {/* Result */}
//         {faceCount !== null && (
//           <div className="mt-6 text-xl font-semibold">
//             Faces Detected: {faceCount}
//           </div>
//         )}
//       </div>
//     </div>
//   );
// };

// export default Dashboard;





// src/pages/Dashboard.js
import * as faceapi from 'face-api.js';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Webcam from 'react-webcam';

const Dashboard = () => {
  const navigate = useNavigate();
  const webcamRef = useRef(null);
  const webcamCanvasRef = useRef(null);
  const [faceCount, setFaceCount] = useState(null);
  const [loading, setLoading] = useState(false);
  const [uploadedImage, setUploadedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const imageCanvasRef = useRef(null);

  const videoConstraints = {
    width: 640,
    height: 480,
    facingMode: "user",
  };

  // Load face-api.js models
  useEffect(() => {
    const loadModels = async () => {
      try {
        // In Vite the public folder is served from root, so use '/models'
        const MODEL_URL = '/models';

        // load required models (try local first)
        await faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL);
        console.log('FaceAPI models loaded from', MODEL_URL);
        return;
      } catch (err) {
        console.warn('Local model load failed, will try CDN fallback:', err.message || err);
      }
      try {
        // Fallback to CDN (jsdelivr serving the face-api.js weights from GitHub)
        const CDN_MODEL_URL = 'https://cdn.jsdelivr.net/gh/justadudewhohacks/face-api.js@master/weights';
        await faceapi.nets.tinyFaceDetector.loadFromUri(CDN_MODEL_URL);
        console.log('FaceAPI models loaded from CDN:', CDN_MODEL_URL);
      } catch (err2) {
        console.error('Error loading FaceAPI models from CDN as well:', err2);
      }
    };
    loadModels();
  }, []);

  // Detect faces from base64 image
  const detectFaces = async (base64Image, canvasRef) => {
    setLoading(true);
    const img = new Image();
    img.src = base64Image;

    img.onload = async () => {
      try {
        const detections = await faceapi.detectAllFaces(
          img,
          new faceapi.TinyFaceDetectorOptions()
        );

        // draw circles on provided canvas or image canvas
        const targetCanvasRef = canvasRef || imageCanvasRef;
        drawDetectionsOnCanvas(targetCanvasRef, detections, img.width, img.height);

        setFaceCount(detections.length);
      } catch (err) {
        console.error('Detection error:', err);
        setFaceCount(0);
      } finally {
        setLoading(false);
      }
    };

    img.onerror = () => {
      console.error("Image load error");
      setFaceCount(0);
      setLoading(false);
    };
  };

  // Webcam capture and detect
  const captureFromWebcam = useCallback(() => {
    const imageSrc = webcamRef.current.getScreenshot();
    if (imageSrc) detectFaces(imageSrc, webcamCanvasRef);
  }, []);

  // Handle image upload
  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      setUploadedImage(reader.result); // base64 image
      setImagePreview(reader.result);  // for preview
    };
    reader.readAsDataURL(file);
  };

  const handleUploadedImageDetect = () => {
    if (uploadedImage) {
      detectFaces(uploadedImage);
    }
  };

  // helper: draw circle markers for detections on a canvas
  const drawDetectionsOnCanvas = (canvasRef, detections, naturalWidth, naturalHeight) => {
    try {
      const canvas = canvasRef?.current;
      if (!canvas) return;

      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      // Determine displayed size and scale factors
      const displayWidth = canvas.clientWidth || canvas.width || naturalWidth;
      const displayHeight = canvas.clientHeight || canvas.height || naturalHeight;
      const scaleX = displayWidth / naturalWidth;
      const scaleY = displayHeight / naturalHeight;

      // set canvas pixel size to displayed size for crisp drawing
      canvas.width = Math.round(displayWidth);
      canvas.height = Math.round(displayHeight);

      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.lineWidth = 3;
      ctx.strokeStyle = 'rgba(0,255,0,0.9)';
      ctx.fillStyle = 'rgba(0,255,0,0.2)';

      detections.forEach(det => {
        const box = det.box || det.detection?.box || {};
        const x = (box.x || 0) * scaleX;
        const y = (box.y || 0) * scaleY;
        const width = (box.width || 0) * scaleX;
        const height = (box.height || 0) * scaleY;

        // Draw bounding box (rectangle)
        ctx.beginPath();
        ctx.lineWidth = 2;
        ctx.strokeStyle = 'rgba(0,255,0,0.9)';
        ctx.rect(x, y, width, height);
        ctx.stroke();

        // Draw semi-transparent fill (optional subtle)
        ctx.fillStyle = 'rgba(0,255,0,0.08)';
        ctx.fillRect(x, y, width, height);

        // Draw score label
        const score = (det.score ?? det.detection?.score ?? 0);
        const label = `Face ${Math.round(score * 100)}%`;
        const padding = 4;
        ctx.font = '14px Arial';
        const textWidth = ctx.measureText(label).width + padding * 2;
        const textHeight = 18;

        // background for text
        ctx.fillStyle = 'rgba(0,0,0,0.6)';
        ctx.fillRect(x, Math.max(y - textHeight, 0), textWidth, textHeight);

        // text
        ctx.fillStyle = '#fff';
        ctx.fillText(label, x + padding, Math.max(y - 4, textHeight - 4));
      });
    } catch (err) {
      console.error('Canvas draw error:', err);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Navbar */}
      <nav className="bg-green-700 shadow-md px-6 py-4 flex justify-between items-center">
        <div className="text-xl font-bold text-white">
          Face Detection Web App
        </div>
        <div className="space-x-4">
          <Link to="/login">
            <button className="px-4 py-2 text-blue-600 border border-blue-600 rounded hover:bg-blue-600 hover:text-white transition">
              Login
            </button>
          </Link>
          <Link to="/register">
            <button className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition">
              Register
            </button>
          </Link>
        </div>
      </nav>

      {/* Main Content */}
      <div className="flex flex-col items-center justify-center p-6">
        <h1 className="text-3xl font-bold mb-6">Welcome to Face Detection Dashboard</h1>

        <div className="grid md:grid-cols-2 gap-8 w-full max-w-4xl">
          {/* Webcam Section */}
          <div className="border border-gray-400 rounded shadow-lg p-4 bg-white flex flex-col items-center">
            <h2 className="text-xl font-semibold mb-2">Webcam</h2>
            <div className="relative">
              <Webcam
                audio={false}
                ref={webcamRef}
                screenshotFormat="image/jpeg"
                videoConstraints={videoConstraints}
                className="rounded"
              />
              <canvas ref={webcamCanvasRef} className="absolute top-0 left-0 pointer-events-none" style={{width:'100%', height:'100%'}} />
            </div>
            <button
              onClick={captureFromWebcam}
              className="mt-4 px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              disabled={loading}
            >
              {loading ? "Detecting..." : "Detect Face (Webcam)"}
            </button>
          </div>

          {/* Upload Section */}
          <div className="border border-gray-400 rounded shadow-lg p-4 bg-white flex flex-col items-center">
            <h2 className="text-xl font-semibold mb-2">Upload Image</h2>
            <input
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className="mb-4"
            />
            {imagePreview && (
              <div className="relative">
                <img src={imagePreview} alt="Uploaded Preview" className="w-64 h-auto rounded shadow mb-2" />
                <canvas ref={imageCanvasRef} className="absolute top-0 left-0 pointer-events-none" style={{width:'100%', height:'100%'}} />
              </div>
            )}
            <button
              onClick={handleUploadedImageDetect}
              className="mt-2 px-6 py-2 bg-green-600 text-white rounded hover:bg-green-700"
              disabled={!uploadedImage || loading}
            >
              {loading ? "Detecting..." : "Detect Face (Upload)"}
            </button>
          </div>
        </div>

        {/* Result */}
        {faceCount !== null && (
          <div className="mt-6 text-xl font-semibold">
            Faces Detected: {faceCount}
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
