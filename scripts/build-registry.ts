#!/usr/bin/env node

/**
 * Build script for generating shadcn-compatible registry JSON files
 * This script processes the registry.json and creates individual component JSON files
 */

import * as fs from "fs";
import * as path from "path";

// Read the registry.json file
const registryPath = path.join(process.cwd(), "registry.json");
const outputDir = path.join(process.cwd(), "public", "r");

interface RegistryFile {
  path: string;
  type: string;
  content?: string;
  target?: string;
}

interface RegistryItem {
  name: string;
  type: string;
  title?: string;
  description?: string;
  dependencies?: string[];
  devDependencies?: string[];
  registryDependencies?: string[];
  files: RegistryFile[];
  tailwind?: {
    config?: Record<string, any>;
  };
  cssVars?: Record<string, any>;
}

interface Registry {
  $schema: string;
  name: string;
  homepage?: string;
  items: RegistryItem[];
}

// Read file content
function readFileContent(filePath: string): string {
  const fullPath = path.join(process.cwd(), filePath);
  if (fs.existsSync(fullPath)) {
    return fs.readFileSync(fullPath, "utf-8");
  }
  console.warn(`Warning: File not found: ${filePath}`);
  return "";
}

// Process registry items
function buildRegistry() {
  console.log("Building registry...");

  // Read registry.json
  if (!fs.existsSync(registryPath)) {
    console.error("Error: registry.json not found");
    process.exit(1);
  }

  const registry: Registry = JSON.parse(fs.readFileSync(registryPath, "utf-8"));

  // Ensure output directory exists
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  // Process each item
  registry.items.forEach((item) => {
    console.log(`Processing: ${item.name}`);

    // Read file contents
    const filesWithContent = item.files.map((file) => ({
      ...file,
      content: readFileContent(file.path),
      target: file.path.replace(/^registry\/default\//, ""),
    }));

    // Create the output JSON
    const output = {
      name: item.name,
      type: item.type,
      ...(item.title && { title: item.title }),
      ...(item.description && { description: item.description }),
      ...(item.dependencies && { dependencies: item.dependencies }),
      ...(item.devDependencies && { devDependencies: item.devDependencies }),
      ...(item.registryDependencies && {
        registryDependencies: item.registryDependencies,
      }),
      files: filesWithContent,
      ...(item.tailwind && { tailwind: item.tailwind }),
      ...(item.cssVars && { cssVars: item.cssVars }),
    };

    // Write to public/r/[name].json
    const outputPath = path.join(outputDir, `${item.name}.json`);
    fs.writeFileSync(outputPath, JSON.stringify(output, null, 2));
    console.log(`✓ Generated: ${outputPath}`);
  });

  // Also copy registry.json to public
  const publicRegistryPath = path.join(process.cwd(), "public", "registry.json");
  fs.writeFileSync(publicRegistryPath, JSON.stringify(registry, null, 2));
  console.log(`✓ Generated: ${publicRegistryPath}`);

  console.log("\n✅ Registry build complete!");
  console.log(`\nGenerated ${registry.items.length} component(s):`);
  registry.items.forEach((item) => {
    console.log(`  - ${item.name}`);
  });
}

// Run the build
buildRegistry();
