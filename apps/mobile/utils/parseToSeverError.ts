import axios from 'axios';

export function parseToSeverError(error: unknown) {
  if (axios.isAxiosError(error) && error.response?.data) {
    const data = error.response.data as ServerErrorResponse;
    return {
      message: data.message ?? 'Unknown error',
      statusCode: data.statusCode ?? 500,
      code: data.code ?? 'UNKNOWN',
    };
  }

  return {
    message: 'Unexpected error occurred',
    statusCode: 500,
    code: 'UNEXPECTED_ERROR',
  };
}
