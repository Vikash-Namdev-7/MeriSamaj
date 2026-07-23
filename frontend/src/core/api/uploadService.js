import { axiosPrivate } from './axiosPrivate';

export const uploadService = {
  uploadSingle: (formData) => axiosPrivate.post(`/common/upload`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  uploadMultiple: (formData) => axiosPrivate.post(`/common/upload/multiple`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
};
