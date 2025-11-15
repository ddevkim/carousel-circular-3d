# @ddevkim/carousel-circular-3d

> A luxury 3D circular carousel component for React with smooth animations, drag interactions, and premium visual effects.

[![npm version](https://img.shields.io/npm/v/@ddevkim/carousel-circular-3d.svg?style=flat-square)](https://www.npmjs.com/package/@ddevkim/carousel-circular-3d)
[![npm downloads](https://img.shields.io/npm/dm/@ddevkim/carousel-circular-3d.svg?style=flat-square)](https://www.npmjs.com/package/@ddevkim/carousel-circular-3d)
[![license](https://img.shields.io/npm/l/@ddevkim/carousel-circular-3d.svg?style=flat-square)](LICENSE)
[![GitHub issues](https://img.shields.io/github/issues/ddevkim/carousel-circular-3d.svg?style=flat-square)](https://github.com/ddevkim/carousel-circular-3d/issues)
[![GitHub stars](https://img.shields.io/github/stars/ddevkim/carousel-circular-3d.svg?style=flat-square)](https://github.com/ddevkim/carousel-circular-3d/stargazers)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg?style=flat-square)](CONTRIBUTING.md)

## ✨ Features

- 🎨 **Luxury 3D Effects** - Smooth perspective transforms, depth perception, and premium visual effects
- 🖱️ **Interactive** - Drag, touch, and momentum physics for natural interactions
- ⚡ **High Performance** - GPU-accelerated animations, 60fps on desktop, 55fps+ on mobile
- 🖼️ **Built-in Lightbox** - Full-screen image viewer with smooth transitions
- 🎯 **LQIP Support** - Progressive image loading with blur placeholders
- ⌨️ **Keyboard Navigation** - Enhanced keyboard support for carousel and lightbox (Arrow keys, ESC) with configurable options
- 📱 **Fully Responsive** - Touch-optimized for mobile devices
- 🔧 **Highly Customizable** - Extensive API for fine-tuning every aspect
- 💪 **TypeScript** - Full type safety and IntelliSense support
- 🌟 **Zero Dependencies** - Only React as peer dependency

## 🎯 Why Choose This?

Unlike traditional flat carousels, this component provides:

- **✨ Premium Feel**: 3D transforms and smooth physics-based interactions
- **🚀 Production Ready**: Used in real projects, battle-tested
- **📦 Zero Config**: Works out of the box with sensible defaults
- **🎨 Fully Customizable**: 30+ props to fine-tune every aspect
- **📱 Mobile First**: Touch-optimized with momentum scrolling
- **♿ Accessible**: ARIA labels, keyboard navigation, screen reader friendly
- **⚡ Performant**: GPU-accelerated, 60fps on desktop

## 📚 Table of Contents

- [Why Choose This?](#-why-choose-this)
- [Demo](#-demo)
- [Installation](#-installation)
- [Quick Start](#-quick-start)
- [Use Cases & Examples](#-use-cases--examples)
- [API Reference](#-api-reference)
- [Framework Integration](#-framework-integration)
- [Troubleshooting](#-troubleshooting)
- [Best Practices](#-best-practices)
- [Architecture](#-architecture)
- [FAQ](#-faq)
- [Contributing](#-contributing)
- [License](#-license)
- [Contact](#-contact)

## 🚀 Demo

**[Live Demo](https://carousel-circular.vercel.app)** - See it in action!

_Interactive 3D carousel with smooth animations and lightbox_

## 📦 Installation

```bash
# npm
npm install @ddevkim/carousel-circular-3d

# yarn
yarn add @ddevkim/carousel-circular-3d

# pnpm
pnpm add @ddevkim/carousel-circular-3d
```

## 🎯 Quick Start

### 1️⃣ Import Component + CSS

**Important:** You must import the CSS file for styles to work properly!

```tsx
import { CarouselCircular } from "@ddevkim/carousel-circular-3d";
import "@ddevkim/carousel-circular-3d/dist/index.css"; // Required for styles
```

### 2️⃣ Minimal Example (30 seconds)

```tsx
import { CarouselCircular } from "@ddevkim/carousel-circular-3d";
import "@ddevkim/carousel-circular-3d/dist/index.css";

const items = [
  { id: 1, image: "/image1.jpg", alt: "Image 1" },
  { id: 2, image: "/image2.jpg", alt: "Image 2" },
  { id: 3, image: "/image3.jpg", alt: "Image 3" },
];

function App() {
  return <CarouselCircular items={items} />;
}
```

That's it! 🎉 The carousel will render with sensible defaults.

### 3️⃣ Luxury Example (Recommended)

For a premium look with 3D depth and smooth interactions:

```tsx
import { CarouselCircular } from "@ddevkim/carousel-circular-3d";
import "@ddevkim/carousel-circular-3d/dist/index.css";

function App() {
  return (
    <CarouselCircular
      items={items}
      containerHeight={600}
      geometry={{
        radius: 900,
        cameraAngle: 12,
      }}
      visualEffect={{
        minScale: 0.5,
        enableReflection: true,
      }}
    />
  );
}
```

## 📖 API Reference

### Props

#### Required Props

| Prop    | Type             | Description                                    |
| ------- | ---------------- | ---------------------------------------------- |
| `items` | `CarouselItem[]` | Array of items to display (max 30 recommended) |

#### 3D Geometry (`geometry`)

| Prop             | Type     | Default         | Description                                                   |
| ---------------- | -------- | --------------- | ------------------------------------------------------------- |
| `radius`         | `number` | `600`           | Circle radius in pixels                                       |
| `perspective`    | `number` | `radius * 3.33` | Perspective depth (min: `radius * 2`)                         |
| `cameraAngle`    | `number` | `0`             | Camera vertical angle (-30 to 30 degrees)                     |
| `depthIntensity` | `number` | `0`             | Individual item Z-depth variation (0-3, recommended: 1.0-2.0) |

#### Interaction (`interaction`)

| Prop                       | Type      | Default | Description                                                                  |
| -------------------------- | --------- | ------- | ---------------------------------------------------------------------------- |
| `dragSensitivity`          | `number`  | `1.0`   | Drag responsiveness multiplier                                               |
| `enableMomentum`           | `boolean` | `true`  | Enable physics-based momentum                                                |
| `momentumFriction`         | `number`  | `0.95`  | Friction coefficient (0-1)                                                   |
| `enableKeyboardNavigation` | `boolean` | `true`  | Enable keyboard navigation (Arrow keys). Auto-disabled when lightbox is open |

#### Auto-Rotation (`autoRotateConfig`)

| Prop          | Type      | Default | Description                                  |
| ------------- | --------- | ------- | -------------------------------------------- |
| `enabled`     | `boolean` | `false` | Enable auto-rotation                         |
| `speed`       | `number`  | `0.1`   | Rotation speed (degrees/frame)               |
| `resumeDelay` | `number`  | `3000`  | Delay before resuming after interaction (ms) |

#### Visual Effects (`visualEffect`)

| Prop               | Type               | Default      | Description                     |
| ------------------ | ------------------ | ------------ | ------------------------------- |
| `opacityRange`     | `[number, number]` | `[0.3, 1.0]` | Opacity range [min, max]        |
| `minScale`         | `number`           | `0.7`        | Minimum scale for back items (0.0~1.0, front items are always 1.0) |
| `enableReflection` | `boolean`          | `false`      | Enable bottom reflection effect |

#### Styling (`style`)

| Prop            | Type     | Description             |
| --------------- | -------- | ----------------------- |
| `className`     | `string` | CSS class for container |
| `itemClassName` | `string` | CSS class for each item |

#### Container

| Prop              | Type     | Default | Description                |
| ----------------- | -------- | ------- | -------------------------- |
| `containerHeight` | `number` | `600`   | Container height in pixels |

#### Lightbox

| Prop                      | Type              | Default | Description              |
| ------------------------- | ----------------- | ------- | ------------------------ |
| `enableLightboxWhenClick` | `boolean`         | `false` | Enable lightbox on click |
| `lightboxOptions`         | `LightboxOptions` | -       | Lightbox configuration   |

**LightboxOptions:**

| Prop                       | Type       | Default | Description                                                   |
| -------------------------- | ---------- | ------- | ------------------------------------------------------------- |
| `enableKeyboardNavigation` | `boolean`  | `true`  | Enable keyboard navigation (ArrowLeft/ArrowRight) in lightbox |
| `closeOnEsc`               | `boolean`  | `true`  | Enable ESC key to close lightbox                              |
| `backgroundBlur`           | `number`   | `8`     | Background blur intensity in pixels                           |
| `animationDuration`        | `number`   | `500`   | Animation duration in milliseconds                            |
| `onOpen`                   | `function` | -       | Callback when lightbox opens (receives index)                 |
| `onClose`                  | `function` | -       | Callback when lightbox closes                                 |

#### Callbacks & Accessibility

| Prop          | Type                    | Description                   |
| ------------- | ----------------------- | ----------------------------- |
| `onItemClick` | `(item, index) => void` | Callback when item is clicked |
| `ariaLabel`   | `string`                | ARIA label for screen readers |

### CarouselItem Type

```typescript
// Image-based item
type CarouselItemWithImage = {
  id: string | number;
  image: string;
  lqip?: {
    base64: string;
    width: number;
    height: number;
  };
  alt?: string;
  title?: string;
};

// Custom content item
type CarouselItemWithContent = {
  id: string | number;
  content: ReactNode;
  alt?: string;
  title?: string;
};

type CarouselItem = CarouselItemWithImage | CarouselItemWithContent;
```

## 🎨 Use Cases & Examples

### 📸 Product Gallery with Lightbox

Perfect for e-commerce sites, portfolios, or any image-heavy application:

```tsx
import { CarouselCircular } from "@ddevkim/carousel-circular-3d";
import "@ddevkim/carousel-circular-3d/dist/index.css";

const products = [
  { id: 1, image: "/products/watch.jpg", alt: "Luxury Watch" },
  { id: 2, image: "/products/phone.jpg", alt: "Smartphone" },
  { id: 3, image: "/products/laptop.jpg", alt: "Laptop" },
];

export function ProductGallery() {
  return (
    <CarouselCircular
      items={products}
      enableLightboxWhenClick={true}
      lightboxOptions={{
        enableKeyboardNavigation: true,
        closeOnEsc: true,
        backgroundBlur: 10,
      }}
      geometry={{
        radius: 900,
        cameraAngle: 12,
      }}
    />
  );
}
```

**Features:**

- Click any product to view full-screen
- Navigate with arrow keys or swipe
- Press ESC to close
- Smooth fade transitions

### 🚀 Progressive Loading with LQIP

Show blurred placeholders instantly while high-res images load:

```tsx
import { CarouselCircular } from "@ddevkim/carousel-circular-3d";
import "@ddevkim/carousel-circular-3d/dist/index.css";

const items = [
  {
    id: 1,
    image: "/gallery/hero.jpg",
    lqip: {
      base64: "data:image/webp;base64,UklGRiQAAABXRUJQ...", // tiny base64 image
      width: 800,
      height: 600,
    },
    alt: "Mountain landscape",
  },
];

<CarouselCircular items={items} />;
```

**Benefits:**

- Instant visual feedback (no blank space)
- Smooth transition from blur to sharp
- Better perceived performance
- Works offline (base64 inline)

### 🎡 Auto-Rotating Hero Carousel

Great for landing pages or showcases:

```tsx
import { CarouselCircular } from "@ddevkim/carousel-circular-3d";
import "@ddevkim/carousel-circular-3d/dist/index.css";

export function HeroCarousel() {
  return (
    <CarouselCircular
      items={items}
      autoRotateConfig={{
        enabled: true,
        speed: 0.1, // Slow, elegant rotation
        resumeDelay: 3000, // Resume 3s after user interaction
      }}
      geometry={{
        radius: 1200,
        cameraAngle: 15,
      }}
    />
  );
}
```

**Pro Tips:**

- Use slower speed (0.05-0.15) for luxury feel
- Longer `resumeDelay` gives users control
- Rotation pauses on hover/drag automatically

### 🎨 Custom Content Cards

Not just images! Render any React component:

```tsx
import { CarouselCircular } from "@ddevkim/carousel-circular-3d";
import "@ddevkim/carousel-circular-3d/dist/index.css";

const teamMembers = [
  {
    id: 1,
    content: (
      <div className="team-card">
        <img src="/avatar1.jpg" alt="John Doe" />
        <h3>John Doe</h3>
        <p>CEO & Founder</p>
        <div className="social-links">{/* Your custom content */}</div>
      </div>
    ),
  },
];

export function TeamCarousel() {
  return (
    <CarouselCircular
      items={teamMembers}
      containerHeight={500}
      itemClassName="custom-team-card"
    />
  );
}
```

**Use Cases:**

- Team members
- Testimonials
- Feature cards
- Pricing tiers
- Anything you can imagine!

### 🎯 Full Example: Complete Product Showcase

```tsx
import { useState } from "react";
import { CarouselCircular } from "@ddevkim/carousel-circular-3d";
import "@ddevkim/carousel-circular-3d/dist/index.css";

export function ProductShowcase() {
  const [selectedProduct, setSelectedProduct] = useState(null);

  const products = [
    {
      id: 1,
      image: "/products/watch.jpg",
      lqip: { base64: "...", width: 800, height: 600 },
      alt: "Premium Watch",
      title: "Swiss Automatic Watch",
    },
    // ... more products
  ];

  return (
    <div className="showcase">
      <CarouselCircular
        items={products}
        containerHeight={700}
        geometry={{
          radius: 1000,
          cameraAngle: 12,
          depthIntensity: 1.5,
        }}
        visualEffect={{
          minScale: 0.6,
          opacityRange: [0.4, 1],
          enableReflection: true,
        }}
        enableLightboxWhenClick={true}
        lightboxOptions={{
          onOpen: (index) => setSelectedProduct(products[index]),
          onClose: () => setSelectedProduct(null),
        }}
        autoRotateConfig={{
          enabled: true,
          speed: 0.08,
          resumeDelay: 4000,
        }}
        onItemClick={(item, index) => {
          console.log("Clicked:", item.title);
        }}
        ariaLabel="Product showcase carousel"
      />

      {selectedProduct && (
        <div className="product-info">
          <h2>{selectedProduct.title}</h2>
          {/* Additional product details */}
        </div>
      )}
    </div>
  );
}
```

## 🎯 Best Practices

### Performance Tips

1. **Image Optimization**: Use optimized images (WebP, compressed JPEG)
2. **LQIP**: Include LQIP data for smooth loading experience
3. **Item Count**: Keep items under 30 for optimal performance
4. **Container Height**: Match your content size to avoid unnecessary scaling

### Visual Design Tips

1. **Radius**: Larger radius (900-1200px) creates more luxurious spacing
2. **Camera Angle**: 8-15 degrees provides subtle depth without distortion
3. **Depth Intensity**: 1.0-2.0 adds subtle Z-axis variation
4. **Scale Range**: `[0.5, 1]` creates dramatic focus effect

### Accessibility

1. Always provide `alt` text for images
2. Set meaningful `ariaLabel` for container
3. Test keyboard navigation:
   - **Carousel**: Arrow keys (Left/Right) for navigation
   - **Lightbox**: Arrow keys (Left/Right) for navigation, ESC to close
   - Keyboard navigation is automatically disabled for carousel when lightbox is open to prevent conflicts
4. Ensure sufficient color contrast for text overlays
5. Configure keyboard options via `interaction.enableKeyboardNavigation` and `lightboxOptions.enableKeyboardNavigation` if needed

## 🔧 Framework Integration

### Next.js (App Router)

```tsx
// app/components/ProductCarousel.tsx
"use client"; // Required for client-side interactivity

import { CarouselCircular } from "@ddevkim/carousel-circular-3d";
import "@ddevkim/carousel-circular-3d/dist/index.css";

export function ProductCarousel({ items }) {
  return <CarouselCircular items={items} />;
}
```

### Next.js (Pages Router)

```tsx
// pages/index.tsx
import { CarouselCircular } from "@ddevkim/carousel-circular-3d";
import "@ddevkim/carousel-circular-3d/dist/index.css";

export default function Home() {
  return <CarouselCircular items={items} />;
}
```

### Vite + React

```tsx
// src/App.tsx
import { CarouselCircular } from "@ddevkim/carousel-circular-3d";
import "@ddevkim/carousel-circular-3d/dist/index.css";

export default function App() {
  return <CarouselCircular items={items} />;
}
```

### Create React App

```tsx
// src/App.js
import { CarouselCircular } from "@ddevkim/carousel-circular-3d";
import "@ddevkim/carousel-circular-3d/dist/index.css";

function App() {
  return <CarouselCircular items={items} />;
}
```

## ❓ Troubleshooting

### Styles Not Showing

**Problem:** Carousel renders but has no styles (buttons missing, layout broken)

**Solution:** Make sure you import the CSS file:

```tsx
import "@ddevkim/carousel-circular-3d/dist/index.css"; // ← Don't forget this!
```

**Alternative imports that work:**

```tsx
// Option 1: Direct path (recommended)
import "@ddevkim/carousel-circular-3d/dist/index.css";

// Option 2: Using styles export
import "@ddevkim/carousel-circular-3d/styles";
```

### TypeScript Errors

**Problem:** Type errors when using the component

**Solution:** The package includes TypeScript definitions. Make sure your `tsconfig.json` includes:

```json
{
  "compilerOptions": {
    "moduleResolution": "bundler", // or "node"
    "esModuleInterop": true
  }
}
```

### Images Not Loading

**Problem:** Images show broken icon or don't load

**Solution:**

1. **Check image paths:** Ensure paths are correct relative to your public folder
2. **Use absolute URLs:** Try using full URLs: `https://example.com/image.jpg`
3. **Verify CORS:** If using external images, ensure CORS headers are set

```tsx
// ✅ Good - relative to public folder
{ id: 1, image: "/images/product.jpg" }

// ✅ Good - absolute URL
{ id: 1, image: "https://cdn.example.com/product.jpg" }

// ❌ Bad - relative to component file
{ id: 1, image: "../assets/product.jpg" }
```

### Performance Issues

**Problem:** Carousel feels laggy or slow

**Solutions:**

1. **Reduce item count:** Keep items under 30
2. **Optimize images:** Use WebP format and compress
3. **Add LQIP:** Use progressive loading
4. **Check radius:** Very large radius (>2000px) may impact performance

```tsx
// ✅ Optimized
<CarouselCircular
  items={items.slice(0, 20)} // Limit items
  geometry={{ radius: 900 }} // Reasonable radius
/>
```

### Lightbox Not Opening

**Problem:** Click on image but lightbox doesn't open

**Solution:** Make sure `enableLightboxWhenClick` is set to `true`:

```tsx
<CarouselCircular
  items={items}
  enableLightboxWhenClick={true} // ← Required for lightbox
/>
```

### Auto-Rotation Not Working

**Problem:** Carousel doesn't auto-rotate

**Solution:** Check your config:

```tsx
<CarouselCircular
  items={items}
  autoRotateConfig={{
    enabled: true, // ← Must be true
    speed: 0.1,
  }}
/>
```

### Keyboard Navigation Issues

**Problem:** Arrow keys don't work

**Solutions:**

1. **Carousel navigation:** Ensure `interaction.enableKeyboardNavigation` is `true` (default)
2. **Lightbox navigation:** Check `lightboxOptions.enableKeyboardNavigation` is `true` (default)
3. **Focus state:** Carousel container must be focused (click on it first)

```tsx
<CarouselCircular
  items={items}
  interaction={{
    enableKeyboardNavigation: true, // Carousel arrow keys
  }}
  lightboxOptions={{
    enableKeyboardNavigation: true, // Lightbox arrow keys
    closeOnEsc: true, // ESC to close
  }}
/>
```

## 🏗️ Architecture

### Key Features

- **GPU-Accelerated**: Uses CSS `transform` and `will-change` for 60fps animations
- **Physics-Based**: Realistic momentum with configurable friction
- **Orientation Detection**: Automatically calculates item sizes based on image dimensions
- **Smart Angle Distribution**: Even spacing regardless of portrait/landscape mix
- **RAF-Based**: All animations use `requestAnimationFrame` for smooth performance

## 💡 FAQ

### Can I use this with TypeScript?

Yes! The package includes full TypeScript definitions with IntelliSense support.

### Does it work with Server-Side Rendering (SSR)?

Yes! It works with Next.js (both App Router and Pages Router), including SSR and SSG.

For Next.js App Router, use the `"use client"` directive in your component file.

### How do I generate LQIP data?

You can use any LQIP generation tool. Here are popular options:

- **[sqip](https://github.com/axe312ger/sqip)** - SVG-based LQIP generator
- **[lqip-modern](https://github.com/transitive-bullshit/lqip-modern)** - Modern LQIP with multiple algorithms
- **[plaiceholder](https://plaiceholder.co/)** - Next.js-friendly LQIP generator
- **ImageMagick** - Create base64 thumbnails with blur

Example with ImageMagick:

```bash
convert input.jpg -resize 20x -quality 30 -blur 0x1 output.webp
base64 output.webp
```

### Can I customize the lightbox appearance?

The lightbox uses minimal inline styles. You can customize it by overriding CSS classes or using `className` props.

### What's the browser support?

Modern browsers (Chrome, Firefox, Safari, Edge) with CSS3 transforms support. IE11 is not supported.

### How many items can I display?

We recommend keeping items under 30 for optimal performance. The component can handle more, but performance may degrade on lower-end devices.

### Can I use videos instead of images?

Currently, the component is optimized for images. For videos, use the `content` prop with a custom video player component.

## 🤝 Contributing

We welcome contributions from the community! Whether it's bug reports, feature requests, or code contributions, we appreciate your help in making this library better.

### Ways to Contribute

- **🐛 Report Bugs**: Use our [Bug Report template](https://github.com/ddevkim/carousel-circular-3d/issues/new?template=bug_report.yml)
- **✨ Request Features**: Use our [Feature Request template](https://github.com/ddevkim/carousel-circular-3d/issues/new?template=feature_request.yml)
- **❓ Ask Questions**: Use our [Question template](https://github.com/ddevkim/carousel-circular-3d/issues/new?template=question.yml)
- **💻 Submit Pull Requests**: Check our [Contributing Guide](CONTRIBUTING.md)

### Quick Start for Contributors

```bash
# Fork and clone the repository
git clone https://github.com/YOUR_USERNAME/carousel-circular-3d.git
cd carousel-circular-3d

# Install dependencies
pnpm install

# Start development
pnpm dev

# Run tests
pnpm lint && pnpm type-check && pnpm build
```

For detailed guidelines, please read our [Contributing Guide](CONTRIBUTING.md) and [Code of Conduct](CODE_OF_CONDUCT.md).

### Community Guidelines

- Be respectful and inclusive
- Provide constructive feedback
- Help others when you can
- Follow our [Code of Conduct](CODE_OF_CONDUCT.md)

## 📄 License

MIT © ddevkim

## 🙏 Acknowledgments

Built with:

- React 18+ for modern UI
- TypeScript for type safety
- tsup for blazing-fast builds
- Turbo for monorepo management

## 📬 Contact

Have questions or need support?

- 🌐 **Website**: [https://ddev.kim](https://ddev.kim)
- 💼 **GitHub**: [ddevkim/carousel-circular-3d](https://github.com/ddevkim/carousel-circular-3d)
- 📦 **npm**: [@ddevkim/carousel-circular-3d](https://www.npmjs.com/package/@ddevkim/carousel-circular-3d)
- 🐛 **Issues**: [Report a bug or request a feature](https://github.com/ddevkim/carousel-circular-3d/issues)

---

Made with ❤️ by [ddevkim](https://ddev.kim)
