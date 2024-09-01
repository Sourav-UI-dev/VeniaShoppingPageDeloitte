
// Toggle the menu on mobile view
const menuIcon = document.getElementById('menu-icon');
const navbarCenter = document.getElementById('navbar-center');

const sidebar = document.querySelector('.sidebar');
const closeButton = document.querySelector('.close-button');
const btnFilter = document.querySelector('.btnFilter');
const btnSort = document.querySelector('.btnSort');
btnSort.addEventListener('touchstart', toggleOptions);


btnFilter.addEventListener('click', () => {
  sidebar.classList.toggle('active');
});

closeButton.addEventListener('click', () => {
  sidebar.classList.remove('active');
});

menuIcon.addEventListener('touchstart', toggleSidebar);

function toggleSidebar() {
  navbarCenter.classList.toggle('open');
}

function toggleOptions() {
  const options = document.getElementById('sortOptions');
  options.classList.toggle('show');
}

// Function to show the overlay loader
function showLoader() {
  const overlayLoader = document.querySelector('.overlay-loader');
  overlayLoader.style.display = 'flex';
}

// Function to hide the overlay loader
function hideLoader() {
  const overlayLoader = document.querySelector('.overlay-loader');
  overlayLoader.style.display = 'none';
}
const productContainer = document.getElementById('product-container');
const noDataMessageDiv = document.getElementById('no-data-message');

// Reference for price range
const minPriceInput1 = document.getElementById('min-price1');
const maxPriceInput1 = document.getElementById('max-price1');

const minPriceInput2 = document.getElementById('min-price2');
const maxPriceInput2 = document.getElementById('max-price2');

let allProducts = [];
let allcategories = [];
let filteredProducts = allProducts;
let categoryCheckboxes = [];
let currentSortOption = 'default'; // Track the current sorting option
let displayedProducts = 10; // Number of products displayed initially
const loadMoreButton = document.getElementById('load-more');



const fetchProducts = async (limit) => {
  try {
    showLoader();
    hideError(); // Hide any previous error messages
    const response = await fetch(`https://fakestoreapi.com/products?limit=${limit}`);
    const results = await response.json();
    if (!response.ok) {
      throw new Error('API error');
    }
    if (results.length === 0) {
      showError('no-data', 'No products found.');
      return;
    }
    // Append new products to the list
    if (allProducts.length === 0) {
      allProducts = results; // Initialize the products array if it's empty
    } else {
      allProducts = [...allProducts, ...results]; // Append more products to the array
    }
    filteredProducts = allProducts;

    if (categoryCheckboxes.length > 0) {
      filterProductsByCategory();
    }
    renderProducts(filteredProducts.slice(0, displayedProducts));
    // Check if the "Load More" button should be hidden or disabled
    if (displayedProducts === 20) {
      loadMoreButton.style.display = 'none'; // Hide button if all products are loaded
    }
    hideLoader();
  } catch (error) {
    hideLoader();
    if (error.message === 'API error') {
      showError('api', 'There was an error fetching products. Please try again later.');
    } else {
      showError('network', 'Network unavailable. Please check your internet connection.');
    }
    console.error('Error fetching products:', error);
  }
}

const renderProducts = (products) => {

  productContainer.innerHTML = '';
  products.forEach(product => {
    const productHTML = `
        <div class="product">
          <img class="product-image" src="${product.image}" alt="${product.title}">
          <h2>${product.title.slice(0, 25)}...</h2>
          <p>$${product.price}</p>
          <span><img src="/public/images/wishlist-icon.svg" alt="wishlist-icon"/>
        </div>`;
    productContainer.innerHTML += productHTML;
  });
  document.getElementById('product-count').textContent = products.length;
  if (products.length > 0) {
    noDataMessageDiv.style.display = 'none';
  } else {
    noDataMessageDiv.style.display = 'flex';
  }

}

const fetchCategories = async () => {
  try {
    const response = await fetch(`https://fakestoreapi.com/products/categories`);
    allcategories = await response.json();

    renderCategories(allcategories);
  } catch (error) {
    console.error('Error fetching products:', error);
  }
}

