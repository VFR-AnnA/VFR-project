# Hunyuan 3D API Integration Guide

This document provides details on integrating with the Hunyuan 3D API for text-to-3D model generation.

## API Key Configuration

The Hunyuan API requires the following environment variables:

```
HY3D_KEY=hunyuan_xxxxxxxxxx  # Your Hunyuan API key
HY3D_REGION=cn-shenzhen      # Default region, do not change
```

## API Endpoints

The Hunyuan API has the following endpoints:

- Text-to-3D generation: `https://hunyuan.tencentcloudapi.com/v2/text-to-3d`
- Status check: `https://hunyuan.tencentcloudapi.com/v2/status/{taskId}`

## Request Headers

All requests to the Hunyuan API require these headers:

```
X-Api-Key: {Your HY3D_KEY}
X-Api-Region: {HY3D_REGION}
X-TC-Version: 2023-11-27  # Required API version
Content-Type: application/json
```

## Request Format

### Generation Request

```json
{
  "prompt": "A detailed description of the 3D model",
  "mode": "avatar",          // "avatar", "object", etc.
  "quality": "standard",     // "draft", "standard", "high"
  "embed": true              // Whether to include embed data
}
```

### Response Format

The API returns a JSON response with a `Response` object:

```json
{
  "Response": {
    "RequestId": "abc123xyz",
    "TaskId": "task_123456789"
    // Additional fields may be present
  }
}
```

For error responses:

```json
{
  "Response": {
    "Error": {
      "Code": "ErrorCode",
      "Message": "Error message details"
    },
    "RequestId": "request_id_string"
  }
}
```

## Common Errors

| Error Code | Description | Solution |
|------------|-------------|----------|
| InvalidParameter | "Url key and value should be splited by `=`" | Check request format |
| MissingParameter | Missing Version parameter | Add X-TC-Version header |
| AuthFailure | Authentication failed | Check API key is valid |

## Troubleshooting

1. Always include the `X-TC-Version` header set to `2023-11-27`
2. Make sure your API key is properly formatted (should start with `hunyuan_`)
3. When parsing responses, check for the `Response.RequestId` field to use as task ID
4. The API may nest results inside a `Response` object

## Integration Notes

- Hunyuan uses different field names than Meshy for similar concepts
- Task IDs are found in the `RequestId` field for Hunyuan
- Model URLs are returned in the `asset_url_glb` field
- Always use exponential backoff when polling for job status

## Additional Resources

- [Hunyuan 3D Documentation](https://github.com/Tencent/Hunyuan3D-2)
- Integration examples in `/scripts/test-hunyuan-api.js`