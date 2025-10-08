// Advanced Search & Filter System
class AdvancedSearch {
    constructor() {
        this.filters = {
            location: '',
            minPrice: '',
            maxPrice: '',
            category: '',
            amenities: [],
            propertyType: '',
            guests: ''
        };
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.loadFiltersFromURL();
    }

    setupEventListeners() {
        // Search input with debounce
        const searchInput = document.getElementById('search-input');
        if (searchInput) {
            let timeout;
            searchInput.addEventListener('input', (e) => {
                clearTimeout(timeout);
                timeout = setTimeout(() => {
                    this.filters.location = e.target.value;
                    this.applyFilters();
                }, 500);
            });
        }

        // Price range sliders
        const minPriceSlider = document.getElementById('min-price');
        const maxPriceSlider = document.getElementById('max-price');
        
        if (minPriceSlider && maxPriceSlider) {
            minPriceSlider.addEventListener('input', (e) => {
                this.filters.minPrice = e.target.value;
                document.getElementById('min-price-display').textContent = `₹${parseInt(e.target.value).toLocaleString()}`;
                this.applyFilters();
            });

            maxPriceSlider.addEventListener('input', (e) => {
                this.filters.maxPrice = e.target.value;
                document.getElementById('max-price-display').textContent = `₹${parseInt(e.target.value).toLocaleString()}`;
                this.applyFilters();
            });
        }

        // Category filters
        document.querySelectorAll('.category-filter').forEach(btn => {
            btn.addEventListener('click', (e) => {
                document.querySelectorAll('.category-filter').forEach(b => b.classList.remove('active'));
                e.target.classList.add('active');
                this.filters.category = e.target.dataset.category;
                this.applyFilters();
            });
        });

        // Amenity checkboxes
        document.querySelectorAll('.amenity-checkbox').forEach(checkbox => {
            checkbox.addEventListener('change', (e) => {
                if (e.target.checked) {
                    this.filters.amenities.push(e.target.value);
                } else {
                    this.filters.amenities = this.filters.amenities.filter(a => a !== e.target.value);
                }
                this.applyFilters();
            });
        });

        // Clear filters
        const clearBtn = document.getElementById('clear-filters');
        if (clearBtn) {
            clearBtn.addEventListener('click', () => this.clearAllFilters());
        }
    }

    applyFilters() {
        const params = new URLSearchParams();
        
        Object.keys(this.filters).forEach(key => {
            if (this.filters[key] && this.filters[key].length > 0) {
                if (Array.isArray(this.filters[key])) {
                    this.filters[key].forEach(value => params.append(key, value));
                } else {
                    params.set(key, this.filters[key]);
                }
            }
        });

        // Update URL without page reload
        const newUrl = `${window.location.pathname}?${params.toString()}`;
        window.history.pushState({}, '', newUrl);
        
        // Fetch filtered results
        this.fetchFilteredResults(params);
    }

    async fetchFilteredResults(params) {
        try {
            const response = await fetch(`/api/listings/filter?${params.toString()}`);
            const data = await response.json();
            this.updateListingsDisplay(data.listings);
            this.updateResultsCount(data.count);
        } catch (error) {
            console.error('Filter error:', error);
        }
    }

    updateListingsDisplay(listings) {
        const container = document.getElementById('listings-container');
        if (!container) return;

        if (listings.length === 0) {
            container.innerHTML = `
                <div class="no-results">
                    <i class="fas fa-search"></i>
                    <h3>No listings found</h3>
                    <p>Try adjusting your filters</p>
                </div>
            `;
            return;
        }

        container.innerHTML = listings.map(listing => `
            <div class="listing-card" data-aos="fade-up">
                <a href="/listings/${listing._id}" class="listing-link">
                    <div class="listing-image">
                        <img src="${listing.image.url}" alt="${listing.title}" loading="lazy">
                        <button class="wishlist-btn" data-listing-id="${listing._id}">
                            <i class="far fa-heart"></i>
                        </button>
                    </div>
                    <div class="listing-content">
                        <div class="listing-location">${listing.location}, ${listing.country}</div>
                        <h3 class="listing-title">${listing.title}</h3>
                        <div class="listing-price">₹${listing.price.toLocaleString()} <span>night</span></div>
                        <div class="listing-rating">
                            <i class="fas fa-star"></i>
                            <span>${listing.averageRating || 'New'}</span>
                        </div>
                    </div>
                </a>
            </div>
        `).join('');
    }

    updateResultsCount(count) {
        const countElement = document.getElementById('results-count');
        if (countElement) {
            countElement.textContent = `${count} properties found`;
        }
    }

    clearAllFilters() {
        this.filters = {
            location: '',
            minPrice: '',
            maxPrice: '',
            category: '',
            amenities: [],
            propertyType: '',
            guests: ''
        };
        
        // Reset UI
        document.getElementById('search-input').value = '';
        document.querySelectorAll('.category-filter').forEach(btn => btn.classList.remove('active'));
        document.querySelectorAll('.amenity-checkbox').forEach(cb => cb.checked = false);
        
        this.applyFilters();
    }

    loadFiltersFromURL() {
        const params = new URLSearchParams(window.location.search);
        params.forEach((value, key) => {
            if (key === 'amenities') {
                this.filters.amenities.push(value);
            } else {
                this.filters[key] = value;
            }
        });
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new AdvancedSearch();
});