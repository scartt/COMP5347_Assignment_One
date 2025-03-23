// Global variable to store book data
let bookList = [];
let currentFilteredBooks = bookList;
let currentSearchTerm = '';
let currentCategory = '';

// Load book data from JSON file
async function loadBookData() {
    try {
        const response = await fetch('./data.json');
        bookList = await response.json();
        displayBooks(bookList);
        loadCategories();
    } catch (error) {
        console.error('Error loading book data:', error);
    }
}

// Function to Display book list
function displayBooks(books) {
    const tbody = document.querySelector('#searchResults tbody');
    tbody.innerHTML = '';

    books.forEach((book, index) => {
        const row = document.createElement('tr');
        const ratingHtml = generateRatingStars(parseInt(book.rating));

        row.innerHTML = `
            <td>
                <div class="book-container">
                    <input type="checkbox" class="book-select" data-book-index="${index}">
                    <div class="book-info">
                        <img src="${book.img}" alt="${book.title}" class="book-cover">
                        <div class="book-title">${book.title}</div>
                    </div>
                </div>
            </td>
            <td class="rating-column">${ratingHtml}</td>
            <td>${book.authors}</td>
            <td>${book.year}</td>
            <td>$${book.price}</td>
            <td>${book.publisher}</td>
            <td>${book.category}</td>
        `;

        tbody.appendChild(row);

        // Add single-select functionality to checkbox
        const checkbox = row.querySelector('.book-select');
        checkbox.addEventListener('click', () => handleCheckboxClick(checkbox));
    });
}

// Handle checkbox single-select
function handleCheckboxClick(clickedCheckbox) {
    const checkboxes = document.querySelectorAll('.book-select');
    checkboxes.forEach(checkbox => {
        if (checkbox !== clickedCheckbox) {
            checkbox.checked = false;
        }
    });
}

// Function to generate HTML for rating stars
function generateRatingStars(rating) {
    const fullStar = '<img src="images/star-16.ico" alt="★">';
    const emptyStar = '<img src="images/outline-star-16.ico" alt="☆">';
    return fullStar.repeat(rating) + emptyStar.repeat(5 - rating);
}

// Load categories into dropdown
function loadCategories() {
    const categorySelect = document.getElementById('categorySelect');
    const categories = [];

    // Manually collect categories and remove duplicates
    for (let i = 0; i < bookList.length; i++) {
        const category = bookList[i].category;
        if (!categories.includes(category)) {
            categories.push(category);
        }
    }

    // Build dropdown options HTML
    let optionsHtml = '<option value="">All Categories</option>';
    for (let i = 0; i < categories.length; i++) {
        optionsHtml += `<option value="${categories[i]}">${categories[i]}</option>`;
    }
    optionsHtml += '<option value="Comics">Comics</option>';

    categorySelect.innerHTML = optionsHtml;
}

// Search functionality - only executes on button click
function searchBooks(isButtonClick = false) {
    if (!isButtonClick) return;

    currentSearchTerm = document.getElementById('searchInput').value.toLowerCase();
    applyFiltersAndSearch();
}

// Filter functionality - executes on category change
function filterBooks() {
    currentCategory = document.getElementById('categorySelect').value;
    applyFiltersAndSearch();
}

// Core function to combine search and filter
function applyFiltersAndSearch() {
    // First apply category filter
    let filteredBooks = currentCategory ?
        bookList.filter(book => book.category === currentCategory) :
        bookList;

    // Then apply search if there's a search term
    if (currentSearchTerm) {
        const searchResults = filteredBooks.filter(book =>
            book.title.toLowerCase().includes(currentSearchTerm)
        );

        // If no matches found, show alert and empty list
        if (searchResults.length === 0) {
            alert('No books found matching your search term.');
            displayBooks([]);  // Display empty list
            return;
        }

        // Display results and highlight matches
        displayBooks(filteredBooks);
        highlightMatches();
    } else {
        // If no search term, just display filtered books
        displayBooks(filteredBooks);
    }
}

