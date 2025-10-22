<template>
  <modals-modal v-model="show" name="podcast-episode-view-modal" :width="800" :height="'unset'" :processing="processing">
    <template #outer>
      <div class="absolute top-0 left-0 p-5 w-2/3 overflow-hidden">
        <p class="text-3xl text-white truncate">{{ $strings.LabelEpisode }}</p>
      </div>
    </template>
    <div ref="wrapper" class="p-4 w-full text-sm rounded-lg bg-bg shadow-lg border border-black-300 relative overflow-y-auto" style="max-height: 80vh">
      <div class="flex mb-4">
        <div class="w-12 h-12">
          <covers-book-cover :library-item="libraryItem" :width="48" :book-cover-aspect-ratio="bookCoverAspectRatio" />
        </div>
        <div class="grow px-2">
          <p class="text-base mb-1">{{ podcastTitle }}</p>
          <p class="text-xs text-gray-300">{{ podcastAuthor }}</p>
        </div>
      </div>
      <p dir="auto" class="text-lg font-semibold mb-6">{{ title }}</p>

      <!-- Audio/Video Toggle -->
      <div v-if="hasVideo" class="mb-4 flex items-center justify-center">
        <button @click="showingVideo = false" class="px-4 py-2 rounded-l-lg transition-colors" :class="!showingVideo ? 'bg-primary text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'">
          <span class="material-symbols mr-2">headphones</span>
          {{ $strings.LabelAudio || 'Audio' }}
        </button>
        <button @click="showingVideo = true" class="px-4 py-2 rounded-r-lg transition-colors" :class="showingVideo ? 'bg-primary text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'">
          <span class="material-symbols mr-2">videocam</span>
          {{ $strings.LabelVideo || 'Video' }}
        </button>
      </div>

      <!-- Video Player -->
      <div v-if="showingVideo && videoURL" class="mb-4">
        <div class="aspect-w-16 aspect-h-9 bg-black rounded-lg overflow-hidden">
          <iframe v-if="videoType === 'youtube'" :src="youtubeEmbedUrl" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen class="w-full h-full"></iframe>
          <iframe v-else-if="videoType === 'vimeo'" :src="vimeoEmbedUrl" frameborder="0" allow="autoplay; fullscreen; picture-in-picture" allowfullscreen class="w-full h-full"></iframe>
          <video v-else-if="videoType === 'direct'" :src="videoURL" controls class="w-full h-full"></video>
          <div v-else class="flex items-center justify-center text-gray-400">
            <p>{{ $strings.MessageUnsupportedVideoType || 'Unsupported video type' }}</p>
          </div>
        </div>
      </div>

      <div v-if="description" dir="auto" class="default-style less-spacing" @click="handleDescriptionClick" v-html="description" />
      <p v-else class="mb-2">{{ $strings.MessageNoDescription }}</p>

      <div class="w-full h-px bg-white/5 my-4" />

      <div class="flex items-center">
        <div class="grow">
          <p class="font-semibold text-xs mb-1">{{ $strings.LabelFilename }}</p>
          <p class="mb-2 text-xs">
            {{ audioFileFilename }}
          </p>
        </div>
        <div class="grow">
          <p class="font-semibold text-xs mb-1">{{ $strings.LabelSize }}</p>
          <p class="mb-2 text-xs">
            {{ audioFileSize }}
          </p>
        </div>
        <div class="grow">
          <p class="font-semibold text-xs mb-1">{{ $strings.LabelDuration }}</p>
          <p class="mb-2 text-xs">
            {{ audioFileDuration }}
          </p>
        </div>
      </div>
    </div>
  </modals-modal>
</template>

