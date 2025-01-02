document.addEventListener('DOMContentLoaded', function() {
  const usdInput = document.getElementById('usd-amount');
  const resultDisplay = document.getElementById('result');
  const rate = parseFloat(document.getElementById('rate').textContent);

  usdInput.addEventListener('input', function() {
    const usdAmount = parseFloat(this.value);
    if (!isNaN(usdAmount)) {
      const crcAmount = (usdAmount * rate).toFixed(2);
      resultDisplay.textContent = `${usdAmount} USD = ${crcAmount} CRC`;
    } else {
      resultDisplay.textContent = '';
    }
  });
}); 