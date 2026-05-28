# Contributing to MCPHub

Thank you for your interest in contributing to MCPHub! This guide will help you get started with contributing to the project.

## Table of Contents

- [Getting Started](#getting-started)
- [Development Setup](#development-setup)
- [Project Structure](#project-structure)
- [Development Workflow](#development-workflow)
- [Adding MCP Server Parsers](#adding-mcp-server-parsers)
- [Internationalization](#internationalization)
- [Code Style](#code-style)
- [Commit Guidelines](#commit-guidelines)
- [Pull Request Process](#pull-request-process)
- [Reporting Issues](#reporting-issues)

## Getting Started

### Prerequisites

- Node.js >= 20.9.0
- pnpm (recommended) or npm
- MySQL 8.0+
- Redis
- Git

### Fork and Clone

1. Fork the repository on GitHub
2. Clone your fork:

```bash
git clone https://github.com/your-username/mcphub.git
cd mcphub
```

3. Add the upstream remote:

```bash
git remote add upstream https://github.com/mcphub-ai/mcphub.git
```

## Development Setup

1. Install dependencies:

```bash
pnpm install
```

2. Set up your environment:

```bash
cp apps/core/.env.development.example apps/core/.env.development
# Edit the .env file with your local configuration
```

3. Initialize the database:

```bash
mysql -u root -p < scripts/sql/create_database.sql
mysql -u root -p mcphub < scripts/sql/alter_table.sql
```

4. Start the development server:

```bash
pnpm run dev:core    # Backend API server
pnpm run dev:web     # Frontend (in another terminal)
```

## Project Structure

```
mcphub/
├── apps/
│   ├── core/          # Backend API server (Hono + Drizzle ORM)
│   │   ├── src/
│   │   │   ├── app.ts              # Application entry point
│   │   │   ├── config/             # Configuration files
│   │   │   ├── db/                 # Database schemas and migrations
│   │   │   ├── i18n/               # Internationalization files
│   │   │   ├── locales/            # Translation files (en.json, zh-CN.json)
│   │   │   ├── middleware/         # Hono middleware
│   │   │   ├── parser/             # MCP server parsers
│   │   │   ├── routes/             # API route handlers
│   │   │   ├── services/           # Business logic services
│   │   │   └── utils/              # Utility functions
│   │   └── package.json
│   └── web/           # Frontend (React + Tailwind CSS)
│       ├── src/
│       │   ├── components/         # React components
│       │   ├── contexts/           # React contexts
│       │   ├── hooks/              # Custom React hooks
│       │   ├── locales/            # Frontend translations
│       │   ├── pages/              # Page components
│       │   └── utils/              # Utility functions
│       └── package.json
├── docs/              # Documentation
├── scripts/           # Build and deployment scripts
├── packages/          # Shared packages
└── pnpm-workspace.yaml
```

## Development Workflow

### Branching Strategy

- `main` - Production-ready code
- `develop` - Development branch
- `feature/*` - Feature branches
- `fix/*` - Bug fix branches
- `docs/*` - Documentation branches

### Creating a Feature Branch

```bash
# Update your local main branch
git checkout main
git pull upstream main

# Create a new feature branch
git checkout -b feature/your-feature-name
```

### Making Changes

1. Make your changes in the appropriate files
2. Test your changes locally
3. Commit your changes with a descriptive message
4. Push to your fork and create a pull request

## Adding MCP Server Parsers

MCPHub uses parsers to extract tool information from different MCP server sources. To add a new parser:

### 1. Create the Parser

Create a new file in `apps/core/src/parser/`:

```typescript
import { ParseResult, BaseParseOptions } from './github';

export interface YourPlatformOptions extends BaseParseOptions {
  // Platform-specific options
}

export async function parseYourPlatformMcpServer(
  options: YourPlatformOptions
): Promise<ParseResult> {
  const { identifier, logoUrl, homepage } = options;
  
  // Implement your parsing logic here
  // Fetch the MCP server configuration
  // Extract tools information
  
  return {
    name: 'Server Name',
    description: 'Server description',
    logo: logoUrl || '',
    homepage: homepage || '',
    tools: [
      {
        name: 'tool_name',
        description: 'Tool description',
        parameters: {
          type: 'object',
          properties: {
            // Define parameters
          },
          required: [],
        },
      },
    ],
  };
}
```

### 2. Register the Parser

Add your parser to `apps/core/src/parser/index.ts`:

```typescript
import { parseYourPlatformMcpServer, YourPlatformOptions } from './your-platform';

export type SourceType = 'github' | 'npm' | 'docker' | 'smithery' | 'your-platform';

export interface ParseMcpServerOptions {
  source: SourceType;
  identifier: string;
  homepage?: string;
  logoUrl?: string;
  accessToken?: string;
}

export async function parseMcpServer(
  options: ParseMcpServerOptions
): Promise<ParseResult> {
  switch (options.source) {
    // ... existing cases ...
    case 'your-platform':
      return parseYourPlatformMcpServer(options as YourPlatformOptions);
    default:
      throw new Error(`Unsupported source: ${options.source}`);
  }
}
```

### 3. Add API Endpoint

Create a new route in `apps/core/src/routes/mcpserver/index.ts`:

```typescript
// Add validation schema
export const mcpServerParseYourPlatformQuerySchema = z.object({
  // Define query parameters
});

// Add route handler
const parseYourPlatformRoute = createRoute({
  method: 'get',
  path: '/mcpserver/parse/your-platform',
  request: { query: mcpServerParseYourPlatformQuerySchema },
  responses: {
    200: {
      content: { 'application/json': { schema: mcpServerDetailResponseSchema } },
      description: 'Parse MCP server from YourPlatform',
    },
  },
});

// Register the route
mcpserverOpenAPI.openapi(parseYourPlatformRoute, async (c) => {
  // Implement handler
});
```

### 4. Add Frontend Integration

Update `apps/web/src/pages/submit/index.tsx` to add your platform option:

```typescript
const metadataSourceOptions = useMemo(
  () => [
    // ... existing options ...
    {
      value: 'your-platform',
      label: t('yourPlatform'),
      placeholder: t('yourPlatformPlaceholder'),
      schema: yourPlatformSchema,
    },
  ],
  [t]
);
```

### 5. Add Translations

Add translations for your platform in both:
- `apps/core/src/locales/en.json`
- `apps/core/src/locales/zh-CN.json`
- `apps/web/src/locales/en.json`
- `apps/web/src/locales/zh-CN.json`

## Internationalization

MCPHub supports multiple languages. When adding new features:

### Backend (Hono)

```typescript
import { getI18n } from '../i18n';

// In your route handler
const t = await getI18n(c);
const message = t('your.translation.key');
```

### Frontend (React)

```typescript
import { useTranslation } from 'react-i18next';

function YourComponent() {
  const { t } = useTranslation();
  
  return <div>{t('your.translation.key')}</div>;
}
```

### Adding a New Language

1. Create a new translation file in `apps/core/src/locales/` (e.g., `ja.json`)
2. Create a corresponding file in `apps/web/src/locales/`
3. Register the language in:
   - `apps/core/src/i18n/index.ts`
   - `apps/web/src/i18n/index.ts`
4. Add the language option to the language selector component

## Code Style

### TypeScript

- Use TypeScript for all new code
- Enable strict mode
- Use proper type annotations
- Avoid `any` types when possible

### Naming Conventions

- **Files**: Use kebab-case for filenames (e.g., `parse-github.ts`)
- **Classes/Interfaces**: Use PascalCase (e.g., `UserService`, `UserSchema`)
- **Functions/Variables**: Use camelCase (e.g., `getUserById`, `userName`)
- **Constants**: Use UPPER_SNAKE_CASE (e.g., `MAX_RETRY_COUNT`)
- **Database Tables**: Use snake_case (e.g., `mcp_servers`, `users`)

### Formatting

The project uses Biome for formatting and linting:

```bash
# Check formatting
pnpm run format

# Run linter
pnpm run lint
```

## Commit Guidelines

We follow the [Conventional Commits](https://www.conventionalcommits.org/) specification:

```
<type>(<scope>): <description>

[optional body]

[optional footer]
```

### Types

- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, etc.)
- `refactor`: Code refactoring
- `test`: Adding or updating tests
- `chore`: Maintenance tasks
- `perf`: Performance improvements

### Examples

```
feat(parser): add npm MCP server parser
fix(auth): resolve OAuth callback issue
docs(readme): update installation instructions
i18n(core): add Japanese translations
```

## Pull Request Process

### Before Submitting

1. Ensure your code follows the project's coding standards
2. Run the linter and formatter
3. Test your changes thoroughly
4. Update documentation if needed
5. Add translations for new user-facing strings

### Submitting a Pull Request

1. Push your changes to your fork
2. Create a pull request from your fork to the main repository
3. Fill in the pull request template
4. Link any related issues
5. Request reviews from maintainers

### Pull Request Template

```markdown
## Description

Brief description of the changes.

## Type of Change

- [ ] Bug fix
- [ ] New feature
- [ ] Documentation update
- [ ] Refactoring
- [ ] Other (please describe)

## Related Issues

Closes #123

## Checklist

- [ ] My code follows the project's coding standards
- [ ] I have added translations for new user-facing strings
- [ ] I have updated the documentation
- [ ] I have tested my changes
- [ ] All existing tests pass
```

### Review Process

1. Maintainers will review your pull request
2. Address any feedback or requested changes
3. Once approved, your pull request will be merged

## Reporting Issues

### Bug Reports

When reporting bugs, please include:

1. **Description**: A clear description of the bug
2. **Steps to Reproduce**: Detailed steps to reproduce the issue
3. **Expected Behavior**: What you expected to happen
4. **Actual Behavior**: What actually happened
5. **Environment**: 
   - OS and version
   - Node.js version
   - Browser (if applicable)
6. **Screenshots**: If applicable
7. **Logs**: Any relevant error messages or logs

### Feature Requests

When requesting features, please include:

1. **Description**: A clear description of the feature
2. **Use Case**: Why this feature would be useful
3. **Proposed Solution**: If you have one
4. **Alternatives**: Any alternative solutions you've considered

## Development Tips

### Debugging

#### Backend

```bash
# Start with debug logging
DEBUG=mcphub:* pnpm run dev:core

# Or set in .env.development
LOG_LEVEL=debug
```

#### Frontend

Use React Developer Tools browser extension for debugging React components.

### Database

```bash
# Generate migration
pnpm run db:generate

# Run migration
pnpm run db:migrate

# Open Drizzle Studio
pnpm run db:studio
```

### Testing

```bash
# Run tests
pnpm run test

# Run tests in watch mode
pnpm run test:watch
```

## Community

- **GitHub Discussions**: For general questions and discussions
- **Issues**: For bug reports and feature requests
- **Pull Requests**: For contributing code

## License

By contributing to MCPHub, you agree that your contributions will be licensed under the MIT License.

## Questions?

If you have any questions about contributing, feel free to:
- Open a GitHub Discussion
- Ask in an issue
- Reach out to the maintainers

Thank you for contributing to MCPHub! 🎉