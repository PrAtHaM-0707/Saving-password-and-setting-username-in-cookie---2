const MIN = 100;
const MAX = 999;
const pinInput = document.getElementById('pin');
const sha256HashView = document.getElementById('sha256-hash');
const resultView = document.getElementById('result');

// Store data in localStorage
function store(key, value) {
  localStorage.setItem(key, value);
}

// Retrieve data from localStorage
function retrieve(key) {
  return localStorage.getItem(key);
}

// Generate a random number between min and max (inclusive)
function getRandomArbitrary(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// Clear localStorage
function clear() {
  localStorage.clear();
}

// Generate SHA256 hash of a string
async function sha256(message) {
  const msgBuffer = new TextEncoder().encode(message);
  const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
}

// Get or generate the SHA256 hash
async function getSHA256Hash() {
  let cached = retrieve('sha256');
  if (cached) {
    return cached;
  }

  const randomNum = getRandomArbitrary(MIN, MAX).toString();
  cached = await sha256(randomNum);
  store('sha256', cached);
  return cached;
}

// Main function to display the hash
async function main() {
  if (sha256HashView) { // Check if element exists (for page2.html compatibility)
    sha256HashView.innerHTML = 'Calculating...';
    try {
      const hash = await getSHA256Hash();
      sha256HashView.innerHTML = hash;
    } catch (error) {
      sha256HashView.innerHTML = 'Error calculating hash';
      console.error(error);
    }
  }
}

// Test the user's guess
async function test() {
  const pin = pinInput.value;

  if (pin.length !== 3) {
    resultView.innerHTML = '💡 Not 3 digits';
    resultView.classList.remove('hidden');
    return;
  }

  const hashedPin = await sha256(pin);
  if (hashedPin === sha256HashView.innerHTML) {
    resultView.innerHTML = '🎉 Success';
    resultView.classList.add('success');
  } else {
    resultView.innerHTML = '❌ Failed';
  }
  resultView.classList.remove('hidden');
}

// Restrict pinInput to 3 digits and numbers only
if (pinInput) {
  pinInput.addEventListener('input', (e) => {
    const { value } = e.target;
    pinInput.value = value.replace(/\D/g, '').slice(0, 3);
  });
}

// Attach test function to the check button
const checkButton = document.getElementById('check');
if (checkButton) {
  checkButton.addEventListener('click', test);
}

// Run main on page load
main();