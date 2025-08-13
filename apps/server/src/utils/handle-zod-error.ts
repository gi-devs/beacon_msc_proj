import { ZodError } from 'zod';
import { CustomError } from '@/utils/custom-error';

export function handleZodError(e: unknown): never {
  if (!(e instanceof ZodError)) throw e;

  const customIssue = e.issues.find((i) => i.code === 'custom');
  const issueToShow = customIssue ?? e.issues[0];

  let message = issueToShow.message;

  if (issueToShow.code === 'invalid_type' && issueToShow.path.length > 0) {
    const fieldName = String(issueToShow.path.at(-1));
    message = `${fieldName} must be a ${issueToShow.expected}`;
  }

  if (!message) {
    message = 'Bad Request, invalid input data.';
  }

  throw new CustomError(message, 400);
}
