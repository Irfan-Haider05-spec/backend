export const generateCardCode = () => {
  const randomNumber = Math.floor(100000 + Math.random() * 900000); // 6 digit
  return `DG-${randomNumber}`;
};
