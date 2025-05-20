// Jest setup bestand voor browser-specifieke mocks

// Mock voor HTMLCanvasElement en het Canvas 2D context
if (typeof window !== 'undefined') {
  // Mock voor Canvas en zijn 2D context
  window.HTMLCanvasElement.prototype.getContext = function() {
    return {
      fillRect: function() {},
      clearRect: function() {},
      getImageData: function(x, y, w, h) {
        return {
          data: new Array(w * h * 4)
        };
      },
      putImageData: function() {},
      createImageData: function() { return []; },
      setTransform: function() {},
      drawImage: function() {},
      save: function() {},
      fillText: function() {},
      restore: function() {},
      beginPath: function() {},
      moveTo: function() {},
      lineTo: function() {},
      closePath: function() {},
      stroke: function() {},
      translate: function() {},
      scale: function() {},
      rotate: function() {},
      arc: function() {},
      fill: function() {},
      measureText: function() {
        return { width: 0 };
      },
      transform: function() {},
      rect: function() {},
      clip: function() {},
    };
  };

  // Mock voor canvas ToDataURL methode
  window.HTMLCanvasElement.prototype.toDataURL = function() {
    return 'data:image/png;base64,mock';
  };
  
  // Mock voor mediaDevices
  Object.defineProperty(window.navigator, 'mediaDevices', {
    value: {
      getUserMedia: jest.fn().mockImplementation(() => {
        return Promise.resolve({
          getTracks: () => {
            return [{
              stop: () => {}
            }];
          }
        });
      })
    },
    configurable: true
  });
}

// Mock voor Web Worker
global.Worker = class {
  constructor(stringUrl) {
    this.url = stringUrl;
    this.onmessage = () => {};
  }

  postMessage(msg) {
    this.onmessage({ data: msg });
  }
};

// Mock voor requestAnimationFrame
global.requestAnimationFrame = function(callback) {
  return setTimeout(callback, 0);
};

// Mock voor cancelAnimationFrame
global.cancelAnimationFrame = function(id) {
  clearTimeout(id);
};

// Opruimen van console-errors voor MediaPipe
const originalError = console.error;
console.error = (...args) => {
  if (
    typeof args[0] === 'string' && 
    (args[0].includes('@mediapipe') || args[0].includes('Error initializing pose detector'))
  ) {
    return;
  }
  originalError(...args);
};