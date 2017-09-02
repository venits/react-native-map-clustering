const handleSize = (num) => {
  if (num <= 0) return 0;
  if (num > 100) return 1;

  return num / 100;
};

export default handleSize;
