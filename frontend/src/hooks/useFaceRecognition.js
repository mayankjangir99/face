import { useEffect, useRef, useState } from 'react';
import * as faceapi from 'face-api.js';

const detectorOptions = new faceapi.TinyFaceDetectorOptions({
  inputSize: 320,
  scoreThreshold: 0.5
});

const parseLabel = (label) => {
  const [studentId, ...nameParts] = label.split('|');

  return {
    studentId,
    name: nameParts.join('|') || label
  };
};

const distanceToConfidence = (distance) => Math.max(0, Number(((1 - distance) * 100).toFixed(2)));

const captureSnapshot = (video) => {
  const canvas = document.createElement('canvas');

  canvas.width = video.videoWidth;
  canvas.height = video.videoHeight;

  const context = canvas.getContext('2d');
  context.drawImage(video, 0, 0, canvas.width, canvas.height);

  return canvas.toDataURL('image/jpeg', 0.85);
};

const drawOverlay = (context, box, label, confidence, known) => {
  const color = known ? '#34d399' : '#fb923c';
  const caption = known ? `${label} ${confidence.toFixed(1)}%` : 'Unknown face';
  const captionWidth = Math.max(160, caption.length * 8.2);
  const labelY = Math.max(8, box.y - 34);

  context.strokeStyle = color;
  context.lineWidth = 3;
  context.strokeRect(box.x, box.y, box.width, box.height);

  context.fillStyle = 'rgba(8, 17, 31, 0.9)';
  context.fillRect(box.x, labelY, captionWidth, 28);

  context.font = '15px "Plus Jakarta Sans", sans-serif';
  context.fillStyle = '#f8fafc';
  context.fillText(caption, box.x + 10, labelY + 18);
};

