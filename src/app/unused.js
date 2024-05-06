function calculateFactorizedRatio(length, width) {
  // Find the greatest common factor (GCF) of length and width
  function findGCF(a, b) {
    if (b === 0) {
      return a;
    }
    return findGCF(b, a % b);
  }

  // Calculate the GCF
  const gcf = findGCF(length, width);

  // Calculate the simplified ratio
  const simplifiedLength = length / gcf;
  const simplifiedWidth = width / gcf;

  // Return the factorized ratio as a string
  return `${simplifiedLength}:${simplifiedWidth}`;
}
