class SearchService {
  static buildSearchQuery(filters) {
    let query = {};
    let sort = {};

    // Location search
    if (filters.where) {
      query.$or = [
        { title: { $regex: filters.where, $options: 'i' } },
        { location: { $regex: filters.where, $options: 'i' } },
        { country: { $regex: filters.where, $options: 'i' } }
      ];
    }

    // Price range
    if (filters.minPrice || filters.maxPrice) {
      query.price = {};
      if (filters.minPrice) query.price.$gte = parseInt(filters.minPrice);
      if (filters.maxPrice) query.price.$lte = parseInt(filters.maxPrice);
    }

    // Property type
    if (filters.propertyType && filters.propertyType !== 'all') {
      query.category = filters.propertyType;
    }

    // Amenities
    if (filters.amenities && filters.amenities.length > 0) {
      query.amenities = { $in: filters.amenities };
    }

    // Rating filter
    if (filters.minRating) {
      query.averageRating = { $gte: parseFloat(filters.minRating) };
    }

    // Instant book
    if (filters.instantBook === 'true') {
      query.instantBook = true;
    }

    // Sorting
    switch (filters.sortBy) {
      case 'price_low':
        sort.price = 1;
        break;
      case 'price_high':
        sort.price = -1;
        break;
      case 'rating':
        sort.averageRating = -1;
        break;
      case 'newest':
        sort.createdAt = -1;
        break;
      default:
        sort.createdAt = -1;
    }

    return { query, sort };
  }

  static buildAvailabilityQuery(checkin, checkout) {
    if (!checkin || !checkout) return {};

    const checkinDate = new Date(checkin);
    const checkoutDate = new Date(checkout);

    return {
      $and: [
        {
          $or: [
            { unavailableDates: { $exists: false } },
            { unavailableDates: { $size: 0 } },
            {
              unavailableDates: {
                $not: {
                  $elemMatch: {
                    $or: [
                      {
                        $and: [
                          { start: { $lte: checkinDate } },
                          { end: { $gte: checkinDate } }
                        ]
                      },
                      {
                        $and: [
                          { start: { $lte: checkoutDate } },
                          { end: { $gte: checkoutDate } }
                        ]
                      },
                      {
                        $and: [
                          { start: { $gte: checkinDate } },
                          { end: { $lte: checkoutDate } }
                        ]
                      }
                    ]
                  }
                }
              }
            }
          ]
        }
      ]
    };
  }

  static async getSearchSuggestions(query) {
    const Listing = require('../models/listing');
    
    const suggestions = await Listing.aggregate([
      {
        $match: {
          $or: [
            { location: { $regex: query, $options: 'i' } },
            { country: { $regex: query, $options: 'i' } },
            { title: { $regex: query, $options: 'i' } }
          ]
        }
      },
      {
        $group: {
          _id: null,
          locations: { $addToSet: '$location' },
          countries: { $addToSet: '$country' }
        }
      },
      {
        $project: {
          suggestions: {
            $slice: [
              { $setUnion: ['$locations', '$countries'] },
              5
            ]
          }
        }
      }
    ]);

    return suggestions[0]?.suggestions || [];
  }

  static async getPopularDestinations() {
    const Listing = require('../models/listing');
    
    return await Listing.aggregate([
      {
        $group: {
          _id: '$location',
          count: { $sum: 1 },
          avgPrice: { $avg: '$price' },
          sampleImage: { $first: '$image.url' }
        }
      },
      { $sort: { count: -1 } },
      { $limit: 8 },
      {
        $project: {
          location: '$_id',
          listingCount: '$count',
          avgPrice: { $round: ['$avgPrice', 0] },
          image: '$sampleImage'
        }
      }
    ]);
  }
}

module.exports = SearchService;