'use client';

import { useEffect, useRef, useState } from 'react';
import * as tf from '@tensorflow/tfjs';
import * as mobilenet from '@tensorflow-models/mobilenet';
import React from 'react';

interface Prediction {
  className: string;
  probability: number;
}

export default function VFRModel() {
  const [isModelLoading, setIsModelLoading] = useState(false);
  const [model, setModel] = useState<mobilenet.MobileNet | null>(null);
  const [imageURL, setImageURL] = useState<string | null>(null);
  const [predictions, setPredictions] = useState<Prediction[]>([]);
  const [error, setError] = useState<string | null>(null);
  
  const imageRef = useRef<HTMLImageElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load the model
  useEffect(() => {
    const loadModel = async () => {
      setIsModelLoading(true);
      try {
        // Load the MobileNet model
        const model = await mobilenet.load();
        setModel(model);
        setIsModelLoading(false);
      } catch (error) {
        console.error('Failed to load model:', error);
        setError('Failed to load the model. Please try again later.');
        setIsModelLoading(false);
      }
    };

    loadModel();
  }, []);

  // Handle image upload
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Reset previous predictions
    setPredictions([]);
    
    // Create a URL for the uploaded image
    const url = URL.createObjectURL(file);
    setImageURL(url);
  };

  // Identify the image
  const identifyImage = async () => {
    if (!model || !imageRef.current || !imageURL) return;

    try {
      // Use the model to classify the image
      const predictions = await model.classify(imageRef.current);
      setPredictions(predictions);
    } catch (error) {
      console.error('Error identifying image:', error);
      setError('Error identifying the image. Please try again.');
    }
  };

  // Trigger file input click
  const handleUploadClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  return (
    <div className="flex flex-col items-center w-full max-w-2xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">Visual Feature Recognition</h1>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}
      
      <div className="w-full mb-6">
        <input
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleImageUpload}
          ref={fileInputRef}
          aria-label="Upload image"
        />
        <button
          onClick={handleUploadClick}
          className="w-full bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
          disabled={isModelLoading}
        >
          {isModelLoading ? 'Loading Model...' : 'Upload Image'}
        </button>
      </div>
      
      {imageURL && (
        <div className="w-full mb-6">
          <div className="relative w-full h-64 bg-gray-100 rounded overflow-hidden mb-4">
            <img
              src={imageURL}
              alt="Uploaded"
              className="object-contain w-full h-full"
              ref={imageRef}
              onLoad={identifyImage}
            />
          </div>
          </div>
          
          <button
            onClick={identifyImage}
            className="w-full bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded"
            disabled={!imageURL || isModelLoading}
          >
            Identify Again
          </button>
        </div>
      )}
      
      {predictions.length > 0 && (
        <div className="w-full">
          <h2 className="text-xl font-semibold mb-2">Results:</h2>
          <div className="bg-gray-100 p-4 rounded">
            {predictions.map((prediction, index) => (
              <div key={index} className="mb-2">
                <div className="flex justify-between">
                  <span className="font-medium">{prediction.className}</span>
                  <span>{(prediction.probability * 100).toFixed(2)}%</span>
                </div>
                <div className="w-full bg-gray-300 rounded-full h-2.5">
                  <div
                    className="bg-blue-600 h-2.5 rounded-full"
                    style={{ width: `${prediction.probability * 100}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}