const renderCategories = (allCategories) => {
  const filterCategory = document.getElementById('category-filter');
  const sidebarfilterCategory = document.getElementById('sidebar-category-filter');
  filterCategory.innerHTML = "";
  allCategories.forEach(item => {
    const escapedItem = item.replace("'", "&#39;");
    const categoryHTML = `
          <label>
            <input class="category-filter-checkbox" type="checkbox" name="category" value="${escapedItem}"> ${toTitleCase(item)}
          </label>`;
    filterCategory.innerHTML += categoryHTML;
    sidebarfilterCategory.innerHTML += categoryHTML;
  });
  categoryCheckboxes = document.querySelectorAll('.category-filter-checkbox');

  categoryCheckboxes.forEach(checkbox => {
    checkbox.addEventListener('change', filterProductsByCategory);
  });
}

function toTitleCase(str) {
  return str.replace(
    /\w\S*/g,
    text => text.charAt(0).toUpperCase() + text.substring(1).toLowerCase()
  );
}


const filterProductsByCategory = () => {
  const selectedCategories = Array.from(categoryCheckboxes)
    .filter(checkbox => checkbox.checked)
    .map(checkbox => checkbox.value);

  // Filter products based on selected categories
  if (selectedCategories.length > 0) {
    filteredProducts = allProducts.filter(product =>
      selectedCategories.includes(product.category)
    );
  } else {
    filteredProducts = allProducts;
  }
  sortProducts(currentSortOption);
}

// Reference to the sort dropdown
const sortDropdown = document.getElementById('sort-options');

// Event listener for the sorting dropdown
sortDropdown.addEventListener('change', function () {
  currentSortOption = sortDropdown.value; // Update the current sorting option
  sortProducts(currentSortOption);
});

// Reference to the custom sorting links
const sortLowToHigh = document.getElementById('sort-low-to-high');
const sortHighToLow = document.getElementById('sort-high-to-low');

// Event listeners for the custom sorting options
sortLowToHigh.addEventListener('click', function (event) {
  event.preventDefault(); // Prevent the default link behavior
  currentSortOption = 'price-asc'; // Set the sort option to Low to High
  sortProducts(currentSortOption); // Apply sorting
});

sortHighToLow.addEventListener('click', function (event) {
  event.preventDefault(); // Prevent the default link behavior
  currentSortOption = 'price-desc'; // Set the sort option to High to Low
  sortProducts(currentSortOption); // Apply sorting
});

// Function to sort products based on the selected option
const sortProducts = (sortOption) => {
  if (sortOption === 'price-asc') {
    filteredProducts.sort((a, b) => a.price - b.price); // Sort by price low to high
  } else if (sortOption === 'price-desc') {
    filteredProducts.sort((a, b) => b.price - a.price); // Sort by price high to low
  }

  // Re-render the sorted products
  renderProducts(filteredProducts);
};

// Reference to the search bar
const searchBar = document.getElementById('search-bar');
const searchButton = document.getElementById('search-button');
let searchQuery = ''; // Global variable to store the current search query


// Search function to filter products based on user input
const searchProducts = (searchQuery) => {
  const lowerCaseQuery = searchQuery.toLowerCase(); // Normalize the search query to lowercase for case-insensitive search

  // Filter the products by checking if the title includes the search query
  const searchResults = filteredProducts.filter(product =>
    product.title.toLowerCase().includes(lowerCaseQuery)
  );

  // Render the filtered products
  renderProducts(searchResults);
  // Hide or show the "Load More" button based on filtered results
  if (searchResults.length <= displayedProducts || displayedProducts >= 20) {
    loadMoreButton.style.display = 'none';
  } else {
    loadMoreButton.style.display = 'block';
  }
};

// Event listener for search button
// searchButton.addEventListener('click', () => {
//   const searchQuery = searchBar.value.trim(); // Get the search query from the input field
//   searchProducts(searchQuery); // Call the search function with the input value
// });

// Optionally, we can add an instant search feature using the input event on the search bar
searchBar.addEventListener('input', () => {
  searchQuery = searchBar.value.trim();
  searchProducts(searchQuery);
});

