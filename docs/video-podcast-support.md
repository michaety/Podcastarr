# Video Podcast Support

Podcastarr now supports video podcasts in addition to audio podcasts, allowing you to toggle between audio and video formats for the same episode.

## Features

- **Toggle Between Audio and Video**: Switch seamlessly between audio and video playback on the episode view page
- **Multiple Video Sources**: Support for YouTube, Vimeo, and direct video URLs
- **Visual Indicators**: Episodes with video content show a video camera icon in the episode list
- **Manual Linking**: Add video URLs to existing podcast episodes through the edit interface

## Adding Video to Podcast Episodes

### Through the Episode Edit Form

1. Navigate to a podcast in your library
2. Click on an episode to view details
3. Click the "Edit" button
4. Scroll to the "Video Settings" section
5. Enter the video URL (e.g., `https://youtube.com/watch?v=VIDEO_ID`)
6. Select the video type from the dropdown:
   - **YouTube**: For YouTube videos
   - **Vimeo**: For Vimeo videos
   - **Direct**: For direct video file URLs (MP4, WebM, etc.)
   - **None**: To remove video link
7. Click "Save" to apply changes

### Through the API

You can also update episode video information using the API:

```bash
curl -X PATCH "http://your-server/api/podcasts/PODCAST_ID/episode/EPISODE_ID/video" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "videoURL": "https://youtube.com/watch?v=VIDEO_ID",
    "videoType": "youtube"
  }'
```

**Supported Video Types:**
- `youtube` - YouTube videos
- `vimeo` - Vimeo videos  
- `direct` - Direct video file URLs
- `null` - Remove video (audio only)

## Viewing Episodes with Video

When viewing an episode that has video content:

1. Open the episode details by clicking on it
2. You'll see a toggle with "Audio" and "Video" buttons at the top
3. Click "Video" to switch to video playback
4. The video will be embedded and ready to play
5. Click "Audio" to switch back to audio-only playback

## Supported Video Formats

### YouTube
- Standard YouTube URLs: `https://youtube.com/watch?v=VIDEO_ID`
- Short URLs: `https://youtu.be/VIDEO_ID`
- Embed URLs: `https://youtube.com/embed/VIDEO_ID`

### Vimeo
- Standard Vimeo URLs: `https://vimeo.com/VIDEO_ID`

### Direct Video URLs
- MP4, WebM, OGG video files
- Must be directly accessible URLs

## Database Schema

The following fields were added to the `podcastEpisodes` table:

- `videoURL` (STRING, nullable): The URL of the video source
- `videoType` (STRING, nullable): The type of video source (youtube, vimeo, direct)

## Migration

The database migration `v2.31.0-add-podcast-video-support` automatically runs when upgrading to this version. It adds the necessary columns without affecting existing data.

## Future Enhancements

Planned features for future releases:

- Automatic matching between audio and video episodes based on title/duration
- YouTube channel integration for automatic episode discovery
- Video download support using yt-dlp
- Support for additional video platforms (Spotify Video, etc.)
- Fuzzy matching algorithms for linking audio/video versions

## Troubleshooting

**Video not playing?**
- Ensure the video URL is publicly accessible
- Check that you selected the correct video type
- For YouTube, make sure the video is not restricted or age-gated

**Toggle not showing?**
- Only episodes with a `videoURL` set will show the toggle
- Check that the episode has been saved with video information

**API endpoint not working?**
- Ensure you have update permissions for the podcast
- Verify the podcast ID and episode ID are correct
- Check that the video type is one of: `youtube`, `vimeo`, `direct`, or `null`
