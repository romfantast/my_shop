function reindex(array) {
  const newArray = {};
  for (let i = 0; i < array.length; i++) {
    const product = array[i];
    newArray[product.id] = product;
  }

  return newArray;
}

module.exports = {
  reindex,
};
