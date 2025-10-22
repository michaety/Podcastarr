# Podcastarr Video Podcast Architecture

## System Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                         Frontend (Vue/Nuxt)                          │
├─────────────────────────────────────────────────────────────────────┤
│                                                                       │
│  ┌────────────────────┐      ┌──────────────────────────────────┐  │
│  │ Episode List Row   │      │    Episode View Modal            │  │
│  │                    │      │                                  │  │
│  │ [🎙️] Episode 1    │      │  ┌────────────────────────────┐ │  │
│  │ [🎙️📹] Episode 2  │──┐   │  │  [ Audio ]  [ Video ]     │ │  │
│  │ [🎙️] Episode 3    │  │   │  └────────────────────────────┘ │  │
│  │                    │  │   │                                  │  │
│  │ (📹 = has video)   │  └──▶│  ┌────────────────────────────┐ │  │
│  └────────────────────┘      │  │                            │ │  │
│                               │  │  [Video Player/Audio UI]   │ │  │
│  ┌────────────────────┐      │  │                            │ │  │
│  │ Episode Edit Form  │      │  └────────────────────────────┘ │  │
│  │                    │      └──────────────────────────────────┘  │
│  │ Video Settings:    │                                             │
│  │ URL: [________]    │                                             │
│  │ Type: [YouTube ▼]  │                                             │
│  └────────────────────┘                                             │
│                                                                      │
└──────────────────────────────────────────────────────────────────────┘
                                    │
                                    │ HTTP/REST API
                                    ▼
┌──────────────────────────────────────────────────────────────────────┐
│                      Backend (Node.js/Express)                        │
├──────────────────────────────────────────────────────────────────────┤
│                                                                       │
│  ┌────────────────────────────────────────────────────────────────┐ │
│  │                      API Router                                 │ │
│  │                                                                 │ │
│  │  GET    /api/podcasts/:id/episode/:episodeId                   │ │
│  │  PATCH  /api/podcasts/:id/episode/:episodeId                   │ │
│  │  PATCH  /api/podcasts/:id/episode/:episodeId/video  ◄─── NEW   │ │
│  │  DELETE /api/podcasts/:id/episode/:episodeId                   │ │
│  └────────────────────────────────────────────────────────────────┘ │
│                                    │                                  │
│                                    ▼                                  │
│  ┌────────────────────────────────────────────────────────────────┐ │
│  │                  PodcastController                              │ │
│  │                                                                 │ │
│  │  • getEpisode()                                                 │ │
│  │  • updateEpisode()                                              │ │
│  │  • updateEpisodeVideo()  ◄───────────────── NEW                │ │
│  │  • removeEpisode()                                              │ │
│  └────────────────────────────────────────────────────────────────┘ │
│                                    │                                  │
│                                    ▼                                  │
│  ┌────────────────────────────────────────────────────────────────┐ │
│  │                  PodcastEpisode Model                           │ │
│  │                                                                 │ │
│  │  Properties:                                                    │ │
│  │  • title, subtitle, description                                │ │
│  │  • audioFile, chapters                                         │ │
│  │  • season, episode, episodeType                                │ │
│  │  • videoURL      ◄────────────────────── NEW                   │ │
│  │  • videoType     ◄────────────────────── NEW                   │ │
│  │                                                                 │ │
│  │  Methods:                                                       │ │
│  │  • toOldJSON() (updated with video fields)                     │ │
│  │  • toOldJSONExpanded() (updated with video fields)             │ │
│  └────────────────────────────────────────────────────────────────┘ │
│                                    │                                  │
└────────────────────────────────────┼──────────────────────────────────┘
                                     │
                                     ▼
┌──────────────────────────────────────────────────────────────────────┐
│                       Database (SQLite/Sequelize)                     │
├──────────────────────────────────────────────────────────────────────┤
│                                                                       │
│  ┌────────────────────────────────────────────────────────────────┐ │
│  │                    podcastEpisodes Table                        │ │
│  │                                                                 │ │
│  │  Columns:                                                       │ │
│  │  ├─ id (UUID, PK)                                               │ │
│  │  ├─ title (STRING)                                              │ │
│  │  ├─ description (TEXT)                                          │ │
│  │  ├─ audioFile (JSON)                                            │ │
│  │  ├─ chapters (JSON)                                             │ │
│  │  ├─ videoURL (STRING)     ◄─────────── NEW (v2.31.0 migration) │ │
│  │  ├─ videoType (STRING)    ◄─────────── NEW (v2.31.0 migration) │ │
│  │  ├─ createdAt (DATE)                                            │ │
│  │  └─ updatedAt (DATE)                                            │ │
│  └────────────────────────────────────────────────────────────────┘ │
│                                                                       │
└───────────────────────────────────────────────────────────────────────┘
                                     │
                                     │ (for embedded playback)
                                     ▼
