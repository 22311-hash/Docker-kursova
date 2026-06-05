// API Endpoint (Using relative path as Nginx reverse proxies it)
const API_BASE_URL = '/api';

// DOM Elements
const carGrid = document.getElementById('car-grid');
const addCarForm = document.getElementById('add-car-form');
const searchInput = document.getElementById('search-input');
const filterEngine = document.getElementById('filter-engine');
const sortBy = document.getElementById('sort-by');
const resultsCount = document.getElementById('results-count');

// Stat Elements
const valTotalCars = document.getElementById('val-total-cars');
const valFleetValue = document.getElementById('val-fleet-value');
const valAvgPrice = document.getElementById('val-avg-price');

// State
let debounceTimer;

// Fetch and render cars
async function fetchCars() {
  try {
    const search = searchInput.value;
    const engineType = filterEngine.value;
    const sort = sortBy.value;

    let queryParams = new URLSearchParams();
    if (search) queryParams.append('search', search);
    if (engineType) queryParams.append('engineType', engineType);
    if (sort) queryParams.append('sortBy', sort);

    const response = await fetch(`${API_BASE_URL}/cars?${queryParams.toString()}`);
    if (!response.ok) throw new Error('Възникна проблем при зареждане на колите');
    
    const cars = await response.json();
    renderCars(cars);
  } catch (error) {
    console.error(error);
    carGrid.innerHTML = `
      <div class="empty-state">
        <i class="ph ph-warning-circle" style="color: var(--accent-red)"></i>
        <span>Грешка при свързване със сървъра!</span>
      </div>
    `;
  }
}

// Fetch stats and update header
async function fetchStats() {
  try {
    const response = await fetch(`${API_BASE_URL}/stats`);
    if (!response.ok) throw new Error('Възникна проблем при зареждане на статистиката');
    
    const stats = await response.json();
    
    valTotalCars.innerText = stats.totalCars;
    valFleetValue.innerText = formatPrice(stats.totalFleetValue);
    valAvgPrice.innerText = formatPrice(stats.averagePrice);
  } catch (error) {
    console.error('Error fetching stats:', error);
  }
}

// Format Price helper
function formatPrice(number) {
  if (number === undefined || number === null) return '-';
  return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(number);
}

// Translate engine type
function translateEngine(type) {
  switch (type) {
    case 'Petrol': return 'Бензин';
    case 'Diesel': return 'Дизел';
    case 'Electric': return 'Електрически';
    case 'Hybrid': return 'Хибрид';
    default: return type;
  }
}

// Render cars to DOM
function renderCars(cars) {
  if (cars.length === 0) {
    resultsCount.innerText = '0 намерени';
    carGrid.innerHTML = `
      <div class="empty-state">
        <i class="ph ph-magnifying-glass"></i>
        <span>Няма намерени автомобили по тези критерии.</span>
      </div>
    `;
    return;
  }

  resultsCount.innerText = `${cars.length} намерени`;
  
  carGrid.innerHTML = cars.map(car => {
    const engineClass = car.engineType.toLowerCase();
    return `
      <div class="car-card" data-id="${car._id}">
        <div class="car-img-container">
          <img src="${car.imageUrl}" alt="${car.brand} ${car.model}" onerror="this.src='https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&q=80&w=800'">
          <span class="engine-badge ${engineClass}">${translateEngine(car.engineType)}</span>
        </div>
        <div class="car-info">
          <div class="car-title">
            <h3>${car.brand} ${car.model} <span>${car.year} г.</span></h3>
            <span class="car-price">${formatPrice(car.price)}</span>
          </div>
          <p class="car-description">${car.description}</p>
          <div class="car-specs">
            <div class="spec-item">
              <span class="spec-val">${car.horsepower} к.с.</span>
              <span class="spec-lbl">Мощност</span>
            </div>
            <div class="spec-item">
              <span class="spec-val">${car.torque} Nm</span>
              <span class="spec-lbl">Въртящ момент</span>
            </div>
            <div class="spec-item">
              <span class="spec-val">${car.acceleration} сек</span>
              <span class="spec-lbl">0-100 км/ч</span>
            </div>
          </div>
          <button class="btn-delete" onclick="deleteCar('${car._id}')">
            <i class="ph ph-trash"></i> Изтрий от каталога
          </button>
        </div>
      </div>
    `;
  }).join('');
}

// Add a new car
addCarForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  
  const submitButton = addCarForm.querySelector('.btn-submit');
  const originalBtnContent = submitButton.innerHTML;
  submitButton.disabled = true;
  submitButton.innerHTML = `<i class="ph ph-spinner spinner"></i> Изпращане...`;

  const newCar = {
    brand: document.getElementById('car-brand').value.trim(),
    model: document.getElementById('car-model').value.trim(),
    year: parseInt(document.getElementById('car-year').value),
    price: parseInt(document.getElementById('car-price').value),
    engineType: document.getElementById('car-engine').value,
    horsepower: parseInt(document.getElementById('car-hp').value),
    torque: parseInt(document.getElementById('car-torque').value),
    acceleration: parseFloat(document.getElementById('car-acceleration').value),
    imageUrl: document.getElementById('car-image').value.trim(),
    description: document.getElementById('car-desc').value.trim()
  };

  try {
    const response = await fetch(`${API_BASE_URL}/cars`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(newCar)
    });

    if (!response.ok) {
      const errData = await response.json();
      throw new Error(errData.error || 'Проблем при запис');
    }

    addCarForm.reset();
    alert('Автомобилът е добавен успешно!');
    
    // Refresh list and stats
    await fetchCars();
    await fetchStats();
  } catch (error) {
    alert(`Грешка: ${error.message}`);
  } finally {
    submitButton.disabled = false;
    submitButton.innerHTML = originalBtnContent;
  }
});

// Delete car function
async function deleteCar(id) {
  if (!confirm('Сигурни ли сте, че искате да изтриете този автомобил?')) return;
  
  try {
    const response = await fetch(`${API_BASE_URL}/cars/${id}`, {
      method: 'DELETE'
    });

    if (!response.ok) throw new Error('Грешка при изтриване');
    
    // Refresh list and stats
    await fetchCars();
    await fetchStats();
  } catch (error) {
    alert(`Грешка при изтриване: ${error.message}`);
  }
}

// Debounce search input
searchInput.addEventListener('input', () => {
  clearTimeout(debounceTimer);
  debounceTimer = setTimeout(() => {
    fetchCars();
  }, 300);
});

// Event Listeners for Filters
filterEngine.addEventListener('change', fetchCars);
sortBy.addEventListener('change', fetchCars);

// Initialize App
document.addEventListener('DOMContentLoaded', () => {
  fetchCars();
  fetchStats();
});
