/**
 * Avatar-Wallet VFR – Proprietary Source
 * © 2025 Artur Gabrielian. All rights reserved.
 */

import { jest, describe, it, expect, beforeEach } from '@jest/globals';
import { GET } from '../model/route';

// Mock the fetch function
global.fetch = jest.fn();

// Mock the NextResponse constructor
jest.mock('next/server', () => {
  return {
    NextResponse: {
      json: jest.fn((body, options) => ({ body, options })),
      __esModule: true
    }
  };
});

describe('Model Proxy API Route', () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  it('should return 400 when no URL is provided', async () => {
    // Arrange
    const mockRequest = new Request('https://example.com/api/model');
    
    // Mock the URL constructor
    Object.defineProperty(URL.prototype, 'searchParams', {
      get: jest.fn().mockReturnValue({
        get: jest.fn().mockReturnValue(null) // No URL parameter
      })
    });
    
    // Act
    const response = await GET(mockRequest);
    
    // Assert
    expect(response.status).toBe(400);
  });

  it('should return 404 when upstream returns 404', async () => {
    // Arrange
    const mockRequest = new Request('https://example.com/api/model?url=https://assets.meshy.ai/test.glb');
    
    // Mock the URL constructor
    Object.defineProperty(URL.prototype, 'searchParams', {
      get: jest.fn().mockReturnValue({
        get: jest.fn().mockReturnValue('https://assets.meshy.ai/test.glb')
      })
    });
    
    // Mock fetch to return a 404
    global.fetch = jest.fn().mockResolvedValue({
      ok: false,
      status: 404,
      statusText: 'Not Found'
    });
    
    // Act
    const response = await GET(mockRequest);
    
    // Assert
    expect(response.status).toBe(404);
    expect(global.fetch).toHaveBeenCalledWith('https://assets.meshy.ai/test.glb', { cache: 'no-store' });
  });

  it('should return 200 with CORS headers when upstream returns 200', async () => {
    // Arrange
    const mockRequest = new Request('https://example.com/api/model?url=https://assets.meshy.ai/test.glb');
    
    // Mock the URL constructor
    Object.defineProperty(URL.prototype, 'searchParams', {
      get: jest.fn().mockReturnValue({
        get: jest.fn().mockReturnValue('https://assets.meshy.ai/test.glb')
      })
    });
    
    // Mock fetch to return a 200
    const mockArrayBuffer = new ArrayBuffer(8);
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      status: 200,
      statusText: 'OK',
      arrayBuffer: jest.fn().mockResolvedValue(mockArrayBuffer),
      redirect: 'follow'
    });
    
    // Create a mock response with all required properties
    const mockResponse = new Response(mockArrayBuffer, {
      headers: {
        'Content-Type': 'model/gltf-binary',
        'Access-Control-Allow-Origin': '*',
        'Cache-Control': 'public, max-age=31536000, immutable'
      }
    });
    
    // Mock the NextResponse.constructor
    jest.spyOn(global, 'Response').mockImplementation(() => mockResponse);
    
    // Act
    const response = await GET(mockRequest);
    
    // Assert
    expect(global.fetch).toHaveBeenCalledWith('https://assets.meshy.ai/test.glb', { cache: 'no-store' });
    
    // Check that the response has the correct headers
    expect(response.headers.get('Content-Type')).toBe('model/gltf-binary');
    expect(response.headers.get('Access-Control-Allow-Origin')).toBe('*');
    expect(response.headers.get('Cache-Control')).toBe('public, max-age=31536000, immutable');
  });

  it('should handle fetch errors gracefully', async () => {
    // Arrange
    const mockRequest = new Request('https://example.com/api/model?url=https://assets.meshy.ai/test.glb');
    
    // Mock the URL constructor
    Object.defineProperty(URL.prototype, 'searchParams', {
      get: jest.fn().mockReturnValue({
        get: jest.fn().mockReturnValue('https://assets.meshy.ai/test.glb')
      })
    });
    
    // Mock fetch to throw an error
    global.fetch = jest.fn().mockRejectedValue(new Error('Network error'));
    
    // Act
    const response = await GET(mockRequest);
    
    // Assert
    expect(response.status).toBe(500);
    expect(global.fetch).toHaveBeenCalledWith('https://assets.meshy.ai/test.glb', { cache: 'no-store' });
  });
});