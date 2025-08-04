type DataRequestOptions = {
  skip?: number;
  take?: number;
  order?: {
    createdAt: 'asc' | 'desc';
  };
};