document.getElementById('load-more').addEventListener('click', () => {
  displayedProducts += 10;
  fetchProducts(displayedProducts);
});


// Function to apply search, filter, and sorting in sequence
const applyFiltersAndSort = () => {
  let filteredResults = [...allProducts];

  // Apply search
  if (searchQuery) {
    filteredResults = filteredResults.filter(product =>
      product.title.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }

  // Apply category filters
  const selectedCategories = Array.from(categoryCheckboxes)
    .filter(checkbox => checkbox.checked)
    .map(checkbox => checkbox.value);

  if (selectedCategories.length > 0) {
    filteredResults = filteredResults.filter(product =>
      selectedCategories.includes(product.category)
    );
  }

  // Handle price range filter
  const minPrice = parseFloat(minPriceInput1.value) || parseFloat(minPriceInput2.value) || 0;
  const maxPrice = parseFloat(maxPriceInput1.value) || parseFloat(maxPriceInput2.value) || Infinity;

  filteredResults = filteredResults.filter(product =>
    product.price >= minPrice && product.price <= maxPrice
  );

  // Apply sorting
  const selectedSortOption = document.getElementById('sort-options').value;
  if (selectedSortOption === 'price-asc') {
    filteredResults.sort((a, b) => a.price - b.price);
  } else if (selectedSortOption === 'price-desc') {
    filteredResults.sort((a, b) => b.price - a.price);
  }

  // Render the final filtered, searched, and sorted results
  renderProducts(filteredResults);

  // Hide or show the "Load More" button based on filtered results
  if (filteredResults.length <= displayedProducts || displayedProducts >= 20) {
    loadMoreButton.style.display = 'none';
  } else {
    loadMoreButton.style.display = 'block';
  }

  // Update the product count
  document.getElementById('product-count').textContent = filteredResults.length;
};


const applyPriceFilterButtons = document.querySelectorAll('#apply-price-filter');

applyPriceFilterButtons.forEach((btn) => {
  btn.addEventListener('click', () => {
    displayedProducts = 10; // Reset to initial load
    applyFiltersAndSort();
  });
});



// Event listener for sorting options
document.getElementById('sort-options').addEventListener('change', () => {
  applyFiltersAndSort();
});
// Custom sort options click event (Price: Low to High, High to Low)
document.querySelector('.custom-sort-options').addEventListener('click', (e) => {
  if (e.target.tagName === 'A') {
    if (e.target.textContent === 'Price: Low to High') {
      document.getElementById('sort-options').value = 'price-asc';
    } else if (e.target.textContent === 'Price: High to Low') {
      document.getElementById('sort-options').value = 'price-desc';
    }
    applyFiltersAndSort(); // Apply sorting when custom sort options are clicked
  }
});

// refernce for clear all filter button
const clearAllFiltersButton = document.querySelectorAll('.btnClearAll');


clearAllFiltersButton.forEach(clearALLBtn => {
  clearALLBtn.addEventListener('click', () => {
    // Clear search input
    searchBar.value = '';
    searchQuery = '';

    // Clear category checkboxes
    categoryCheckboxes.forEach(checkbox => checkbox.checked = false);

    // Clear price range inputs
    minPriceInput1.value = '';
    maxPriceInput1.value = '';
    minPriceInput2.value = '';
    maxPriceInput2.value = '';

    // Reset sort option
    document.getElementById('sort-options').value = 'default';

    // Reset product display
    displayedProducts = 10;
    applyFiltersAndSort();
  });
});


// Error handling
const errorMessageDiv = document.getElementById('error-message');
const errorIcon = document.getElementById('error-icon');
const errorText = document.getElementById('error-text');

const showError = (type, message) => {
  errorIcon.className = `error-icon ${type}`;
  errorText.textContent = message;
  errorMessageDiv.style.display = 'flex';
  if (type !== 'no-data') {
    document.getElementById('main-section').style.display = 'none';
  }
};

const hideError = () => {
  errorMessageDiv.style.display = 'none';
  document.getElementById('main-section').style.display = 'block';
};


// Call the fetch function when the page loads
fetchProducts(displayedProducts);
fetchCategories();
