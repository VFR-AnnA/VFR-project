# AvatarWalletVFR Unity Plugin

Version: 0.1.0

## Overview

This Unity plugin allows integration with the AvatarWallet VFR (Virtual Fitting Room) service.
It provides functionality to load and display 3D avatars and clothing items.

## Features

- Load avatars from the AvatarWallet service
- Generate new avatars using AI (requires Generator API)
- Try on clothing items on avatars
- Export avatars for use in Unity games and applications

## Installation

1. Import the `AvatarWalletVFR.unitypackage` into your Unity project
2. Add the AvatarWalletVFR component to a GameObject in your scene
3. Initialize the plugin with your API key

## Usage

```csharp
// Get the instance
var vfr = AvatarWallet.VFR.AvatarWalletVFR.Instance;

// Initialize with your API key
vfr.Initialize("your-api-key-here");

// Load an avatar
var avatar = await vfr.LoadAvatarAsync("avatar-id");

// Generate an avatar (requires Generator API)
vfr.EnableGeneratorAPI();
var generatedAvatar = await vfr.GenerateAvatarAsync("A tall male avatar with blue eyes");
```

## Requirements

- Unity 2021.3 or newer
- .NET Standard 2.0 or newer

## License

Copyright (c) 2025 AvatarWallet. All rights reserved.