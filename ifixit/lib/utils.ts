export const ensureAbsoluteUrl = (url: string, root: string) => {
  return url.startsWith("http") ? url : `${root}${url}`;
};
