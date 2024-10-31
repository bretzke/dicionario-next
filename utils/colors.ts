export const getRandomHexColor = () => {
  const hex = Math.floor(Math.random() * 0xffffff);
  const hexString = `#${hex.toString(16).padStart(6, "0")}`;
  return hexString;
};