export const useFaceRecognition = ({ students, threshold, markedStudentIds, onRecognized, onUnknown }) => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);
  const detectionIntervalRef = useRef(null);
  const isDetectingRef = useRef(false);
  const labeledDescriptorsRef = useRef([]);
  const matcherRef = useRef(null);
  const onRecognizedRef = useRef(onRecognized);
  const onUnknownRef = useRef(onUnknown);
  const markedIdsRef = useRef(markedStudentIds);
  const knownCooldownRef = useRef(new Map());
  const unknownCooldownRef = useRef(0);
  const modelsLoadedRef = useRef(false);

  const [modelsLoaded, setModelsLoaded] = useState(false);
  const [cameraReady, setCameraReady] = useState(false);
  const [training, setTraining] = useState(false);
  const [descriptorCount, setDescriptorCount] = useState(0);
  const [liveDetections, setLiveDetections] = useState([]);
  const [statusMessage, setStatusMessage] = useState('Loading face detection models...');
  const [error, setError] = useState('');

  useEffect(() => {
    onRecognizedRef.current = onRecognized;
  }, [onRecognized]);

  useEffect(() => {
    onUnknownRef.current = onUnknown;
  }, [onUnknown]);

  useEffect(() => {
    markedIdsRef.current = markedStudentIds;
  }, [markedStudentIds]);

  useEffect(() => {
    let ignore = false;

    const loadModels = async () => {
      try {
        const modelUrl = import.meta.env.VITE_FACE_API_MODEL_URL || '/models';

        await Promise.all([
          faceapi.nets.tinyFaceDetector.loadFromUri(modelUrl),
          faceapi.nets.faceLandmark68Net.loadFromUri(modelUrl),
          faceapi.nets.faceRecognitionNet.loadFromUri(modelUrl)
        ]);

        if (!ignore) {
          modelsLoadedRef.current = true;
          setModelsLoaded(true);
          setStatusMessage('Models ready. Starting camera...');
        }
      } catch (modelError) {
        if (!ignore) {
          setError(
            'Unable to load face-api.js models. Add the required model files to frontend/public/models before running the camera.'
          );
        }
      }
    };

    loadModels();

    return () => {
      ignore = true;
    };
  }, []);

  useEffect(() => {
    let ignore = false;

    const setupCamera = async () => {
      if (!modelsLoadedRef.current || streamRef.current) {
        return;
      }

      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: 'user',
            width: { ideal: 1280 },
            height: { ideal: 720 }
          },
          audio: false
        });

        if (ignore) {
          stream.getTracks().forEach((track) => track.stop());
          return;
        }

        streamRef.current = stream;

        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          await videoRef.current.play();
          setCameraReady(true);
          setStatusMessage('Camera ready. Training labeled profiles...');
        }
      } catch (_cameraError) {
        if (!ignore) {
          setError('Camera access failed. Allow webcam permission and reload the page.');
        }
      }
    };

    setupCamera();

    return () => {
      ignore = true;
    };
  }, [modelsLoaded]);

  useEffect(() => {
    let ignore = false;

    const encodeStudents = async () => {
      if (!modelsLoadedRef.current) {
        return;
      }

      if (!students.length) {
        labeledDescriptorsRef.current = [];
        matcherRef.current = null;
        setDescriptorCount(0);
        setStatusMessage('No students available for recognition. Add labeled images first.');
        return;
      }

      setTraining(true);
      setStatusMessage('Encoding student images for face matching...');

      const labeledDescriptors = [];

      for (const student of students) {
        const descriptors = [];

        for (const imageUrl of student.imageUrls || []) {
          try {
            const image = await faceapi.fetchImage(imageUrl);
            const detection = await faceapi
              .detectSingleFace(image, detectorOptions)
              .withFaceLandmarks()
              .withFaceDescriptor();

            if (detection) {
              descriptors.push(detection.descriptor);
            }
          } catch (_imageError) {
            // Bad or missing training images are ignored so the rest of the roster can still train.
          }
        }

        if (descriptors.length > 0) {
          labeledDescriptors.push(new faceapi.LabeledFaceDescriptors(`${student._id}|${student.name}`, descriptors));
        }
      }

      if (!ignore) {
        labeledDescriptorsRef.current = labeledDescriptors;
        matcherRef.current = labeledDescriptors.length ? new faceapi.FaceMatcher(labeledDescriptors, threshold) : null;
        setDescriptorCount(labeledDescriptors.length);
        setTraining(false);
        setStatusMessage(
          labeledDescriptors.length
            ? `Recognition ready with ${labeledDescriptors.length} trained student profiles.`
            : 'No valid training faces found in uploaded student images.'
        );
      }
    };

    encodeStudents();

    return () => {
      ignore = true;
    };
  }, [students]);

  useEffect(() => {
    if (labeledDescriptorsRef.current.length > 0) {
      matcherRef.current = new faceapi.FaceMatcher(labeledDescriptorsRef.current, threshold);
    }
  }, [threshold]);

  useEffect(() => {
    const video = videoRef.current;
    const canvas = canvasRef.current;

    if (!cameraReady || !video || !canvas) {
      return undefined;
    }

    const runDetection = async () => {
      if (isDetectingRef.current || video.readyState < 2) {
        return;
      }

      isDetectingRef.current = true;

      try {
        const detections = await faceapi
          .detectAllFaces(video, detectorOptions)
          .withFaceLandmarks()
          .withFaceDescriptors();

        const displaySize = {
          width: video.videoWidth,
          height: video.videoHeight
        };

        faceapi.matchDimensions(canvas, displaySize);

        const resizedDetections = faceapi.resizeResults(detections, displaySize);
        const context = canvas.getContext('2d');

        canvas.width = displaySize.width;
        canvas.height = displaySize.height;
        context.clearRect(0, 0, canvas.width, canvas.height);

        const nextDetections = resizedDetections.map((detection) => {
          let studentId = '';
          let name = 'Unknown face';
          let known = false;
          let confidence = 0;
          let distance = 1;

          if (matcherRef.current) {
            const bestMatch = matcherRef.current.findBestMatch(detection.descriptor);
            const parsedLabel = parseLabel(bestMatch.label);

            studentId = parsedLabel.studentId;
            name = parsedLabel.name;
            known = bestMatch.label !== 'unknown' && bestMatch.distance <= threshold;
            confidence = distanceToConfidence(bestMatch.distance);
            distance = bestMatch.distance;
          }

          drawOverlay(context, detection.detection.box, name, confidence, known);

          return {
            studentId,
            name,
            known,
            confidence,
            distance
          };
        });

        setLiveDetections(nextDetections);

        const now = Date.now();

        nextDetections.forEach((match) => {
          if (match.known) {
            if (markedIdsRef.current.includes(match.studentId)) {
              return;
            }

            const lastSeen = knownCooldownRef.current.get(match.studentId) || 0;

            if (now - lastSeen > 12000) {
              knownCooldownRef.current.set(match.studentId, now);
              onRecognizedRef.current?.({
                studentId: match.studentId,
                name: match.name,
                confidence: match.confidence,
                distance: match.distance,
                facesDetected: resizedDetections.length,
                snapshotDataUrl: captureSnapshot(video)
              });
            }
          } else if (now - unknownCooldownRef.current > 20000) {
            unknownCooldownRef.current = now;
            onUnknownRef.current?.({
              time: new Date().toISOString(),
              facesDetected: resizedDetections.length
            });
          }
        });
      } catch (_detectionError) {
        setError('Face detection loop failed. Check the camera stream and model files.');
      } finally {
        isDetectingRef.current = false;
      }
    };

    detectionIntervalRef.current = window.setInterval(runDetection, 850);

    return () => {
      if (detectionIntervalRef.current) {
        window.clearInterval(detectionIntervalRef.current);
        detectionIntervalRef.current = null;
      }
    };
  }, [cameraReady, threshold]);

  useEffect(
    () => () => {
      if (detectionIntervalRef.current) {
        window.clearInterval(detectionIntervalRef.current);
      }

      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
        streamRef.current = null;
      }
    },
    []
  );

  return {
    videoRef,
    canvasRef,
    modelsLoaded,
    cameraReady,
    training,
    descriptorCount,
    liveDetections,
    statusMessage,
    error
  };
};
