import React from "react";
import { CameraIcon, RefreshCwIcon, XIcon } from "./Icons";

const Loader = () => (
  <div className="flex flex-col items-center justify-center space-y-4">
    <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
    <p className="text-lg text-slate-300">Analyzing your meal...</p>
  </div>
);

const AddMealModal = ({ isOpen, onClose, onAddMeal }) => {
  const [capturedImage, setCapturedImage] = React.useState(null);
  const [stream, setStream] = React.useState(null);
  const [isLoading, setIsLoading] = React.useState(false);
  const [apiResult, setApiResult] = React.useState(null);
  const [editedMeal, setEditedMeal] = React.useState({ name: "", calories: 0 });
  const [error, setError] = React.useState(null);
  const videoRef = React.useRef(null);
  const canvasRef = React.useRef(null);

  const stopCamera = React.useCallback(() => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
      setStream(null);
    }
  }, [stream]);

  const resetState = React.useCallback(() => {
    stopCamera();
    setCapturedImage(null);
    setIsLoading(false);
    setApiResult(null);
    setError(null);
    setEditedMeal({ name: "", calories: 0 });
  }, [stopCamera]);

  React.useEffect(() => {
    if (isOpen) {
      const startCamera = async () => {
        if (stream) return;
        try {
          const mediaStream = await navigator.mediaDevices.getUserMedia({
            video: { facingMode: "environment" },
          });
          setStream(mediaStream);
          if (videoRef.current) {
            videoRef.current.srcObject = mediaStream;
          }
        } catch (err) {
          console.error("Error accessing camera:", err);
          setError("Could not access camera. Please check permissions.");
        }
      };
      startCamera();
    } else {
      stopCamera();
    }
  }, [isOpen, stream, stopCamera]);

  if (!isOpen) return null;

  const handleClose = () => {
    resetState();
    onClose();
  };

  const handleScanMeal = () => {
    if (!videoRef.current) return;
    const video = videoRef.current;
    const canvas = canvasRef.current;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    canvas
      .getContext("2d")
      .drawImage(video, 0, 0, video.videoWidth, video.videoHeight);
    const dataUrl = canvas.toDataURL("image/jpeg");
    setCapturedImage(dataUrl);
    const base64Data = dataUrl.split(",")[1];
    stopCamera();
    getCalorieData(base64Data);
  };

  const handleRetake = () => {
    setCapturedImage(null);
    setApiResult(null);
    setError(null);
  };

  // src/components/AddMealModal.jsx

  const getCalorieData = async (base64ImageData) => {
    if (!base64ImageData) {
      setError("No image data to analyze.");
      return;
    }
    setIsLoading(true);
    setError(null);
    const apiKey = import.meta.env.VITE_GEMINI_API_KEY; // Or your hardcoded key for testing
    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-05-20:generateContent?key=${apiKey}`;
    const userPrompt = `Analyze the food in this image. Identify the primary food item. Return a JSON object with the item's name (as "mealName") and its estimated total calories (as "totalCalories"). Meal name should be a short, descriptive title. For example: "Bowl of Oatmeal with Berries".`;
    const payload = {
      contents: [
        {
          parts: [
            { text: userPrompt },
            { inlineData: { mimeType: "image/jpeg", data: base64ImageData } },
          ],
        },
      ],
      generationConfig: {
        responseMimeType: "application/json",
        responseSchema: {
          type: "OBJECT",
          properties: {
            mealName: { type: "STRING" },
            totalCalories: { type: "NUMBER" },
          },
          required: ["mealName", "totalCalories"],
        },
      },
    };

    try {
      const response = await fetch(apiUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!response.ok) {
        const errorBody = await response.json();
        throw new Error(
          `API Error: ${response.status} ${response.statusText} - ${
            errorBody.error?.message || "Unknown error"
          }`
        );
      }
      const result = await response.json();
      const candidate = result.candidates?.[0];
      if (candidate && candidate.content?.parts?.[0]?.text) {
        const parsedJson = JSON.parse(candidate.content.parts[0].text);
        setApiResult(parsedJson);
        setEditedMeal({
          name: parsedJson.mealName,
          calories: parsedJson.totalCalories,
        });
      } else {
        throw new Error(
          "Unexpected API response format. Could not find valid content."
        );
      }
    } catch (err) {
      console.error(err);
      setError("Sorry, I couldn't analyze the meal. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };
  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50 transition-opacity">
      <div className="bg-slate-800 text-slate-200 rounded-2xl shadow-2xl p-8 w-full max-w-lg max-h-[90vh] overflow-y-auto relative transform transition-all duration-300 ease-out scale-95 opacity-0 animate-fade-in-scale">
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:bg-slate-700 rounded-full transition-colors z-20"
        >
          <XIcon />
        </button>
        <div className="space-y-6">
          <h2 className="text-3xl font-bold text-center text-slate-100">
            Scan a Meal
          </h2>
          <div className="bg-slate-900 rounded-xl overflow-hidden aspect-video flex items-center justify-center relative">
            {!capturedImage ? (
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover"
              />
            ) : (
              <img
                src={capturedImage}
                alt="Captured meal"
                className="w-full h-full object-cover"
              />
            )}
            <canvas ref={canvasRef} className="hidden"></canvas>
          </div>
          {!apiResult && !isLoading && !capturedImage && (
            <button
              onClick={handleScanMeal}
              disabled={!stream}
              className="w-full bg-blue-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-blue-500 transition-transform transform hover:scale-105 disabled:bg-slate-600 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              <CameraIcon />
              Scan Meal
            </button>
          )}
          {isLoading && <Loader />}
          {error && !isLoading && (
            <div className="text-center">
              <p className="text-red-400 font-semibold mb-4">{error}</p>
              <button
                onClick={handleRetake}
                className="bg-sky-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-sky-500 transition-colors flex items-center justify-center gap-2 mx-auto"
              >
                <RefreshCwIcon />
                Try Again
              </button>
            </div>
          )}
          {apiResult && !isLoading && (
            <div className="p-6 bg-slate-700 rounded-xl text-center animate-fade-in-up space-y-4">
              <input
                type="text"
                value={editedMeal.name}
                onChange={(e) =>
                  setEditedMeal({ ...editedMeal, name: e.target.value })
                }
                className="w-full p-2 bg-slate-600 border border-slate-500 rounded-lg text-xl font-semibold text-slate-100 capitalize text-center"
              />
              <div className="flex items-center justify-center">
                <input
                  type="number"
                  value={editedMeal.calories}
                  onChange={(e) =>
                    setEditedMeal({
                      ...editedMeal,
                      calories: parseInt(e.target.value, 10) || 0,
                    })
                  }
                  className="w-32 p-2 bg-slate-600 border border-slate-500 rounded-lg text-4xl font-bold text-blue-400 text-center"
                />
                <span className="text-2xl text-slate-400 ml-2">kcal</span>
              </div>
              <div className="flex gap-4">
                <button
                  onClick={handleRetake}
                  className="w-full bg-slate-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-slate-500 transition-colors flex items-center justify-center gap-2"
                >
                  <RefreshCwIcon />
                  Retake
                </button>
                <button
                  onClick={handleAddMeal}
                  className="w-full bg-blue-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-blue-500 transition-transform transform hover:scale-105"
                >
                  Add to Diary
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AddMealModal;