// Helper function to highlight matching titles
function highlightMatches() {
    const rows = document.querySelectorAll('#searchResults tbody tr');
    rows.forEach(row => {
        const titleCell = row.querySelector('.book-title');
        const title = titleCell.textContent.toLowerCase();

        row.classList.remove('highlight-match');
        if (title.includes(currentSearchTerm)) {
            row.classList.add('highlight-match');
        }
    });
}

// Reset search - clears search term and highlighting
function resetSearch() {
    document.getElementById('searchInput').value = '';
    currentSearchTerm = '';
    const rows = document.querySelectorAll('#searchResults tbody tr');
    rows.forEach(row => {
        row.classList.remove('highlight-match');
    });
    applyFiltersAndSearch();
}

// Reset filter - clears category selection
function resetFilter() {
    document.getElementById('categorySelect').value = '';
    currentCategory = '';
    applyFiltersAndSearch();
}

// Shopping cart function
let cartItems = [];


// Add to cart
function addToCart() {
    const selectedCheckbox = document.querySelector('.book-select:checked');

    if (!selectedCheckbox) {
        alert('Please select a book first');
        return;
    }

    const bookIndex = selectedCheckbox.getAttribute('data-book-index');
    const selectedBook = bookList[parseInt(bookIndex)];

    const quantity = prompt(`Enter quantity for "${selectedBook.title}":`, "1");

    if (quantity === null) {
        selectedCheckbox.checked = false;
        return;
    }

    const quantityNum = parseInt(quantity);
    if (isNaN(quantityNum) || quantityNum <= 0) {
        alert('Please enter a valid positive number');
        return;
    }

    const cartCount = document.querySelector('.cart-count');
    cartCount.textContent = `(${quantityNum})`;
    selectedCheckbox.checked = false;
    alert(`Added ${quantityNum} copy/copies of "${selectedBook.title}" to cart`);
}

// Reset cart
function resetCart() {
    if (confirm("Are you sure you want to reset the cart?")) {
        const cartCount = document.querySelector('.cart-count');
        cartCount.textContent = '(0)';

        const checkboxes = document.querySelectorAll('.book-select');
        checkboxes.forEach(checkbox => {
            checkbox.checked = false;
        });
    }
}

// Toggle dark mode
function toggleDarkMode() {
    const body = document.body;
    if (body.classList.contains('dark-mode')) {
        body.classList.remove('dark-mode');
        localStorage.setItem('darkMode', 'false');
    } else {
        body.classList.add('dark-mode');
        localStorage.setItem('darkMode', 'true');
    }
}

// Initialize dark mode
function initDarkMode() {
    const isDarkMode = localStorage.getItem('darkMode') === 'true';
    if (isDarkMode) {
        document.body.classList.add('dark-mode');
        document.getElementById('darkModeToggle').checked = true;
    }
}

// Initialize all features when page loads
document.addEventListener('DOMContentLoaded', () => {
    loadBookData();

    // Add event listeners
    document.getElementById('searchButton').addEventListener('click', () => {
        searchBooks(true);
    });
    document.getElementById('resetSearchBtn').addEventListener('click', resetSearch);
    document.getElementById('searchInput').addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            searchBooks();
        }
    });

    document.getElementById('filterBtn').addEventListener('click', filterBooks);
    document.getElementById('resetFilterBtn').addEventListener('click', resetFilter);

    document.getElementById('addToCartBtn').addEventListener('click', addToCart);
    document.getElementById('resetCartBtn').addEventListener('click', resetCart);

    document.getElementById('darkModeToggle').addEventListener('change', toggleDarkMode);
    initDarkMode();

    // Remove real-time search event listener
    // document.getElementById('searchInput').removeEventListener('input', searchBooks);
});

// Add CSS for highlight
const style = document.createElement('style');
style.textContent = `
    .highlight-match {
        background-color: #fff3cd !important;  
    }
`;
document.head.appendChild(style);
