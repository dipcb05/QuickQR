# QuickQR 🚀

**One Simple Scan. Zero Ads. Total Privacy.**

QuickQR exists to avoid excessive ads and unnecessary permissions for a simple scan. It’s open-source, ad-free, and privacy-first.

Built with performance and ergonomics in mind, QuickQR is a Progressive Web App (PWA) that brings native-level utility to your browser—offline, fast, and secure.

---

## ✨ Features

- **⚡ 3-Tier Scanning Cascade**: Reliable scanning using a fall-through logic:
  1. **Native BarcodeDetector API**: For high-performance, low-latency native scanning.
  2. **html5-qrcode**: Robust web-standard fallback.
  3. **jsQR**: Pure JavaScript implementation for maximum compatibility.
- **📶 Smart WiFi Detection**: Scanning a WiFi QR code provides a direct connection prompt on supported platforms.
- **📂 Image Decoding**: Scan QR codes directly from your image gallery or file system.
- **🌑 Privacy-First Architecture**: No trackers, no ads, and no cloud syncing. All scan history is stored locally on your device's indexedDB.
- **📱 PWA (Progressive Web App)**: Install it on iOS (Add to Home Screen) or Android/Desktop for a standalone app experience that works offline.
- **🔦 Flashlight Control**: Toggle your camera's flash directly from the interface for dark environments.
- **📜 Scan History**: Automatically saves your scans with date, time, and type for easy access later.
- **🎨 Modern Dark/Light Mode**: Styled with Tailwind CSS 4 and Framer Motion for a fluid, premium feel.

---

## 🛠️ Tech Stack

- **Framework**: [Next.js 16](https://nextjs.org/) (App Router & React 19)
- **Styling**: [Tailwind CSS 4](https://tailwindcss.com/) with [Framer Motion](https://www.framer.com/motion/) for animations.
- **Icons & UI**: [Lucide React](https://lucide.dev/) & [Radix UI](https://www.radix-ui.com/).
- **PWA**: Custom service worker with [pwa-asset-generator](https://github.com/onderceylan/pwa-asset-generator).
- **Scanning**: BarcodeDetector API, [html5-qrcode](https://github.com/mebjas/html5-qrcode), and [jsQR](https://github.com/cozmo/jsQR).

---

## 🚀 Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (v18 or higher)
- [pnpm](https://pnpm.io/) (recommended)

### Installation

1. **Clone the repo:**
   ```bash
   git clone https://github.com/dipcb05/QuickQR.git
   cd QuickQR
   ```

2. **Install dependencies:**
   ```bash
   pnpm install
   ```

3. **Run the development server:**
   ```bash
   pnpm dev
   ```

4. **Build for production:**
   ```bash
   pnpm build
   pnpm start
   ```

---

## 📖 Usage

1. **Scan via Camera**: Launch the scanner and point your camera at any QR code or Barcode.
2. **Scan via File**: Tap the file icon on the scanner page to upload a saved image.
3. **Connect to WiFi**: Simply scan a WiFi QR, and tap the "Connect" button in the result modal.
4. **Offline Use**: Once opened once, QuickQR is cached. You can open it anytime without an internet connection to view history or scan.

---

## 🤝 Contributing

QuickQR is open-source and contributions are what make the community amazing!

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## ☕ Support

If QuickQR has helped you, consider supporting the development!

<a href="https://buymeacoffee.com/dipcb05" target="_blank">
  <img src="https://cdn.buymeacoffee.com/buttons/v2/default-yellow.png" alt="Buy Me A Coffee" style="height: 50px !important;width: 180px !important;" >
</a>

---

## 📄 License

Distributed under the MIT License. See `LICENSE` for more information.

---

Built with ❤️ by [dipcb05](https://github.com/dipcb05)
