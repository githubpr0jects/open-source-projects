# Sponsors API Documentation

## Overview

The Sponsors API provides a centralized way to manage sponsor configurations across the application. It serves as the single source of truth for all sponsor-related data.

## API Endpoints

### GET /api/sponsors

Retrieve sponsors data with various filtering options.

#### Query Parameters

- `active=true` - Only return active (non-expired) sponsors
- `shuffle=true` - Shuffle the order of returned sponsors
- `random=true` - Return only one random sponsor from the filtered results

#### Examples

```bash
# Get all sponsors
GET /api/sponsors

# Get only active sponsors, shuffled
GET /api/sponsors?active=true&shuffle=true

# Get one random active sponsor
GET /api/sponsors?active=true&random=true
```

#### Response Format

```json
{
  "success": true,
  "sponsors": [
    {
      "id": "droidrun",
      "name": "DroidRun",
      "image": "https://...",
      "description": "...",
      "tagline": "...",
      "link": "https://...",
      "repo": "droidrun/droidrun",
      "startDate": "2025-07-31",
      "durationDays": 30,
      "tags": [...]
    }
  ],
  "total": 1,
  "timestamp": "2025-08-07T..."
}
```

### POST /api/sponsors (Future Enhancement)

Add a new sponsor to the system.

#### Request Body

```json
{
  "id": "unique-sponsor-id",
  "name": "Sponsor Name",
  "image": "https://sponsor-image-url",
  "description": "Short description",
  "tagline": "Longer tagline describing the project",
  "link": "https://tracking-url",
  "repo": "owner/repository",
  "startDate": "2025-08-01",
  "durationDays": 30,
  "tags": [
    {
      "label": "Tag Name",
      "icon": "fas fa-icon",
      "color": "#color",
      "bgColor": "rgba(color, 0.1)"
    }
  ]
}
```

## Usage in Components

### Homepage (Multiple Sponsors)

```javascript
// Fetch active sponsors with shuffle
const response = await fetch('/api/sponsors?active=true&shuffle=true');
const data = await response.json();
setActiveSponsors(data.sponsors || []);
```

### Post Details (Single Random Sponsor)

```javascript
// Fetch one random active sponsor
const response = await fetch('/api/sponsors?active=true&random=true');
const data = await response.json();
if (data.sponsors && data.sponsors.length > 0) {
  setSelectedSponsor(data.sponsors[0]);
}
```

## Sponsor Configuration

Each sponsor object contains:

- **id**: Unique identifier
- **name**: Display name
- **image**: OpenGraph or project image URL
- **description**: Short description for titles
- **tagline**: Longer description for content
- **link**: Tracking URL for analytics
- **repo**: GitHub repository (owner/name format)
- **startDate**: Campaign start date (YYYY-MM-DD)
- **durationDays**: Campaign duration (default: 30)
- **tags**: Array of tag objects with styling

## Adding New Sponsors

To add a new sponsor, update the `sponsors` array in `/src/app/api/sponsors/route.js`:

```javascript
const sponsors = [
  // Existing sponsors...
  {
    id: 'new-sponsor',
    name: 'New Sponsor Name',
    image: 'https://sponsor-image-url',
    description: 'Short description',
    tagline: 'Detailed tagline about the project',
    link: 'https://tracking-url',
    repo: 'owner/repository',
    startDate: '2025-09-01',
    durationDays: 30,
    tags: [
      { label: 'Category', icon: 'fas fa-icon', color: '#color', bgColor: 'rgba(color, 0.1)' }
    ]
  }
];
```

## Benefits

1. **Single Source of Truth**: All sponsor data managed in one place
2. **Automatic Expiry**: Sponsors automatically disappear when expired
3. **Fair Rotation**: Random selection ensures equal visibility
4. **Easy Management**: Simple API for adding/updating sponsors
5. **Consistent Experience**: Same sponsor data across all pages
6. **Performance**: Efficient caching and filtering
