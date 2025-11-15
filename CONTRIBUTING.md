# Contributing to @ddevkim/carousel-circular-3d

First off, thank you for considering contributing to carousel-circular-3d! It's people like you that make this library better for everyone.

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [How Can I Contribute?](#how-can-i-contribute)
  - [Reporting Bugs](#reporting-bugs)
  - [Suggesting Features](#suggesting-features)
  - [Submitting Pull Requests](#submitting-pull-requests)
- [Development Setup](#development-setup)
- [Project Structure](#project-structure)
- [Coding Guidelines](#coding-guidelines)
- [Commit Message Guidelines](#commit-message-guidelines)
- [Testing Guidelines](#testing-guidelines)

## Code of Conduct

This project and everyone participating in it is governed by our [Code of Conduct](CODE_OF_CONDUCT.md). By participating, you are expected to uphold this code.

## How Can I Contribute?

### 📢 Important: Development Workflow

**Note for External Contributors:**

This package is maintained as part of a private monorepo and automatically synced to this public repository.

**What this means for you:**

1. **Submit PRs normally** - You can fork and submit pull requests to this repository as usual
2. **We review here** - All code review and discussion happens in this public repository
3. **Integration process** - If approved, we integrate your changes into our main development repository
4. **Auto-sync** - Changes automatically sync back to this repository (usually within minutes)
5. **You get credit** - Your contribution is preserved with proper attribution in:
   - Commit messages (`Co-authored-by`)
   - Release notes
   - Contributors list

**Why this workflow?**

We maintain the package in a monorepo for:
- Shared development tools and configurations
- Cross-package testing
- Coordinated releases with related packages

This workflow ensures your contributions integrate properly while keeping the contribution process simple for you!

### Reporting Bugs

Before creating bug reports, please check the [existing issues](https://github.com/ddevkim/carousel-circular-3d/issues) to avoid duplicates.

When creating a bug report, please use the **Bug Report** template and include:

- A clear and descriptive title
- Exact steps to reproduce the problem
- Expected vs. actual behavior
- Code samples or links to reproduction repositories
- Your environment (package version, React version, browser, OS)
- Screenshots or screen recordings if applicable

### Suggesting Features

Feature suggestions are welcome! Please use the **Feature Request** template and include:

- A clear description of the problem you're trying to solve
- Your proposed solution
- Use cases and examples
- Any alternative solutions you've considered

### Submitting Pull Requests

1. **Fork the repository** and create your branch from `main`
   ```bash
   git clone https://github.com/YOUR_USERNAME/carousel-circular-3d.git
   cd carousel-circular-3d
   git checkout -b feature/my-feature
   ```

2. **Install dependencies**
   ```bash
   pnpm install
   ```

3. **Make your changes**
   - Follow the [coding guidelines](#coding-guidelines)
   - Add tests for your changes
   - Update documentation if needed

4. **Test your changes**
   ```bash
   # Run linter
   pnpm lint

   # Run type checker
   pnpm type-check

   # Build the package
   pnpm build

   # Test in playground
   pnpm dev
   ```

5. **Commit your changes**
   - Follow the [commit message guidelines](#commit-message-guidelines)
   ```bash
   git add .
   git commit -m "feat: add amazing feature"
   ```

6. **Push to your fork**
   ```bash
   git push origin feature/my-feature
   ```

7. **Open a Pull Request**
   - Use the PR template
   - Link to related issues
   - Provide a clear description of the changes
   - Add screenshots/videos if applicable

## Development Setup

### Prerequisites

- Node.js >= 18.0.0
- pnpm (install with `npm install -g pnpm`)

### Local Development

```bash
# Clone the repository
git clone https://github.com/ddevkim/carousel-circular-3d.git
cd carousel-circular-3d

# Install dependencies
pnpm install

# Start development server (runs playground)
pnpm dev

# Build the library
pnpm build

# Run linter
pnpm lint

# Fix linting issues
pnpm lint:fix

# Type checking
pnpm type-check
```

### Playground

The playground is located in the `playground/` directory. Use it to test your changes:

```bash
pnpm dev
```

This will start a Vite dev server where you can interactively test the carousel component.

## Project Structure

```
carousel-circular-3d/
├── src/
│   ├── components/          # UI components
│   │   ├── CarouselCircular.tsx
│   │   ├── Lightbox.tsx
│   │   └── ...
│   ├── hooks/               # Custom React hooks
│   │   ├── useCarousel3D.ts
│   │   ├── useAutoRotate.ts
│   │   └── ...
│   ├── utils/               # Utility functions
│   ├── constants/           # Constants and default values
│   ├── types.ts             # TypeScript type definitions
│   └── index.ts             # Main entry point
├── playground/              # Development playground
├── documents/               # Additional documentation
├── package.json
├── tsconfig.json
├── tsup.config.ts          # Build configuration
└── README.md
```

## Coding Guidelines

### TypeScript

- **Use TypeScript for all code**
- **Strict mode is enabled** - No `any` types
- **Use interfaces for objects**, types for unions/intersections
- **Add JSDoc comments** for all public APIs

```tsx
/**
 * Rotates the carousel to a specific index
 * @param index - The target index to rotate to
 * @param options - Rotation options
 */
export function rotateTo(index: number, options?: RotationOptions): void {
  // Implementation
}
```

### React

- **Use functional components only**
- **Use hooks** for state and side effects
- **Follow the hooks rules** (don't call hooks conditionally)
- **Memoize expensive calculations** with `useMemo`
- **Memoize callbacks** with `useCallback` when passed as props

```tsx
const memoizedValue = useMemo(() => {
  return expensiveCalculation(dep);
}, [dep]);

const handleClick = useCallback(() => {
  // Handler logic
}, [dependencies]);
```

### Naming Conventions

- **Components**: PascalCase (`CarouselCircular`, `Lightbox`)
- **Hooks**: camelCase with `use` prefix (`useCarousel3D`, `useAutoRotate`)
- **Utility functions**: camelCase (`calculateAngle`, `normalizeIndex`)
- **Constants**: UPPER_SNAKE_CASE (`DEFAULT_RADIUS`, `ANIMATION_DURATION`)
- **Types/Interfaces**: PascalCase (`CarouselProps`, `LightboxOptions`)
- **Boolean variables**: `is`, `has`, `should` prefix (`isActive`, `hasError`)

### Code Style

- Use **Biome** for linting and formatting
- **No semicolons** (enforced by Biome)
- **Use const** for variables that don't change
- **Destructure props** in function parameters
- **Keep functions small and focused** (single responsibility)

```tsx
// Good
export function CarouselCircular({
  items,
  radius = DEFAULT_RADIUS,
  autoRotate = false,
}: CarouselCircularProps) {
  // Implementation
}

// Bad
export function CarouselCircular(props: CarouselCircularProps) {
  const items = props.items;
  const radius = props.radius || DEFAULT_RADIUS;
  // ...
}
```

### Performance

- **Use GPU acceleration** with `transform` and `opacity`
- **Avoid layout thrashing** (minimize reflows)
- **Use `requestAnimationFrame`** for animations
- **Clean up side effects** in useEffect return functions
- **Use `will-change`** sparingly

```tsx
useEffect(() => {
  const rafId = requestAnimationFrame(animate);

  return () => {
    cancelAnimationFrame(rafId);
  };
}, [animate]);
```

## Commit Message Guidelines

We follow the [Conventional Commits](https://www.conventionalcommits.org/) specification:

```
<type>(<scope>): <subject>

<body>

<footer>
```

### Types

- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, no functional changes)
- `refactor`: Code refactoring
- `perf`: Performance improvements
- `test`: Adding or updating tests
- `build`: Build system or dependency changes
- `ci`: CI configuration changes
- `chore`: Other changes that don't modify src or test files

### Examples

```bash
# Feature
git commit -m "feat: add vertical carousel orientation support"

# Bug fix
git commit -m "fix: resolve infinite loop in autoRotate"

# Breaking change
git commit -m "feat!: replace scaleRange with minScale

BREAKING CHANGE: visualEffect.scaleRange has been replaced with visualEffect.minScale"

# Documentation
git commit -m "docs: update API reference for lightbox props"
```

## Testing Guidelines

### Manual Testing

1. **Test in the playground**
   ```bash
   pnpm dev
   ```

2. **Test on multiple browsers**
   - Chrome
   - Firefox
   - Safari
   - Edge

3. **Test on multiple devices**
   - Desktop
   - Mobile (iOS and Android)
   - Tablet

4. **Test performance**
   - Check FPS (should be 60fps on desktop, 55+ on mobile)
   - Monitor for memory leaks
   - Verify smooth animations

### Checklist

Before submitting a PR, ensure:

- [ ] Code follows the style guide
- [ ] Lint passes (`pnpm lint`)
- [ ] Type check passes (`pnpm type-check`)
- [ ] Build succeeds (`pnpm build`)
- [ ] Changes tested in playground
- [ ] Tested on multiple browsers
- [ ] No console errors or warnings
- [ ] Documentation updated (if needed)
- [ ] Examples updated (if needed)

## Questions?

- Check the [README](README.md)
- Browse [existing issues](https://github.com/ddevkim/carousel-circular-3d/issues)
- Ask in [Discussions](https://github.com/ddevkim/carousel-circular-3d/discussions)
- Or create a new issue with the **Question** template

## License

By contributing, you agree that your contributions will be licensed under the MIT License.

---

Thank you for contributing! 🎉
