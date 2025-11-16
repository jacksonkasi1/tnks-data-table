'use server';

// ** import types
import type { Feedback, ActionResponse } from '@/components/feedback';

const GITHUB_REPO = 'jacksonkasi1/tnks-data-table';
const GITHUB_API_URL = 'https://api.github.com';

export async function onRateAction(
  url: string,
  feedback: Feedback,
): Promise<ActionResponse> {
  const { opinion, message } = feedback;

  // Create GitHub issue title and body
  const title = `[Docs Feedback] ${opinion === 'good' ? '👍' : '👎'} ${url}`;
  const body = `
## Documentation Feedback

**Page:** ${url}
**Rating:** ${opinion === 'good' ? '👍 Good' : '👎 Bad'}

### Feedback Message:
${message}

---
**Page URL:** https://tnks-docs.vercel.app${url}

*This feedback was submitted from the documentation.*
  `.trim();

  try {
    // Check if GitHub App credentials are configured
    const githubAppId = process.env.GITHUB_APP_ID;
    const githubAppPrivateKey = process.env.GITHUB_APP_PRIVATE_KEY;

    if (githubAppId && githubAppPrivateKey) {
      // TODO: Implement GitHub App authentication and create issue
      // This requires installing a GitHub App and setting up JWT authentication
      // For now, we'll just log and return the issues page URL
      console.log('GitHub App configured - would create issue:', {
        title,
        body,
      });
    } else {
      // Log feedback for now (can be sent to analytics, database, etc.)
      console.log('Feedback received:', {
        url,
        opinion,
        message,
        timestamp: new Date().toISOString(),
      });
    }

    // Return the GitHub issues URL for manual submission
    const issueUrl = `https://github.com/${GITHUB_REPO}/issues/new?labels=documentation,feedback&title=${encodeURIComponent(title)}&body=${encodeURIComponent(body)}`;

    return {
      githubUrl: issueUrl,
    };
  } catch (error) {
    console.error('Error handling feedback:', error);

    // Fallback to issues page
    return {
      githubUrl: `https://github.com/${GITHUB_REPO}/issues/new`,
    };
  }
}
