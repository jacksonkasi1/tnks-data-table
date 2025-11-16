# TNKS Data Table - Documentation

This directory contains the complete documentation for the Advanced Data Table Component, built with [Fumadocs](https://fumadocs.vercel.app).

## Documentation Structure

```
content/docs/
├── index.mdx                          # Documentation home page
├── getting-started/                   # Getting started guides
│   ├── index.mdx                      # Quick start guide
│   ├── installation.mdx                # Installation instructions
│   └── file-structure.mdx             # Project structure explanation
├── core-concepts/                     # Core concepts and architecture
│   └── index.mdx                      # Architecture overview
├── configuration/                     # Configuration guides
├── features/                          # Feature documentation
├── examples/                          # Real-world examples
├── api/                               # API reference
└── guides/                            # How-to guides
```

## Building the Documentation

The documentation is built automatically as part of the main Next.js application:

```bash
# Development
pnpm dev

# Production build
pnpm build
```

## Viewing Documentation

After starting the development server:

1. Visit `http://localhost:3000/docs` for the main documentation
2. Use the sidebar navigation to explore different sections
3. Search functionality is available in the top navigation

## Adding New Documentation

### Creating a New Page

1. Create an MDX file in the appropriate directory:

```mdx
---
title: Your Page Title
description: A brief description of the page
---

# Your Page Title

Your content here using MDX syntax...
```

2. Add the page to the corresponding `_meta.json` file:

```json
{
  "title": "Section Title",
  "pages": [
    "index",
    "your-new-page"
  ]
}
```

### MDX Features

The documentation supports all MDX features plus Fumadocs components:

#### Cards

```mdx
<Cards>
  <Card title="Title" href="/link">
    Description
  </Card>
</Cards>
```

#### Steps

```mdx
<Steps>
### Step 1

Content for step 1...

### Step 2

Content for step 2...
</Steps>
```

#### Tabs

```mdx
<Tabs items={['Tab 1', 'Tab 2']}>
  <Tab value="Tab 1">
    Content for tab 1
  </Tab>
  <Tab value="Tab 2">
    Content for tab 2
  </Tab>
</Tabs>
```

#### Code Blocks

````mdx
```typescript title="example.ts"
const example = "code here";
```
````

## Documentation Standards

### Writing Style

- Use clear, concise language
- Write in active voice
- Use present tense
- Include code examples for technical concepts
- Provide real-world use cases

### Content Organization

- Start with an overview/introduction
- Use hierarchical headings (h2, h3, h4)
- Include a table of contents for long pages
- Link to related documentation
- End with "Next Steps" links

### Code Examples

- Include working, tested code examples
- Show both TypeScript and JavaScript when relevant
- Highlight important lines
- Include error handling
- Add comments for complex logic

## Fumadocs Configuration

The documentation uses these key Fumadocs files:

- `source.config.ts` - MDX processing configuration
- `app/source.ts` - Documentation source definition
- `app/(docs)/layout.tsx` - Documentation layout
- `app/(docs)/docs/[[...slug]]/page.tsx` - Dynamic page routing

## Contributing to Documentation

1. Follow the existing structure and style
2. Test your changes locally
3. Ensure all links work
4. Add examples where appropriate
5. Update navigation if adding new sections

## Resources

- [Fumadocs Documentation](https://fumadocs.vercel.app)
- [MDX Documentation](https://mdxjs.com)
- [Next.js Documentation](https://nextjs.org/docs)
