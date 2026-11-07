# CLAUDE.md

# Created: 2026-10-11 14:30:00

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

A handwritten digit recognition project with two implementations:
1. **Desktop Version** — Python tkinter GUI application for local use
2. **Web Version** — Web-based application with frontend and backend API

Both versions use a CNN model trained on the MNIST dataset to recognize handwritten digits (0-9).

## Project Structure

```
Study-01/
├── desktop_version/
│   ├── digit_recognition.py       — Main tkinter GUI application
│   ├── CLAUDE.md                  — Desktop version guidance
│   └── (other assets as needed)
├── web_version/
│   ├── frontend/                  — HTML, CSS, JavaScript
│   ├── backend/                   — API server
│   ├── CLAUDE.md                  — Web version guidance
│   └── (models, data as needed)
├── CLAUDE.md                       — This file (root guidance)
└── (shared resources if any)
```

## Which Version to Work On

- **Desktop Version:** See `desktop_version/CLAUDE.md` for Python tkinter development
- **Web Version:** See `web_version/CLAUDE.md` for full-stack web development

## Shared Resources

If both versions share the same pre-trained model or utilities, store them in the root or a shared folder and reference them from both versions.

## Development Notes

- Both versions train/load the same 3-layer CNN on MNIST
- Desktop version trains on startup; web version should load a pre-trained model
- Model preprocessing (resize to 28×28, normalize) is consistent across both versions
- Code duplication for model inference is acceptable; each version is self-contained

## Next Steps

1. Implement desktop version fully (already has core code)
2. Implement web version with frontend canvas and backend API
3. Consider sharing model training/serialization code if needed
4. Test both versions produce consistent predictions for the same input
