module.exports = {
  ci: {
    collect: {
      // Add any custom collect options here
      startServerCommand: 'npm start',
      url: ['http://localhost:3000/try/body-ai']
    },
    upload: {
      // Add any custom upload options here
      target: 'temporary-public-storage'
    },
    assert: {
      assertions: {
        'interactive': ['error', {maxNumericValue: 2000}],
        'interactive-to-next-paint': ['error', {maxNumericValue: 200}],
        'first-contentful-paint': ['error', {maxNumericValue: 2000}],
        'largest-contentful-paint': ['error', {maxNumericValue: 2500}],
        'cumulative-layout-shift': ['error', {maxNumericValue: 0.1}],
        'total-blocking-time': ['error', {maxNumericValue: 200}]
      }
    }
  }
};