function normalizePrice(price) {
  return price.toFixed(2).replace(/\d(?=(\d{3})+\.)/g, "$& ");
}

module.exports = {
  normalizePrice,
};
