// Global variable to store book data
let bookList = [];
let currentFilteredBooks = bookList; // Keep track of the current filtered books
let currentSearchTerm = ''; // Keep track of the current search term

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

// Function to generate HTML for rating stars
function generateRatingStars(rating) {
    const fullStar = '<img src="images/star-16.ico" alt="★">';
    const emptyStar = '<img src="images/outline-star-16.ico" alt="☆">';
    return fullStar.repeat(rating) + emptyStar.repeat(5 - rating);
}

// Load categories into dropdown
function loadCategories() {
    const categorySelect = document.getElementById('categorySelect');
    const categories = [...new Set(bookList.map(book => book.category))];

    categorySelect.innerHTML = `
        <option value="">All Categories</option>
        ${categories.map(category =>
        `<option value="${category}">${category}</option>`
    ).join('')}
        <option value="Comics">Comics</option>
    `;
}

// Search functionality
function searchBooks(isButtonClick = false) {
    if (!isButtonClick) return; // 只在点击按钮时执行

    currentSearchTerm = document.getElementById('searchInput').value.toLowerCase();
    highlightMatches();
}

// Highlight matching function
function highlightMatches() {
    const rows = document.querySelectorAll('#searchResults tbody tr');
    let hasMatches = false;

    if (currentSearchTerm !== '') {
        rows.forEach(row => {
            const titleCell = row.querySelector('.book-title');
            const title = titleCell.textContent.toLowerCase();

            row.classList.remove('highlight-match');

            if (title.includes(currentSearchTerm)) {
                row.classList.add('highlight-match');
                hasMatches = true;
            }
        });

        if (!hasMatches) {
            alert('No books found matching your search term.');
        }
    }
}

// Shopping cart function
let cartItems = [];

// Handle checkbox single-select
function handleCheckboxClick(clickedCheckbox) {
    const checkboxes = document.querySelectorAll('.book-select');
    checkboxes.forEach(checkbox => {
        if (checkbox !== clickedCheckbox) {
            checkbox.checked = false;
        }
    });
}

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

// Filter functionality
function filterBooks() {
    const selectedCategory = document.getElementById('categorySelect').value;

    if (!selectedCategory) {
        currentFilteredBooks = bookList;
    } else {
        currentFilteredBooks = bookList.filter(book =>
            book.category === selectedCategory
        );

        if (currentFilteredBooks.length === 0) {
            alert('No books found in this category.');
            currentFilteredBooks = bookList;
            document.getElementById('categorySelect').value = '';
        }
    }

    displayBooks(currentFilteredBooks);
    // 重新应用当前的搜索高亮
    highlightMatches();
}

// Reset search
function resetSearch() {
    document.getElementById('searchInput').value = '';
    currentSearchTerm = '';
    const rows = document.querySelectorAll('#searchResults tbody tr');
    rows.forEach(row => {
        row.classList.remove('highlight-match');
    });
}

// Reset filter
function resetFilter() {
    document.getElementById('categorySelect').value = '';
    currentFilteredBooks = bookList;
    displayBooks(bookList);
    // 重新应用当前的搜索高亮
    highlightMatches();
}

// Toggle dark mode
function toggleDarkMode() {
    document.body.classList.toggle('dark-mode');
    const isDarkMode = document.body.classList.contains('dark-mode');
    localStorage.setItem('darkMode', isDarkMode);
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
        background-color: #fff3cd !important;  // 浅黄色高亮
    }
`;
document.head.appendChild(style);