<script>
export default {
  data() {
    return {
      processing: false,
      showingVideo: false
    }
  },
  computed: {
    show: {
      get() {
        return this.$store.state.globals.showViewPodcastEpisodeModal
      },
      set(val) {
        this.$store.commit('globals/setShowViewPodcastEpisodeModal', val)
      }
    },
    libraryItem() {
      return this.$store.state.selectedLibraryItem
    },
    episode() {
      return this.$store.state.globals.selectedEpisode || {}
    },
    episodeId() {
      return this.episode.id
    },
    title() {
      return this.episode.title || 'No Episode Title'
    },
    description() {
      return this.parseDescription(this.episode.description || '')
    },
    media() {
      return this.libraryItem?.media || {}
    },
    mediaMetadata() {
      return this.media.metadata || {}
    },
    podcastTitle() {
      return this.mediaMetadata.title
    },
    podcastAuthor() {
      return this.mediaMetadata.author
    },
    audioFileFilename() {
      return this.episode.audioFile?.metadata?.filename || ''
    },
    audioFileSize() {
      const size = this.episode.audioFile?.metadata?.size || 0

      return this.$bytesPretty(size)
    },
    audioFileDuration() {
      const duration = this.episode.duration || 0
      return this.$elapsedPretty(duration)
    },
    bookCoverAspectRatio() {
      return this.$store.getters['libraries/getBookCoverAspectRatio']
    },
    videoURL() {
      return this.episode.videoURL || null
    },
    videoType() {
      return this.episode.videoType || null
    },
    hasVideo() {
      return !!this.videoURL
    },
    youtubeEmbedUrl() {
      if (!this.videoURL || this.videoType !== 'youtube') return ''
      // Extract video ID from various YouTube URL formats
      const videoId = this.extractYoutubeId(this.videoURL)
      return videoId ? `https://www.youtube.com/embed/${videoId}` : ''
    },
    vimeoEmbedUrl() {
      if (!this.videoURL || this.videoType !== 'vimeo') return ''
      // Extract video ID from Vimeo URL
      const videoId = this.videoURL.match(/vimeo\.com\/(\d+)/)?.[1]
      return videoId ? `https://player.vimeo.com/video/${videoId}` : ''
    }
  },
  methods: {
    extractYoutubeId(url) {
      // Handle various YouTube URL formats
      const patterns = [
        /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\?\/]+)/,
        /youtube\.com\/watch\?.*v=([^&\?\/]+)/
      ]
      
      for (const pattern of patterns) {
        const match = url.match(pattern)
        if (match && match[1]) {
          return match[1]
        }
      }
      return null
    },
    handleDescriptionClick(e) {
      if (e.target.matches('span.time-marker')) {
        const time = parseInt(e.target.dataset.time)
        if (!isNaN(time)) {
          this.$eventBus.$emit('play-item', {
            episodeId: this.episodeId,
            libraryItemId: this.libraryItem.id,
            startTime: time
          })
        }
        e.preventDefault()
      }
    },
    parseDescription(description) {
      const timeMarkerLinkRegex = /<a href="#([^"]*?\b\d{1,2}:\d{1,2}(?::\d{1,2})?)">(.*?)<\/a>/g
      const timeMarkerRegex = /\b\d{1,2}:\d{1,2}(?::\d{1,2})?\b/g

      function convertToSeconds(time) {
        const timeParts = time.split(':').map(Number)
        return timeParts.reduce((acc, part, index) => acc * 60 + part, 0)
      }

      return description
        .replace(timeMarkerLinkRegex, (match, href, displayTime) => {
          const time = displayTime.match(timeMarkerRegex)[0]
          const seekTimeInSeconds = convertToSeconds(time)
          return `<span class="time-marker cursor-pointer text-blue-400 hover:text-blue-300" data-time="${seekTimeInSeconds}">${displayTime}</span>`
        })
        .replace(timeMarkerRegex, (match) => {
          const seekTimeInSeconds = convertToSeconds(match)
          return `<span class="time-marker cursor-pointer text-blue-400 hover:text-blue-300" data-time="${seekTimeInSeconds}">${match}</span>`
        })
    }
  },
  mounted() {}
}
</script>