┌───────────────────────────────────────────────────────────────────────┐
│                      External Video Sources                           │
├───────────────────────────────────────────────────────────────────────┤
│                                                                        │
│   ┌──────────────┐     ┌──────────────┐     ┌──────────────────┐    │
│   │   YouTube    │     │    Vimeo     │     │  Direct URLs     │    │
│   │              │     │              │     │                  │    │
│   │ Iframe Embed │     │ Iframe Embed │     │  HTML5 <video>   │    │
│   └──────────────┘     └──────────────┘     └──────────────────┘    │
│                                                                        │
└────────────────────────────────────────────────────────────────────────┘
```

## Data Flow

### Adding Video to Episode

```
User Input (UI)
    │
    ├─ Video URL: https://youtube.com/watch?v=VIDEO_ID
    └─ Video Type: youtube
    │
    ▼
Frontend: EpisodeDetails.vue
    │
    ├─ Validate input
    └─ Send PATCH request
    │
    ▼
Backend: PodcastController.updateEpisodeVideo()
    │
    ├─ Check user permissions
    ├─ Validate videoType
    └─ Update episode model
    │
    ▼
Database: podcastEpisodes table
    │
    ├─ UPDATE videoURL = 'https://youtube.com/watch?v=VIDEO_ID'
    └─ UPDATE videoType = 'youtube'
    │
    ▼
Response: Updated episode JSON
    │
    └─ Includes videoURL and videoType
    │
    ▼
Frontend: Episode list refreshes
    │
    └─ Shows 📹 icon next to episode
```

### Viewing Episode with Video

```
User Action
    │
    └─ Click on episode with 📹 icon
    │
    ▼
Frontend: ViewEpisode.vue
    │
    ├─ Load episode data (includes videoURL, videoType)
    ├─ Show Audio/Video toggle (hasVideo = true)
    └─ Default to Audio view
    │
User Clicks "Video"
    │
    ├─ showingVideo = true
    │
    ▼
Video Player Rendering
    │
    ├─ if videoType === 'youtube'
    │   └─ Extract video ID from URL
    │   └─ Render: <iframe src="https://youtube.com/embed/VIDEO_ID">
    │
    ├─ if videoType === 'vimeo'
    │   └─ Extract video ID
    │   └─ Render: <iframe src="https://player.vimeo.com/video/VIDEO_ID">
    │
    └─ if videoType === 'direct'
        └─ Render: <video src="VIDEO_URL">
    │
    ▼
External Video Source
    │
    └─ Video streams from YouTube/Vimeo/Direct URL
```

## Component Relationships

```
pages/item/_id/index.vue
    │
    └── Opens ViewEpisode Modal
            │
            ├── ViewEpisode.vue (Display)
            │   ├── Audio/Video Toggle
            │   ├── Video Player (YouTube/Vimeo/Direct)
            │   └── Episode Details
            │
            └── EditEpisode Modal
                    │
                    └── EpisodeDetails.vue (Edit)
                        ├── Basic Episode Info
                        └── Video Settings
                            ├── Video URL Input
                            └── Video Type Dropdown
```

## API Endpoints

| Method | Endpoint | Description | New |
|--------|----------|-------------|-----|
| GET | `/api/podcasts/:id/episode/:episodeId` | Get episode details | No |
| PATCH | `/api/podcasts/:id/episode/:episodeId` | Update episode metadata | No |
| **PATCH** | **`/api/podcasts/:id/episode/:episodeId/video`** | **Update video info** | ✅ **Yes** |
| DELETE | `/api/podcasts/:id/episode/:episodeId` | Delete episode | No |

## Database Schema Changes

```sql
-- Migration v2.31.0
ALTER TABLE podcastEpisodes ADD COLUMN videoURL VARCHAR(255);
ALTER TABLE podcastEpisodes ADD COLUMN videoType VARCHAR(255);

-- Both columns are nullable (optional feature)
-- videoType values: 'youtube', 'vimeo', 'direct', or NULL
```

## Video Type Support

| Type | Description | URL Format | Player |
|------|-------------|------------|--------|
| youtube | YouTube videos | youtube.com/watch?v=ID<br>youtu.be/ID | iframe embed |
| vimeo | Vimeo videos | vimeo.com/ID | iframe embed |
| direct | Direct video files | https://example.com/video.mp4 | HTML5 video |
| null | No video (audio only) | N/A | N/A |

## Security Considerations

1. **Input Validation**: Video type restricted to allowed values
2. **Permission Checks**: Only users with update permission can modify
3. **XSS Protection**: URLs are embedded in iframes (sandboxed)
4. **CSP Compliance**: Iframe sources follow security policies
5. **No Server Storage**: Videos served from external sources (no upload risk)

## Performance Characteristics

- **Database Impact**: Minimal (2 nullable string columns)
- **Network**: Videos load from external CDNs (YouTube/Vimeo)
- **Server Load**: No additional server processing
- **Client Load**: Video players load on-demand (lazy)

## Backward Compatibility

- Existing episodes: `videoURL` and `videoType` are null
- Existing API responses: Include new fields (null for old data)
- Existing UI: Functions normally (toggle hidden when no video)
- Migration: Runs automatically, adds columns safely
